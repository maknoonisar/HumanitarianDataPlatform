import { useState, FormEvent } from "react";
import { useLocation } from "wouter";

interface SearchBarProps {
  placeholder?: string;
  darkMode?: boolean;
}

const SearchBar = ({ 
  placeholder = "Search datasets, locations, or organizations...",
  darkMode = false 
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setLocation(`/data-catalog?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className={`w-full py-3 px-4 pr-12 rounded-md ${darkMode ? 'bg-primary-600 border-primary-700 text-white placeholder-white/70' : 'text-neutral-800'} font-body focus:outline-none focus:ring-2 focus:ring-secondary`}
      />
      <button 
        type="submit"
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-white' : 'text-primary'}`}
      >
        <span className="material-icons">search</span>
      </button>
    </form>
  );
};

export default SearchBar;
