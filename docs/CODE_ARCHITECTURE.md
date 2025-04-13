# RPM Auto Code Architecture Documentation

This document outlines the architectural patterns, code organization, and design principles employed in the RPM Auto website codebase. It serves as a guide for understanding how the application is structured and the reasoning behind key architectural decisions.

## Table of Contents

1. [Application Architecture](#application-architecture)
   - [Client-Server Model](#client-server-model)
   - [Directory Structure](#directory-structure)
   - [Code Organization Principles](#code-organization-principles)
2. [Frontend Architecture](#frontend-architecture)
   - [Component Hierarchy](#component-hierarchy)
   - [State Management](#state-management)
   - [Routing Implementation](#routing-implementation)
   - [Data Fetching Pattern](#data-fetching-pattern)
3. [Backend Architecture](#backend-architecture)
   - [API Design](#api-design)
   - [Storage Interface](#storage-interface)
   - [Database Access Layer](#database-access-layer)
4. [Shared Code](#shared-code)
   - [Schema Definitions](#schema-definitions)
   - [Type System](#type-system)
   - [Validation Logic](#validation-logic)
5. [Key Design Patterns](#key-design-patterns)
   - [Repository Pattern](#repository-pattern)
   - [Container/Presentational Pattern](#containerpresentational-pattern)
   - [Hooks Pattern](#hooks-pattern)
6. [Coding Standards](#coding-standards)
   - [TypeScript Usage](#typescript-usage)
   - [Error Handling](#error-handling)
   - [Performance Optimizations](#performance-optimizations)
7. [Authentication System](#authentication-system)
8. [Deployment Architecture](#deployment-architecture)

## Application Architecture

### Client-Server Model

RPM Auto follows a modern client-server architecture:

- **Client:** React single-page application (SPA) built with Vite
- **Server:** Express.js REST API
- **Database:** PostgreSQL with Drizzle ORM
- **Communication:** JSON over HTTP

**Key Benefits:**
- Clear separation of concerns
- Independent scalability of frontend and backend
- Improved maintainability through modular design

### Directory Structure

The project is organized into logical directories:

```
/
├── client/               # Frontend application
│   ├── src/              # Source code
│   │   ├── components/   # Reusable UI components
│   │   │   ├── admin/    # Admin-specific components
│   │   │   ├── layout/   # Layout components (header, footer)
│   │   │   ├── seo/      # SEO-related components
│   │   │   └── ui/       # General UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and services
│   │   ├── pages/        # Page components matching routes
│   │   │   └── admin/    # Admin page components
│   │   ├── App.tsx       # Root component
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   └── index.html        # HTML template
├── server/               # Backend application
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage interface
│   └── vite.ts           # Vite integration
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and type definitions
└── docs/                 # Documentation
```

### Code Organization Principles

RPM Auto follows these code organization principles:

1. **Separation of Concerns:** Clear boundaries between UI, business logic, and data access
2. **Feature-based Organization:** Components organized by feature rather than type
3. **Proximity Principle:** Related code kept close together
4. **Encapsulation:** Implementation details hidden behind clean interfaces
5. **Single Responsibility:** Each module responsible for one aspect of functionality

## Frontend Architecture

### Component Hierarchy

The React component hierarchy follows this structure:

```
App
├── Router
│   ├── Layout (Header, Footer)
│   │   ├── Home
│   │   │   ├── HeroSection
│   │   │   ├── FeaturedVehicles
│   │   │   ├── ServicesSection
│   │   │   └── TestimonialsSection
│   │   ├── Inventory
│   │   │   ├── SearchFilters
│   │   │   ├── VehicleGrid
│   │   │   │   └── VehicleCard
│   │   │   └── Pagination
│   │   ├── VehicleDetails
│   │   │   ├── VehicleGallery
│   │   │   ├── VehicleSpecs
│   │   │   ├── PriceSection
│   │   │   └── ContactSection
│   │   └── Other pages...
│   ├── AdminLayout (no Header/Footer)
│   │   ├── AdminDashboard
│   │   ├── InventoryManagement
│   │   └── Other admin pages...
│   └── NotFound
└── Toaster (Notifications)
```

**Component Design Principles:**
- Components are designed for reusability
- Each component has a single responsibility
- Container components manage data and state
- Presentational components focus on UI and styling
- Shared UI elements extracted into component library

### State Management

RPM Auto uses a combination of state management approaches:

1. **Local Component State:**
   - For component-specific UI state
   - Implemented with `useState` and `useReducer` hooks
   - Example: Form input values, modal open/closed state

2. **React Query:**
   - For server-state management
   - Handles caching, background updates, and refetching
   - Example: Vehicle inventory data, testimonials

3. **Context API:**
   - For cross-component shared state
   - Used sparingly for truly global state
   - Example: User authentication state, theme preferences

**Implementation:**

```typescript
// Example React Query implementation
const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
  queryKey: ['/api/vehicles'],
});

// Example mutation
const addVehicleMutation = useMutation({
  mutationFn: (newVehicle: InsertVehicle) => 
    apiRequest('POST', '/api/vehicles', newVehicle),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
  }
});
```

### Routing Implementation

RPM Auto uses `wouter` for client-side routing:

```typescript
// App.tsx
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/inventory/:id" component={VehicleDetails} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

**Routing Features:**
- Clean URL structure
- Parameter-based routes for dynamic content
- Nested routes for admin section
- Programmatic navigation via useLocation hook
- Not Found page for undefined routes

### Data Fetching Pattern

RPM Auto uses a consistent data fetching pattern:

1. **API Client:**
   - Centralized API client in `client/src/lib/queryClient.ts`
   - Handles authentication headers and error processing
   - Supports GET, POST, PUT, DELETE methods

2. **React Query:**
   - Queries defined close to where data is used
   - Dynamic query keys based on filters/parameters
   - Invalidation on mutations to keep data fresh

3. **Loading States:**
   - Consistent loading indicators
   - Skeleton screens for better perceived performance
   - Error boundaries for graceful error handling

**Implementation Example:**

```typescript
// API client 
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);
  await throwIfResNotOk(response);
  
  return response;
}

// Using in a component
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/vehicles/featured'],
});
```

## Backend Architecture

### API Design

The API follows RESTful principles:

- **Resource-based URLs:** `/api/vehicles`, `/api/inquiries`
- **HTTP Methods:** GET, POST, PUT, DELETE for CRUD operations
- **JSON Format:** Consistent request/response format
- **Status Codes:** Standard HTTP status codes

**API Endpoints:**

| Endpoint                        | Method | Description                             |
|---------------------------------|--------|-----------------------------------------|
| `/api/vehicles`                 | GET    | Get all vehicles                        |
| `/api/vehicles/featured`        | GET    | Get featured vehicles                   |
| `/api/vehicles/:id`             | GET    | Get a specific vehicle                  |
| `/api/vehicles/category/:cat`   | GET    | Get vehicles by category                |
| `/api/vehicles/search`          | GET    | Search vehicles with query params       |
| `/api/vehicles`                 | POST   | Create a new vehicle                    |
| `/api/vehicles/:id`             | PUT    | Update a vehicle                        |
| `/api/vehicles/:id`             | DELETE | Delete a vehicle                        |
| `/api/inquiries`                | GET    | Get all inquiries                       |
| `/api/inquiries`                | POST   | Create a new inquiry                    |
| `/api/testimonials`             | GET    | Get approved testimonials               |
| `/api/testimonials`             | POST   | Submit a new testimonial                |

### Storage Interface

The backend uses the Repository pattern via the Storage interface:

```typescript
// Simplified storage interface
export interface IStorage {
  // Vehicle methods
  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  getFeaturedVehicles(): Promise<Vehicle[]>;
  getVehiclesByCategory(category: string): Promise<Vehicle[]>;
  searchVehicles(query: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Inquiry methods
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  
  // Testimonial methods
  getApprovedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}
```

This interface is implemented by `DatabaseStorage` class which uses Drizzle ORM to interact with PostgreSQL.

**Key Benefits:**
- Abstracts database implementation details
- Enables easy swapping of data sources
- Facilitates testing with mock implementations
- Enforces consistent data access patterns

### Database Access Layer

The database layer uses Drizzle ORM with a PostgreSQL database:

```typescript
// Database connection
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**Database Interaction Pattern:**

```typescript
// Example Drizzle ORM query
async function getVehicleById(id: number): Promise<Vehicle | undefined> {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, id));
  return vehicle || undefined;
}
```

## Shared Code

### Schema Definitions

The shared schema in `shared/schema.ts` defines the database schema and TypeScript types:

```typescript
// Vehicle schema definition
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull().default("Used"),
  isFeatured: boolean("is_featured").default(false),
  features: json("features").$type<string[]>().notNull().default([]),
  images: json("images").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  vin: text("vin").notNull().unique(),
});
```

### Type System

The type system uses TypeScript with Zod for runtime validation:

```typescript
// Type definitions
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
```

**Benefits of this approach:**
- Type safety throughout the application
- Single source of truth for data structures
- Runtime validation through Zod schemas
- Automatic type inference from database schema

### Validation Logic

Input validation is implemented using Zod schemas:

```typescript
// API route with validation
app.post("/api/vehicles", async (req: Request, res: Response) => {
  try {
    const validationResult = insertVehicleSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      return res.status(400).json({ message: errorMessage });
    }
    
    const vehicle = await storage.createVehicle(validationResult.data);
    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});
```

## Key Design Patterns

### Repository Pattern

The Repository pattern is used to abstract data access:

```typescript
// DatabaseStorage as repository implementation
export class DatabaseStorage implements IStorage {
  async getVehicles(): Promise<Vehicle[]> {
    return db
      .select()
      .from(vehicles)
      .orderBy(desc(vehicles.createdAt));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(insertVehicle)
      .returning();
    return vehicle;
  }

  // Other repository methods...
}
```

**Benefits:**
- Centralizes data access logic
- Makes data operations testable
- Decouples business logic from data access
- Enforces consistent data access patterns

### Container/Presentational Pattern

The frontend uses a container/presentational pattern:

**Container Component (manages data and logic):**

```typescript
// Inventory page (container)
export default function Inventory() {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    priceMin: 0,
    priceMax: 1000000,
  });
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles', searchParams],
    queryFn: () => fetchVehicles(searchParams)
  });
  
  // Logic for filtering and sorting...
  
  return (
    <InventoryView 
      vehicles={vehicles} 
      isLoading={isLoading}
      filters={searchParams}
      onFilterChange={handleFilterChange}
    />
  );
}
```

**Presentational Component (focuses on UI):**

```typescript
// InventoryView component (presentational)
function InventoryView({ 
  vehicles, 
  isLoading,
  filters,
  onFilterChange
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vehicle Inventory</h1>
      
      <FilterPanel filters={filters} onChange={onFilterChange} />
      
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Benefits:**
- Separation of concerns
- Improved reusability of UI components
- Easier testing of business logic
- More maintainable codebase

### Hooks Pattern

Custom React hooks are used to encapsulate and reuse logic:

```typescript
// Custom hook for tracking recently viewed vehicles
export function useRecentlyViewedVehicles(limit = 4) {
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  
  useEffect(() => {
    // Load recently viewed vehicles from cookies
    const recentIds = getRecentlyViewedVehicles();
    
    if (recentIds.length > 0) {
      // Fetch vehicles by IDs
      apiRequest('GET', `/api/vehicles/batch?ids=${recentIds.join(',')}`)
        .then(res => res.json())
        .then(data => {
          setRecentVehicles(data.slice(0, limit));
        })
        .catch(err => console.error('Failed to load recently viewed vehicles', err));
    }
  }, [limit]);
  
  const addVehicle = useCallback((vehicle: Vehicle) => {
    // Add to cookie tracking
    saveRecentlyViewedVehicle(vehicle.id);
    
    // Update local state without duplicates
    setRecentVehicles(prev => {
      const filtered = prev.filter(v => v.id !== vehicle.id);
      return [vehicle, ...filtered].slice(0, limit);
    });
  }, [limit]);
  
  return { recentVehicles, addVehicle };
}
```

**Benefits:**
- Encapsulation of related logic
- Reusability across components
- Cleaner component code
- Testability of logic in isolation

## Coding Standards

### TypeScript Usage

The codebase follows these TypeScript best practices:

1. **Explicit Types for Function Parameters:**
   ```typescript
   function processVehicle(vehicle: Vehicle): ProcessedVehicle {
     // Implementation
   }
   ```

2. **Interfaces for Object Shapes:**
   ```typescript
   interface FilterParams {
     query: string;
     category: string;
     priceRange: [number, number];
   }
   ```

3. **Type Safety with Nullability:**
   ```typescript
   function getFirstImage(vehicle: Vehicle): string {
     return vehicle.images && vehicle.images.length > 0
       ? vehicle.images[0]
       : defaultImage;
   }
   ```

4. **Generic Types for Reusable Components:**
   ```typescript
   interface ApiResponse<T> {
     data: T;
     status: 'success' | 'error';
     message?: string;
   }
   ```

### Error Handling

The application uses a consistent error handling strategy:

1. **Backend Error Handling:**
   ```typescript
   app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
     try {
       const id = parseInt(req.params.id);
       if (isNaN(id)) {
         return res.status(400).json({ message: "Invalid vehicle ID" });
       }
       
       const vehicle = await storage.getVehicleById(id);
       if (!vehicle) {
         return res.status(404).json({ message: "Vehicle not found" });
       }
       
       res.json(vehicle);
     } catch (error) {
       console.error(`Error fetching vehicle ${req.params.id}:`, error);
       res.status(500).json({ message: "Failed to fetch vehicle" });
     }
   });
   ```

2. **Frontend Error Handling:**
   ```typescript
   const { data, error, isLoading } = useQuery({
     queryKey: ['/api/vehicles', id],
     retry: 2,
   });

   if (error) {
     return <ErrorDisplay message="Failed to load vehicle details" error={error} />;
   }
   
   if (isLoading) {
     return <VehicleDetailsSkeleton />;
   }
   ```

3. **Global Error Handling:**
   ```typescript
   // Express global error handler
   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
     console.error('Unhandled error:', err);
     res.status(500).json({ message: 'Internal server error' });
   });
   ```

### Performance Optimizations

The codebase includes these performance optimizations:

1. **Query Caching:**
   - React Query caches API responses
   - Configurable staleTime for data freshness
   - Background refetching for stale data

2. **Code Splitting:**
   - Dynamic imports for route-based code splitting
   - Lazy loading of heavy components

3. **Component Optimization:**
   - React.memo for expensive components
   - useCallback/useMemo for stable references
   - Virtual lists for long scrollable content

4. **Image Optimization:**
   - Responsive images
   - Lazy loading of images
   - WebP format with fallbacks

## Authentication System

The authentication system uses Passport.js with local strategy:

```typescript
// Authentication setup
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));
```

**Authentication Flow:**
1. User submits login credentials
2. Server validates credentials against database
3. On success, creates a session and sets a cookie
4. Protected routes check for authenticated session
5. Admin routes require admin role

## Deployment Architecture

The application is deployed on Replit with the following architecture:

**Environment:**
- Node.js runtime
- PostgreSQL database
- Vite for frontend bundling

**Build Process:**
1. TypeScript compilation
2. Vite production build
3. Asset optimization

**Runtime Configuration:**
- Environment variables for sensitive configuration
- Database connection pooling
- Express server serving both API and static assets

**Scaling Considerations:**
- Database connection pooling
- Asset caching through CDN
- Optimized bundle sizes
- Efficient database queries

This comprehensive architecture document provides a complete overview of the RPM Auto codebase structure, patterns, and implementation details.