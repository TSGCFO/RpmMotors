import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import { Link } from "wouter";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  useEffect(() => {
    document.title = "Gallery | RPM Auto";
  }, []);

  // Extract all unique images from vehicles
  const allImages = vehicles?.flatMap(vehicle => vehicle.photos) || [];
  
  // Get unique categories from vehicles
  const categories = vehicles 
    ? [...new Set(vehicles.map(v => v.category))].sort() 
    : [];

  // Filter images based on selected category
  const filteredImages = selectedCategory
    ? vehicles
        ?.filter(vehicle => vehicle.category === selectedCategory)
        .flatMap(vehicle => vehicle.photos) || []
    : allImages;

  const openLightbox = (image: string) => {
    setLightboxImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = "auto";
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-16 relative">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Gallery</h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore our collection of premium luxury vehicles through our image gallery
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-6 py-2 rounded-full font-['Poppins'] transition-colors ${
                selectedCategory === null
                  ? "bg-[#E31837] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2 rounded-full font-['Poppins'] transition-colors ${
                  selectedCategory === category
                    ? "bg-[#E31837] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 8, 9].map((i) => (
                <div key={i} className="bg-gray-300 aspect-[4/3] rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image, index) => (
                <div 
                  key={index} 
                  className="overflow-hidden rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => openLightbox(image)}
                >
                  <img 
                    src={image} 
                    alt={`Luxury vehicle ${index + 1}`} 
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[#E31837] mb-4">
                <i className="fas fa-camera text-5xl"></i>
              </div>
              <h3 className="text-2xl font-['Poppins'] font-bold mb-2">No Images Found</h3>
              <p className="text-gray-600 mb-6">
                No images available for the selected category. Please try another category.
              </p>
              <button 
                onClick={() => handleCategoryChange(null)} 
                className="inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
              >
                View All Categories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Find Your Luxury Vehicle Today</h2>
            <p className="text-gray-300 mb-8">
              Browse our inventory to discover more details about our premium selection of vehicles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/inventory">
                <a className="inline-block px-8 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
                  Browse Inventory
                </a>
              </Link>
              <Link href="/contact">
                <a className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded hover:bg-white hover:text-black transition">
                  Contact Us
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white text-3xl"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <i className="fas fa-times"></i>
          </button>
          <img 
            src={lightboxImage} 
            alt="Enlarged vehicle" 
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
