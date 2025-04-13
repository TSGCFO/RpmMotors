import React from 'react';
import { useLocation } from 'wouter';

interface CanonicalUrlProps {
  path?: string;
}

/**
 * CanonicalUrl component to add a canonical link tag to the head
 * 
 * This component is useful for:
 * - Preventing duplicate content issues
 * - Specifying the preferred URL for search engines to index
 * - Consolidating link signals for pages with multiple URLs
 * 
 * @param {string} path - Optional path to use as the canonical URL.
 *                        If not provided, the current path will be used.
 */
export default function CanonicalUrl({ path }: CanonicalUrlProps) {
  const [location] = useLocation();
  const baseDomain = 'https://rpmauto.com';
  
  // Use provided path or current location
  const canonicalPath = path || location;
  
  // Ensure path starts with a slash
  const formattedPath = canonicalPath.startsWith('/') 
    ? canonicalPath 
    : `/${canonicalPath}`;
  
  // Create the full canonical URL
  const canonicalUrl = `${baseDomain}${formattedPath}`;
  
  return (
    <link rel="canonical" href={canonicalUrl} />
  );
}