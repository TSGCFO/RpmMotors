import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Vehicle } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface CarCardProps {
  vehicle: Vehicle;
}

export function CarCard({ vehicle }: CarCardProps) {
  const {
    id,
    make,
    model,
    year,
    price,
    mileage,
    fuelType,
    transmission,
    color,
    condition,
    status,
    features = [],
    images = []
  } = vehicle;

  return (
    <Card className="bg-white rounded-lg overflow-hidden shadow-md group transition-all hover:shadow-xl">
      <div className="relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {vehicle.isFeatured && (
            <span className="bg-[#E31837] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
              Featured
            </span>
          )}
          {status === 'sold' && (
            <span className="bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
              Sold
            </span>
          )}
        </div>
        <img 
          src={images && images.length > 0 
            ? (typeof images[0] === 'string' 
                ? (images[0].startsWith('http') || images[0].startsWith('/') 
                    ? images[0] 
                    : `/${images[0]}`)
                : '/placeholders/placeholder-car.svg')
            : '/placeholders/placeholder-car.svg'} 
          alt={`${year} ${make} ${model}`} 
          className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholders/placeholder-car.svg';
          }}
        />
        <div className="flex justify-center space-x-2 pt-2 pb-3 bg-white">
          <span className="text-xs text-gray-600">{images.length} Photos</span>
          <span className="text-gray-300">|</span>
          {status === 'sold' ? (
            <span className="text-xs text-black font-semibold">Sold</span>
          ) : (
            <span className="text-xs text-[#E31837] font-semibold">{formatCurrency(price)}</span>
          )}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-['Poppins'] font-bold text-xl mb-2">
          {year} {make} {model}
        </h3>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <i className="fas fa-tachometer-alt w-5 text-gray-400"></i>
              <span>{mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-gas-pump w-5 text-gray-400"></i>
              <span>{fuelType}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-cog w-5 text-gray-400"></i>
              <span>{transmission}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <i className="fas fa-calendar-alt w-5 text-gray-400"></i>
              <span>{year}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-paint-brush w-5 text-gray-400"></i>
              <span>{color}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-car w-5 text-gray-400"></i>
              <span>{features && features.length > 0 ? features[0] : 'Standard'}</span>
            </div>
          </div>
        </div>
        <Link 
          href={`/inventory/${id}`}
          className="block w-full text-center py-3 bg-black text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
