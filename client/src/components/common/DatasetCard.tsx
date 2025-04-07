import { Link } from "wouter";
import { Dataset } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DatasetCardProps {
  dataset: Dataset;
}

const DatasetCard = ({ dataset }: DatasetCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: `"${dataset.title}" has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
      duration: 3000,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex justify-between items-start">
          <h3 className="font-heading font-bold text-lg text-neutral-800">{dataset.title}</h3>
          <button onClick={handleToggleBookmark} aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
            <span className="material-icons text-neutral-500 hover:text-primary cursor-pointer">
              {isBookmarked ? "bookmark" : "bookmark_border"}
            </span>
          </button>
        </div>
        <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{dataset.description}</p>
      </div>
      
      <div className="px-4 py-3 bg-neutral-50">
        <div className="flex items-center text-sm mb-2">
          <span className="material-icons text-sm text-neutral-500 mr-1">calendar_today</span>
          <span>Updated: {formatDate(dataset.lastUpdated)}</span>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center text-sm">
            <span className="material-icons text-sm text-neutral-500 mr-1">account_circle</span>
            <span>{dataset.source}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="material-icons text-sm text-neutral-500 mr-1">file_download</span>
            <span>{dataset.downloadCount?.toLocaleString() || 0} downloads</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-wrap gap-2">
        {dataset.tags && dataset.tags.map((tag, index) => (
          <span key={index} className="text-xs bg-neutral-200 text-neutral-800 px-2 py-1 rounded">{tag}</span>
        ))}
      </div>
      
      <div className="px-4 pb-4">
        <Link href={`/datasets/${dataset.id}`} className="block w-full bg-primary hover:bg-primary/90 text-white text-center py-2 rounded transition">
          View Dataset
        </Link>
      </div>
    </div>
  );
};

export default DatasetCard;
