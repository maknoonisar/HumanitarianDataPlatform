import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Footer from "@/components/layout/Footer";
import { Organization, Dataset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DatasetCard from "@/components/common/DatasetCard";

const OrganizationPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: organization, isLoading: isLoadingOrg, error: orgError } = useQuery<Organization>({
    queryKey: [`/api/organizations/${id}`],
    staleTime: 60 * 1000,
  });
  
  const { data: datasets, isLoading: isLoadingDatasets, error: datasetsError } = useQuery<Dataset[]>({
    queryKey: [`/api/organizations/${id}/datasets`],
    staleTime: 60 * 1000,
    enabled: !!id,
  });
  
  const isLoading = isLoadingOrg || isLoadingDatasets;
  const error = orgError || datasetsError;
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="py-12 flex-grow">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold text-error mb-2">Error Loading Organization</h1>
                  <p className="text-neutral-600">There was a problem loading the organization data. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="py-12 flex-grow">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-4xl mx-auto animate-pulse">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-neutral-200"></div>
                <div className="ml-4">
                  <div className="h-8 bg-neutral-200 rounded-md w-64 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded-md w-32"></div>
                </div>
              </div>
              
              <div className="h-4 bg-neutral-200 rounded-md w-full mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-5/6 mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-4/6 mb-8"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-64 bg-neutral-200 rounded-md"></div>
                <div className="h-64 bg-neutral-200 rounded-md"></div>
                <div className="h-64 bg-neutral-200 rounded-md"></div>
              </div>
            </div>
          ) : organization ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {organization.acronym || organization.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold font-heading">{organization.name}</h1>
                  {organization.acronym && (
                    <p className="text-lg text-neutral-600">{organization.acronym}</p>
                  )}
                </div>
              </div>
              
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">About</h2>
                    <p className="text-neutral-600">{organization.description}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <h3 className="font-semibold text-neutral-800 mb-1">Total Datasets</h3>
                      <p className="text-2xl font-bold text-primary">{organization.datasetCount}</p>
                    </div>
                    
                    {/* Additional organization metrics could be added here */}
                  </div>
                </CardContent>
              </Card>
              
              <h2 className="text-2xl font-bold font-heading mb-6">Datasets from {organization.acronym || organization.name}</h2>
              
              {isLoadingDatasets ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-neutral-200 rounded-md"></div>
                  ))}
                </div>
              ) : datasets && datasets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {datasets.map(dataset => (
                    <DatasetCard key={dataset.id} dataset={dataset} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600">No datasets available from this organization yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-2">Organization Not Found</h1>
              <p className="text-neutral-600">The requested organization could not be found.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrganizationPage;
