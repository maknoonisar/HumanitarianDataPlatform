import { useQuery } from "@tanstack/react-query";
import { Statistics } from "@/lib/types";

const StatisticsSection = () => {
  const { data: stats, isLoading, error } = useQuery<Statistics>({
    queryKey: ['/api/statistics'],
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    console.error("Failed to load statistics:", error);
  }

  const formatNumber = (num?: number) => {
    if (num === undefined) return "—";
    return num.toLocaleString();
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded mx-auto"></div>
              ) : (
                formatNumber(stats?.datasetCount)
              )}
            </div>
            <div className="text-neutral-500">Datasets</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded mx-auto"></div>
              ) : (
                formatNumber(stats?.organizationCount)
              )}
            </div>
            <div className="text-neutral-500">Organizations</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded mx-auto"></div>
              ) : (
                formatNumber(stats?.locationCount)
              )}
            </div>
            <div className="text-neutral-500">Locations</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? (
                <div className="h-8 w-20 bg-neutral-200 animate-pulse rounded mx-auto"></div>
              ) : (
                formatNumber(stats?.activeCrisisCount)
              )}
            </div>
            <div className="text-neutral-500">Active Crises</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
