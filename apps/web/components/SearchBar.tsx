
import { useUIStore } from "@/stores/uiStore";
import { Search } from "lucide-react";


export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search websites..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64 shadow-sm"
      />
    </div>
  );
}
