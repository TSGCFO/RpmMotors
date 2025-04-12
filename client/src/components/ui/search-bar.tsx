import { useState } from "react";
import { useLocation } from "wouter";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form className="flex items-center" onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Search Inventory" 
        className="w-full md:w-60 px-3 py-1.5 text-sm text-gray-800 rounded-l focus:outline-none border border-gray-300"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search inventory"
      />
      <button 
        type="submit" 
        className="bg-[#E31837] text-white px-3 py-1.5 rounded-r hover:bg-opacity-90 transition-opacity"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </form>
  );
}
