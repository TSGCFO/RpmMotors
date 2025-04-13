import { useEffect } from 'react';

interface PageMetaProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
}

export default function PageMeta({
  title = 'RPM Auto: New & Used Luxury Cars Dealer | Woodbridge, ON',
  description = 'RPM Auto in Woodbridge has New and Used Luxury Cars and SUVs for sale. Call (905) 264-1969 for RPM Auto Specials and Promotions.',
  canonical = 'https://rpmauto.com/',
  ogType = 'website',
  ogImage = '/RPM Auto.png',
  keywords = 'luxury cars, exotic cars, premium vehicles, car dealership, Woodbridge, Toronto, Ontario'
}: PageMetaProps) {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDesc) ogDesc.setAttribute('content', description);
    if (ogUrl) ogUrl.setAttribute('content', canonical);
    if (ogImageTag) ogImageTag.setAttribute('content', ogImage);
    if (ogTypeTag) ogTypeTag.setAttribute('content', ogType);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDesc = document.querySelector('meta[property="twitter:description"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDesc) twitterDesc.setAttribute('content', description);
    if (twitterUrl) twitterUrl.setAttribute('content', canonical);
    if (twitterImage) twitterImage.setAttribute('content', ogImage);
    
    // Clean up (optional)
    return () => {
      document.title = 'RPM Auto: New & Used Luxury Cars Dealer | Woodbridge, ON';
    };
  }, [title, description, canonical, ogType, ogImage, keywords]);
  
  return null;
}