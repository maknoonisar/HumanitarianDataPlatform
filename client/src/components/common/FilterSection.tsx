import { useCallback } from "react";
import { useLocation } from "wouter";
import { SearchFilters } from "@/lib/types";

interface FilterItemProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
}

const FilterItem = ({ label, value, onRemove }: FilterItemProps) => (
  <div className="bg-neutral-100 py-1 px-3 rounded-full text-sm flex items-center">
    {label}: {value}
    <button 
      className="ml-2 text-neutral-500 hover:text-neutral-800"
      onClick={() => onRemove(value)}
      aria-label={`Remove ${label} filter`}
    >
      <span className="material-icons text-sm">close</span>
    </button>
  </div>
);

interface FilterSectionProps {
  filters: SearchFilters;
  onRemoveFilter: (key: keyof SearchFilters, value: string) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
}

const FilterSection = ({ 
  filters, 
  onRemoveFilter,
  onClearFilters,
  onToggleAdvancedFilters
}: FilterSectionProps) => {
  const hasFilters = Object.values(filters).some(val => val !== undefined && val !== "");
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-wrap gap-4 mb-4">
        {filters.category && (
          <FilterItem 
            label="Category" 
            value={filters.category} 
            onRemove={() => onRemoveFilter('category', filters.category!)} 
          />
        )}
        
        {filters.location && (
          <FilterItem 
            label="Location" 
            value={filters.location} 
            onRemove={() => onRemoveFilter('location', filters.location!)} 
          />
        )}
        
        {filters.format && (
          <FilterItem 
            label="Format" 
            value={filters.format} 
            onRemove={() => onRemoveFilter('format', filters.format!)} 
          />
        )}
        
        {hasFilters && (
          <button 
            className="text-secondary text-sm font-semibold hover:text-secondary/80"
            onClick={onClearFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      <button 
        className="flex items-center text-primary font-semibold text-sm hover:text-primary/80"
        onClick={onToggleAdvancedFilters}
      >
        <span className="material-icons text-sm mr-1">tune</span>
        Advanced Filters
      </button>
    </div>
  );
};

export default FilterSection;
