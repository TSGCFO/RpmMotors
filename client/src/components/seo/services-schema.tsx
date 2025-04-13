import React from 'react';
import JsonLdSchema from '@/components/seo/json-ld-schema';

interface Service {
  name: string;
  description: string;
  url: string;
  image?: string;
  provider?: {
    name: string;
    url: string;
  };
  serviceType?: string;
  serviceOutput?: string;
  areaServed?: string | {
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  availableChannel?: {
    name: string;
    serviceUrl: string;
  };
}

interface ServicesSchemaProps {
  businessName: string;
  businessUrl: string;
  services: Service[];
}

/**
 * ServicesSchema component for automotive services structured data
 * 
 * This component renders specialized structured data for automotive services
 * to improve rich snippets and service listings in search results.
 * 
 * @param {string} businessName - The name of the dealership
 * @param {string} businessUrl - The URL of the dealership website
 * @param {Array} services - Array of service objects with details
 */
export default function ServicesSchema({
  businessName,
  businessUrl,
  services
}: ServicesSchemaProps) {
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "AutomotiveBusiness",
    "name": businessName,
    "url": businessUrl,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${businessName} Automotive Services`,
      "itemListElement": services.map((service, index) => ({
        "@type": "Service",
        "position": index + 1,
        "name": service.name,
        "description": service.description,
        "url": service.url,
        ...(service.image && { "image": service.image }),
        ...(service.provider && {
          "provider": {
            "@type": "AutomotiveBusiness",
            "name": service.provider.name,
            "url": service.provider.url
          }
        }),
        ...(service.serviceType && { "serviceType": service.serviceType }),
        ...(service.serviceOutput && { "serviceOutput": service.serviceOutput }),
        ...(service.areaServed && {
          "areaServed": typeof service.areaServed === 'string'
            ? service.areaServed
            : {
              "@type": "PostalAddress",
              "addressLocality": service.areaServed.addressLocality,
              "addressRegion": service.areaServed.addressRegion,
              "postalCode": service.areaServed.postalCode,
              "addressCountry": service.areaServed.addressCountry
            }
        }),
        ...(service.availableChannel && {
          "availableChannel": {
            "@type": "ServiceChannel",
            "name": service.availableChannel.name,
            "serviceUrl": service.availableChannel.serviceUrl
          }
        })
      }))
    }
  };

  return <JsonLdSchema schema={servicesSchema} />;
}