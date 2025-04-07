import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Footer from "@/components/layout/Footer";
import { Dataset, Organization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const DatasetPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  // Check if the user is an admin
  const isAdmin = user?.role === "admin";
  
  const { data: dataset, isLoading: isLoadingDataset, error: datasetError } = useQuery<Dataset>({
    queryKey: [`/api/datasets/${id}`],
    staleTime: 60 * 1000,
  });
  
  const { data: organization, isLoading: isLoadingOrg } = useQuery<Organization>({
    queryKey: [`/api/organizations/${dataset?.organizationId}`],
    staleTime: 60 * 1000,
    enabled: !!dataset?.organizationId,
  });
  
  const isLoading = isLoadingDataset || isLoadingOrg;
  
  // Delete dataset mutation
  const deleteDatasetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/datasets/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Dataset deleted",
        description: "The dataset has been successfully deleted.",
        duration: 3000,
      });
      // Redirect to datasets page after successful deletion
      navigate("/data-catalog");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete dataset",
        description: error.message || "There was an error deleting the dataset.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteDatasetMutation.mutate();
    setDeleteDialogOpen(false);
  };
  
  const handleDownload = async () => {
    if (!dataset) return;
    
    try {
      // Check if dataset has a fileUrl
      if (dataset.fileUrl) {
        // Create a temporary anchor element to trigger download
        const downloadLink = document.createElement('a');
        const filename = dataset.fileUrl.split('/').pop() || 'dataset-file';
        downloadLink.href = `/api/download/${encodeURIComponent(filename)}`;
        downloadLink.target = '_blank';
        downloadLink.download = filename;
        
        // Append to body, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      
      // Also notify the server about the download for tracking
      await apiRequest("POST", `/api/datasets/${id}/download`, {});
      queryClient.invalidateQueries({ queryKey: [`/api/datasets/${id}`] });
      
      toast({
        title: "Download started",
        description: `You are now downloading "${dataset.title}"`,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error starting your download. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (datasetError) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="py-12 flex-grow">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h1 className="text-2xl font-bold text-error mb-2">Error Loading Dataset</h1>
                  <p className="text-neutral-600">There was a problem loading the dataset. Please try again later.</p>
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
              <div className="h-10 bg-neutral-200 rounded-md w-3/4 mb-6"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-full mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-5/6 mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded-md w-4/6 mb-8"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-neutral-200 rounded-md"></div>
                <div className="h-40 bg-neutral-200 rounded-md"></div>
                <div className="h-40 bg-neutral-200 rounded-md"></div>
              </div>
            </div>
          ) : dataset ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold font-heading mb-2 md:mb-0">{dataset.title}</h1>
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button 
                      onClick={handleDelete}
                      variant="destructive"
                      className="py-2 px-6 rounded flex items-center"
                    >
                      <span className="material-icons mr-2">delete</span>
                      Delete
                    </Button>
                  )}
                  <Button 
                    onClick={handleDownload}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded flex items-center"
                  >
                    <span className="material-icons mr-2">file_download</span>
                    Download Dataset
                  </Button>
                </div>
              </div>
              
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 mr-1">calendar_today</span>
                      <span>Updated: {formatDate(dataset.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 mr-1">account_circle</span>
                      <span>Source: {dataset.source}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 mr-1">category</span>
                      <span>Category: {dataset.category || "Uncategorized"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-neutral-500 mr-1">file_download</span>
                      <span>{dataset.downloadCount?.toLocaleString() || 0} downloads</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className={`text-neutral-600 ${!showFullDescription && "line-clamp-3"}`}>
                      {dataset.description}
                    </p>
                    {dataset.description.length > 200 && (
                      <button 
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-primary font-semibold text-sm mt-2 hover:text-primary/80"
                      >
                        {showFullDescription ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags?.map((tag, index) => (
                        <span key={index} className="bg-neutral-200 text-neutral-800 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      )) || <span className="text-neutral-500">No tags available</span>}
                    </div>
                  </div>
                  
                  {organization && (
                    <>
                      <Separator className="my-4" />
                      
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Organization</h2>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                            {organization.acronym || organization.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-bold">{organization.name}</h3>
                            <p className="text-sm text-neutral-500">{organization.datasetCount} datasets available</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-2">description</span>
                      <span>Format: {dataset.format || "Unknown"}</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      {dataset.format === "CSV" 
                        ? "CSV (Comma Separated Values) format for easy import into spreadsheet software or data analysis tools."
                        : dataset.format === "JSON"
                        ? "JSON format for programmatic access and API integration."
                        : dataset.format === "XML"
                        ? "XML format structured data representation."
                        : "Download this dataset in its original format."}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-2">public</span>
                      <span>Location: {dataset.location || "Global"}</span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      This dataset covers information related to {dataset.location || "global"} regions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-2">Dataset Not Found</h1>
              <p className="text-neutral-600">The requested dataset could not be found.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dataset
              "{dataset?.title}" and remove the associated files from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDatasetMutation.isPending ? (
                <span className="flex items-center">
                  <span className="material-icons animate-spin mr-2">refresh</span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatasetPage;
