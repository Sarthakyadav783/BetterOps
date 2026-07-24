import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { apiClient } from "@/lib/AxiosHandling";
import { Globe } from "lucide-react";

type Region = { id: string; name: string };

export default function RegionFilter() {
  const { regionFilter, setRegionFilter } = useUIStore();
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    apiClient
      .get<{ regions: Region[] }>("/regions")
      .then((res) => setRegions(res.data.regions))
      .catch(() => setRegions([]));
  }, []);

  return (
    <div className="relative">
      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <select
        value={regionFilter}
        onChange={(e) => setRegionFilter(e.target.value)}
        className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer shadow-sm"
      >
        <option value="all">All Regions</option>
        {regions.map((region) => (
          <option key={region.id} value={region.name}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
}
