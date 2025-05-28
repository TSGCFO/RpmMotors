# RPM Auto SEO Implementation Guide

## ⚠️ CRITICAL: Read This First
- Complete tasks in the EXACT order listed
- Do NOT skip any steps
- Do NOT move to the next task until the current one is 100% complete
- Test each change before moving to the next task
- Keep a backup of all files before making changes

---

## PHASE 1: Critical H1 Tag Fixes (Day 1)
**MUST BE COMPLETED FIRST - Google will not verify the site without proper H1 tags**

### Task 1.1: Fix Homepage H1 Tag
**File**: `client/src/pages/home.tsx`

1. Open the file in your code editor
2. Find line 186 (approximately):
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h2>
   ```
3. Change the `<h2>` to `<h1>`:
   ```jsx
   <h1 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h1>
   ```
4. Find line 213:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-2">Featured Vehicles</h2>
   ```
5. Keep this as `<h2>` (it's correct as a section heading)
6. Save the file

### Task 1.2: Fix About Page H1 Tag
**File**: `client/src/pages/about.tsx`

1. Open the file
2. Find line 135 (approximately):
   ```jsx
   <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">About RPM Auto</h1>
   ```
3. This is CORRECT - leave it as is
4. Check that no other H1 tags exist on this page
5. Verify all other headings are H2 or H3

### Task 1.3: Fix Contact Page H1 Tag
**File**: `client/src/pages/contact.tsx`

1. Open the file
2. Find line 95 (approximately):
   ```jsx
   <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Contact Us</h1>
   ```
3. This is CORRECT - leave it as is
4. Verify no other H1 tags exist

### Task 1.4: Fix Inventory Page H1 Tag
**File**: `client/src/pages/inventory.tsx`

1. Open the file
2. Find line 282 (approximately):
   ```jsx
   <h1 className="text-4xl font-['Poppins'] font-bold mb-4">
     {categoryName ? categoryName : "Our Inventory"}
   </h1>
   ```
3. This is CORRECT - leave it as is
4. Verify no other H1 tags exist

### Task 1.5: Fix Services Page H1 Tag
**File**: `client/src/pages/services.tsx`

1. Open the file
2. Find line 174 (approximately):
   ```jsx
   <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Our Services</h1>
   ```
3. This is CORRECT - leave it as is
4. Find line 185:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-6">{service.title}</h2>
   ```
5. Keep all service titles as H2 - this is correct

### Task 1.6: Fix Gallery Page H1 Tag
**File**: `client/src/pages/gallery.tsx`

1. Open the file
2. Find line 91 (approximately):
   ```jsx
   <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Gallery</h1>
   ```
3. This is CORRECT - leave it as is

### Task 1.7: Fix Vehicle Details Page H1 Tag
**File**: `client/src/pages/vehicle-details.tsx`

1. Open the file
2. Find line 193 (approximately):
   ```jsx
   <h1 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-gray-900">
     {vehicle.year} {vehicle.make} {vehicle.model}
   </h1>
   ```
3. This is CORRECT - leave it as is

### Task 1.8: TEST H1 Implementation
1. Start your development server: `npm run dev`
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Visit each page and run this command:
   ```javascript
   document.querySelectorAll('h1').length
   ```
5. MUST return `1` for every page
6. If any page returns 0 or more than 1, fix it immediately

---

## PHASE 2: Heading Hierarchy Fix (Day 1-2)

### Task 2.1: Create Heading Audit Spreadsheet
1. Create a new Google Sheet named "RPM Auto Heading Audit"
2. Create columns: Page, Current Structure, Required Structure, Status
3. Document current heading structure for each page

### Task 2.2: Fix Homepage Heading Hierarchy
**File**: `client/src/pages/home.tsx`

1. Current structure has issues. Fix as follows:
2. Line 186: Already changed to H1 (from Task 1.1)
3. Line 272: Keep as H2:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Our Services</h2>
   ```
4. Line 302: Keep as H2:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-6">About RPM Auto</h2>
   ```
5. Line 350: Keep as H2:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Client Testimonials</h2>
   ```
6. Line 395: Keep as H2:
   ```jsx
   <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Get In Touch</h2>
   ```
7. Find any H3, H4, H5, H6 tags - ensure they follow proper hierarchy
8. Save the file

### Task 2.3: Fix Service Cards Heading Level
**File**: `client/src/components/ui/service-card.tsx`

1. Open the file
2. Find line 40:
   ```jsx
   <h3 className="font-['Poppins'] font-bold text-xl mb-3">{title}</h3>
   ```
3. This is CORRECT as H3 under H2 sections
4. Save if any changes were made

### Task 2.4: Verify All Other Pages
For each page, ensure:
- One H1 at the top
- H2 for major sections
- H3 for subsections
- Never skip levels (no H1 → H3)

---

## PHASE 3: Google Analytics & Search Console Setup (Day 2)

### Task 3.1: Verify Google Analytics Installation
1. Go to https://rpmauto.com in Chrome
2. Install "Google Tag Assistant" Chrome extension
3. Click the extension icon
4. It should show "Google Analytics 4" as active
5. If NOT active:
   - Check `client/index.html` line 58-66
   - Verify the tracking ID: `G-LH25K9FG9L`
   - Contact the client to confirm this is their GA4 property

### Task 3.2: Set Up Google Search Console
1. Go to https://search.google.com/search-console/
2. Sign in with the Google account that owns the website
3. Click "Add property"
4. Choose "URL prefix" method
5. Enter: `https://rpmauto.com`
6. Click "Continue"

### Task 3.3: Verify Search Console Ownership
1. Choose "HTML tag" verification method
2. Copy the meta tag (looks like):
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXXXXX" />
   ```
3. Open file: `client/index.html`
4. Add the meta tag after line 10 (after the description meta tag):
   ```html
   <meta name="description" content="RPM Auto in Vaughan has New and Used Luxury Cars and SUVs for sale. Call (647) 550-9590 for RPM Auto Specials and Promotions.">
   <meta name="google-site-verification" content="XXXXXXXXXXXXX" />
   ```
5. Save the file
6. Deploy to production
7. Go back to Search Console and click "Verify"

### Task 3.4: Submit Sitemap to Search Console
1. In Search Console, go to "Sitemaps" in left menu
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Wait for status to show "Success"

---

## PHASE 4: Image Optimization (Day 3-4)

### Task 4.1: Create Image Naming Convention Document
1. Create a new document: "RPM Auto Image Naming Convention"
2. Add these rules:
   - Format: `year-make-model-color-angle-number.jpg`
   - Example: `2023-porsche-911-gt3-blue-front-01.jpg`
   - For generic images: `rpm-auto-showroom-interior-01.jpg`
   - All lowercase
   - Use hyphens, not underscores
   - No spaces

### Task 4.2: Download and Rename Current Images
1. Create folder on desktop: "RPM_Images_Backup"
2. Create subfolder: "RPM_Images_Optimized"
3. For EACH image URL in the code:
   - Download the image
   - Rename according to convention
   - Save in the Optimized folder

### Task 4.3: Add Missing Image Attributes
**Example File**: `client/src/pages/home.tsx`

For EVERY image, change from:
```jsx
<img 
  src="https://images.unsplash.com/..." 
  alt="RPM Auto Dealership Interior View" 
  className="w-full h-[400px] object-cover rounded-lg shadow-xl"
/>
```

To:
```jsx
<img 
  src="/images/rpm-auto-showroom-interior-01.jpg" 
  alt="RPM Auto luxury car dealership showroom interior in Vaughan Ontario" 
  title="RPM Auto Showroom - Premium Luxury Vehicles"
  className="w-full h-[400px] object-cover rounded-lg shadow-xl"
  width="800"
  height="400"
/>
```

### Task 4.4: Create Images Folder Structure
1. In your project, create: `client/public/images/`
2. Create subfolders:
   - `client/public/images/vehicles/`
   - `client/public/images/showroom/`
   - `client/public/images/team/`
   - `client/public/images/services/`

### Task 4.5: Optimize All Images
1. Use https://tinypng.com/ or https://squoosh.app/
2. For EACH image:
   - Upload to optimizer
   - Set quality to 85%
   - Ensure width is maximum 1920px
   - Download optimized version
   - Replace in your folders

### Task 4.6: Update OptimizedImage Component Usage
**File**: `client/src/components/seo/optimized-image.tsx`

This component is already created but needs to be used everywhere. For example:

Change:
```jsx
<img src={member.image} alt={member.name} />
```

To:
```jsx
<OptimizedImage 
  src={member.image} 
  alt={`${member.name}, ${member.position} at RPM Auto luxury car dealership`}
  title={`${member.name} - ${member.position}`}
  width={400}
  height={600}
  className="w-full h-64 object-cover"
/>
```

---

## PHASE 5: Blog Implementation (Day 5-7)

### Task 5.1: Create Blog Database Schema
**File**: Create new file `shared/schema/blog.ts`

```typescript
import { pgTable, text, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const blogPosts = pgTable("blog_posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  excerpt: text().notNull(),
  content: text().notNull(),
  featuredImage: varchar({ length: 500 }),
  author: varchar({ length: 100 }).notNull().default("RPM Auto Team"),
  category: varchar({ length: 50 }).notNull(),
  tags: text(), // JSON array stored as text
  metaTitle: varchar({ length: 160 }),
  metaDescription: varchar({ length: 320 }),
  keywords: text(),
  published: boolean().notNull().default(false),
  publishedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow()
});
```

### Task 5.2: Create Blog Routes
**File**: `server/routes.ts`

Add these routes after line 180:
```typescript
// Blog routes
app.get("/api/blog/posts", async (req, res) => {
  const posts = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt));
  res.json(posts);
});

app.get("/api/blog/posts/:slug", async (req, res) => {
  const post = await db.select()
    .from(blogPosts)
    .where(and(
      eq(blogPosts.slug, req.params.slug),
      eq(blogPosts.published, true)
    ))
    .limit(1);
  
  if (post.length === 0) {
    return res.status(404).send("Blog post not found");
  }
  
  res.json(post[0]);
});
```

### Task 5.3: Create Blog List Page
**File**: Create new file `client/src/pages/blog.tsx`

```typescript
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import PageMeta from "@/components/seo/page-meta";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog/posts"],
  });

  useEffect(() => {
    document.title = "Blog | RPM Auto";
  }, []);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog", current: true }
  ];

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      <PageMeta
        title="RPM Auto Blog | Luxury Car News & Insights"
        description="Read the latest news, tips, and insights about luxury and exotic vehicles from RPM Auto's expert team."
        canonical="https://rpmauto.com/blog"
      />
      
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-['Poppins'] font-bold mb-4 text-center">
            RPM Auto Blog
          </h1>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Expert insights, maintenance tips, and the latest news from the world of luxury automobiles
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map(post => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/blog/${post.slug}`}>
                    <OptimizedImage
                      src={post.featuredImage || "/images/blog/default-blog-image.jpg"}
                      alt={post.title}
                      title={post.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(post.publishedAt).toLocaleDateString()} • {post.category}
                    </div>
                    <h2 className="text-xl font-['Poppins'] font-bold mb-3">
                      <Link href={`/blog/${post.slug}`} className="hover:text-[#E31837] transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-[#E31837] font-semibold hover:text-black transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```

### Task 5.4: Create Blog Post Template
**File**: Create new file `client/src/pages/blog-post.tsx`

[Due to length, I'll continue with the remaining critical tasks...]

### Task 5.5: Add Blog to Navigation
**File**: `client/src/components/layout/header.tsx`

1. Find the navigation menu (around line 120)
2. Add after the "Gallery" menu item:
```jsx
<li>
  <Link href="/blog" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/blog') ? 'text-[#E31837]' : ''}`}>
    Blog
  </Link>
</li>
```

### Task 5.6: Update Router
**File**: `client/src/main.tsx`

Add blog routes:
```jsx
<Route path="/blog" component={Blog} />
<Route path="/blog/:slug" component={BlogPost} />
```

---

## PHASE 6: Keyword Implementation (Day 8)

### Task 6.1: Create Keyword Map
Create a spreadsheet with:
- Page URL
- Primary Keyword
- Secondary Keywords
- Current Keyword Density
- Target Keyword Density (2-3%)

### Task 6.2: Update Meta Descriptions
For EACH page, ensure meta description includes primary keyword within first 160 characters.

Example for homepage:
```jsx
description="RPM Auto in Vaughan offers luxury cars and exotic vehicles for sale. Premium selection of high-end automobiles with expert service."
```

### Task 6.3: Update Page Content
For each page, naturally include keywords:
- In the first paragraph
- In at least one H2 heading
- In image alt text
- 2-3 times throughout the content

---

## PHASE 7: Testing & Verification (Day 9)

### Task 7.1: Run Full SEO Audit
1. Install Screaming Frog SEO Spider
2. Crawl https://rpmauto.com
3. Export all issues to spreadsheet
4. Fix any remaining issues

### Task 7.2: Test in Google's Tools
1. Go to https://search.google.com/test/rich-results
2. Test each major page URL
3. Fix any structured data errors

### Task 7.3: Submit for Indexing
1. In Search Console, go to "URL Inspection"
2. For each main page:
   - Enter the URL
   - Click "Request Indexing"
   - Wait for confirmation

---

## PHASE 8: Weekly Blog Post Process

### Task 8.1: First Blog Post
**Topic**: "Essential Maintenance Tips for Luxury Vehicle Owners"
**Target**: 850 words minimum

Structure:
1. Introduction (100 words) - Include "luxury vehicle maintenance"
2. 5 Main Tips (150 words each)
3. Conclusion (100 words)
4. Include 4 internal links to vehicle pages
5. Include 4 custom images with proper SEO

### Task 8.2: Blog Post Checklist
For EVERY blog post:
- [ ] 800+ words
- [ ] Primary keyword in title
- [ ] Primary keyword in first paragraph
- [ ] One H1 (post title)
- [ ] 3-5 H2 subheadings
- [ ] 4 internal links
- [ ] 4 custom images with alt text
- [ ] Meta description (155 characters)
- [ ] Focus keyword appears 5-7 times naturally

---

## Final Verification Checklist

Before considering the project complete:
- [ ] Every page has exactly one H1
- [ ] No heading hierarchy violations
- [ ] Google Analytics verified working
- [ ] Search Console verified and sitemap submitted
- [ ] All images have alt and title attributes
- [ ] All images optimized under 200KB
- [ ] Blog section live with first post
- [ ] All meta descriptions under 160 characters
- [ ] Mobile responsive tested on real devices
- [ ] Page load speed under 3 seconds

**DO NOT PROCEED TO LAUNCH** until every checkbox above is marked complete.