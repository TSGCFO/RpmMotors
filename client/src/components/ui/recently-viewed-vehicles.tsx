import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { getRecentlyViewedVehicles } from '@/lib/cookieUtils';
import { Vehicle } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentlyViewedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has consented to cookies
    const consent = localStorage.getItem('cookie_consent');
    setHasConsent(consent === 'true');
    
    // If they have consented, load their recently viewed vehicles
    if (consent === 'true') {
      loadRecentlyViewedVehicles();
    } else {
      setLoading(false);
    }
  }, []);

  const loadRecentlyViewedVehicles = async () => {
    try {
      setLoading(true);
      
      // Get the IDs of recently viewed vehicles from cookies
      const vehicleIds = getRecentlyViewedVehicles();
      
      if (vehicleIds.length === 0) {
        setLoading(false);
        return;
      }
      
      // Fetch the vehicle details for each ID
      const vehiclePromises = vehicleIds.map(id => 
        fetch(`/api/vehicles/${id}`).then(res => res.json())
      );
      
      const results = await Promise.all(vehiclePromises);
      const validVehicles = results.filter(vehicle => vehicle !== null);
      
      setVehicles(validVehicles);
      setLoading(false);
    } catch (error) {
      console.error("Error loading recently viewed vehicles:", error);
      setLoading(false);
    }
  };

  // If user hasn't consented to cookies or there are no recently viewed vehicles
  if (!hasConsent || (vehicles.length === 0 && !loading)) {
    return null;
  }

  return (
    <div className="mt-12 bg-[#F5F5F5] py-10 px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl font-['Poppins'] font-bold mb-6">Recently Viewed Vehicles</h2>
        
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
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={(vehicle.images && vehicle.images.length > 0) ? vehicle.images[0] : `/placeholders/placeholder-car.svg`}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                      className="w-full h-full object-cover hover:scale-105 transition"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholders/placeholder-car.svg';
                      }}
                    />
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
      </div>
    </div>
  );
}