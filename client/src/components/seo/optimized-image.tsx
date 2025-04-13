import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage component for SEO-friendly images
 * 
 * This component provides:
 * - Proper width and height attributes to reduce layout shift
 * - Alt text for accessibility and SEO
 * - Loading strategy (lazy by default, eager for priority images)
 * - Controlled aspect ratio via width/height props
 * 
 * @param {string} src - The image source URL
 * @param {string} alt - Descriptive alt text for the image 
 * @param {number} width - The width of the image (optional)
 * @param {number} height - The height of the image (optional)
 * @param {string} className - Additional CSS classes
 * @param {boolean} priority - If true, loads as high priority (non-lazy)
 * @param {string} objectFit - CSS object-fit property
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover'
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={`${className} ${objectFit ? `object-${objectFit}` : ''}`}
      fetchPriority={priority ? 'high' : 'auto'}
      // Add structured data attributes
      itemProp="image"
      itemScope
      itemType="http://schema.org/ImageObject"
    />
  );
}