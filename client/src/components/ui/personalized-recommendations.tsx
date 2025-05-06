import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Vehicle } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { hasConsentedToCookies, getPopularVehicles } from '@/lib/cookieUtils';

export default function PersonalizedRecommendations() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has consented to cookies
    const consent = localStorage.getItem('cookie_consent');
    setHasConsent(consent === 'true');
    
    // If they have consented, load popular vehicles
    if (consent === 'true') {
      loadRecommendedVehicles();
    } else {
      setLoading(false);
    }
  }, []);

  const loadRecommendedVehicles = async () => {
    try {
      setLoading(true);
      
      // Get popular vehicle IDs tracked in cookies
      const popularVehicleIds = getPopularVehicles();
      
      if (popularVehicleIds.length === 0) {
        // If no popularity data, get featured vehicles
        const featuredResponse = await fetch('/api/vehicles/featured');
        if (featuredResponse.ok) {
          const featuredVehicles = await featuredResponse.json();
          setVehicles(featuredVehicles);
        }
      } else {
        // Get vehicles by popularity
        const vehiclePromises = popularVehicleIds.map(id => 
          fetch(`/api/vehicles/${id}`).then(res => res.json())
        );
        
        const results = await Promise.all(vehiclePromises);
        const validVehicles = results.filter(vehicle => vehicle !== null);
        
        setVehicles(validVehicles);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading recommended vehicles:", error);
      setLoading(false);
    }
  };

  // If there are no vehicles to show, don't render the component
  if (vehicles.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="mt-12 bg-[#F5F5F5] py-10 px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl font-['Poppins'] font-bold mb-6">
          {hasConsent ? "Recommended For You" : "Featured Vehicles"}
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-5 w-1/2 mb-3" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <Link 
                key={vehicle.id} 
                href={`/inventory/${vehicle.id}`}
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer group">
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    <img 
                      src={(vehicle.images && vehicle.images.length > 0) ? vehicle.images[0] : `/placeholders/placeholder-car.svg`}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholders/placeholder-car.svg';
                      }}
                    />
                    {hasConsent && (
                      <div className="absolute top-0 right-0 bg-[#E31837] text-white text-xs px-2 py-1">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-['Poppins'] font-semibold mb-1">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-[#E31837] font-bold text-lg mb-2">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {vehicle.mileage.toLocaleString()} km | {vehicle.transmission} | {vehicle.fuelType}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {hasConsent && (
          <p className="text-gray-500 text-sm mt-4">
            Recommendations are personalized based on vehicle popularity and your browsing history.
          </p>
        )}
      </div>
    </div>
  );
}