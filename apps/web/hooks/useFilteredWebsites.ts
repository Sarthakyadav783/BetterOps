import { useUIStore } from '@/stores/uiStore';
import { useWebsiteStore } from '@/stores/websiteStore';
import { useMemo } from 'react';

export const useFilteredWebsites = () => {
  const websites = useWebsiteStore((state) => state.websites);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const statusFilter = useUIStore((state) => state.statusFilter);
  const regionFilter = useUIStore((state) => state.regionFilter);

  return useMemo(() => {
    return websites.filter((site) => {
      const matchesSearch = site.url.toLowerCase().includes(searchQuery.toLowerCase());

      const ticksForRegion =
        regionFilter === 'all'
          ? site.ticks
          : site.ticks?.filter((t) => t.region?.name === regionFilter);

      const latestStatus = ticksForRegion?.[0]?.status ?? 'Unknown';
      const matchesStatus = statusFilter === 'all' || latestStatus === statusFilter;
      const matchesRegion =
        regionFilter === 'all' || (ticksForRegion && ticksForRegion.length > 0);

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [websites, searchQuery, statusFilter, regionFilter]);
};
