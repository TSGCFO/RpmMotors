# RPM Auto Website Architecture

## Overview

The RPM Auto Website is a professional car dealership application designed to showcase vehicle inventory and provide a high-quality user experience for potential customers. The application follows a modern client-server architecture with a clear separation between frontend and backend components.

The system is built using a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. It incorporates advanced marketing features, vehicle inventory management, and admin capabilities.

## System Architecture

The application follows a standard web architecture with the following key components:

```
┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│             │         │             │        │             │
│   React     │ ◄────► │   Express   │ ◄────► │  PostgreSQL │
│   Frontend  │         │   Backend   │        │  Database   │
│             │         │             │        │             │
└─────────────┘         └─────────────┘        └─────────────┘
      ▲                        ▲                     ▲
      │                        │                     │
      ▼                        ▼                     ▼
┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│  3rd Party  │         │  Serverless │        │   Replit    │
│   Services  │         │  Functions  │        │   Storage   │
│ (SendGrid)  │         │ (Neon DB)   │        │             │
└─────────────┘         └─────────────┘        └─────────────┘
```

### Key Architectural Decisions

1. **Single Codebase Structure**: 
   - The application uses a monorepo approach with frontend and backend in a single codebase
   - This simplifies development, deployment, and type sharing between client and server

2. **Type Safety**:
   - Strong TypeScript integration throughout the application
   - Shared schema definitions between frontend and backend
   - Zod validation for runtime data validation

3. **Data Persistence**:
   - PostgreSQL database with Drizzle ORM
   - Serverless database connection using Neon DB
   - Schema-driven database design with migrations
   
4. **Object Storage**:
   - Replit Object Storage for vehicle images and assets
   - Custom scripts for batch uploading images

5. **API Design**:
   - RESTful API for data access
   - React Query for data fetching, caching, and state management

## Key Components

### Frontend

#### Technology Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Routing**: Wouter (lightweight alternative to React Router)

#### Key Frontend Components
1. **Public Pages**:
   - Home page with featured vehicles
   - Inventory browsing with filtering
   - Vehicle details pages
   - About, Services, Gallery, Contact pages

2. **Admin/Employee Portal**:
   - Dashboard with analytics
   - Inventory management
   - Inquiry management
   - Marketing tools

3. **UI Components**:
   - Reusable component library based on shadcn/ui
   - Vehicle cards, galleries, and detail displays
   - Contact forms and inquiry handling
   - SEO optimization components

4. **Customer Experience Features**:
   - Cookie-based user preference tracking
   - Recently viewed vehicles
   - Personalized recommendations
   - A/B testing capabilities

### Backend

#### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: REST endpoints
- **Database Access**: Drizzle ORM
- **Email**: SendGrid integration

#### Key Backend Components
1. **API Layer**:
   - RESTful endpoints for vehicle data
   - Inquiry and contact form handling
   - User authentication for admin/employee portals

2. **Storage Interface**:
   - Abstract data access layer in `storage.ts`
   - Standardized query patterns for filtering, pagination, and sorting
   - Type-safe database operations

3. **Database Connection**:
   - Connection pooling for efficient database access
   - Serverless database compatibility
   - Error handling and connection management

4. **External Services**:
   - Email service integration with SendGrid
   - Object storage for vehicle images

### Shared Code

1. **Schema Definitions**:
   - Database schema defined in `shared/schema.ts`
   - Zod validation schemas for data integrity
   - TypeScript types generated from schema definitions

2. **Utilities**:
   - Shared utility functions
   - Common type definitions
   - Validation logic

## Data Flow

### Vehicle Browsing Flow
1. User visits the website
2. Frontend requests vehicle data from backend API
3. Backend retrieves data from PostgreSQL via Drizzle ORM
4. Data is transformed and sent back to the frontend
5. React components render the vehicle information
6. User interactions (like viewing a vehicle) are tracked in cookies

### Inquiry Flow
1. User fills out a contact or inquiry form
2. Form data is validated on the frontend
3. Data is sent to the backend API
4. Backend stores the inquiry in the database
5. Notification email is sent via SendGrid
6. Confirmation is returned to the frontend
7. Frontend displays success message to the user

### Admin/Employee Flow
1. Admin/employee logs in (simple authentication)
2. Dashboard loads with data from multiple API endpoints
3. Admin can view/edit inventory, handle inquiries, and view analytics
4. Changes are saved back to the database via API calls

## External Dependencies

### Third-Party Services
1. **SendGrid**: Email delivery service for contact forms and notifications
2. **Stripe**: Integration for payment processing (referenced in package.json)
3. **Replit Object Storage**: Cloud storage for vehicle images

### UI Component Libraries
1. **Radix UI**: Low-level, accessible UI primitives
2. **shadcn/ui**: High-level components built on Radix UI
3. **Lucide Icons**: Icon library for UI elements

### State Management and Data Fetching
1. **TanStack Query** (React Query): Data fetching, caching, and state management
2. **Zod**: Schema validation library

## Deployment Strategy

The application is configured for deployment on Replit, with specific configuration for the Replit environment:

1. **Build Process**:
   - Vite builds the frontend assets
   - esbuild bundles the server code
   - Combined deployment with server serving static assets

2. **Database**:
   - Uses serverless PostgreSQL (likely Neon DB)
   - Database URL provided via environment variables
   - Migration scripts for schema updates

3. **Asset Storage**:
   - Replit Object Storage for static assets and vehicle images
   - Custom upload scripts for managing assets

4. **Environment Configuration**:
   - Development vs. production settings
   - Environment variables for API keys and secrets

5. **Scaling Strategy**:
   - Configured for autoscaling on Replit
   - Serverless-friendly architecture

## Security Considerations

1. **Authentication**:
   - Simple password-based authentication for admin/employee areas
   - Token storage in localStorage (basic implementation)

2. **Data Validation**:
   - Input validation on both client and server
   - Zod schemas for type-safe validation

3. **API Security**:
   - RESTful API with proper error handling
   - Request validation before processing

4. **User Data**:
   - Cookie consent for tracking user preferences
   - Privacy policy explaining data usage