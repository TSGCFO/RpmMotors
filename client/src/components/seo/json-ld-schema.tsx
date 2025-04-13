import React from 'react';

interface JsonLdSchemaProps {
  schema: Record<string, any>;
}

/**
 * JsonLdSchema component for adding structured data to pages
 * 
 * This component provides a standardized way to insert JSON-LD structured data
 * into the page, which improves search engine understanding of page content
 * and can enhance rich snippet display in search results.
 * 
 * @param {Record<string, any>} schema - The structured data object to be inserted
 */
export default function JsonLdSchema({ schema }: JsonLdSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    ...schema
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
}

/**
 * Helper functions to create common schema types
 */

// Business schema generator
export const createBusinessSchema = (data: {
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
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  image?: string;
  priceRange?: string;
  sameAs?: string[]; // Social media profiles
}) => {
  return {
    '@type': 'AutoDealer',
    ...data,
    address: {
      '@type': 'PostalAddress',
      ...data.address
    },
    ...(data.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        ...data.geo
      }
    })
  };
};

// Product schema generator for vehicles
export const createVehicleSchema = (data: {
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
  vehicleInteriorColor?: string;
  vehicleExteriorColor?: string;
  image: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}) => {
  return {
    '@type': 'Vehicle',
    ...data,
    offers: {
      '@type': 'Offer',
      ...data.offers
    },
    ...(data.mileageFromOdometer && {
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        ...data.mileageFromOdometer
      }
    }),
    ...(data.vehicleEngine && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        ...data.vehicleEngine
      }
    })
  };
};

// FAQ schema generator
export const createFaqSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

// Breadcrumb schema generator
export const createBreadcrumbSchema = (items: { name: string; item: string }[]) => {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
};