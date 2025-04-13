# RPM Auto Style Guide

This comprehensive style guide documents the design system, styling principles, and visual standards used throughout the RPM Auto website. It serves as the definitive reference for maintaining design consistency across all components and pages.

## Table of Contents

1. [Brand Identity](#brand-identity)
   - [Logo Usage](#logo-usage)
   - [Brand Voice](#brand-voice)
2. [Color System](#color-system)
   - [Primary Colors](#primary-colors)
   - [Secondary Colors](#secondary-colors)
   - [UI Color Application](#ui-color-application)
3. [Typography](#typography)
   - [Font Families](#font-families)
   - [Type Scale](#type-scale)
   - [Font Weights](#font-weights)
   - [Text Styles by Component](#text-styles-by-component)
4. [Layout System](#layout-system)
   - [Grid Structure](#grid-structure)
   - [Spacing System](#spacing-system)
   - [Responsive Breakpoints](#responsive-breakpoints)
5. [Component Design](#component-design)
   - [Cards](#cards)
   - [Buttons](#buttons)
   - [Forms](#forms)
   - [Navigation](#navigation)
   - [Modals](#modals)
6. [Image Guidelines](#image-guidelines)
   - [Vehicle Photography](#vehicle-photography)
   - [Image Optimization](#image-optimization)
7. [Animation & Interaction](#animation--interaction)
   - [Transition Standards](#transition-standards)
   - [Hover States](#hover-states)
8. [Accessibility Standards](#accessibility-standards)
9. [Implementation Guidelines](#implementation-guidelines)
   - [CSS Structure](#css-structure)
   - [Tailwind Configuration](#tailwind-configuration)
   - [Component-Specific Styling](#component-specific-styling)

## Brand Identity

### Logo Usage

The RPM Auto logo is a key brand asset that must be used consistently across all touchpoints.

**Logo Specifications:**
- Primary logo: Full color version with "RPM Auto" text
- Logo clearspace: Minimum 24px padding around all sides
- Minimum size: 40px height on desktop, 32px on mobile
- File formats: SVG preferred for web use

**Logo Implementation:**

```jsx
// Header logo implementation
<div className="py-8">
  <RPMLogo className="h-40" />
</div>
```

**Logo Color Variations:**
- Default: Full color on white/light backgrounds
- Inverse: White version for dark backgrounds
- Monochrome: Black version for special applications

### Brand Voice

RPM Auto's brand voice is:
- Professional but approachable
- Knowledgeable without being technical
- Premium without being pretentious
- Confident and trustworthy

UI text should reflect these qualities with clear, concise language focused on customer benefits.

## Color System

### Primary Colors

The primary color palette defines RPM Auto's core brand identity:

| Color Name      | Hex Code  | RGB             | Usage                           |
|-----------------|-----------|-----------------|----------------------------------|
| Racing Red      | `#E31837` | rgb(227,24,55)  | Primary brand color, CTAs        |
| Black           | `#000000` | rgb(0,0,0)      | Headers, primary text            |
| White           | `#FFFFFF` | rgb(255,255,255)| Backgrounds, inverse text        |
| Dark Grey       | `#333333` | rgb(51,51,51)   | Secondary text                   |
| Light Grey      | `#F5F5F5` | rgb(245,245,245)| Background accents, cards        |

**Color Implementation in TailwindCSS:**

The colors are defined in the `theme.json` file and Tailwind configuration:

```json
// theme.json
{
  "primary": "#E31837",
  "variant": "professional",
  "appearance": "light",
  "radius": 4
}
```

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#E31837',
        secondary: '#000000',
        background: '#FFFFFF',
        text: {
          primary: '#333333',
          secondary: '#666666',
          light: '#FFFFFF'
        },
        accent: '#F5F5F5'
      }
    }
  }
}
```

### Secondary Colors

Secondary colors provide additional flexibility for UI elements:

| Color Name      | Hex Code  | RGB             | Usage                           |
|-----------------|-----------|-----------------|----------------------------------|
| Medium Grey     | `#666666` | rgb(102,102,102)| Subdued text, icons              |
| Light Silver    | `#EEEEEE` | rgb(238,238,238)| Dividers, subtle backgrounds     |
| Success Green   | `#2E7D32` | rgb(46,125,50)  | Success states, positive actions |
| Warning Amber   | `#FF8F00` | rgb(255,143,0)  | Warning states, attention needed |
| Error Red       | `#D32F2F` | rgb(211,47,47)  | Error states, destructive actions|

### UI Color Application

Consistent application of the color system:

**Primary UI Elements:**
- Primary CTA buttons: Racing Red (#E31837) with white text
- Secondary buttons: Black (#000000) with white text or outlined
- Links: Racing Red (#E31837) with hover state darkening to #C81530

**Backgrounds:**
- Main content areas: White (#FFFFFF)
- Alternate sections: Light Grey (#F5F5F5)
- Feature highlights: Subtle gradients from white to light grey

**Text Colors:**
- Headings: Black (#000000)
- Body text: Dark Grey (#333333)
- Secondary text: Medium Grey (#666666)
- CTAs and links: Racing Red (#E31837)

**Example Implementation:**

```jsx
// Primary button component
<button className="px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90">
  View Inventory
</button>

// Secondary button component
<button className="px-4 py-2 border border-[#000000] text-[#000000] rounded-md hover:bg-black hover:text-white">
  Learn More
</button>
```

## Typography

### Font Families

RPM Auto uses a carefully selected typography system for clear hierarchy and premium feel:

**Primary Fonts:**
- **Headlines & Navigation:** Poppins (sans-serif)
- **Body Copy:** Open Sans (sans-serif)

**Font Loading Implementation:**

```html
<!-- In client/index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
```

```css
/* In client/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=Poppins:wght@500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Open Sans', sans-serif;
    color: #333333;
  }
  
  h1, h2, h3, h4, h5, h6, .nav-link {
    font-family: 'Poppins', sans-serif;
  }
}
```

**Tailwind Configuration:**

```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    }
  }
}
```

### Type Scale

RPM Auto follows a consistent type scale for harmonious hierarchy:

| Element          | Font           | Size (Desktop) | Size (Mobile) | Weight | Line Height | Example Usage                 |
|------------------|----------------|----------------|---------------|--------|-------------|-------------------------------|
| H1 (Page Title)  | Poppins        | 40px (2.5rem)  | 32px (2rem)   | 700    | 1.2         | Main page titles              |
| H2 (Section)     | Poppins        | 32px (2rem)    | 28px (1.75rem)| 600    | 1.3         | Major section headers         |
| H3 (Subsection)  | Poppins        | 24px (1.5rem)  | 20px (1.25rem)| 600    | 1.4         | Content group headers         |
| H4 (Card Title)  | Poppins        | 20px (1.25rem) | 18px (1.125rem)| 600   | 1.4         | Card and component titles     |
| Body (Primary)   | Open Sans      | 16px (1rem)    | 16px (1rem)   | 400    | 1.5         | Main content text             |
| Body (Secondary) | Open Sans      | 14px (0.875rem)| 14px (0.875rem)| 400   | 1.6         | Secondary, supporting content |
| Small/Caption    | Open Sans      | 12px (0.75rem) | 12px (0.75rem)| 400    | 1.5         | Labels, captions, footnotes   |

**Example Implementation:**

```jsx
// Page title
<h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold text-black mb-6">
  Our Inventory
</h1>

// Section header
<h2 className="text-2xl md:text-3xl font-['Poppins'] font-semibold text-black mb-4">
  Featured Vehicles
</h2>

// Card title
<h3 className="text-xl font-['Poppins'] font-semibold mb-2">
  {vehicle.year} {vehicle.make} {vehicle.model}
</h3>

// Body text
<p className="text-base text-gray-700 leading-relaxed mb-4">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</p>
```

### Font Weights

RPM Auto uses specific font weights for different purposes:

**Poppins:**
- Bold (700): Page titles, primary CTAs
- SemiBold (600): Section headers, card titles
- Medium (500): Navigation, highlighted content

**Open Sans:**
- SemiBold (600): Subheaders, emphasized text
- Regular (400): Body text, general content

### Text Styles by Component

**Vehicle Card:**
- Title: Poppins SemiBold 20px, Black (#000000)
- Price: Poppins SemiBold 20px, Racing Red (#E31837)
- Specifications: Open Sans Regular 14px, Dark Grey (#333333)

**Navigation:**
- Main links: Poppins Medium 16px, Black (#000000)
- Active/hover state: Racing Red (#E31837) underline

**Buttons:**
- Primary: Poppins SemiBold 16px, White (#FFFFFF)
- Secondary: Poppins SemiBold 16px, Black (#000000)

## Layout System

### Grid Structure

RPM Auto uses a responsive 12-column grid system implemented with Tailwind's grid utilities:

**Desktop (1280px+):**
- 12 columns
- 24px gutters
- 48px outer margins

**Tablet (768px - 1279px):**
- 12 columns
- 16px gutters
- 32px outer margins

**Mobile (320px - 767px):**
- 4 columns
- 16px gutters
- 16px outer margins

**Implementation Example:**

```jsx
// Responsive grid for vehicle cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {vehicles.map(vehicle => (
    <VehicleCard key={vehicle.id} vehicle={vehicle} />
  ))}
</div>
```

### Spacing System

RPM Auto uses a consistent spacing scale to create visual harmony:

| Token | Size     | Tailwind Class | Usage                           |
|-------|----------|---------------|----------------------------------|
| 4xs   | 2px      | p-0.5, m-0.5  | Minimum separation              |
| 3xs   | 4px      | p-1, m-1      | Tight internal spacing           |
| 2xs   | 8px      | p-2, m-2      | Close related elements           |
| xs    | 12px     | p-3, m-3      | Related elements                 |
| sm    | 16px     | p-4, m-4      | Standard component padding       |
| md    | 24px     | p-6, m-6      | Standard section padding         |
| lg    | 32px     | p-8, m-8      | Major section padding            |
| xl    | 48px     | p-12, m-12    | Page section spacing             |
| 2xl   | 64px     | p-16, m-16    | Major page section dividers      |

**Implementation Example:**

```jsx
// Component with consistent spacing
<div className="p-6 mb-8">
  <h2 className="text-2xl font-['Poppins'] font-semibold mb-4">Featured Vehicles</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Vehicle cards */}
  </div>
</div>
```

### Responsive Breakpoints

RPM Auto uses these responsive breakpoints:

| Breakpoint Name | Width    | Tailwind Prefix | Description                 |
|-----------------|----------|----------------|-----------------------------|
| Mobile          | 0-639px  | (default)      | Mobile phones, small devices |
| Small           | 640px+   | sm:            | Large phones, small tablets  |
| Medium          | 768px+   | md:            | Tablets, small laptops       |
| Large           | 1024px+  | lg:            | Laptops, desktops            |
| Extra Large     | 1280px+  | xl:            | Large desktop displays       |
| 2XL             | 1536px+  | 2xl:           | Extra wide displays          |

**Responsive Design Principles:**
- Mobile-first approach with progressive enhancement
- Single-column layouts on mobile that expand to multi-column on larger screens
- Critical content prioritized in the visual hierarchy on all devices
- Touch-friendly tap targets (minimum 44px) on mobile interfaces

## Component Design

### Cards

**Vehicle Card:**
- Container: White background, subtle shadow, 4px border radius
- Image container: 16:9 aspect ratio, overflow hidden
- Padding: 16px (sm) around content
- Title: Poppins SemiBold 20px, dark gray
- Price: Racing Red (#E31837), Poppins SemiBold
- Specifications: Open Sans 14px with icons for visual clarity
- Hover state: Subtle shadow increase, slight scale transform

**Implementation:**

```jsx
<div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
  <div className="h-48 bg-gray-200 overflow-hidden">
    <img 
      src={vehicle.images[0]} 
      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
      className="w-full h-full object-cover hover:scale-105 transition"
    />
  </div>
  <div className="p-4">
    <h3 className="text-lg font-['Poppins'] font-semibold mb-1">
      {vehicle.year} {vehicle.make} {vehicle.model}
    </h3>
    <p className="text-[#E31837] font-bold text-lg mb-2">
      ${vehicle.price.toLocaleString()}
    </p>
    <p className="text-gray-600 text-sm">
      {vehicle.mileage.toLocaleString()} km | {vehicle.transmission} | {vehicle.fuelType}
    </p>
  </div>
</div>
```

### Buttons

RPM Auto uses a consistent button system:

**Primary Button:**
- Background: Racing Red (#E31837)
- Text: White (#FFFFFF), Poppins SemiBold
- Padding: 8px 16px (px-4 py-2)
- Border radius: 4px (rounded-md)
- Hover: 90% opacity
- Active: 85% opacity, slight scale reduction

**Secondary Button:**
- Background: Transparent
- Border: 1px solid Black (#000000)
- Text: Black (#000000), Poppins SemiBold
- Padding: 8px 16px (px-4 py-2)
- Border radius: 4px (rounded-md)
- Hover: Black background, white text
- Active: 90% opacity, slight scale reduction

**Tertiary/Text Button:**
- Background: Transparent
- Text: Racing Red (#E31837), Poppins Medium
- Padding: 8px 0
- Hover: Text decoration underline
- Active: 90% opacity

**Button Sizes:**
- Small: py-1 px-3, text-sm
- Default: py-2 px-4, text-base
- Large: py-3 px-6, text-lg

**Implementation:**

```jsx
// Button component examples
export function PrimaryButton({ children, className, ...props }) {
  return (
    <button 
      className={`px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90 active:scale-[0.98] font-['Poppins'] font-semibold ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className, ...props }) {
  return (
    <button 
      className={`px-4 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white active:scale-[0.98] font-['Poppins'] font-semibold ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
```

### Forms

Form elements follow these consistent styling patterns:

**Text Inputs:**
- Height: 40px (h-10)
- Border: 1px solid Light Silver (#EEEEEE)
- Border radius: 4px (rounded-md)
- Padding: 8px 12px (px-3 py-2)
- Focus state: Racing Red (#E31837) outline
- Error state: Error Red (#D32F2F) border and helper text

**Labels:**
- Font: Open Sans SemiBold 14px
- Color: Dark Grey (#333333)
- Margin bottom: 8px (mb-2)

**Select Dropdowns:**
- Matching styling to text inputs
- Custom chevron icon for dropdown indicator

**Checkboxes and Radio Buttons:**
- Custom styling with Racing Red (#E31837) for selected state

**Implementation:**

```jsx
<div className="mb-4">
  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
    Full Name *
  </label>
  <input
    type="text"
    id="name"
    name="name"
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
  />
</div>
```

### Navigation

**Main Navigation:**
- Background: White (#FFFFFF)
- Font: Poppins Medium 16px
- Text color: Black (#000000)
- Active/hover: Racing Red (#E31837) with subtle transition
- Padding: 16px between items
- Mobile: Hamburger menu with slide-in navigation panel

**Dropdown Menus:**
- Background: White (#FFFFFF)
- Shadow: Subtle drop shadow
- Border radius: 4px (rounded-md)
- Animation: Fade in, slight translation

**Implementation:**

```jsx
<nav className="bg-white shadow-sm">
  <div className="container mx-auto px-4 py-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <RPMLogo className="h-10" />
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/" className="font-['Poppins'] font-medium hover:text-[#E31837] transition">
          Home
        </Link>
        <Link href="/inventory" className="font-['Poppins'] font-medium hover:text-[#E31837] transition">
          Inventory
        </Link>
        <Link href="/services" className="font-['Poppins'] font-medium hover:text-[#E31837] transition">
          Services
        </Link>
        <Link href="/about" className="font-['Poppins'] font-medium hover:text-[#E31837] transition">
          About
        </Link>
        <Link href="/contact" className="font-['Poppins'] font-medium hover:text-[#E31837] transition">
          Contact
        </Link>
      </div>
      {/* Mobile menu button */}
    </div>
  </div>
</nav>
```

### Modals

**Modal Styling:**
- Backdrop: Black (#000000) at 50% opacity
- Container: White (#FFFFFF) background
- Border radius: 8px (rounded-lg)
- Shadow: Medium drop shadow
- Max width: Varies by content (typically 24rem to 36rem)
- Padding: 24px (p-6)
- Animation: Fade in with slight scale

**Implementation:**

```jsx
{isModalOpen && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
      <div className="relative bg-white rounded-lg max-w-lg w-full z-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-['Poppins'] font-bold">Modal Title</h3>
          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Modal content */}
      </div>
    </div>
  </div>
)}
```

## Image Guidelines

### Vehicle Photography

**Standard Vehicle Images:**
- Primary image: 3/4 front view, well-lit
- Gallery images: exterior (front, rear, sides), interior (dashboard, seats, features)
- Minimum resolution: 1200 x 800 pixels
- Aspect ratio: 16:9 (landscape) for consistency
- Style: Clean background, natural lighting
- Format: JPEG for photographs

**Image Display Rules:**
- Card thumbnails: Square or 16:9 cropping, centered on vehicle
- Detail page: Large hero image (primary), gallery grid for additional images
- Gallery page: Consistent tile sizing with hover zoom effect

### Image Optimization

All images should be optimized for web delivery:

- JPEG quality: 80-85% (balance between quality and file size)
- Lazy loading for images below the fold
- Responsive image sizing with the `OptimizedImage` component
- WebP format with JPEG fallback for older browsers
- Alt text for all images for accessibility and SEO

**Implementation:**

```jsx
<OptimizedImage
  src={vehicle.images[0]}
  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
  width={800}
  height={450}
  className="w-full h-full object-cover rounded"
  priority={isHeroImage}
/>
```

## Animation & Interaction

### Transition Standards

RPM Auto uses subtle, purposeful animations:

**Standard Transitions:**
- Duration: 200-300ms
- Timing: Ease-out for natural movement
- Properties: opacity, transform, background-color

**Implementation:**

```css
/* In Tailwind classes */
.transition { transition: all 300ms ease-out; }
.hover\:scale-105:hover { transform: scale(1.05); }
```

### Hover States

Interactive elements have clear hover states:

- Buttons: Slight color change or opacity shift
- Cards: Shadow increase, subtle scale increase
- Links: Color change, optional underline
- Navigation: Color shift to Racing Red (#E31837)

**Implementation Example:**

```jsx
<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer group">
  <div className="overflow-hidden">
    <img 
      src={imageUrl} 
      alt={imageAlt}
      className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" 
    />
  </div>
</div>
```

## Accessibility Standards

RPM Auto follows WCAG 2.1 AA standards for accessibility:

**Color Contrast:**
- Text meets 4.5:1 contrast ratio against backgrounds
- Interactive elements meet 3:1 contrast ratio

**Focus States:**
- Visible focus indicators for keyboard navigation
- Skip links for keyboard users
- Focus management in modals and dialogs

**Semantic HTML:**
- Proper heading hierarchy
- ARIA landmarks for major page sections
- ARIA attributes for interactive components
- Alternative text for images

**Implementation Example:**

```jsx
// Accessible button component
<button 
  className="px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837]"
  aria-label={ariaLabel || undefined}
>
  {children}
</button>
```

## Implementation Guidelines

### CSS Structure

RPM Auto uses a Tailwind CSS approach with these organization principles:

1. Utility-first approach with Tailwind classes
2. Component-specific styles for complex patterns
3. Global styles for baseline typography and spacing
4. CSS variables for theme customization

**CSS Organization:**

```css
/* 1. Base styles and CSS variables */
@layer base {
  :root {
    --color-primary: #E31837;
    --color-secondary: #000000;
    /* Other CSS variables */
  }
  
  html {
    font-family: 'Open Sans', sans-serif;
  }
}

/* 2. Component styles */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-[#E31837] text-white rounded-md hover:bg-opacity-90;
  }
  
  .vehicle-card {
    @apply bg-white rounded-lg shadow-md hover:shadow-lg transition;
  }
}
```

### Tailwind Configuration

The Tailwind configuration extends the default theme with RPM Auto's design tokens:

```javascript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'racing-red': '#E31837',
        'dark-grey': '#333333',
        'light-grey': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '4px',
        lg: '8px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### Component-Specific Styling

For complex components, use a combination of Tailwind utilities and component-specific styles:

```jsx
// Vehicle card component with consistent styling
function VehicleCard({ vehicle }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={vehicle.images[0]} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transform hover:scale-105 transition duration-300" 
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-['Poppins'] font-semibold mb-1 line-clamp-1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-[#E31837] font-bold text-lg mb-2">
          ${vehicle.price.toLocaleString()}
        </p>
        <div className="flex items-center text-gray-600 text-sm">
          <span>{vehicle.mileage.toLocaleString()} km</span>
          <span className="mx-2">•</span>
          <span>{vehicle.transmission}</span>
          <span className="mx-2">•</span>
          <span>{vehicle.fuelType}</span>
        </div>
      </div>
    </div>
  );
}
```

By following this style guide, developers and designers can maintain a consistent, professional, and cohesive user experience across the entire RPM Auto website.