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
        className="flex-grow px-4 py-2 rounded-l-md focus:outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search inventory"
      />
      <button 
        type="submit" 
        className="bg-[#E31837] text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition"
        aria-label="Search"
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
}
