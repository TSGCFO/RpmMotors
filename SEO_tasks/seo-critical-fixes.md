# SEO Critical Fixes - Week 1 Implementation Guide

## ⚠️ CRITICAL: Complete these tasks in the EXACT order listed

---

## Task 1: Fix Sitemap.xml File Structure

### Step 1.1: Delete the current sitemap.xml
1. Open your terminal/command prompt
2. Navigate to your project root directory
3. Run command: `rm public/sitemap.xml` (on Windows use: `del public\sitemap.xml`)

### Step 1.2: Create new sitemap.xml file
1. In your project root, navigate to: `public/`
2. Create a new file named: `sitemap.xml`
3. Copy and paste this EXACT content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.rpmautosales.ca/</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/about</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/inventory</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/services</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/gallery</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/contact</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/privacy-policy</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/terms</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.rpmautosales.ca/sitemap</loc>
    <lastmod>2025-01-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
```

4. Save the file
5. Ensure file encoding is UTF-8 (In VS Code: click on encoding in bottom bar, select "Save with Encoding" > "UTF-8")

### Step 1.3: Test the sitemap
1. Start your development server: `npm run dev`
2. Open browser and go to: `http://localhost:5173/sitemap.xml`
3. You should see XML content, NOT binary data
4. If you see binary data or an error, STOP and check file encoding

### Step 1.4: Update server configuration
1. Open file: `server/routes.ts`
2. Find the section where routes are defined (around line 100-200)
3. Add this route BEFORE any catch-all routes:

```typescript
// Serve sitemap.xml
app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "UTF-8");
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});
```

4. At the top of the file, ensure you have: `import path from "path";`
5. Save the file

---

## Task 2: Fix Homepage H1 Tag Issue

### Step 2.1: Identify the current H1
1. Open file: `client/src/pages/home.tsx`
2. Press Ctrl+F (or Cmd+F on Mac)
3. Search for: `<h1`
4. You should find on line ~186: `<h1 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h1>`

### Step 2.2: Add proper page H1
1. Go to line 130 (after the `<main>` tag and SEO components)
2. Add this code IMMEDIATELY after `<HeroSlider />` component:

```jsx
{/* Main H1 for SEO - Visually Hidden */}
<h1 className="sr-only">
  RPM Auto - Luxury Car Dealership in Richmond Hill | Premium Vehicles, Exotic Cars & Expert Service
</h1>
```

### Step 2.3: Change existing H1 to H2
1. Find line ~186 with: `<h1 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h1>`
2. Change `<h1` to `<h2`
3. Change `</h1>` to `</h2>`
4. The line should now read: `<h2 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h2>`

### Step 2.4: Add CSS for screen reader only class
1. Open file: `client/src/index.css`
2. At the end of the file, add:

```css
/* Screen reader only - for SEO H1 tags */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

3. Save the file

### Step 2.5: Verify H1 implementation
1. Start dev server: `npm run dev`
2. Open Chrome browser
3. Go to homepage
4. Open DevTools (F12)
5. Go to Console tab
6. Type: `document.querySelectorAll('h1').length`
7. Press Enter
8. Result MUST be: `1`
9. If not 1, recheck steps 2.1-2.3

---

## Task 3: Fix URL Consistency Issues

### Step 3.1: Update all internal links
1. Open VS Code
2. Press Ctrl+Shift+F (Cmd+Shift+F on Mac) to open global search
3. Search for: `rpmautosales.ca`
4. For EACH result, ensure it has `www.` prefix
5. Files to check and update:
   - All files in `client/src/pages/`
   - All files in `client/src/components/seo/`
   - `public/manifest.json`
   - `public/robots.txt`

### Step 3.2: Update canonical URL base
1. Open file: `client/src/components/seo/canonical-url.tsx`
2. Find line: `const baseDomain = 'https://www.rpmautosales.ca';`
3. Ensure it says `www.` (it already should)
4. Save file

### Step 3.3: Update all schema references
1. Open each file in `client/src/pages/`
2. Search for `https://rpmautosales.ca` (without www)
3. Replace ALL instances with `https://www.rpmautosales.ca`
4. Files that MUST be updated:
   - `about.tsx` - Lines with schema URLs
   - `contact.tsx` - Lines with schema URLs  
   - `services.tsx` - Lines with schema URLs
   - `home.tsx` - Lines with schema URLs
   - ALL other page files

### Step 3.4: Create redirect rule
1. Create new file: `public/_redirects`
2. Add this content:

```
# Redirect non-www to www
https://rpmautosales.ca/* https://www.rpmautosales.ca/:splat 301!
http://rpmautosales.ca/* https://www.rpmautosales.ca/:splat 301!
```

3. Save file

---

## Task 4: Download and Optimize Hero Images

### Step 4.1: Create image directories
1. Navigate to: `public/`
2. Create folder: `images`
3. Inside `images/`, create these folders:
   - `hero`
   - `categories`
   - `about`
   - `team`

### Step 4.2: Download homepage hero images
1. Open file: `client/src/components/ui/hero-slider.tsx`
2. Find the `slides` array (around line 10-30)
3. For EACH image URL in the slides:
   - Copy the Unsplash URL
   - Open the URL in browser
   - Right-click image > Save Image As
   - Save to: `public/images/hero/`
   - Rename as follows:
     - Slide 1: `luxury-sports-car-showroom-01.jpg`
     - Slide 2: `premium-vehicle-collection-02.jpg`  
     - Slide 3: `exotic-car-interior-03.jpg`

### Step 4.3: Optimize images
1. Go to: https://squoosh.app/
2. For EACH image in `public/images/hero/`:
   - Drag image to squoosh.app
   - Set resize width: 1920px (maintain aspect ratio)
   - Set format: WebP
   - Set quality: 85%
   - Click download
   - Save with same name but `.webp` extension
   - Keep BOTH .jpg and .webp versions

### Step 4.4: Update hero slider code
1. Open file: `client/src/components/ui/hero-slider.tsx`
2. Replace the entire `slides` array with:

```jsx
const slides = [
  {
    image: "/images/hero/luxury-sports-car-showroom-01.webp",
    imageFallback: "/images/hero/luxury-sports-car-showroom-01.jpg",
    title: "Experience Automotive Excellence",
    subtitle: "Discover our curated collection of premium luxury vehicles",
    cta: "Browse Inventory",
    link: "/inventory"
  },
  {
    image: "/images/hero/premium-vehicle-collection-02.webp", 
    imageFallback: "/images/hero/premium-vehicle-collection-02.jpg",
    title: "Unparalleled Service",
    subtitle: "Expert guidance from selection to delivery",
    cta: "Our Services",
    link: "/services"
  },
  {
    image: "/images/hero/exotic-car-interior-03.webp",
    imageFallback: "/images/hero/exotic-car-interior-03.jpg",
    title: "Your Dream Car Awaits",
    subtitle: "Find the perfect luxury vehicle for your lifestyle",
    cta: "Contact Us",
    link: "/contact"
  }
];
```

### Step 4.5: Update image rendering
1. In the same file, find the `<img>` tag (around line 80-90)
2. Replace with:

```jsx
<picture>
  <source srcSet={slide.image} type="image/webp" />
  <img 
    src={slide.imageFallback} 
    alt={slide.title}
    className="w-full h-full object-cover"
    loading={index === 0 ? "eager" : "lazy"}
  />
</picture>
```

3. Save file

---

## Task 5: Test All Changes

### Step 5.1: Test sitemap
1. Deploy to staging/preview environment
2. Visit: `https://your-staging-url.com/sitemap.xml`
3. Verify XML displays correctly
4. Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html

### Step 5.2: Test H1 tags
1. Visit each page
2. Use Chrome DevTools Console
3. Run: `document.querySelectorAll('h1').length`
4. Each page should return: `1`

### Step 5.3: Test images
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by: Img
4. Reload homepage
5. Verify `.webp` images load
6. Check file sizes are under 200KB

### Step 5.4: Submit to Google
1. Go to: https://search.google.com/search-console/
2. Select RPM Auto property
3. Go to Sitemaps
4. Submit: `https://www.rpmautosales.ca/sitemap.xml`
5. Wait for "Success" status

---

## Verification Checklist

Before marking these tasks complete, verify:

- [ ] Sitemap.xml loads as XML, not binary data
- [ ] All pages have exactly 1 H1 tag
- [ ] All internal links use www.rpmautosales.ca
- [ ] Hero images are under 200KB each
- [ ] WebP images load correctly
- [ ] Sitemap submitted to Google Search Console
- [ ] No console errors on any page

## Next Steps
Once ALL items above are checked, proceed to "High Priority SEO Improvements" guide.