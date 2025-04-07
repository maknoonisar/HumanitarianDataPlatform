import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import DatasetCard from "@/components/common/DatasetCard";
import FilterSection from "@/components/common/FilterSection";
import { Dataset, SearchFilters } from "@/lib/types";

const DataCatalogSection = () => {
  const [sortBy, setSortBy] = useState("recent");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { data: datasets, isLoading, error } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    console.error("Failed to load datasets:", error);
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (e.target.value !== "all") {
      setFilters({ ...filters, category: e.target.value });
    } else {
      const { category, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const removeFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setCategory("all");
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Apply filters to datasets
  const filteredDatasets = datasets ? datasets.filter(dataset => {
    if (filters.category && dataset.category !== filters.category) return false;
    if (filters.location && dataset.location !== filters.location) return false;
    if (filters.format && dataset.format !== filters.format) return false;
    return true;
  }) : [];

  // Sort datasets
  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
    } else if (sortBy === "downloads") {
      return (b.downloadCount || 0) - (a.downloadCount || 0);
    } else if (sortBy === "az") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <section className="mb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral-800">Data Catalog</h2>
        
        <div className="flex flex-col sm:flex-row mt-4 md:mt-0 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="bg-white border border-neutral-200 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="Climate & Weather">Climate & Weather</option>
              <option value="Health & Nutrition">Health & Nutrition</option>
              <option value="Population & Migration">Population & Migration</option>
              <option value="Food Security">Food Security</option>
            </select>
            <span className="material-icons absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none">
              expand_more
            </span>
          </div>
          
          <div className="relative">
            <select 
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white border border-neutral-200 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloaded</option>
              <option value="az">A-Z</option>
            </select>
            <span className="material-icons absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>
      
      <FilterSection 
        filters={filters}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="p-4 h-40 bg-neutral-100"></div>
              <div className="p-4 h-20 bg-neutral-50"></div>
              <div className="p-4 h-10 bg-neutral-100"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center text-error">
          <p>Failed to load datasets. Please try again later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDatasets.slice(0, 3).map(dataset => (
              <DatasetCard key={dataset.id} dataset={dataset} />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link href="/data-catalog" className="bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-semibold py-2 px-6 rounded flex items-center transition">
              Load More Datasets
              <span className="material-icons ml-1">expand_more</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default DataCatalogSection;
