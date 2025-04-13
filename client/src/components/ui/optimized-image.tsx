import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  decoding?: 'async' | 'auto' | 'sync';
}

/**
 * OptimizedImage component for improved image loading and SEO
 * 
 * This component enhances regular image tags with:
 * - Proper width and height attributes to prevent layout shifts
 * - Loading attributes for performance optimization
 * - Proper alt text for accessibility and SEO
 * - Optional priority flag for LCP images
 * - Decoding attribute for browser optimization
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  loading = 'lazy',
  sizes,
  decoding = 'async'
}: OptimizedImageProps) {
  // Force eager loading if priority is true
  const loadingAttribute = priority ? 'eager' : loading;
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loadingAttribute}
      sizes={sizes}
      decoding={decoding}
      // Add fetchpriority attribute for browsers that support it
      {...(priority ? { fetchpriority: 'high' } : {})}
    />
  );
}