import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Vehicle } from "@shared/schema";
import { CarCard } from "@/components/ui/car-card";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OptimizedImage } from "@/components/ui/optimized-image";
import RecentlyViewedVehicles from "@/components/ui/recently-viewed-vehicles";
import PageMeta from "@/components/seo/page-meta";
import CanonicalUrl from "@/components/seo/canonical-url";
import JsonLdSchema, { createBreadcrumbSchema } from "@/components/seo/json-ld-schema";
import { 
  hasConsentedToCookies,
  getFilterPreferences,
  saveFilterPreferences
} from '@/lib/cookieUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Inventory() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    year: "",
    priceMin: "",
    priceMax: "",
    category: "",
    status: "",
    search: ""
  });

  // State to track category name for breadcrumb
  const [categoryName, setCategoryName] = useState<string>("");
  
  // Parse query parameters and load saved preferences
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    
    const category = params.get("category");
    const search = params.get("search");
    
    // First check if we have URL parameters (these take priority)
    if (category) {
      setFilters(prev => ({ ...prev, category }));
      
      // Set readable category name for breadcrumb
      const formattedCategory = category.replace(/-/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCategoryName(formattedCategory);
    } else {
      setCategoryName("");
    }
    
    if (search) {
      setFilters(prev => ({ ...prev, search }));
    }
    
    // If no URL parameters and user has consented to cookies, load saved preferences
    if (!category && !search && hasConsentedToCookies()) {
      const savedFilters = getFilterPreferences();
      if (savedFilters) {
        // Only update if we have saved filters
        setFilters(prev => {
          const updatedFilters = { ...prev };
          
          // Apply each saved filter
          Object.entries(savedFilters).forEach(([key, value]) => {
            // Make sure the key is valid for our filter state
            if (key in updatedFilters) {
              updatedFilters[key as keyof typeof updatedFilters] = value;
              
              // If category was restored, also update the category name for breadcrumb
              if (key === 'category' && value) {
                const formattedCategory = value.replace(/-/g, " ")
                  .split(" ")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                setCategoryName(formattedCategory);
              }
            }
          });
          
          return updatedFilters;
        });
      }
    }
  }, [location]);

  // Fetch all vehicles (including sold ones)
  const { data: allVehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles?includeAll=true"],
  });

  // Filter vehicles based on selected filters
  const filteredVehicles = allVehicles?.filter(vehicle => {
    if (filters.make && vehicle.make.toLowerCase() !== filters.make.toLowerCase()) {
      return false;
    }
    
    if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false;
    }
    
    if (filters.year && vehicle.year.toString() !== filters.year) {
      return false;
    }
    
    if (filters.priceMin && vehicle.price < parseInt(filters.priceMin)) {
      return false;
    }
    
    if (filters.priceMax && vehicle.price > parseInt(filters.priceMax)) {
      return false;
    }
    
    if (filters.category) {
      const formattedCategory = filters.category.replace(/-/g, " ");
      if (vehicle.category.toLowerCase() !== formattedCategory.toLowerCase()) {
        return false;
      }
    }
    
    if (filters.status && filters.status !== 'all' && vehicle.status !== filters.status) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower) ||
        vehicle.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Get unique makes for the filter
  const uniqueMakes = allVehicles 
    ? [...new Set(allVehicles.map(v => v.make))].sort() 
    : [];

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    
    // Save filter preferences to cookies if user has consented
    if (hasConsentedToCookies()) {
      // Convert to a simple record of string values for storage
      const filterRecord = Object.entries(updatedFilters).reduce((acc, [key, val]) => {
        // Only save non-empty values
        if (val) acc[key] = val;
        return acc;
      }, {} as Record<string, string>);
      
      // Save to cookies if there are active filters
      if (Object.keys(filterRecord).length > 0) {
        saveFilterPreferences(filterRecord);
      }
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      make: "",
      model: "",
      year: "",
      priceMin: "",
      priceMax: "",
      category: "",
      status: "",
      search: ""
    });
    
    // Clear saved filter preferences from cookies
    if (hasConsentedToCookies()) {
      saveFilterPreferences({});
    }
  };

  // Prepare page title and description based on filters
  const pageTitle = categoryName 
    ? `${categoryName} | RPM Auto Inventory`
    : "Our Inventory | RPM Auto";
    
  const pageDescription = categoryName
    ? `Explore our collection of ${categoryName.toLowerCase()} at RPM Auto. Premium selection of luxury vehicles in Woodbridge, ON.`
    : "Browse our inventory of premium luxury vehicles at RPM Auto in Woodbridge, ON. Find your dream car today.";
    
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory", current: !categoryName }
  ];
  
  if (categoryName) {
    breadcrumbItems.push({ 
      label: categoryName, 
      href: `/inventory?category=${filters.category}`,
      current: true 
    });
  }
  
  return (
    <main className="py-12 bg-[#F5F5F5] min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        keywords="luxury cars, exotic cars, premium vehicles, car inventory, Woodbridge, Toronto, Ontario"
        ogType="website"
        ogImage="/RPM Auto.png"
        canonical={categoryName ? `https://rpmauto.com/inventory?category=${filters.category}` : "https://rpmauto.com/inventory"}
      />
      <CanonicalUrl path={categoryName ? `/inventory?category=${filters.category}` : "/inventory"} />
      
      {/* Breadcrumb structured data */}
      <JsonLdSchema
        schema={createBreadcrumbSchema(
          categoryName 
            ? [
                { name: "Home", item: "https://rpmauto.com/" },
                { name: "Inventory", item: "https://rpmauto.com/inventory" },
                { name: categoryName, item: `https://rpmauto.com/inventory?category=${filters.category}` }
              ]
            : [
                { name: "Home", item: "https://rpmauto.com/" },
                { name: "Inventory", item: "https://rpmauto.com/inventory" }
              ]
        )}
      />
      
      {/* CollectionPage schema for inventory listing */}
      <JsonLdSchema
        schema={{
          "@type": "CollectionPage",
          "name": pageTitle,
          "description": pageDescription,
          "url": categoryName 
            ? `https://rpmauto.com/inventory?category=${filters.category}` 
            : "https://rpmauto.com/inventory",
          "numberOfItems": filteredVehicles?.length || 0,
          "itemListElement": filteredVehicles?.slice(0, 10).map((vehicle, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              "url": `https://rpmauto.com/inventory/${vehicle.id}`,
              "image": vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '',
              "offers": {
                "@type": "Offer",
                "price": vehicle.price,
                "priceCurrency": "CAD",
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        }}
      />
      
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-['Poppins'] font-bold mb-4">
            {categoryName ? categoryName : "Our Inventory"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our collection of premium luxury vehicles. Use the filters to find your dream car.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-['Poppins'] font-semibold">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-[#E31837] hover:text-black transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Make</label>
                  <Select 
                    value={filters.make}
                    onValueChange={(value) => handleFilterChange("make", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Makes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-makes">All Makes</SelectItem>
                      {uniqueMakes.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <Input 
                    type="text" 
                    placeholder="Enter model"
                    value={filters.model}
                    onChange={(e) => handleFilterChange("model", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Input
                    type="number"
                    placeholder="Enter year"
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      <SelectItem value="sports-cars">Sports Cars</SelectItem>
                      <SelectItem value="luxury-sedans">Luxury Sedans</SelectItem>
                      <SelectItem value="suvs-crossovers">SUVs & Crossovers</SelectItem>
                      <SelectItem value="exotic-collection">Exotic Collection</SelectItem>
                      <SelectItem value="convertibles">Convertibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Vehicles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters - Mobile */}
          <div className="lg:hidden w-full mb-8">
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-md">
              <AccordionItem value="filters">
                <AccordionTrigger className="p-4">
                  <span className="text-xl font-['Poppins'] font-semibold">Filters</span>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <div className="space-y-6">
                    <div className="text-right">
                      <button 
                        onClick={clearFilters}
                        className="text-[#E31837] hover:text-black transition-colors text-sm"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Make</label>
                      <Select 
                        value={filters.make}
                        onValueChange={(value) => handleFilterChange("make", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Makes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-makes">All Makes</SelectItem>
                          {uniqueMakes.map(make => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Model</label>
                      <Input 
                        type="text" 
                        placeholder="Enter model"
                        value={filters.model}
                        onChange={(e) => handleFilterChange("model", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Year</label>
                      <Input
                        type="number"
                        placeholder="Enter year"
                        value={filters.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Price Range</label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.priceMin}
                          onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.priceMax}
                          onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-categories">All Categories</SelectItem>
                          <SelectItem value="sports-cars">Sports Cars</SelectItem>
                          <SelectItem value="luxury-sedans">Luxury Sedans</SelectItem>
                          <SelectItem value="suvs-crossovers">SUVs & Crossovers</SelectItem>
                          <SelectItem value="exotic-collection">Exotic Collection</SelectItem>
                          <SelectItem value="convertibles">Convertibles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Vehicles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vehicles</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          {/* Vehicle Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-[460px] animate-pulse">
                    <div className="w-full h-56 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="space-y-2 w-2/5">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                        <div className="space-y-2 w-2/5">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      <div className="h-10 bg-gray-300 rounded mt-6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVehicles && filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredVehicles.map((vehicle) => (
                  <CarCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <div className="text-[#E31837] mb-4">
                  <i className="fas fa-car-alt text-5xl"></i>
                </div>
                <h3 className="text-2xl font-['Poppins'] font-bold mb-2">No Vehicles Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any vehicles matching your criteria. Try adjusting your filters or check back later for new inventory.
                </p>
                <button 
                  onClick={clearFilters} 
                  className="inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recently Viewed Vehicles */}
      <RecentlyViewedVehicles />
    </main>
  );
}
