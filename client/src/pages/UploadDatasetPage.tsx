import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Organization, Crisis } from "@shared/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const uploadFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  source: z.string().min(1, "Source is required"),
  organizationId: z.string().min(1, "Organization is required"),
  location: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.string(),
  format: z.string().min(1, "Format is required"),
  crisisId: z.string().optional(),
  fileUrl: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

const UploadDatasetPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      source: "",
      organizationId: "",
      location: "",
      category: "",
      tags: "",
      format: "",
      crisisId: "",
      fileUrl: "",
    }
  });

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  const { data: crises } = useQuery<Crisis[]>({
    queryKey: ["/api/crises"],
  });

  const categories = [
    "Population & Migration",
    "Health",
    "Food Security",
    "Shelter",
    "Education",
    "Water & Sanitation",
    "Protection",
    "Economy",
    "Coordination",
    "Logistics",
    "Telecommunications",
    "Environment",
    "Other"
  ];

  const formats = [
    "CSV",
    "JSON",
    "XML",
    "Excel",
    "PDF",
    "Shapefile",
    "GeoJSON",
    "JPG/JPEG",
    "PNG",
    "GIF",
    "Word",
    "Text",
    "ZIP Archive",
    "RAR Archive",
    "URL",
    "Other"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Convert the string values to the correct types
      const processedData = {
        ...data,
        // Convert organizationId from string to number
        organizationId: data.organizationId ? parseInt(data.organizationId, 10) : undefined,
        // Convert crisisId from string to number if present
        crisisId: data.crisisId ? parseInt(data.crisisId, 10) : undefined,
        // Convert tags from comma-separated string to array
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      const formData = new FormData();
      formData.append('datasetInfo', JSON.stringify(processedData));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      setUploadProgress(30);
      const response = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      setUploadProgress(100);
      toast({
        title: "Success",
        description: "Dataset uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload dataset",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Dataset</CardTitle>
          <CardDescription>
            Add a new dataset to the Humanitarian Data Exchange platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dataset Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ukraine Conflict: IDP Figures by Oblast" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide a detailed description of the dataset" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. UNHCR Field Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ukraine" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter comma-separated tags" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crisisId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Crisis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crisis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {crises?.map((crisis) => (
                            <SelectItem key={crisis.id} value={crisis.id.toString()}>
                              {crisis.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter external URL if not uploading a file" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      onChange={handleFileChange}
                      accept=".csv,.json,.xml,.xlsx,.pdf,.shp,.geojson,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt,.zip,.rar,.7z"
                    />
                  </FormControl>
                  <FormDescription>
                    Supports multiple file types: CSV, Excel, PDF, Word, Shapefiles, Images, ZIP archives, and more
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... {uploadProgress > 0 ? `${uploadProgress}%` : ''}
                  </>
                ) : (
                  <>Upload Dataset</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadDatasetPage;