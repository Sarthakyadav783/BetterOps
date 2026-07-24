import { useUIStore } from "@/stores/uiStore";
import { Filter } from "lucide-react";

export default function StatusFilter() {
  const { statusFilter, setStatusFilter } = useUIStore();

  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value as "all" | "Up" | "Down")
        }
        className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer shadow-sm"
      >
        <option value="all">All Status</option>
        <option value="Up">Up Only</option>
        <option value="Down">Down Only</option>
      </select>
    </div>
  );
}
