import { useState, useEffect } from 'react';
import {
  getUserVisitCount,
  getViewedVehiclesCount,
  getPopularVehicles,
  getSessionId,
  getABTestVariant
} from '@/lib/cookieUtils';
import { Vehicle } from '@shared/schema';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Link } from 'wouter';

export default function AnalyticsDashboard() {
  const [userStats, setUserStats] = useState({
    visits: 0,
    vehiclesViewed: 0,
    sessionId: '',
    testVariant: ''
  });
  
  const [popularVehicles, setPopularVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get cookie-based stats
    const visits = getUserVisitCount();
    const vehiclesViewed = getViewedVehiclesCount();
    const sessionId = getSessionId() || 'Not available';
    const testVariant = getABTestVariant('home_layout') || 'Not assigned';
    
    setUserStats({
      visits,
      vehiclesViewed,
      sessionId,
      testVariant
    });
    
    // Get popular vehicles data
    const fetchPopularVehicles = async () => {
      setIsLoading(true);
      
      try {
        // Get IDs of popular vehicles from cookies
        const popularIds = getPopularVehicles().slice(0, 5); // Top 5
        
        if (popularIds.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // Fetch vehicle data for each ID
        const vehicleData = await Promise.all(
          popularIds.map(async (id) => {
            const response = await fetch(`/api/vehicles/${id}`);
            if (!response.ok) throw new Error(`Failed to fetch vehicle ${id}`);
            return response.json();
          })
        );
        
        setPopularVehicles(vehicleData);
      } catch (error) {
        console.error("Error fetching popular vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPopularVehicles();
  }, []);
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-['Poppins'] font-bold mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* User visits */}
        <div className="bg-[#F5F5F5] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-600">Total Visits</h3>
            <span className="text-[#E31837]">
              <i className="fas fa-user-clock"></i>
            </span>
          </div>
          <p className="text-3xl font-['Poppins'] font-bold">{userStats.visits}</p>
          <p className="text-sm text-gray-500 mt-2">User visits based on cookies</p>
        </div>
        
        {/* Vehicles viewed */}
        <div className="bg-[#F5F5F5] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-600">Vehicles Viewed</h3>
            <span className="text-[#E31837]">
              <i className="fas fa-car"></i>
            </span>
          </div>
          <p className="text-3xl font-['Poppins'] font-bold">{userStats.vehiclesViewed}</p>
          <p className="text-sm text-gray-500 mt-2">Total vehicle views</p>
        </div>
        
        {/* Session ID */}
        <div className="bg-[#F5F5F5] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-600">Session ID</h3>
            <span className="text-[#E31837]">
              <i className="fas fa-fingerprint"></i>
            </span>
          </div>
          <p className="text-sm font-mono mt-2 overflow-hidden overflow-ellipsis">{userStats.sessionId}</p>
          <p className="text-sm text-gray-500 mt-2">Unique session identifier</p>
        </div>
        
        {/* A/B Test Variant */}
        <div className="bg-[#F5F5F5] p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-600">A/B Test Variant</h3>
            <span className="text-[#E31837]">
              <i className="fas fa-vial"></i>
            </span>
          </div>
          <p className="text-3xl font-['Poppins'] font-bold">{userStats.testVariant}</p>
          <p className="text-sm text-gray-500 mt-2">Home layout test</p>
        </div>
      </div>
      
      {/* Popular Vehicles */}
      <div>
        <h3 className="text-xl font-['Poppins'] font-semibold mb-4">Popular Vehicles</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F5F5F5] p-4 rounded-lg animate-pulse">
                <div className="h-36 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : popularVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularVehicles.map((vehicle) => (
              <Link href={`/inventory/${vehicle.id}`} key={vehicle.id}>
                <div className="bg-[#F5F5F5] p-4 rounded-lg hover:shadow-md transition cursor-pointer">
                  <div className="relative h-36 mb-4">
                    <OptimizedImage
                      src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : ''}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <h4 className="font-['Poppins'] font-semibold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[#E31837] font-bold">{formatCurrency(vehicle.price)}</p>
                    <p className="text-gray-500 text-sm">{formatNumber(vehicle.mileage)} km</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#F5F5F5] p-6 rounded-lg text-center">
            <p className="text-gray-500">No popular vehicles data available yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              This will populate as users browse the inventory.
            </p>
          </div>
        )}
      </div>
      
      {/* Analytics Info */}
      <div className="mt-8 p-6 bg-[#F5F5F5] rounded-lg">
        <h3 className="text-xl font-['Poppins'] font-semibold mb-4">About Analytics</h3>
        <div className="text-gray-600 space-y-3">
          <p>
            <strong>Analytics & Insights:</strong> The data shown here helps understand how users navigate the site and which vehicles generate the most interest.
          </p>
          <p>
            <strong>Targeted Content:</strong> Popular vehicles can be featured on the homepage to improve user engagement.
          </p>
          <p>
            <strong>A/B Testing:</strong> Different layouts and features can be tested to see which performs better. Currently testing home page layout variants.
          </p>
          <p>
            <strong>Marketing Effectiveness:</strong> Track which marketing campaigns drive conversions through UTM parameters in cookies.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Note: All analytics data is stored in browser cookies and is anonymized. No personally identifiable information is collected.
          </p>
        </div>
      </div>
    </div>
  );
}