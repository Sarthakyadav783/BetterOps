
import { useUIStore } from '@/stores/uiStore';
import { useWebsiteStore } from '@/stores/websiteStore';
import { useMemo } from 'react';

export const useFilteredWebsites = () => {
  const websites = useWebsiteStore((state) => state.websites);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const statusFilter = useUIStore((state) => state.statusFilter);

  return useMemo(() => {
    return websites.filter((site) => {
      const matchesSearch = site.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [websites, searchQuery, statusFilter]);
};
