import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

/**
 * OptimizedImage component for better SEO and performance
 * 
 * This component enhances images with:
 * - Proper alt text (required for accessibility and SEO)
 * - Width and height attributes (prevents layout shifts)
 * - Lazy loading (improves page load performance)
 * - Descriptive structured data attributes
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  onClick
}: OptimizedImageProps) {
  // Extract filename from src for better accessibility when alt text is generic
  const getFilename = (src: string) => {
    const parts = src.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    return filename.replace(/[-_]/g, ' ');
  };

  // Get enhanced alt text if the provided one is too generic
  const enhancedAlt = alt.length < 5 ? `${alt} - ${getFilename(src)}` : alt;
  
  return (
    <img
      src={src}
      alt={enhancedAlt}
      width={width}
      height={height}
      loading={loading}
      className={className}
      onClick={onClick}
      itemProp="image"
      itemScope
      itemType="https://schema.org/ImageObject"
    />
  );
}