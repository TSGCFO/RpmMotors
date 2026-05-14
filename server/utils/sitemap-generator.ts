import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { db } from '../db';
import { vehicles } from '@shared/schema';

interface SitemapUrl {
  url: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  lastmod?: string;
}

export async function generateSitemap(): Promise<string> {
  // Static pages
  const staticUrls: SitemapUrl[] = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/inventory', changefreq: 'daily', priority: 0.9 },
    { url: '/services', changefreq: 'monthly', priority: 0.7 },
    { url: '/gallery', changefreq: 'weekly', priority: 0.6 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/value-my-car', changefreq: 'monthly', priority: 0.8 },
    { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
    { url: '/terms', changefreq: 'yearly', priority: 0.3 },
    { url: '/sitemap', changefreq: 'monthly', priority: 0.4 }
  ];

  // Get all vehicles from database
  const allVehicles = await db.select().from(vehicles);
  
  // Add vehicle URLs
  const vehicleUrls: SitemapUrl[] = allVehicles.map(vehicle => ({
    url: `/inventory/${vehicle.id}`,
    changefreq: 'weekly' as const,
    priority: 0.7,
    lastmod: new Date().toISOString()
  }));

  // Combine all URLs
  const allUrls = [...staticUrls, ...vehicleUrls];

  // Create sitemap
  const stream = new SitemapStream({ 
    hostname: 'https://www.rpmautosales.ca',
    xmlns: {
      news: false,
      xhtml: false,
      image: false,
      video: false
    }
  });

  const xmlString = await streamToPromise(
    Readable.from(allUrls).pipe(stream)
  ).then(data => data.toString());

  return xmlString;
}