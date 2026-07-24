// stores/uiStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  searchQuery: string;
  statusFilter: 'all' | 'Up' | 'Down';
  regionFilter: 'all' | string;
  isModalOpen: boolean;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'all' | 'Up' | 'Down') => void;
  setRegionFilter: (filter: 'all' | string) => void;
  openModal: () => void;
  closeModal: () => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    searchQuery: '',
    statusFilter: 'all',
    regionFilter: 'all',
    isModalOpen: false,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setStatusFilter: (filter) => set({ statusFilter: filter }),
    setRegionFilter: (filter) => set({ regionFilter: filter }),
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),
    resetFilters: () => set({ searchQuery: '', statusFilter: 'all', regionFilter: 'all' }),
  }))
);
