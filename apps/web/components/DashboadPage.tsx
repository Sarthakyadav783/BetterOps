"use client";

import { useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Table from "./Table";
import Navbar from "./Navbar";
import SearchBar from "./SearchBar";
import StatusFilter from "./StatusFilter";
import RegionFilter from "./RegionFilter";
import AddWebsiteModal from "./AddWebsiteModal";
import { useWebsiteStore } from "@/stores/websiteStore";
import { useUIStore } from "@/stores/uiStore";

export default function Dashboard() {
  const { websites, loading, fetchWebsites, refreshWebsites } = useWebsiteStore();
  const { searchQuery, statusFilter, regionFilter, openModal } = useUIStore();

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleRefresh = async () => {
    try {
      await refreshWebsites();
      toast.success("Data refreshed");
    } catch {
      toast.error("Failed to refresh data");
    }
  };

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch = site.url
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const ticksForRegion =
      regionFilter === "all"
        ? site.ticks
        : site.ticks?.filter((t) => t.region?.name === regionFilter);

    const latestTick = ticksForRegion?.[0];
    const latestStatus = latestTick?.status ?? "Unknown";

    const matchesStatus =
      statusFilter === "all" || latestStatus === statusFilter;

    const matchesRegion =
      regionFilter === "all" || (ticksForRegion && ticksForRegion.length > 0);

    return matchesSearch && matchesStatus && matchesRegion;
  });

  if (loading && websites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading websites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <SearchBar />
          <StatusFilter />
          <RegionFilter />

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md border border-gray-200 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={openModal}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Website
            </button>
          </div>
        </div>

        <Table
          filteredWebsites={filteredWebsites}
          websites={websites}
          regionFilter={regionFilter}
        />
      </main>

      <AddWebsiteModal />
    </div>
  );
}
