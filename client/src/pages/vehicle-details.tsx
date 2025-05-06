import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Vehicle } from "@shared/schema";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { VehicleGallery } from "@/components/ui/vehicle-gallery";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OptimizedImage } from "@/components/ui/optimized-image";
import PageMeta from "@/components/seo/page-meta";
import StructuredData from "@/components/seo/structured-data";
import CanonicalUrl from "@/components/seo/canonical-url";
import JsonLdSchema, { createVehicleSchema, createBreadcrumbSchema } from "@/components/seo/json-ld-schema";
import { 
  saveRecentlyViewedVehicle, 
  getRecentlyViewedVehicles,
  incrementViewedVehiclesCount
} from "@/lib/cookieUtils";

export default function VehicleDetails() {
  const [, params] = useRoute<{ id: string }>("/inventory/:id");
  
  // Fetch vehicle data
  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${params?.id}`],
    enabled: !!params?.id,
  });

  // State for recently viewed vehicles
  const [recentlyViewed, setRecentlyViewed] = useState<Vehicle[]>([]);
  
  useEffect(() => {
    // Set page title when vehicle data is available
    if (vehicle) {
      document.title = `${vehicle.year} ${vehicle.make} ${vehicle.model} | RPM Auto`;
      
      // Save this vehicle to recently viewed cookies
      saveRecentlyViewedVehicle(vehicle.id);
      
      // Increment the count of viewed vehicles for analytics
      incrementViewedVehiclesCount();
    } else {
      document.title = "Vehicle Details | RPM Auto";
    }
  }, [vehicle]);
  
  // Fetch recently viewed vehicles when the page loads
  useEffect(() => {
    if (!vehicle) return;
    
    // Get IDs of recently viewed vehicles (excluding current one)
    const recentIds = getRecentlyViewedVehicles()
      .filter(id => id !== vehicle.id)
      .slice(0, 3); // Limit to 3 vehicles
    
    if (recentIds.length === 0) return;
    
    // Fetch vehicle data for each ID
    const fetchRecentVehicles = async () => {
      try {
        const vehicles = await Promise.all(
          recentIds.map(async (id) => {
            const response = await fetch(`/api/vehicles/${id}`);
            if (!response.ok) throw new Error(`Failed to fetch vehicle ${id}`);
            return response.json();
          })
        );
        setRecentlyViewed(vehicles);
      } catch (error) {
        console.error("Error fetching recently viewed vehicles:", error);
      }
    };
    
    fetchRecentVehicles();
  }, [vehicle]);

  if (isLoading) {
    return (
      <div className="py-16 bg-[#F5F5F5] min-h-screen">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-[400px] bg-gray-300 rounded"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-300 rounded w-2/3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-full mt-8"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="h-12 bg-gray-300 rounded"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="py-16 bg-[#F5F5F5] min-h-screen">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-[#E31837] mb-4">
              <i className="fas fa-exclamation-triangle text-5xl"></i>
            </div>
            <h1 className="text-3xl font-['Poppins'] font-bold mb-4">Vehicle Not Found</h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the vehicle you're looking for. It may have been sold or removed from our inventory.
            </p>
            <Link href="/inventory" className="inline-block px-6 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
              Browse Our Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prepare SEO data
  const pageTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} | RPM Auto`;
  const pageDescription = `${vehicle.year} ${vehicle.make} ${vehicle.model} with ${formatNumber(vehicle.mileage)} km, ${vehicle.transmission}, ${vehicle.color}. Available at RPM Auto in Woodbridge.`;
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Inventory", href: "/inventory" },
    { 
      label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, 
      href: `/inventory/${vehicle.id}`,
      current: true 
    }
  ];
  
  // Prepare vehicle structured data
  const vehicleData = {
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: vehicle.description,
    brand: vehicle.make,
    model: vehicle.model,
    modelDate: vehicle.year.toString(),
    vehicleEngine: {
      engineType: "Internal combustion",
      fuelType: vehicle.fuelType
    },
    url: `https://rpmauto.com/inventory/${vehicle.id}`,
    mileageFromOdometer: {
      value: vehicle.mileage,
      unitCode: "KMT"
    },
    vehicleTransmission: vehicle.transmission,
    driveWheelConfiguration: vehicle.features && vehicle.features.length > 0 ? vehicle.features[0] : "Standard",
    vehicleInteriorColor: "Not specified",
    vehicleExteriorColor: vehicle.color,
    image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "",
    offers: {
      price: vehicle.price,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      url: `https://rpmauto.com/inventory/${vehicle.id}`
    }
  };
  
  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        keywords={`${vehicle.make}, ${vehicle.model}, used cars, luxury cars, ${vehicle.category}, Woodbridge, Toronto, Ontario`}
        ogType="product"
        ogImage={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : ''}
        canonical={`https://rpmauto.com/inventory/${vehicle.id}`}
      />
      <CanonicalUrl path={`/inventory/${vehicle.id}`} />
      <StructuredData
        type="vehicle"
        vehicleData={vehicleData}
      />
      {/* Enhanced vehicle structured data with JSON-LD */}
      <JsonLdSchema
        schema={createVehicleSchema({
          name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          description: vehicle.description || `${vehicle.year} ${vehicle.make} ${vehicle.model} available at RPM Auto in Woodbridge, Ontario. This ${vehicle.color} ${vehicle.category.toLowerCase()} features ${vehicle.transmission} transmission and ${formatNumber(vehicle.mileage)} kilometers.`,
          brand: vehicle.make,
          model: vehicle.model,
          modelDate: vehicle.year.toString(),
          vehicleEngine: {
            engineType: "Internal combustion",
            fuelType: vehicle.fuelType
          },
          url: `https://rpmauto.com/inventory/${vehicle.id}`,
          mileageFromOdometer: {
            value: vehicle.mileage,
            unitCode: "KMT"
          },
          vehicleTransmission: vehicle.transmission,
          driveWheelConfiguration: vehicle.features && vehicle.features.length > 0 ? vehicle.features[0] : "Standard",
          vehicleInteriorColor: "Not specified",
          vehicleExteriorColor: vehicle.color,
          image: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "",
          offers: {
            price: vehicle.price,
            priceCurrency: "CAD",
            availability: "https://schema.org/InStock",
            url: `https://rpmauto.com/inventory/${vehicle.id}`
          }
        })}
      />
      {/* Breadcrumb structured data */}
      <JsonLdSchema
        schema={createBreadcrumbSchema([
          { name: "Home", item: "https://rpmauto.com/" },
          { name: "Inventory", item: "https://rpmauto.com/inventory" },
          { name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`, item: `https://rpmauto.com/inventory/${vehicle.id}` }
        ])}
      />
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} className="mb-0" />
        </div>
      </div>

      {/* Vehicle Header */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-gray-600 mt-1">
                <span>Stock# {vehicle.vin.slice(-6)}</span>
                <span className="mx-2">|</span>
                <span>{formatNumber(vehicle.mileage)} km</span>
                <span className="mx-2">|</span>
                <span>{vehicle.color}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {vehicle.status === 'sold' ? (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">PRICE</p>
                  <p className="text-3xl font-['Poppins'] font-bold text-black">Price Hidden</p>
                  <span className="inline-block mt-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                    Sold
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-['Poppins'] font-bold text-[#E31837]">{formatCurrency(vehicle.price)}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Gallery and Basic Info */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Photo Gallery */}
            <VehicleGallery photos={vehicle.images || []} vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />

            {/* Vehicle Information */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-['Poppins'] font-semibold mb-6">Vehicle Information</h2>
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="flex items-center">
                    <i className="fas fa-calendar-alt w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-semibold">{vehicle.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-tachometer-alt w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Mileage</p>
                      <p className="font-semibold">{formatNumber(vehicle.mileage)} km</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-palette w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Exterior Color</p>
                      <p className="font-semibold">{vehicle.color}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-gas-pump w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Fuel Type</p>
                      <p className="font-semibold">{vehicle.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-cog w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Transmission</p>
                      <p className="font-semibold">{vehicle.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-car w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Features</p>
                      <p className="font-semibold">{vehicle.features && vehicle.features.length > 0 ? vehicle.features[0] : "Standard"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-tag w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold">{vehicle.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-id-card w-8 text-[#E31837]"></i>
                    <div>
                      <p className="text-sm text-gray-500">VIN</p>
                      <p className="font-semibold">{vehicle.vin}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <a href={`tel:+1-905-264-1969`} className="flex items-center justify-center bg-black hover:bg-opacity-80 text-white py-3 px-6 rounded font-['Poppins'] font-semibold transition">
                  <i className="fas fa-phone-alt mr-2"></i> Call Us
                </a>
                <a href="#inquiry-form" className="flex items-center justify-center bg-[#E31837] hover:bg-opacity-90 text-white py-3 px-6 rounded font-['Poppins'] font-semibold transition">
                  <i className="fas fa-envelope mr-2"></i> Inquire Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Description */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-['Poppins'] font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {vehicle.description}
            </p>
          </div>
        </div>
      </section>

      {/* Vehicle Features */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-['Poppins'] font-semibold mb-4">Key Features & Highlights</h2>
            
            {vehicle.features && (
              <div className="space-y-6">
                {/* Categorized features */}
                {(() => {
                  // Get features array
                  const featuresArray = typeof vehicle.features === 'string' 
                    ? vehicle.features.split(',').map(f => f.trim()) 
                    : Array.isArray(vehicle.features) ? vehicle.features : [];
                  
                  // Check if features already contain category headers (starting with ##, ### etc.)
                  const hasMarkdownCategories = featuresArray.some(f => f.trim().startsWith('#'));
                  
                  // If features already have markdown categories, parse those
                  if (hasMarkdownCategories) {
                    const categoriesMap = {};
                    let currentCategory = "Other Features";
                    
                    featuresArray.forEach(feature => {
                      // Check if this is a category header (starts with # or ##)
                      if (feature.trim().startsWith('#')) {
                        // Extract category name by removing # symbols and trimming
                        currentCategory = feature.replace(/^#+\s*/, '').trim();
                        if (!categoriesMap[currentCategory]) {
                          categoriesMap[currentCategory] = [];
                        }
                      } else if (feature.trim()) {
                        // Add non-empty feature to current category
                        if (!categoriesMap[currentCategory]) {
                          categoriesMap[currentCategory] = [];
                        }
                        categoriesMap[currentCategory].push(feature.trim());
                      }
                    });
                    
                    return (
                      <>
                        {Object.entries(categoriesMap).map(([category, features]) => 
                          features.length > 0 ? (
                            <div key={category} className="mb-6">
                              <h3 className="text-xl font-['Poppins'] font-semibold mb-3 text-[#E31837]">{category}</h3>
                              <ul className="list-disc pl-6 space-y-1">
                                {features.map((feature, index) => (
                                  <li key={index} className="text-gray-700">{feature}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null
                        )}
                      </>
                    );
                  }
                  
                  // Otherwise, auto-categorize features based on keywords
                  const categories = {
                    "Performance & Handling": featuresArray.filter(f => 
                      f.toLowerCase().includes('suspension') || 
                      f.toLowerCase().includes('brake') || 
                      f.toLowerCase().includes('exhaust') || 
                      f.toLowerCase().includes('performance') || 
                      f.toLowerCase().includes('turbo') || 
                      f.toLowerCase().includes('horsepower') || 
                      f.toLowerCase().includes('sport') ||
                      f.toLowerCase().includes('wheel') ||
                      f.toLowerCase().includes('aerodynamic') ||
                      f.toLowerCase().includes('engine') ||
                      f.toLowerCase().includes('power') ||
                      f.toLowerCase().includes('handling') ||
                      f.toLowerCase().includes('drive') ||
                      f.toLowerCase().includes('speed')
                    ),
                    "Exterior Details": featuresArray.filter(f => 
                      f.toLowerCase().includes('grille') || 
                      f.toLowerCase().includes('light') || 
                      f.toLowerCase().includes('exterior') || 
                      f.toLowerCase().includes('paint') || 
                      f.toLowerCase().includes('roof') ||
                      f.toLowerCase().includes('skirt') ||
                      f.toLowerCase().includes('spoiler') ||
                      f.toLowerCase().includes('diffuser') ||
                      f.toLowerCase().includes('window') ||
                      f.toLowerCase().includes('mirror') ||
                      f.toLowerCase().includes('color') ||
                      f.toLowerCase().includes('body') ||
                      f.toLowerCase().includes('glass')
                    ),
                    "Interior & Technology": featuresArray.filter(f => 
                      f.toLowerCase().includes('seat') || 
                      f.toLowerCase().includes('audio') || 
                      f.toLowerCase().includes('navigation') || 
                      f.toLowerCase().includes('climate') || 
                      f.toLowerCase().includes('apple carplay') || 
                      f.toLowerCase().includes('android auto') ||
                      f.toLowerCase().includes('display') ||
                      f.toLowerCase().includes('leather') ||
                      f.toLowerCase().includes('steering wheel') ||
                      f.toLowerCase().includes('interior') ||
                      f.toLowerCase().includes('dashboard') ||
                      f.toLowerCase().includes('tech') ||
                      f.toLowerCase().includes('bluetooth') ||
                      f.toLowerCase().includes('screen') ||
                      f.toLowerCase().includes('infotainment') ||
                      f.toLowerCase().includes('connectivity')
                    ),
                    "Safety & Convenience": featuresArray.filter(f => 
                      f.toLowerCase().includes('camera') || 
                      f.toLowerCase().includes('sensor') || 
                      f.toLowerCase().includes('airbag') || 
                      f.toLowerCase().includes('safety') || 
                      f.toLowerCase().includes('keyless') || 
                      f.toLowerCase().includes('cruise') ||
                      f.toLowerCase().includes('assist') ||
                      f.toLowerCase().includes('control') ||
                      f.toLowerCase().includes('warning') ||
                      f.toLowerCase().includes('prevention') ||
                      f.toLowerCase().includes('protection') ||
                      f.toLowerCase().includes('emergency') ||
                      f.toLowerCase().includes('brake') ||
                      f.toLowerCase().includes('park')
                    )
                  };
                  
                  // Find uncategorized features
                  const categorizedFeatures = [...categories["Performance & Handling"], 
                    ...categories["Exterior Details"], 
                    ...categories["Interior & Technology"], 
                    ...categories["Safety & Convenience"]];
                  
                  const uncategorized = featuresArray.filter(f => !categorizedFeatures.includes(f));
                  
                  if (uncategorized.length > 0) {
                    categories["Other Features"] = uncategorized;
                  }
                  
                  return (
                    <>
                      {Object.entries(categories).map(([category, features]) => 
                        features.length > 0 ? (
                          <div key={category} className="mb-6">
                            <h3 className="text-xl font-['Poppins'] font-semibold mb-3 text-[#E31837]">{category}</h3>
                            <ul className="list-disc pl-6 space-y-1">
                              {features.map((feature, index) => (
                                <li key={index} className="text-gray-700">{feature}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Vehicles Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-['Poppins'] font-semibold mb-4">Recently Viewed Vehicles</h2>
              <p className="text-gray-600">
                Here are some other vehicles you've recently viewed.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentlyViewed.map((vehicle) => (
                <Link href={`/inventory/${vehicle.id}`} key={vehicle.id}>
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative h-52">
                      <OptimizedImage 
                        src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : ''} 
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-['Poppins'] font-semibold mb-1">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="font-bold mb-2">
                        {vehicle.status === 'sold' ? 
                         <span className="text-black">Price Hidden</span> : 
                         <span className="text-[#E31837]">{formatCurrency(vehicle.price)}</span>}
                      </p>
                      <div className="text-sm text-gray-600">
                        <span>{formatNumber(vehicle.mileage)} km</span>
                        <span className="mx-2">•</span>
                        <span>{vehicle.transmission}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Form */}
      <section id="inquiry-form" className="py-8">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-['Poppins'] font-semibold mb-6 text-center">
              Interested in this {vehicle.year} {vehicle.make} {vehicle.model}?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Complete the form below and one of our sales specialists will contact you shortly.
            </p>
            <ContactForm vehicleId={vehicle.id} />
          </div>
        </div>
      </section>
    </main>
  );
}
