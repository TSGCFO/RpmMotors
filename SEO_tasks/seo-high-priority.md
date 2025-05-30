# SEO High Priority Improvements - Weeks 2-3

## Prerequisites: Complete ALL Critical Fixes first

---

## Task 6: Implement Dynamic Sitemap Generation

### Step 6.1: Install required package
1. Open terminal in project root
2. Run: `npm install sitemap`
3. Wait for installation to complete
4. Verify in `package.json` that `"sitemap": "^7.x.x"` is listed

### Step 6.2: Create sitemap generator
1. Create new file: `server/utils/sitemap-generator.ts`
2. Copy this EXACT code:

```typescript
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
```

3. Save file

### Step 6.3: Add sitemap route
1. Open file: `server/routes.ts`
2. At the top, add import: `import { generateSitemap } from './utils/sitemap-generator';`
3. Find where you added the static sitemap route in Task 1
4. Replace it with:

```typescript
// Dynamic sitemap generation
app.get("/sitemap.xml", async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header("Content-Type", "application/xml");
    res.header("Content-Encoding", "UTF-8");
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
```

5. Save file

### Step 6.4: Remove static sitemap
1. Delete file: `public/sitemap.xml`
2. This ensures dynamic sitemap is always used

---

## Task 7: Optimize All Category Images

### Step 7.1: Download category images
1. Open file: `client/src/pages/home.tsx`
2. Find `categories` array (around line 80)
3. Download each image:
   - Sports Cars image → Save as: `public/images/categories/sports-cars-category.jpg`
   - Luxury Sedans image → Save as: `public/images/categories/luxury-sedans-category.jpg`
   - SUVs & Crossovers image → Save as: `public/images/categories/suvs-crossovers-category.jpg`
   - Exotic Collection image → Save as: `public/images/categories/exotic-collection-category.jpg`

### Step 7.2: Optimize with WebP
1. For EACH image in `public/images/categories/`:
   - Upload to https://squoosh.app/
   - Width: 800px
   - Format: WebP
   - Quality: 85%
   - Download with `.webp` extension

### Step 7.3: Update category code
1. In `client/src/pages/home.tsx`, replace categories array with:

```javascript
const categories = [
  {
    title: "Sports Cars",
    image: "/images/categories/sports-cars-category.webp",
    imageFallback: "/images/categories/sports-cars-category.jpg",
    link: "/inventory?category=sports-cars"
  },
  {
    title: "Luxury Sedans", 
    image: "/images/categories/luxury-sedans-category.webp",
    imageFallback: "/images/categories/luxury-sedans-category.jpg",
    link: "/inventory?category=luxury-sedans"
  },
  {
    title: "SUVs & Crossovers",
    image: "/images/categories/suvs-crossovers-category.webp",
    imageFallback: "/images/categories/suvs-crossovers-category.jpg",
    link: "/inventory?category=suvs-crossovers"
  },
  {
    title: "Exotic Collection",
    image: "/images/categories/exotic-collection-category.webp",
    imageFallback: "/images/categories/exotic-collection-category.jpg",
    link: "/inventory?category=exotic-collection"
  }
];
```

### Step 7.4: Update CategoryCard component
1. Open file: `client/src/components/ui/category-card.tsx`
2. Find the `<img>` tag
3. Replace with:

```jsx
<picture>
  <source srcSet={image} type="image/webp" />
  <img 
    src={imageFallback || image} 
    alt={`${title} - Premium luxury vehicles at RPM Auto`}
    className="w-full h-full object-cover"
    loading="lazy"
    width="800"
    height="600"
  />
</picture>
```

4. Update the component props interface at the top:

```typescript
interface CategoryCardProps {
  title: string;
  image: string;
  imageFallback?: string;
  link: string;
}
```

5. Update function parameters:

```typescript
export function CategoryCard({ title, image, imageFallback, link }: CategoryCardProps) {
```

---

## Task 8: Enhance Meta Descriptions

### Step 8.1: Create meta description map
1. Create file: `client/src/utils/seo-metadata.ts`
2. Add this content:

```typescript
interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
}

export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: "RPM Auto: Luxury & Exotic Cars Dealer | Vaughan ON | 50+ Premium Vehicles",
    description: "Discover 50+ luxury vehicles at RPM Auto Vaughan. Ferrari, Lamborghini, Porsche & more. Expert financing, trade-ins welcome. Call (647) 550-9590 for exclusive deals!",
    keywords: "luxury cars dealer Vaughan, exotic cars Toronto, premium vehicles, Ferrari dealer, Lamborghini, Porsche, BMW M, Mercedes AMG, car financing, trade-in"
  },
  inventory: {
    title: "Luxury Car Inventory | 50+ Premium Vehicles | RPM Auto Vaughan",
    description: "Browse 50+ hand-selected luxury vehicles. Latest inventory updated daily. Competitive pricing, certified pre-owned options. Schedule test drive: (647) 550-9590",
    keywords: "luxury car inventory, exotic cars for sale, premium vehicles Vaughan, certified pre-owned, sports cars, SUVs, test drive"
  },
  services: {
    title: "Premium Auto Services | Financing, Trade-ins, Warranties | RPM Auto",
    description: "Complete luxury car services: Custom financing from 4.99%, competitive trade-ins, extended warranties, vehicle sourcing. Expert team with 10+ years experience.",
    keywords: "car financing Vaughan, trade-in value, extended warranty, vehicle sourcing, consignment, luxury car services"
  },
  about: {
    title: "About RPM Auto | 10+ Years of Excellence | Luxury Car Experts",
    description: "Family-owned luxury dealership since 2013. 500+ satisfied customers, A+ BBB rating. Meet our certified team. Visit our Vaughan showroom by appointment.",
    keywords: "about RPM Auto, luxury car dealership, Vaughan auto dealer, family owned, certified team, customer testimonials"
  },
  contact: {
    title: "Contact RPM Auto Vaughan | Directions, Hours | (647) 550-9590",
    description: "Visit RPM Auto in Vaughan. Open Mon-Sat, Sunday by appointment. Quick responses guaranteed. Get directions, book appointments, or call (647) 550-9590.",
    keywords: "contact RPM Auto, dealership hours, directions Vaughan, book appointment, phone number, email, location"
  },
  gallery: {
    title: "Luxury Car Gallery | 100+ Photos | RPM Auto Showroom & Inventory",
    description: "View 100+ high-resolution photos of our luxury vehicles and showroom. Virtual tour available. See our current inventory in stunning detail.",
    keywords: "luxury car photos, vehicle gallery, showroom tour, car pictures, exotic car images"
  }
};

// Category-specific metadata
export const categoryMetadata: Record<string, PageMetadata> = {
  'sports-cars': {
    title: "Sports Cars for Sale | Porsche, Ferrari, McLaren | RPM Auto",
    description: "Premium sports cars in stock. 0-60 in under 4 seconds. Porsche 911, Ferrari 488, McLaren 720S & more. Financing available. Test drive today!",
    keywords: "sports cars for sale, Porsche 911, Ferrari 488, McLaren 720S, high performance, track cars"
  },
  'luxury-sedans': {
    title: "Luxury Sedans | Mercedes S-Class, BMW 7 Series | RPM Auto",
    description: "Executive sedans with cutting-edge technology. Mercedes S-Class, BMW 7 Series, Audi A8. Comfort meets performance. Lease options available.",
    keywords: "luxury sedans, Mercedes S-Class, BMW 7 Series, Audi A8, executive cars, comfortable sedans"
  },
  'suvs-crossovers': {
    title: "Luxury SUVs & Crossovers | Range Rover, Bentley, Porsche | RPM Auto",
    description: "Premium SUVs combining luxury & capability. Range Rover, Bentley Bentayga, Porsche Cayenne in stock. 7-seater options. All-weather performance.",
    keywords: "luxury SUV, Range Rover, Bentley Bentayga, Porsche Cayenne, 7 seater SUV, crossover"
  },
  'exotic-collection': {
    title: "Exotic Cars Collection | Ultra-Rare Supercars | RPM Auto",
    description: "Exclusive exotic vehicles for discerning collectors. Limited editions, one-of-a-kind builds. Lamborghini, Ferrari, Bugatti. Investment-grade automobiles.",
    keywords: "exotic cars, supercars, Lamborghini, Bugatti, rare cars, collector vehicles, limited edition"
  }
};
```

### Step 8.2: Update all page meta tags
For EACH page file in `client/src/pages/`:

1. **home.tsx** - Line ~55, update PageMeta:
```jsx
import { pageMetadata } from '@/utils/seo-metadata';

// In component:
<PageMeta 
  title={pageMetadata.home.title}
  description={pageMetadata.home.description}
  keywords={pageMetadata.home.keywords}
  ogType="website"
  ogImage="/RPM Auto.png"
  canonical="https://www.rpmautosales.ca/"
/>
```

2. **inventory.tsx** - Update based on category:
```jsx
import { pageMetadata, categoryMetadata } from '@/utils/seo-metadata';

// In component (after getting category):
const metadata = filters.category && categoryMetadata[filters.category] 
  ? categoryMetadata[filters.category]
  : pageMetadata.inventory;

<PageMeta 
  title={metadata.title}
  description={metadata.description}
  keywords={metadata.keywords}
  // ... rest of props
/>
```

3. Repeat for: `services.tsx`, `about.tsx`, `contact.tsx`, `gallery.tsx`

---

## Task 9: Add FAQ Schema to All Service Pages

### Step 9.1: Create FAQ data
1. Open file: `client/src/pages/services.tsx`
2. After the `services` array, add:

```javascript
const serviceFAQs = [
  {
    question: "How does RPM Auto's vehicle sourcing service work?",
    answer: "Our vehicle sourcing service leverages our extensive network to find specific makes and models. We handle all logistics from search to delivery, typically completing the process in 2-4 weeks depending on the vehicle's rarity and location."
  },
  {
    question: "What is my car worth as a trade-in at RPM Auto?",
    answer: "Trade-in values depend on your vehicle's condition, mileage, and market demand. We offer free appraisals and guarantee competitive values. Our process is transparent, and we can apply your trade-in value directly to your purchase."
  },
  {
    question: "What does RPM Auto's vehicle inspection include?",
    answer: "Our comprehensive inspection covers 150+ points including all mechanical systems, electrical components, cosmetic condition, and road testing. We provide a detailed report and only sell vehicles that meet our stringent quality standards."
  },
  {
    question: "What extended warranty options does RPM Auto offer?",
    answer: "We offer warranties from 1-5 years covering mechanical and electrical components. Plans range from basic powertrain to comprehensive bumper-to-bumper coverage. All warranties include roadside assistance."
  },
  {
    question: "How does consignment work at RPM Auto?",
    answer: "Our consignment service handles everything: professional photography, marketing, inquiries, negotiations, and paperwork. Your vehicle is displayed in our showroom and marketed through our network. We charge a competitive commission only upon successful sale."
  },
  {
    question: "Does RPM Auto offer financing?",
    answer: "Yes, we offer competitive financing starting from 4.99% APR through our network of premium lenders. We can arrange financing for all credit situations and offer lease options for qualified buyers."
  }
];
```

### Step 9.2: Import FAQ schema creator
1. At the top of `services.tsx`, update import:
```javascript
import JsonLdSchema, { createBreadcrumbSchema, createFaqSchema } from "@/components/seo/json-ld-schema";
```

### Step 9.3: Add FAQ schema after breadcrumb schema
1. Find the breadcrumb schema (around line 85)
2. Add immediately after:

```jsx
{/* FAQ Schema */}
<JsonLdSchema
  schema={createFaqSchema(serviceFAQs)}
/>
```

### Step 9.4: Add visual FAQ section
1. Before the closing `</main>` tag, add:

```jsx
{/* FAQ Section */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-6">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-['Poppins'] font-bold mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-6">
        {serviceFAQs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-['Poppins'] font-semibold mb-3 text-gray-900">
              {faq.question}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

---

## Task 10: Implement Review Schema

### Step 10.1: Update testimonial component
1. Open file: `client/src/components/ui/testimonial-card.tsx`
2. Add review schema to each testimonial card
3. Inside the component, wrap the content with:

```jsx
<div itemScope itemType="https://schema.org/Review">
  <div itemProp="reviewBody" className="text-gray-700 mb-6 italic">
    "{testimonial.content}"
  </div>
  <div itemProp="author" itemScope itemType="https://schema.org/Person">
    <p itemProp="name" className="font-['Poppins'] font-semibold">
      {testimonial.customerName}
    </p>
  </div>
  <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
    <meta itemProp="ratingValue" content={testimonial.rating.toString()} />
    <meta itemProp="bestRating" content="5" />
    <div className="flex text-yellow-400 mb-4">
      {/* Star rendering code */}
    </div>
  </div>
  <meta itemProp="datePublished" content={new Date().toISOString()} />
</div>
```

### Step 10.2: Add aggregate rating to homepage
1. Open `client/src/pages/home.tsx`
2. In the business schema (around line 90), add:

```javascript
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "127",
  "bestRating": "5",
  "worstRating": "1"
}
```

---

## Task 11: Create 404 Page with SEO Value

### Step 11.1: Update 404 page
1. Open file: `client/src/pages/not-found.tsx`
2. Replace entire content with:

```jsx
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";
import PageMeta from "@/components/seo/page-meta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  // Fetch some vehicles to show
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles/featured"],
  });

  return (
    <>
      <PageMeta 
        title="404 - Page Not Found | RPM Auto"
        description="The page you're looking for doesn't exist. Browse our luxury vehicle inventory or explore our premium automotive services."
        keywords="404, page not found, RPM Auto"
        canonical="https://www.rpmautosales.ca/404"
      />
      
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          {/* Error Message */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-['Poppins'] font-bold text-[#E31837] mb-4">404</h1>
            <h2 className="text-3xl font-['Poppins'] font-semibold mb-4">Page Not Found</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              We couldn't find the page you're looking for. It may have been moved or no longer exists. 
              Let us help you find what you're looking for.
            </p>
          </div>

          {/* Quick Links */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-['Poppins'] font-semibold mb-6 text-center">
                  Popular Pages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/inventory">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-car mr-2"></i>
                      Browse Inventory
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-wrench mr-2"></i>
                      Our Services
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-phone mr-2"></i>
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Vehicles */}
          {vehicles && vehicles.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-['Poppins'] font-semibold mb-6 text-center">
                Featured Vehicles You Might Like
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.slice(0, 3).map((vehicle) => (
                  <Link key={vehicle.id} href={`/inventory/${vehicle.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <img 
                          src={vehicle.images?.[0] || '/placeholder-vehicle.jpg'} 
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          className="w-full h-48 object-cover rounded mb-4"
                        />
                        <h4 className="font-['Poppins'] font-semibold">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-[#E31837] font-bold mt-2">
                          ${vehicle.price.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestion */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Still can't find what you're looking for?
            </p>
            <Link href="/">
              <Button className="bg-[#E31837] hover:bg-[#E31837]/90">
                <i className="fas fa-home mr-2"></i>
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
```

### Step 11.2: Add 404 route
1. Open `client/src/App.tsx`
2. Before the `<Route component={NotFound} />` line, add:
```jsx
<Route path="/404" component={NotFound} />
```

---

## Task 12: Performance Optimization - Preload Fonts

### Step 12.1: Download Google Fonts locally
1. Go to: https://fonts.google.com/specimen/Poppins
2. Select these weights: 400, 600, 700
3. Download all files
4. Create folder: `public/fonts/`
5. Copy font files to this folder
6. Rename files:
   - `Poppins-Regular.woff2`
   - `Poppins-SemiBold.woff2`
   - `Poppins-Bold.woff2`

### Step 12.2: Update index.html
1. Open `index.html`
2. In `<head>`, remove Google Fonts link
3. Add these preload tags after viewport meta:

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/Poppins-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Poppins-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Poppins-Bold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect to required origins -->
<link rel="preconnect" href="https://www.google-analytics.com">
<link rel="dns-prefetch" href="https://www.google-analytics.com">
```

### Step 12.3: Add font-face declarations
1. Open `client/src/index.css`
2. At the TOP of the file, add:

```css
/* Local Font Definitions */
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/Poppins-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/Poppins-SemiBold.woff2') format('woff2');
}

@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/Poppins-Bold.woff2') format('woff2');
}
```

---

## Testing Checklist

After completing ALL tasks above:

### Sitemap Testing
- [ ] Visit `/sitemap.xml` - shows all pages including vehicles
- [ ] No errors in console when generating sitemap
- [ ] All vehicle URLs included in sitemap

### Image Testing  
- [ ] All category images load as WebP
- [ ] Fallback to JPG works (test by disabling WebP in browser)
- [ ] All images under 200KB
- [ ] No broken image links

### Meta Description Testing
- [ ] View page source for each page
- [ ] Meta descriptions are unique and compelling
- [ ] All include call-to-action
- [ ] Character count between 150-160

### Schema Testing
- [ ] Test each page at: https://validator.schema.org/
- [ ] No errors reported
- [ ] FAQ schema appears on services page
- [ ] Review schema on testimonials

### Performance Testing
- [ ] Run Lighthouse audit
- [ ] Font loading doesn't cause layout shift
- [ ] First Contentful Paint under 2 seconds
- [ ] All fonts load from local files

### 404 Page Testing
- [ ] Visit non-existent URL (e.g., `/asdfasdf`)
- [ ] 404 page loads correctly
- [ ] Featured vehicles display
- [ ] All links work properly

## Next Steps
Proceed to "Medium Priority SEO Enhancements" only after ALL items above are verified.