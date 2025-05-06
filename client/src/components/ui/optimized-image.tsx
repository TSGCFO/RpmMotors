import React from 'react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: never; // Prevent direct use of loading attribute
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
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover'
}: OptimizedImageProps) {
  // Construct object-fit class
  const objectFitClass = objectFit ? `object-${objectFit}` : '';
  
  // Normalize image src path
  const normalizedSrc = (() => {
    if (!src) return '/placeholders/placeholder-car.svg';
    if (src.startsWith('http') || src.startsWith('/')) return src;
    return `/${src}`;
  })();

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      className={`${className} ${objectFitClass}`.trim()}
      style={{
        // If width/height are provided, set them as style props too for older browsers
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` }),
      }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/placeholders/placeholder-car.svg';
      }}
    />
  );
}