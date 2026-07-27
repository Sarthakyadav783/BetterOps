"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Globe,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDate } from "@/lib/HelpfullFunction";
import { apiClient } from "@/lib/AxiosHandling";
import { useWebsiteStore } from "@/stores/websiteStore";
import type { StatusRange, Website } from "@/types";

interface WebsiteDetailPageProps {
  websiteId: string;
}

type Region = { id: string; name: string };

const RANGE_OPTIONS: { value: StatusRange; label: string }[] = [
  { value: "1h", label: "Last 1 hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

export default function WebsiteDetailPage({ websiteId }: WebsiteDetailPageProps) {
  const router = useRouter();
  const deleteWebsite = useWebsiteStore((state) => state.deleteWebsite);
  const [website, setWebsite] = useState<Website | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [rangeFilter, setRangeFilter] = useState<StatusRange>("24h");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchWebsite = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: rangeFilter });
      if (regionFilter !== "all") {
        params.set("region", regionFilter);
      }

      const [websiteRes, regionsRes] = await Promise.all([
        apiClient.get<Website>(`/status/${websiteId}?${params.toString()}`),
        apiClient.get<{ regions: Region[] }>("/regions"),
      ]);

      const regionMap = new Map(regionsRes.data.regions.map((r) => [r.id, r]));
      const websiteData = {
        ...websiteRes.data,
        ticks: (websiteRes.data.ticks ?? []).map((tick) => ({
          ...tick,
          region: tick.region ?? regionMap.get(tick.region_id) ?? undefined,
        })),
      };

      setRegions(regionsRes.data.regions);
      setWebsite(websiteData);
    } catch (error: any) {
      setWebsite(null);
      toast.error(error.response?.data?.message || "Failed to load website");
    } finally {
      setLoading(false);
    }
  }, [websiteId, rangeFilter, regionFilter]);

  useEffect(() => {
    fetchWebsite();
  }, [fetchWebsite]);

  const stats = useMemo(() => {
    if (!website) return null;

    const ticks = [...(website.ticks ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const apiStats = website.stats;
    if ((!apiStats || apiStats.totalChecks === 0) && !ticks.length) {
      return null;
    }

    const latestTick = ticks[0];
    const totalChecks = apiStats?.totalChecks ?? ticks.length;
    const upCount = apiStats?.upCount ?? ticks.filter((t) => t.status === "Up").length;
    const downCount =
      apiStats?.downCount ?? ticks.filter((t) => t.status === "Down").length;
    const uptime =
      apiStats?.uptimePercentage ??
      (totalChecks > 0 ? Number(((upCount / totalChecks) * 100).toFixed(2)) : 0);
    const avgResponseTime =
      apiStats?.avgResponseTimeMs ??
      (ticks.length
        ? Math.round(
            ticks.reduce((acc, curr) => acc + curr.response_time_ms, 0) /
              ticks.length
          )
        : 0);

    return {
      latestStatus: latestTick?.status ?? "Unknown",
      lastChecked: latestTick ? formatDate(latestTick.createdAt) : "Not checked yet",
      responseTime: latestTick?.response_time_ms ?? 0,
      regionName: latestTick?.region?.name ?? "Unknown",
      uptime: uptime.toFixed(2),
      upCount,
      downCount,
      avgResponseTime,
      totalChecks,
      timeline: ticks,
      truncated: apiStats?.truncated ?? false,
      timelineCount: apiStats?.timelineCount ?? ticks.length,
    };
  }, [website]);

  const rangeLabel =
    RANGE_OPTIONS.find((option) => option.value === rangeFilter)?.label ??
    "Selected range";

  const handleRefresh = async () => {
    try {
      await fetchWebsite();
      toast.success("Data refreshed");
    } catch {
      toast.error("Failed to refresh data");
    }
  };

  const handleDelete = async () => {
    if (!website) return;
    const confirmed = window.confirm(
      `Remove ${website.url} from monitoring? This deletes all check history for this site.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteWebsite(websiteId);
      toast.success("Website removed");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete website");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-green-800">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading website details...</span>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center text-gray-700 gap-4">
        <h2 className="text-xl font-medium">Website not found</h2>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const isUp = stats?.latestStatus === "Up";
  const statusLabel = stats?.latestStatus ?? "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value as StatusRange)}
                className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
              >
                <option value="all">All Regions</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
              <Trash2 className={`w-4 h-4 ${deleting ? "animate-pulse" : ""}`} />
              <span>{deleting ? "Deleting…" : "Delete"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                    !stats
                      ? "bg-gray-100"
                      : isUp
                        ? "bg-green-100"
                        : "bg-red-100"
                  }`}
                >
                  {!stats ? (
                    <AlertCircle className="w-6 h-6 text-gray-500" />
                  ) : isUp ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 break-all">
                  {website.url}
                </h1>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm flex-wrap">
                <div
                  className={`w-2 h-2 rounded-full ${
                    !stats
                      ? "bg-gray-400"
                      : isUp
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                ></div>
                <span>
                  Current Status:{" "}
                  <span
                    className={`font-medium ${
                      !stats
                        ? "text-gray-600"
                        : isUp
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span>
                  Region:{" "}
                  {stats?.regionName ??
                    (regionFilter === "all" ? "All" : regionFilter)}
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span>
                  Last checked: {stats?.lastChecked ?? "Not checked yet"}
                </span>
                <span className="mx-2 text-gray-300">•</span>
                <span>{rangeLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {!stats ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-8 text-center text-gray-600">
            {regionFilter === "all"
              ? `No monitoring checks in the ${rangeLabel.toLowerCase()}.`
              : `No monitoring checks for region "${regionFilter}" in the ${rangeLabel.toLowerCase()}.`}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
                <div className="text-gray-500 text-sm mb-2 font-medium">
                  Total Uptime
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.uptime}%
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
                <div className="text-gray-500 text-sm mb-2 font-medium">
                  Latest Response
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {stats.responseTime}ms
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
                <div className="text-gray-500 text-sm mb-2 font-medium">
                  Total Up Checks
                </div>
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {stats.upCount}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
                <div className="text-gray-500 text-sm mb-2 font-medium">
                  Total Down Checks
                </div>
                <div className="text-4xl font-bold text-red-500 mb-1">
                  {stats.downCount}
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-green-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Status History
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {stats.truncated
                      ? `Showing latest ${stats.timelineCount} of ${stats.totalChecks} checks (${rangeLabel.toLowerCase()})`
                      : `Checks in range · latest first (${rangeLabel.toLowerCase()})`}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-1 h-16 w-full overflow-hidden bg-white/40 p-1 rounded-lg border border-green-50">
                  {stats.timeline.map((tick, index) => (
                    <div
                      key={tick.id || index}
                      className={`flex-1 h-full min-w-[10px] rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer flex items-center justify-center group relative ${
                        tick.status === "Up"
                          ? "bg-green-400 hover:bg-green-500"
                          : "bg-red-400 hover:bg-red-500"
                      }`}
                    >
                      <div className="absolute bottom-full mb-3 hidden group-hover:block z-20 w-48 bg-white text-gray-800 text-xs p-3 rounded-lg border border-green-100 shadow-xl pointer-events-none">
                        <p className="font-bold mb-1 text-gray-900">
                          {formatDate(tick.createdAt)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`font-medium ${
                              tick.status === "Up"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {tick.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500">Response:</span>
                          <span className="font-medium text-gray-900">
                            {tick.response_time_ms}ms
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-500">Region:</span>
                          <span className="font-medium text-gray-900">
                            {tick.region?.name ?? "Unknown"}
                          </span>
                        </div>
                      </div>

                      {tick.status === "Up" ? (
                        <CheckCircle className="w-4 h-4 text-white/90" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white/90" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-green-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.uptime}%
                  </div>
                  <div className="text-gray-500 text-sm font-medium">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.avgResponseTime}ms
                  </div>
                  <div className="text-gray-500 text-sm font-medium">
                    Avg Response Time
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.totalChecks}
                  </div>
                  <div className="text-gray-500 text-sm font-medium">
                    Total Checks in Range
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="text-center text-green-700/50 text-xs py-4 font-mono">
          ID: {websiteId}
        </div>
      </div>
    </div>
  );
}
