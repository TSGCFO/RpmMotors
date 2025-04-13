import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { Vehicle } from "@shared/schema";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/ui/contact-form";
import { VehicleGallery } from "@/components/ui/vehicle-gallery";
import { FinancingCalculator } from "@/components/ui/financing-calculator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PageMeta from "@/components/seo/page-meta";
import StructuredData from "@/components/seo/structured-data";

export default function VehicleDetails() {
  const [, params] = useRoute<{ id: string }>("/inventory/:id");
  
  // Fetch vehicle data
  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${params?.id}`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    // Set page title when vehicle data is available
    if (vehicle) {
      document.title = `${vehicle.year} ${vehicle.make} ${vehicle.model} | RPM Auto`;
    } else {
      document.title = "Vehicle Details | RPM Auto";
    }
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
  const pageDescription = `${vehicle.year} ${vehicle.make} ${vehicle.model} with ${formatNumber(vehicle.mileage)} km, ${vehicle.transmission}, ${vehicle.exteriorColor}. Available at RPM Auto in Woodbridge.`;
  
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
    driveWheelConfiguration: vehicle.drivetrain,
    vehicleInteriorColor: "Not specified",
    vehicleExteriorColor: vehicle.exteriorColor,
    image: vehicle.photos[0],
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
        ogImage={vehicle.photos[0]}
        canonical={`https://rpmauto.com/inventory/${vehicle.id}`}
      />
      <StructuredData
        type="vehicle"
        vehicleData={vehicleData}
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
                <span>{vehicle.exteriorColor}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-3xl font-['Poppins'] font-bold text-[#E31837]">{formatCurrency(vehicle.price)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Gallery and Basic Info */}
      <section className="py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Photo Gallery */}
            <VehicleGallery photos={vehicle.photos} vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />

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
                      <p className="font-semibold">{vehicle.exteriorColor}</p>
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
                      <p className="text-sm text-gray-500">Drivetrain</p>
                      <p className="font-semibold">{vehicle.drivetrain}</p>
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

              {/* Financing Calculator */}
              <FinancingCalculator vehiclePrice={vehicle.price} />
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
