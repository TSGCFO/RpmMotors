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

// Shared Offer fields included in a vehicle Offer (schema.org/Offer properties
// only — the product identifier/SKU lives on the Product/Vehicle entity).
interface VehicleOffer {
  price: number;
  priceCurrency: string;
  availability: string;
  url: string;
  priceValidUntil?: string;
  itemCondition?: string;
}

/**
 * Builds the Offer for a vehicle, used by both the inventory listing and the
 * vehicle detail page so the structured data stays consistent.
 *
 * This matches the site's ORIGINAL behavior: an Offer (with price) is always
 * returned and availability is always InStock. Google requires every Product to
 * carry an Offer/review/rating, so the Offer must always be present. The only
 * additions over the original are the recommended fields (priceValidUntil,
 * itemCondition) that resolve the non-critical "Product snippets" /
 * "Merchant listings" warnings in Search Console. Availability and the
 * sold-vehicle handling are intentionally left exactly as they were.
 */
export const buildVehicleOffer = (vehicle: {
  id: number;
  price: number;
  condition: string;
}): VehicleOffer => {
  const conditionMap: Record<string, string> = {
    'New': 'https://schema.org/NewCondition',
    'Used': 'https://schema.org/UsedCondition',
    'Certified Pre-Owned': 'https://schema.org/UsedCondition',
  };

  // Rolling one-year validity so the price is never reported as stale.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    price: vehicle.price,
    priceCurrency: 'CAD',
    availability: 'https://schema.org/InStock',
    url: `https://www.rpmautosales.ca/inventory/${vehicle.id}`,
    priceValidUntil,
    itemCondition: conditionMap[vehicle.condition] ?? 'https://schema.org/UsedCondition',
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
  vehicleIdentificationNumber?: string;
  mileageFromOdometer?: {
    value: number;
    unitCode: string;
  };
  vehicleTransmission?: string;
  driveWheelConfiguration?: string;
  vehicleInteriorColor?: string;
  vehicleExteriorColor?: string;
  image: string;
  sku?: string;
  offers?: VehicleOffer;
}) => {
  // Pull out the fields that need typed (nested @type) shapes so they aren't
  // emitted twice via the rest spread.
  const { offers, mileageFromOdometer, vehicleEngine, ...rest } = data;
  return {
    '@type': 'Vehicle',
    ...rest,
    // Only emit an Offer when one is provided (omitted for sold vehicles).
    ...(offers && {
      offers: {
        '@type': 'Offer',
        ...offers
      }
    }),
    ...(mileageFromOdometer && {
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        ...mileageFromOdometer
      }
    }),
    ...(vehicleEngine && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        ...vehicleEngine
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