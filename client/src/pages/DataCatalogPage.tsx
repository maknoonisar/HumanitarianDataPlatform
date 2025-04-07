import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/common/SearchBar";
import FilterSection from "@/components/common/FilterSection";
import DatasetCard from "@/components/common/DatasetCard";
import { Dataset, SearchFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DataCatalogPage = () => {
  const [location, setLocation] = useLocation();
  const [sortBy, setSortBy] = useState("recent");
  const [category, setCategory] = useState("all");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  
  // Parse query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.split('?')[1] || '');
    
    const searchQuery = query.get('q');
    const categoryParam = query.get('category');
    const locationParam = query.get('location');
    const formatParam = query.get('format');
    
    const newFilters: SearchFilters = {};
    if (searchQuery) newFilters.query = searchQuery;
    if (categoryParam) {
      newFilters.category = categoryParam;
      setCategory(categoryParam);
    }
    if (locationParam) newFilters.location = locationParam;
    if (formatParam) newFilters.format = formatParam;
    
    setFilters(newFilters);
  }, [location]);
  
  // Fetch datasets
  const { data: allDatasets, isLoading, error } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Search datasets if query is present
  const { data: searchResults, isLoading: isSearching } = useQuery<Dataset[]>({
    queryKey: ['/api/datasets/search', filters.query],
    staleTime: 60 * 1000,
    enabled: !!filters.query,
  });
  
  // Determine which dataset list to use
  const datasets = filters.query ? searchResults : allDatasets;
  
  // Apply filters to datasets
  const filteredDatasets = datasets ? datasets.filter(dataset => {
    if (filters.category && dataset.category !== filters.category) return false;
    if (filters.location && dataset.location !== filters.location) return false;
    if (filters.format && dataset.format !== filters.format) return false;
    return true;
  }) : [];
  
  // Sort datasets
  const sortedDatasets = [...(filteredDatasets || [])].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime();
    } else if (sortBy === "downloads") {
      return (b.downloadCount || 0) - (a.downloadCount || 0);
    } else if (sortBy === "az") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });
  
  // Paginate datasets
  const paginatedDatasets = sortedDatasets.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sortedDatasets.length / itemsPerPage);
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (e.target.value !== "all") {
      setFilters({ ...filters, category: e.target.value });
      updateUrlParams({ ...filters, category: e.target.value });
    } else {
      const { category, ...rest } = filters;
      setFilters(rest);
      updateUrlParams(rest);
    }
    setPage(1);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  const removeFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    updateUrlParams(newFilters);
    if (key === 'category') setCategory('all');
    setPage(1);
  };
  
  const clearFilters = () => {
    setFilters({});
    setCategory("all");
    updateUrlParams({});
    setPage(1);
  };
  
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  const updateUrlParams = (newFilters: SearchFilters) => {
    const query = new URLSearchParams();
    if (newFilters.query) query.set('q', newFilters.query);
    if (newFilters.category) query.set('category', newFilters.category);
    if (newFilters.location) query.set('location', newFilters.location);
    if (newFilters.format) query.set('format', newFilters.format);
    
    const queryString = query.toString();
    setLocation(`/data-catalog${queryString ? `?${queryString}` : ''}`, { replace: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="py-12 flex-grow bg-neutral-50">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-800 mb-8">Data Catalog</h1>
          
          <div className="mb-8">
            <SearchBar placeholder="Search within data catalog..." />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="text-lg font-semibold">
              {isLoading || isSearching ? (
                "Loading datasets..."
              ) : (
                `${sortedDatasets.length} datasets found`
              )}
            </div>
            
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
          
          {showAdvancedFilters && (
            <Card className="mb-8">
              <CardContent className="py-6">
                <h3 className="font-semibold text-lg mb-4">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <select 
                      value={filters.location || ""}
                      onChange={(e) => {
                        const newFilters = { ...filters, location: e.target.value || undefined };
                        setFilters(newFilters);
                        updateUrlParams(newFilters);
                        setPage(1);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Any Location</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="Somalia">Somalia</option>
                      <option value="Global">Global</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Yemen">Yemen</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Format</label>
                    <select 
                      value={filters.format || ""}
                      onChange={(e) => {
                        const newFilters = { ...filters, format: e.target.value || undefined };
                        setFilters(newFilters);
                        updateUrlParams(newFilters);
                        setPage(1);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Any Format</option>
                      <option value="CSV">CSV</option>
                      <option value="JSON">JSON</option>
                      <option value="XML">XML</option>
                      <option value="Excel">Excel</option>
                      <option value="PDF">PDF</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isLoading || isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : sortedDatasets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No datasets found</h3>
                <p className="text-neutral-600">
                  {filters.query 
                    ? `No results found for "${filters.query}". Try adjusting your search or filters.`
                    : "No datasets match your selected filters. Try adjusting your criteria."}
                </p>
                {Object.keys(filters).length > 0 && (
                  <Button 
                    onClick={clearFilters}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedDatasets.map(dataset => (
                  <DatasetCard key={dataset.id} dataset={dataset} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <span className="material-icons">chevron_left</span>
                    </Button>
                    
                    <div className="flex items-center px-4 bg-white border border-neutral-200 rounded-md">
                      Page {page} of {totalPages}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <span className="material-icons">chevron_right</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DataCatalogPage;
