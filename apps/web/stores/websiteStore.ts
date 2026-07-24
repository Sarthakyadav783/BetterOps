// store/websiteStore.ts
import { create } from 'zustand';
import { apiClient } from '@/lib/AxiosHandling';
import { Website, WebsiteTick, WebsitesResponse, AddWebsiteResponse } from '@/types';

interface WebsiteState {
  websites: Website[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWebsites: () => Promise<void>;
  addWebsite: (url: string) => Promise<void>;
  refreshWebsites: () => Promise<void>;
}

async function withRegionNames(websites: Website[]): Promise<Website[]> {
  try {
    const regionsRes = await apiClient.get<{ regions: { id: string; name: string }[] }>('/regions');
    const regionMap = new Map(regionsRes.data.regions.map((r) => [r.id, r]));

    return websites.map((site) => ({
      ...site,
      ticks: (site.ticks ?? []).map((tick: WebsiteTick) => ({
        ...tick,
        region: tick.region ?? regionMap.get(tick.region_id) ?? undefined,
      })),
    }));
  } catch {
    return websites;
  }
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  websites: [],
  loading: false,
  error: null,

  fetchWebsites: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<WebsitesResponse>('/websites');
      const websites = await withRegionNames(response.data.websites);
      set({ websites, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch websites',
        loading: false 
      });
    }
  },

  addWebsite: async (url: string) => {
    try {
      await apiClient.post<AddWebsiteResponse>('/website', { url });
      await get().fetchWebsites();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add website');
    }
  },

  refreshWebsites: async () => {
    await get().fetchWebsites();
  },
}));
