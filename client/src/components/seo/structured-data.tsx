import { useEffect } from 'react';

interface LocalBusinessData {
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  image: string;
  priceRange: string;
}

interface VehicleData {
  name: string;
  description: string;
  brand: string;
  model: string;
  modelDate: string;
  vehicleEngine?: {
    engineType: string;
    fuelType: string;
  };
  url: string;
  mileageFromOdometer?: {
    value: number;
    unitCode: string;
  };
  vehicleTransmission?: string;
  driveWheelConfiguration?: string;
  fuelConsumption?: {
    value: number;
    unitCode: string;
  };
  vehicleInteriorColor?: string;
  vehicleExteriorColor?: string;
  image: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

interface StructuredDataProps {
  type: 'localBusiness' | 'vehicle';
  businessData?: LocalBusinessData;
  vehicleData?: VehicleData;
}

export default function StructuredData({ type, businessData, vehicleData }: StructuredDataProps) {
  useEffect(() => {
    // Clean up any existing JSON-LD script
    const existingScript = document.getElementById('structured-data-jsonld');
    if (existingScript) {
      existingScript.remove();
    }
    
    let structuredData: any = {};
    
    if (type === 'localBusiness' && businessData) {
      // Business structured data
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        'name': businessData.name,
        'description': businessData.description,
        'url': businessData.url,
        'telephone': businessData.telephone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': businessData.address.streetAddress,
          'addressLocality': businessData.address.addressLocality,
          'addressRegion': businessData.address.addressRegion,
          'postalCode': businessData.address.postalCode,
          'addressCountry': businessData.address.addressCountry
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': businessData.geo.latitude,
          'longitude': businessData.geo.longitude
        },
        'openingHoursSpecification': businessData.openingHours.map((hours) => ({
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': hours.split(' ')[0],
          'opens': hours.split(' ')[1].split('-')[0],
          'closes': hours.split(' ')[1].split('-')[1]
        })),
        'image': businessData.image,
        'priceRange': businessData.priceRange
      };
    } else if (type === 'vehicle' && vehicleData) {
      // Vehicle structured data
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Vehicle',
        'name': vehicleData.name,
        'description': vehicleData.description,
        'brand': {
          '@type': 'Brand',
          'name': vehicleData.brand
        },
        'model': vehicleData.model,
        'modelDate': vehicleData.modelDate,
        'url': vehicleData.url,
        'image': vehicleData.image,
        'offers': {
          '@type': 'Offer',
          'price': vehicleData.offers.price,
          'priceCurrency': vehicleData.offers.priceCurrency,
          'availability': vehicleData.offers.availability,
          'url': vehicleData.offers.url
        }
      };
      
      // Add optional vehicle properties if available
      if (vehicleData.vehicleEngine) {
        structuredData.vehicleEngine = {
          '@type': 'EngineSpecification',
          'engineType': vehicleData.vehicleEngine.engineType,
          'fuelType': vehicleData.vehicleEngine.fuelType
        };
      }
      
      if (vehicleData.mileageFromOdometer) {
        structuredData.mileageFromOdometer = {
          '@type': 'QuantitativeValue',
          'value': vehicleData.mileageFromOdometer.value,
          'unitCode': vehicleData.mileageFromOdometer.unitCode
        };
      }
      
      if (vehicleData.vehicleTransmission) {
        structuredData.vehicleTransmission = vehicleData.vehicleTransmission;
      }
      
      if (vehicleData.driveWheelConfiguration) {
        structuredData.driveWheelConfiguration = vehicleData.driveWheelConfiguration;
      }
      
      if (vehicleData.vehicleInteriorColor) {
        structuredData.vehicleInteriorColor = vehicleData.vehicleInteriorColor;
      }
      
      if (vehicleData.vehicleExteriorColor) {
        structuredData.vehicleExteriorColor = vehicleData.vehicleExteriorColor;
      }
    }
    
    // Create and append the JSON-LD script
    const script = document.createElement('script');
    script.id = 'structured-data-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Clean up
    return () => {
      const scriptToRemove = document.getElementById('structured-data-jsonld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, businessData, vehicleData]);
  
  return null;
}