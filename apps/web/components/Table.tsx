import { Website } from '@/types';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

function Table({ 
  filteredWebsites, 
  websites,
  regionFilter = 'all',
}: { 
  filteredWebsites: Website[]; 
  websites: Website[];
  regionFilter?: string;
}) {
  const router = useRouter();

  const getLatestTick = (website: Website) => {
    const ticks =
      regionFilter === 'all'
        ? website.ticks
        : website.ticks?.filter((t) => t.region?.name === regionFilter);

    return ticks && ticks.length > 0 ? ticks[0] : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Website
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Response Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Last Checked
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredWebsites.length > 0 ? (
            filteredWebsites.map((site) => {
              const latestTick = getLatestTick(site);
              
              return (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {site.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {latestTick?.region?.name ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {latestTick ? (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          latestTick.status === 'Up'
                            ? 'bg-green-100 text-green-800'
                            : latestTick.status === 'Down'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {latestTick.status}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {latestTick ? `${latestTick.response_time_ms}ms` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {latestTick ? formatDate(latestTick.createdAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => router.push(`/website/${site.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                <div className="space-y-2">
                  <p className="text-lg font-medium">No websites found</p>
                  <p className="text-sm">
                    {websites.length === 0
                      ? 'Click "Add Website" to start monitoring'
                      : 'Try adjusting your search or filters'}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
