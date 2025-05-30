# RPM Auto SEO Implementation - Master TODO List

## 🚨 WEEK 1: CRITICAL FIXES (URGENT - Complete First!)

### Task 1: Fix Sitemap.xml ❗❗❗
- [ ] Delete current broken sitemap.xml file
- [ ] Create new sitemap.xml with proper XML format
- [ ] Ensure UTF-8 encoding
- [ ] Test sitemap loads as XML (not binary)
- [ ] Update server configuration for proper headers
- [ ] Submit to Google Search Console

### Task 2: Fix Homepage H1 Tag
- [ ] Add visually hidden H1 after hero slider
- [ ] Change "Explore Our Collection" from H1 to H2
- [ ] Add sr-only CSS class
- [ ] Test all pages have exactly 1 H1 tag
- [ ] Verify with Chrome DevTools console

### Task 3: Fix URL Consistency
- [ ] Update all internal links to use www.rpmautosales.ca
- [ ] Check all files in pages/ directory
- [ ] Update canonical URL references
- [ ] Update schema references
- [ ] Create redirect rules (non-www to www)
- [ ] Test redirects work properly

### Task 4: Download and Optimize Hero Images
- [ ] Create image directory structure
- [ ] Download all hero slider images
- [ ] Optimize each image with squoosh.app
- [ ] Create WebP versions
- [ ] Update hero slider component
- [ ] Verify images load under 200KB

### Task 5: Test All Critical Changes
- [ ] Validate sitemap at xml-sitemaps.com
- [ ] Check H1 count on every page
- [ ] Test image loading and WebP fallbacks
- [ ] Submit sitemap to Google Search Console
- [ ] Verify no console errors

---

## 📈 WEEKS 2-3: HIGH PRIORITY IMPROVEMENTS

### Task 6: Dynamic Sitemap Generation
- [ ] Install sitemap npm package
- [ ] Create sitemap-generator.ts utility
- [ ] Add dynamic route for sitemap.xml
- [ ] Include all vehicle URLs
- [ ] Remove static sitemap file
- [ ] Test dynamic generation

### Task 7: Optimize Category Images
- [ ] Download all 4 category images
- [ ] Create WebP versions (800px width)
- [ ] Update categories array in home.tsx
- [ ] Update CategoryCard component
- [ ] Test WebP loading with fallbacks

### Task 8: Enhance Meta Descriptions
- [ ] Create seo-metadata.ts utility file
- [ ] Add compelling meta descriptions for all pages
- [ ] Include CTAs in descriptions
- [ ] Add category-specific metadata
- [ ] Update all page components
- [ ] Keep descriptions 155-160 characters

### Task 9: Add FAQ Schema
- [ ] Create service FAQs data structure
- [ ] Import createFaqSchema function
- [ ] Add FAQ schema to services page
- [ ] Create visual FAQ section
- [ ] Test schema in validator
- [ ] Add 6 service-related Q&As

### Task 10: Implement Review Schema
- [ ] Update testimonial-card component
- [ ] Add review microdata markup
- [ ] Add aggregate rating to homepage
- [ ] Test with schema validator
- [ ] Ensure all testimonials have schema

### Task 11: Create SEO 404 Page
- [ ] Replace basic 404 with full page
- [ ] Add featured vehicles section
- [ ] Include popular page links
- [ ] Add proper meta tags
- [ ] Test 404 triggers correctly

### Task 12: Performance - Font Optimization
- [ ] Download Poppins font files locally
- [ ] Add font preload tags
- [ ] Create @font-face declarations
- [ ] Remove Google Fonts external link
- [ ] Test for layout shift

---

## 🚀 WEEKS 4-6: MEDIUM PRIORITY ENHANCEMENTS

### Task 13: Implement Blog Functionality
- [ ] Create blog database migration
- [ ] Add blog schema to shared types
- [ ] Create blog API routes
- [ ] Build blog list page component
- [ ] Build blog post page component
- [ ] Add blog to navigation menu
- [ ] Update router with blog routes

### Task 14: Create Initial Blog Posts
- [ ] Create blog images folder
- [ ] Set up blog post creation script
- [ ] Write "Maintenance Tips" post (1000+ words)
- [ ] Write "2025 SUV Buyer's Guide" post
- [ ] Optimize all blog images
- [ ] Run creation script

### Task 15: Implement Clean URLs
- [ ] Update inventory route structure
- [ ] Modify inventory page for clean URLs
- [ ] Update all category links site-wide
- [ ] Add redirect rules for old URLs
- [ ] Test all category pages load

### Task 16: Add Business Hours Widget
- [ ] Create business-hours component
- [ ] Add real-time open/closed status
- [ ] Include schema markup
- [ ] Add to contact page
- [ ] Test status updates correctly

### Task 17: Implement Scroll Tracking
- [ ] Add scroll depth tracking functions
- [ ] Track 25%, 50%, 75%, 100% milestones
- [ ] Initialize in App component
- [ ] Send events to Google Analytics
- [ ] Test with cookie consent

### Task 18: Add Engagement Tracking
- [ ] Create time-on-site tracking
- [ ] Add engagement event tracking
- [ ] Track by page category
- [ ] Implement in router
- [ ] Verify in Google Analytics

---

## 📅 ONGOING: LONG-TERM STRATEGY

### Weekly Tasks (Every Week)

#### Monday - Analytics & Planning
- [ ] Review Google Analytics metrics
- [ ] Check Search Console performance
- [ ] Plan weekly blog post topic
- [ ] Create content brief
- [ ] Document keyword opportunities

#### Wednesday - Content Creation
- [ ] Write blog post (1000+ words)
- [ ] Optimize images for post
- [ ] Create meta title and description
- [ ] Add internal links
- [ ] Format with proper headings

#### Friday - Publishing & Optimization
- [ ] Publish blog post
- [ ] Add internal links to new post
- [ ] Share on social media
- [ ] Update existing pages with links
- [ ] Document all changes

### Monthly Tasks

#### First Monday - Technical Audit
- [ ] Run Screaming Frog crawl
- [ ] Check page speed scores
- [ ] Test mobile usability
- [ ] Fix any 404 errors
- [ ] Update XML sitemap

#### Second Monday - Competitor Analysis
- [ ] Identify top 3 competitors
- [ ] Analyze their keywords
- [ ] Find content gaps
- [ ] Identify backlink opportunities
- [ ] Create action plan

#### Third Monday - Local SEO
- [ ] Update Google Business Profile
- [ ] Add new photos
- [ ] Respond to all reviews
- [ ] Check citation consistency
- [ ] Create local content

#### Fourth Monday - Conversion Optimization
- [ ] Set up A/B test
- [ ] Review user recordings
- [ ] Analyze form submissions
- [ ] Implement UX improvements
- [ ] Document test results

### Quarterly Tasks

#### Q1 - Annual Planning
- [ ] Complete year-end analysis
- [ ] Set annual SEO goals
- [ ] Create content calendar
- [ ] Assign team responsibilities
- [ ] Define success metrics

#### Q2 - Technical Infrastructure
- [ ] Security audit
- [ ] Update all dependencies
- [ ] Expand schema markup
- [ ] Review robots.txt
- [ ] SSL certificate check

#### Q3 - Content Strategy
- [ ] Review content performance
- [ ] Update old blog posts
- [ ] Plan next 6 months content
- [ ] Create content templates
- [ ] Train content team

#### Q4 - Link Building
- [ ] Create outreach list (50 targets)
- [ ] Develop linkable assets
- [ ] Execute outreach campaign
- [ ] Track backlinks gained
- [ ] Report on ROI

### Daily Monitoring (5 min/day)
- [ ] Check Search Console for errors
- [ ] Verify site uptime
- [ ] Review traffic anomalies
- [ ] Test contact forms
- [ ] Monitor conversion tracking

---

## 📊 SUCCESS METRICS TO TRACK

### 3-Month Targets
- [ ] 25% increase in organic traffic
- [ ] 50 new top-10 keywords
- [ ] 15% conversion rate improvement
- [ ] 20 quality backlinks

### 6-Month Targets
- [ ] 50% increase in organic traffic
- [ ] 100 new top-10 keywords
- [ ] Domain Authority +5
- [ ] 50 quality backlinks

### 12-Month Targets
- [ ] 100% increase in organic traffic
- [ ] #1 rankings for 5 primary keywords
- [ ] Organic = top traffic source
- [ ] 100+ quality backlinks

---

## 🛠️ TOOLS SETUP CHECKLIST

- [ ] Google Analytics 4 configured
- [ ] Google Search Console verified
- [ ] Google Tag Manager installed
- [ ] SEMrush/Ahrefs account active
- [ ] Screaming Frog licensed
- [ ] Hotjar tracking installed
- [ ] Rank tracking configured
- [ ] Uptime monitoring active

---

## 📝 DOCUMENTATION TO CREATE

- [ ] SEO change log document
- [ ] Keyword tracking spreadsheet
- [ ] Content calendar
- [ ] Link building tracker
- [ ] Monthly report template
- [ ] Emergency response guide
- [ ] Team training materials

---

## ⚠️ PRIORITY NOTES

1. **DO NOT SKIP CRITICAL FIXES** - The site won't rank properly until these are done
2. **Complete tasks in order** - Each phase builds on the previous
3. **Test everything** - Use the verification checklists
4. **Document all changes** - Keep detailed records
5. **Get sign-off** - Have someone verify each phase completion

---

## 🎯 QUICK WIN OPPORTUNITIES

If you need quick results while working through the full list:

1. [ ] Fix sitemap.xml (immediate crawling improvement)
2. [ ] Submit to Google Search Console
3. [ ] Fix H1 tags (immediate ranking factor)
4. [ ] Update meta descriptions (improve CTR)
5. [ ] Add FAQ schema (rich snippets)
6. [ ] Optimize images (page speed boost)
7. [ ] Create first blog post
8. [ ] Update Google Business Profile

---

## 📞 ESCALATION CONTACTS

- **Critical Issues**: [Technical Lead Contact]
- **Content Questions**: [Content Manager Contact]
- **Analytics Access**: [Analytics Admin Contact]
- **Emergency SEO**: [SEO Consultant Contact]
- **Client Contact**: fateh@rpmautosales.ca | (647) 550-9590

---

## ✅ FINAL COMPLETION CHECKLIST

Before considering SEO implementation complete:

- [ ] All Critical Fixes verified and live
- [ ] All High Priority tasks completed
- [ ] All Medium Priority tasks completed
- [ ] Blog publishing schedule active
- [ ] Monthly audit schedule in place
- [ ] Team trained on ongoing tasks
- [ ] Analytics tracking all KPIs
- [ ] Documentation complete
- [ ] Client sign-off received

---

**Last Updated**: January 2025
**Next Review**: April 2025
**Document Version**: 1.0