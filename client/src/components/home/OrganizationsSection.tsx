import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Organization } from "@/lib/types";
import OrganizationCard from "../common/OrganizationCard";

const OrganizationsSection = () => {
  const { data: organizations, isLoading, error } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    console.error("Failed to load organizations:", error);
  }

  return (
    <section>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800 mb-8">Contributing Organizations</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-20"></div>
                  <div className="h-3 bg-neutral-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-neutral-200 rounded"></div>
                <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error">
          <p>Failed to load organizations. Please try again later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations && organizations.slice(0, 3).map(org => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/organizations" className="inline-flex items-center text-primary font-semibold hover:text-primary/80">
              View all organizations
              <span className="material-icons ml-1">arrow_forward</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default OrganizationsSection;
