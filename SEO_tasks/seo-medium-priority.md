# SEO Medium Priority Enhancements - Weeks 4-6

## Prerequisites: Complete ALL High Priority tasks first

---

## Task 13: Implement Blog Functionality

### Step 13.1: Create blog database migration
1. Create file: `db/migrations/0003_add_blog_tables.sql`
2. Add this EXACT content:

```sql
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  author VARCHAR(100) NOT NULL DEFAULT 'RPM Auto Team',
  category VARCHAR(50) NOT NULL,
  tags TEXT,
  meta_title VARCHAR(160),
  meta_description VARCHAR(320),
  keywords TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
```

3. Run migration: `npm run db:migrate`

### Step 13.2: Add blog schema to shared types
1. Open file: `shared/schema.ts`
2. At the end of file, add:

```typescript
export const blogPosts = pgTable("blog_posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  excerpt: text().notNull(),
  content: text().notNull(),
  featuredImage: varchar("featured_image", { length: 500 }),
  author: varchar({ length: 100 }).notNull().default("RPM Auto Team"),
  category: varchar({ length: 50 }).notNull(),
  tags: text(),
  metaTitle: varchar("meta_title", { length: 160 }),
  metaDescription: varchar("meta_description", { length: 320 }),
  keywords: text(),
  published: boolean().notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
```

### Step 13.3: Create blog API routes
1. Open file: `server/routes.ts`
2. Add import at top: `import { blogPosts } from "@shared/schema";`
3. After vehicle routes, add:

```typescript
// Blog Routes
app.get("/api/blog/posts", async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db.select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(Number(limit))
      .offset(offset);
    
    if (category) {
      query = query.where(eq(blogPosts.category, String(category)));
    }
    
    const posts = await query;
    res.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

app.get("/api/blog/posts/:slug", async (req, res) => {
  try {
    const post = await db.select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.slug, req.params.slug),
        eq(blogPosts.published, true)
      ))
      .limit(1);
    
    if (post.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    
    res.json(post[0]);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

// Admin route to create blog posts (protected in production)
app.post("/api/admin/blog/posts", async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const newPost = await db.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: JSON.stringify(tags || []),
      featuredImage,
      published: false,
      metaTitle: title.substring(0, 60) + " | RPM Auto Blog",
      metaDescription: excerpt.substring(0, 160)
    }).returning();
    
    res.json(newPost[0]);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});
```

### Step 13.4: Create blog list page
1. Create file: `client/src/pages/blog/index.tsx`
2. Add this content:

```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PageMeta from "@/components/seo/page-meta";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import JsonLdSchema from "@/components/seo/json-ld-schema";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  author: string;
  category: string;
  publishedAt: string;
}

export default function Blog() {
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: [`/api/blog/posts?page=${page}&limit=${limit}`],
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog", current: true }
  ];

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      <PageMeta
        title="RPM Auto Blog | Luxury Car News, Tips & Industry Insights"
        description="Expert insights on luxury cars, maintenance tips, industry news, and buying guides. Stay informed with RPM Auto's automotive blog."
        keywords="luxury car blog, automotive news, car maintenance tips, vehicle buying guide, exotic car insights"
        canonical="https://www.rpmautosales.ca/blog"
      />
      
      <JsonLdSchema
        schema={{
          "@type": "Blog",
          "name": "RPM Auto Blog",
          "description": "Expert insights on luxury and exotic vehicles",
          "url": "https://www.rpmautosales.ca/blog",
          "publisher": {
            "@type": "Organization",
            "name": "RPM Auto",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.rpmautosales.ca/RPM Auto.png"
            }
          }
        }}
      />
      
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-['Poppins'] font-bold mb-4">
              RPM Auto Blog
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expert insights, maintenance tips, and the latest news from the world of luxury automobiles
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-4 mb-12">
            <Button variant="outline">All Posts</Button>
            <Button variant="outline">Buying Guides</Button>
            <Button variant="outline">Maintenance</Button>
            <Button variant="outline">Industry News</Button>
            <Button variant="outline">Model Reviews</Button>
          </div>

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 mb-3"></div>
                    <div className="h-4 bg-gray-300 mb-2"></div>
                    <div className="h-4 bg-gray-300 w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="h-48 overflow-hidden">
                      <OptimizedImage
                        src={post.featuredImage || "/images/blog/default-blog-image.jpg"}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        width={400}
                        height={250}
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {formatDate(post.publishedAt)} • {post.category}
                    </div>
                    <h2 className="text-xl font-['Poppins'] font-bold mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-[#E31837] transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-[#E31837] font-semibold hover:text-black transition-colors inline-flex items-center"
                    >
                      Read More 
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No blog posts available yet. Check back soon!</p>
            </div>
          )}

          {/* Pagination */}
          {posts && posts.length === limit && (
            <div className="flex justify-center mt-12 gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">Page {page}</span>
              <Button 
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```

### Step 13.5: Create blog post page
1. Create file: `client/src/pages/blog/[slug].tsx`
2. Add complete blog post template (content too long for this section - implement similar to vehicle-details.tsx but for blog posts)

### Step 13.6: Add blog to navigation
1. Open `client/src/components/layout/header.tsx`
2. Find navigation menu (around line 120)
3. Add after Gallery:

```jsx
<li>
  <Link href="/blog" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/blog') ? 'text-[#E31837]' : ''}`}>
    Blog
  </Link>
</li>
```

### Step 13.7: Update router
1. Open `client/src/App.tsx`
2. Add blog routes:

```jsx
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog/[slug]";

// In routes:
<Route path="/blog" component={Blog} />
<Route path="/blog/:slug" component={BlogPost} />
```

---

## Task 14: Create First Blog Posts

### Step 14.1: Create blog images folder
1. Create folder: `public/images/blog/`
2. Add placeholder image: `default-blog-image.jpg` (download a generic luxury car image)

### Step 14.2: Create blog post creation script
1. Create file: `scripts/create-blog-posts.ts`
2. Add this content:

```typescript
import { db } from '../server/db';
import { blogPosts } from '@shared/schema';

const initialPosts = [
  {
    title: "Essential Maintenance Tips for Luxury Vehicle Owners",
    slug: "essential-maintenance-tips-luxury-vehicles",
    excerpt: "Keep your luxury car performing at its peak with these professional maintenance tips from RPM Auto's expert technicians.",
    content: `
<h2>Regular Maintenance is Key to Longevity</h2>
<p>Owning a luxury vehicle is a significant investment, and proper maintenance is crucial to protect that investment. At RPM Auto, we've serviced hundreds of high-end vehicles and compiled these essential tips to keep your car in pristine condition.</p>

<h3>1. Follow Manufacturer Service Intervals</h3>
<p>Luxury vehicles often have specific service requirements that differ from standard cars. Always adhere to your manufacturer's recommended service schedule. For most luxury brands:</p>
<ul>
  <li>Oil changes: Every 5,000-10,000 miles (synthetic oil)</li>
  <li>Brake fluid: Every 2 years</li>
  <li>Transmission fluid: Every 40,000-60,000 miles</li>
  <li>Coolant flush: Every 2-4 years</li>
</ul>

<h3>2. Use OEM or High-Quality Parts</h3>
<p>When replacement parts are needed, always opt for Original Equipment Manufacturer (OEM) parts or certified high-quality alternatives. Cheaper parts may save money initially but can lead to costly repairs down the road.</p>

<h3>3. Pay Attention to Tire Care</h3>
<p>High-performance tires on luxury vehicles require special attention:</p>
<ul>
  <li>Check tire pressure weekly</li>
  <li>Rotate tires every 5,000-7,500 miles</li>
  <li>Inspect for uneven wear patterns</li>
  <li>Replace tires in sets for AWD vehicles</li>
</ul>

<h3>4. Keep It Clean Inside and Out</h3>
<p>Regular washing and detailing isn't just about aesthetics. It protects your vehicle's paint, prevents rust, and maintains interior materials. We recommend professional detailing every 3-6 months.</p>

<h3>5. Store Your Vehicle Properly</h3>
<p>If you're not driving your luxury car regularly:</p>
<ul>
  <li>Store in a climate-controlled environment</li>
  <li>Use a battery tender</li>
  <li>Start and run the engine periodically</li>
  <li>Keep the fuel tank full to prevent condensation</li>
</ul>

<h2>When to Seek Professional Service</h2>
<p>While some maintenance can be done at home, luxury vehicles often require specialized tools and expertise. Always consult professionals for:</p>
<ul>
  <li>Engine diagnostics and repairs</li>
  <li>Transmission service</li>
  <li>Suspension work</li>
  <li>Electronic system issues</li>
</ul>

<p>At RPM Auto, our certified technicians have experience with all major luxury brands. Contact us to schedule your vehicle's next service appointment.</p>
    `,
    category: "Maintenance",
    tags: JSON.stringify(["maintenance", "luxury cars", "car care", "service tips"]),
    featuredImage: "/images/blog/luxury-car-maintenance.jpg",
    author: "David Thompson, Service Manager",
    published: true,
    publishedAt: new Date(),
    metaTitle: "Luxury Car Maintenance Tips | Expert Guide | RPM Auto",
    metaDescription: "Professional maintenance tips for luxury vehicle owners. Learn how to keep your high-end car performing perfectly with advice from RPM Auto experts.",
    keywords: "luxury car maintenance, vehicle service tips, car care guide, preventive maintenance"
  },
  {
    title: "2025 Luxury SUV Buyer's Guide: Top Models to Consider",
    slug: "2025-luxury-suv-buyers-guide",
    excerpt: "Exploring the best luxury SUVs for 2025, from performance-focused models to family-friendly options with cutting-edge technology.",
    content: `
<h2>The Luxury SUV Market in 2025</h2>
<p>The luxury SUV segment continues to evolve with impressive technological advances, enhanced performance capabilities, and unprecedented comfort levels. Here's our comprehensive guide to the top luxury SUVs worth considering in 2025.</p>

<h3>Performance Leaders</h3>

<h4>Porsche Cayenne Turbo</h4>
<p>The Cayenne Turbo remains the benchmark for performance SUVs:</p>
<ul>
  <li>Twin-turbo V8 producing 631 horsepower</li>
  <li>0-60 mph in 3.7 seconds</li>
  <li>Advanced air suspension</li>
  <li>Starting at $146,000</li>
</ul>

<h4>BMW X5 M Competition</h4>
<p>BMW's flagship performance SUV delivers:</p>
<ul>
  <li>625 horsepower twin-turbo V8</li>
  <li>Exceptional handling for its size</li>
  <li>Luxurious interior with latest technology</li>
  <li>Starting at $125,000</li>
</ul>

<h3>Ultimate Luxury</h3>

<h4>Bentley Bentayga</h4>
<p>For those seeking the pinnacle of luxury:</p>
<ul>
  <li>Hand-crafted interior with endless customization</li>
  <li>W12 or V8 engine options</li>
  <li>Unmatched ride quality</li>
  <li>Starting at $250,000</li>
</ul>

<h4>Rolls-Royce Cullinan</h4>
<p>The ultimate expression of SUV luxury:</p>
<ul>
  <li>V12 engine with effortless power</li>
  <li>Bespoke interior options</li>
  <li>Magic carpet ride quality</li>
  <li>Starting at $400,000</li>
</ul>

<h3>Technology Forward</h3>

<h4>Mercedes-Benz EQS SUV</h4>
<p>Leading the electric luxury SUV revolution:</p>
<ul>
  <li>Up to 450 miles of range</li>
  <li>Hyperscreen dashboard</li>
  <li>Level 3 autonomous capability</li>
  <li>Starting at $125,000</li>
</ul>

<h3>Family-Friendly Options</h3>

<h4>Audi Q7</h4>
<p>Perfect blend of luxury and practicality:</p>
<ul>
  <li>Spacious three-row seating</li>
  <li>Quattro all-wheel drive</li>
  <li>Virtual cockpit technology</li>
  <li>Starting at $65,000</li>
</ul>

<h2>Key Factors to Consider</h2>

<h3>1. Intended Use</h3>
<p>Consider how you'll primarily use your SUV. Daily commuting, family trips, or occasional off-road adventures will influence your choice.</p>

<h3>2. Technology Needs</h3>
<p>Modern luxury SUVs offer extensive tech features. Prioritize what matters most: driver assistance, infotainment, or connectivity.</p>

<h3>3. Fuel Efficiency vs Performance</h3>
<p>Decide between traditional powertrains, hybrids, or full electric based on your driving patterns and environmental preferences.</p>

<h3>4. Brand Prestige and Resale</h3>
<p>Some brands hold value better than others. Research depreciation rates for models you're considering.</p>

<h2>Contact RPM Auto for Your Next Luxury SUV</h2>
<p>Our team can help you find the perfect luxury SUV that matches your lifestyle and preferences. Visit our showroom to experience these remarkable vehicles firsthand.</p>
    `,
    category: "Buying Guides",
    tags: JSON.stringify(["SUV", "buying guide", "2025 models", "luxury vehicles"]),
    featuredImage: "/images/blog/2025-luxury-suv-guide.jpg",
    author: "Sarah Chen, Sales Director",
    published: true,
    publishedAt: new Date(),
    metaTitle: "2025 Luxury SUV Buyer's Guide | Top Models | RPM Auto",
    metaDescription: "Comprehensive guide to the best luxury SUVs in 2025. Compare performance, technology, and features of top models from Porsche, BMW, Bentley, and more.",
    keywords: "luxury SUV 2025, SUV buying guide, best luxury SUVs, Porsche Cayenne, BMW X5, Bentley Bentayga"
  }
];

async function createInitialBlogPosts() {
  console.log('Creating initial blog posts...');
  
  for (const post of initialPosts) {
    try {
      await db.insert(blogPosts).values(post);
      console.log(`Created post: ${post.title}`);
    } catch (error) {
      console.error(`Error creating post ${post.title}:`, error);
    }
  }
  
  console.log('Blog posts created successfully!');
  process.exit(0);
}

createInitialBlogPosts();
```

3. Run script: `npx tsx scripts/create-blog-posts.ts`

---

## Task 15: Implement Clean URLs

### Step 15.1: Update inventory routes
1. Open `client/src/App.tsx`
2. Update inventory route:

```jsx
// Change from:
<Route path="/inventory" component={Inventory} />

// To:
<Route path="/inventory/:category?" component={Inventory} />
```

### Step 15.2: Update inventory page
1. Open `client/src/pages/inventory.tsx`
2. Import useRoute: `import { useRoute } from "wouter";`
3. Add at component start:

```typescript
const [, params] = useRoute<{ category?: string }>("/inventory/:category?");

// Update useEffect to handle clean URLs
useEffect(() => {
  // If category in URL path, use it
  if (params?.category) {
    setFilters(prev => ({ ...prev, category: params.category }));
    
    // Set readable category name
    const formattedCategory = params.category.replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    setCategoryName(formattedCategory);
  } else {
    // Check query params as fallback
    const searchParams = new URLSearchParams(window.location.search);
    const queryCategory = searchParams.get("category");
    
    if (queryCategory) {
      // Redirect to clean URL
      window.history.replaceState({}, '', `/inventory/${queryCategory}`);
      setFilters(prev => ({ ...prev, category: queryCategory }));
    }
  }
}, [params]);
```

### Step 15.3: Update all category links
1. Global search for: `href="/inventory?category=`
2. Replace each with clean URL format:
   - `/inventory?category=sports-cars` → `/inventory/sports-cars`
   - `/inventory?category=luxury-sedans` → `/inventory/luxury-sedans`
   - etc.

### Step 15.4: Add redirects
1. Open/create `public/_redirects`
2. Add:

```
# Redirect old category URLs to new clean URLs
/inventory?category=sports-cars /inventory/sports-cars 301!
/inventory?category=luxury-sedans /inventory/luxury-sedans 301!
/inventory?category=suvs-crossovers /inventory/suvs-crossovers 301!
/inventory?category=exotic-collection /inventory/exotic-collection 301!
/inventory?category=convertibles /inventory/convertibles 301!
```

---

## Task 16: Add Business Hours Widget

### Step 16.1: Create business hours component
1. Create file: `client/src/components/ui/business-hours.tsx`
2. Add this content:

```tsx
import { useEffect, useState } from 'react';

interface OpenHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export function BusinessHours() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [currentDay, setCurrentDay] = useState<string>('');
  
  const hours: OpenHours[] = [
    { day: 'Monday', open: '9:00 AM', close: '7:00 PM' },
    { day: 'Tuesday', open: '9:00 AM', close: '7:00 PM' },
    { day: 'Wednesday', open: '9:00 AM', close: '7:00 PM' },
    { day: 'Thursday', open: '9:00 AM', close: '7:00 PM' },
    { day: 'Friday', open: '9:00 AM', close: '7:00 PM' },
    { day: 'Saturday', open: '10:00 AM', close: '5:00 PM' },
    { day: 'Sunday', open: '11:00 AM', close: '4:00 PM' }
  ];

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const dayIndex = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      // Convert day index (0 = Sunday) to match our array
      const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Sunday to Saturday
      const todayHours = hours[dayMap[dayIndex]];
      
      setCurrentDay(todayHours.day);
      
      if (todayHours.closed) {
        setIsOpen(false);
        return;
      }
      
      // Parse open/close times
      const [openHour, openMinute] = todayHours.open.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
      const [closeHour, closeMinute] = todayHours.close.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
      
      // Adjust for PM times
      const openTime = (todayHours.open.includes('PM') && openHour !== 12 ? openHour + 12 : openHour) * 60 + openMinute;
      const closeTime = (todayHours.close.includes('PM') && closeHour !== 12 ? closeHour + 12 : closeHour) * 60 + closeMinute;
      
      setIsOpen(currentTime >= openTime && currentTime < closeTime);
    };
    
    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6" itemScope itemType="https://schema.org/OpeningHoursSpecification">
      <h3 className="text-xl font-['Poppins'] font-semibold mb-4">Business Hours</h3>
      
      {isOpen !== null && (
        <div className="mb-4 flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-semibold">
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      )}
      
      <div className="space-y-2">
        {hours.map((schedule) => (
          <div 
            key={schedule.day} 
            className={`flex justify-between ${schedule.day === currentDay ? 'font-semibold' : ''}`}
            itemProp="openingHours"
            content={`${schedule.day.slice(0, 2)} ${schedule.open.replace(' ', '')}-${schedule.close.replace(' ', '')}`}
          >
            <span>{schedule.day}</span>
            <span>
              {schedule.closed ? 'Closed' : `${schedule.open} - ${schedule.close}`}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        <p>Holiday hours may vary</p>
        <p>Sundays by appointment only</p>
      </div>
    </div>
  );
}
```

### Step 16.2: Add to contact page
1. Open `client/src/pages/contact.tsx`
2. Import component: `import { BusinessHours } from "@/components/ui/business-hours";`
3. Add after contact info section:

```jsx
{/* Business Hours Widget */}
<div className="mt-8">
  <BusinessHours />
</div>
```

---

## Task 17: Implement Scroll Tracking

### Step 17.1: Create scroll tracking utility
1. Open `client/src/lib/cookieUtils.ts`
2. Add these functions:

```typescript
// Track scroll depth for engagement metrics
let scrollDepthTracked = {
  25: false,
  50: false,
  75: false,
  100: false
};

export function initScrollTracking(): void {
  if (!hasAnalyticsConsent()) return;
  
  let ticking = false;
  
  const updateScrollProgress = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop + windowHeight) / documentHeight * 100;
    
    // Track 25% milestone
    if (scrollPercentage >= 25 && !scrollDepthTracked[25]) {
      scrollDepthTracked[25] = true;
      trackAnalyticsEvent('scroll_depth', { depth: 25, page: window.location.pathname });
    }
    
    // Track 50% milestone
    if (scrollPercentage >= 50 && !scrollDepthTracked[50]) {
      scrollDepthTracked[50] = true;
      trackAnalyticsEvent('scroll_depth', { depth: 50, page: window.location.pathname });
    }
    
    // Track 75% milestone
    if (scrollPercentage >= 75 && !scrollDepthTracked[75]) {
      scrollDepthTracked[75] = true;
      trackAnalyticsEvent('scroll_depth', { depth: 75, page: window.location.pathname });
    }
    
    // Track 100% (bottom of page)
    if (scrollPercentage >= 95 && !scrollDepthTracked[100]) {
      scrollDepthTracked[100] = true;
      trackAnalyticsEvent('scroll_depth', { depth: 100, page: window.location.pathname });
    }
    
    ticking = false;
  };
  
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Reset tracking when navigating to new page
  return () => {
    window.removeEventListener('scroll', handleScroll);
    scrollDepthTracked = { 25: false, 50: false, 75: false, 100: false };
  };
}

// Track custom analytics events
export function trackAnalyticsEvent(eventName: string, parameters: Record<string, any>): void {
  if (!hasAnalyticsConsent()) return;
  
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
  
  // Also store in session data for internal analytics
  const sessionData = getSessionData();
  if (!sessionData.analyticsEvents) {
    sessionData.analyticsEvents = [];
  }
  
  sessionData.analyticsEvents.push({
    event: eventName,
    parameters,
    timestamp: new Date().toISOString()
  });
  
  saveSessionData(sessionData);
}
```

### Step 17.2: Initialize scroll tracking
1. Open `client/src/App.tsx`
2. Import function: `import { initScrollTracking } from '@/lib/cookieUtils';`
3. Add to Router component:

```typescript
function Router() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Track UTM parameters when user first lands on the site
    trackUtmParameters();
    
    // Track page view for this path
    if (hasConsentedToCookies()) {
      trackPageView(location);
    }
    
    // Initialize scroll tracking
    const cleanup = initScrollTracking();
    
    return cleanup;
  }, [location]);
  
  // ... rest of component
}
```

---

## Task 18: Add Time on Site Tracking

### Step 18.1: Create engagement tracking
1. Add to `client/src/lib/cookieUtils.ts`:

```typescript
// Track time on site
let pageStartTime: number | null = null;

export function startTimeTracking(): void {
  pageStartTime = Date.now();
}

export function stopTimeTracking(): void {
  if (!pageStartTime || !hasAnalyticsConsent()) return;
  
  const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000); // in seconds
  
  trackAnalyticsEvent('time_on_page', {
    page: window.location.pathname,
    seconds: timeOnPage,
    category: getPageCategory()
  });
  
  pageStartTime = null;
}

function getPageCategory(): string {
  const path = window.location.pathname;
  
  if (path === '/') return 'home';
  if (path.startsWith('/inventory')) return 'inventory';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/services')) return 'services';
  
  return 'other';
}

// Track engagement rate
export function trackEngagement(): void {
  if (!hasAnalyticsConsent()) return;
  
  let engaged = false;
  let engagementTime = 0;
  const startTime = Date.now();
  
  // User is engaged if they:
  // - Scroll
  // - Click
  // - Move mouse
  // - Type
  
  const markEngaged = () => {
    if (!engaged) {
      engaged = true;
      engagementTime = Date.now() - startTime;
      
      trackAnalyticsEvent('user_engagement', {
        page: window.location.pathname,
        time_to_engage: engagementTime,
        source: document.referrer || 'direct'
      });
    }
  };
  
  // Add listeners
  window.addEventListener('scroll', markEngaged, { once: true });
  window.addEventListener('click', markEngaged, { once: true });
  window.addEventListener('mousemove', markEngaged, { once: true });
  window.addEventListener('keypress', markEngaged, { once: true });
}
```

### Step 18.2: Implement tracking in app
1. Update `client/src/App.tsx`:

```typescript
import { 
  trackPageView, 
  trackUtmParameters,
  hasConsentedToCookies,
  initScrollTracking,
  startTimeTracking,
  stopTimeTracking,
  trackEngagement
} from "@/lib/cookieUtils";

function Router() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Track UTM parameters when user first lands on the site
    trackUtmParameters();
    
    // Track page view and engagement
    if (hasConsentedToCookies()) {
      trackPageView(location);
      startTimeTracking();
      trackEngagement();
    }
    
    // Initialize scroll tracking
    const cleanup = initScrollTracking();
    
    // Stop time tracking when leaving page
    return () => {
      stopTimeTracking();
      cleanup();
    };
  }, [location]);
  
  // ... rest of component
}
```

---

## Testing Checklist

### Blog Implementation
- [ ] Blog homepage loads at `/blog`
- [ ] Individual blog posts load correctly
- [ ] Blog posts have unique meta tags
- [ ] Blog schema validates correctly
- [ ] Images load properly in blog posts
- [ ] Blog navigation works in header/footer

### Clean URLs
- [ ] Category pages load with clean URLs (e.g., `/inventory/sports-cars`)
- [ ] Old URLs redirect to new format
- [ ] Breadcrumbs show correct path
- [ ] Internal links use new URL format

### Business Hours
- [ ] Widget shows current open/closed status
- [ ] Hours display correctly for all days
- [ ] Schema markup is present
- [ ] Live status updates every minute

### Analytics Tracking
- [ ] Scroll depth fires at 25%, 50%, 75%, 100%
- [ ] Time on page tracked correctly
- [ ] Engagement events fire
- [ ] Data only tracked with consent
- [ ] Events show in Google Analytics

### Performance
- [ ] No console errors
- [ ] Page load time under 3 seconds
- [ ] No layout shifts from new components
- [ ] All tracking is non-blocking

## Completion Verification
Before proceeding to long-term tasks:

1. Run full Lighthouse audit - Score should be 90+ for all metrics
2. Test all new features on mobile devices
3. Validate all schema markup
4. Check Google Analytics for new events
5. Submit updated sitemap to Search Console
6. Monitor Core Web Vitals for any regression

## Next Steps
Once all medium priority tasks are complete and verified, proceed to "Long-term SEO Strategy" guide.