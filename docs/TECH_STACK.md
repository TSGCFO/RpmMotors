# RPM Auto Technology Stack Documentation

This document provides a comprehensive overview of the technology stack used in the RPM Auto dealership website, including core frameworks, libraries, tools, and services. It serves as a reference for understanding the technical foundation of the application.

## Table of Contents

1. [Core Technology Stack](#core-technology-stack)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Database](#database)
2. [Frontend Technologies](#frontend-technologies)
   - [Framework](#framework)
   - [Build Tools](#build-tools)
   - [State Management](#state-management)
   - [UI Components](#ui-components)
   - [Styling](#styling)
   - [Routing](#routing)
   - [Form Handling](#form-handling)
3. [Backend Technologies](#backend-technologies)
   - [Server Framework](#server-framework)
   - [API Architecture](#api-architecture)
   - [Authentication](#authentication)
   - [Data Validation](#data-validation)
4. [Database Technologies](#database-technologies)
   - [Database System](#database-system)
   - [ORM](#orm)
   - [Schema Management](#schema-management)
   - [Migrations](#migrations)
5. [Development Tools](#development-tools)
   - [Version Control](#version-control)
   - [Type Checking](#type-checking)
   - [Code Quality](#code-quality)
   - [Development Environment](#development-environment)
6. [Testing Stack](#testing-stack)
7. [Deployment and Infrastructure](#deployment-and-infrastructure)
8. [Third-party Services](#third-party-services)
9. [Performance Optimization Tools](#performance-optimization-tools)
10. [Version Information](#version-information)
11. [Key Dependencies](#key-dependencies)

## Core Technology Stack

### Frontend

- **Language:** TypeScript 5.2+
- **Framework:** React 18.2+ (with JSX)
- **Build Tool:** Vite 5.0+
- **Package Manager:** npm 10+

### Backend

- **Language:** TypeScript 5.2+ (Node.js)
- **Server Framework:** Express 4.18+
- **API Style:** RESTful JSON API
- **Runtime:** Node.js 20+

### Database

- **Database System:** PostgreSQL 15+
- **ORM:** Drizzle ORM 0.29+
- **Connection:** @neondatabase/serverless (for PostgreSQL)
- **Schema Validation:** Zod & Drizzle-Zod

## Frontend Technologies

### Framework

- **React 18.2+**
  - Uses functional components and hooks pattern
  - Follows unidirectional data flow architecture
  - Leverages Context API for global state where appropriate

### Build Tools

- **Vite 5.0+**
  - Provides fast dev server with HMR (Hot Module Replacement)
  - Optimized production builds with code splitting
  - Environment variable handling via import.meta.env
  - Custom plugins:
    - @replit/vite-plugin-cartographer
    - @replit/vite-plugin-runtime-error-modal
    - @replit/vite-plugin-shadcn-theme-json

- **TypeScript 5.2+**
  - Strict type checking configuration
  - Path aliases configured for clean imports
  - Source maps enabled for debugging

### State Management

- **React Query (@tanstack/react-query) 5.0+**
  - Handles server-state management
  - Caching, background fetching, and pagination
  - Deduplication of requests
  - Optimistic updates

- **React Hooks**
  - useState for local component state
  - useReducer for complex state logic
  - useContext for shared state
  - Custom hooks for business logic abstraction

### UI Components

- **Shadcn/UI Components**
  - Accessibility-first component library
  - Based on Radix UI primitives
  - Customized with Tailwind CSS
  - Major components used:
    - Dialog/Modal
    - Dropdown Menu
    - Form components
    - Toast notifications
    - Tabs

- **Radix UI Primitives**
  - Unstyled, accessible UI components
  - Provides advanced interaction patterns
  - Used as the foundation for custom components

- **Specialized UI Libraries**
  - react-day-picker for date selection
  - embla-carousel-react for carousels/sliders
  - react-resizable-panels for resizable layouts
  - cmdk for command palettes

### Styling

- **Tailwind CSS 3.3+**
  - Utility-first CSS framework
  - Custom configuration in tailwind.config.ts
  - Extended with custom colors, spacing, and components
  - Extended with plugins:
    - @tailwindcss/typography
    - tailwindcss-animate

- **Custom Design System**
  - Defined in theme.json
  - Color palette centered around Racing Red (#E31837)
  - Typography system using Poppins and Open Sans
  - Component styles defined in Style Guide

### Routing

- **Wouter**
  - Lightweight (~1KB) router for React
  - Hooks-based API
  - Route parameters and path matching
  - Used for client-side routing

### Form Handling

- **React Hook Form 7.0+**
  - Performance-focused form library
  - Controlled inputs with validation
  - Integration with Zod for schema validation
  - Field-level validation and error handling

- **Zod Validation**
  - @hookform/resolvers/zod for form validation
  - Schema-based validation of user input
  - Type inference from validation schemas

## Backend Technologies

### Server Framework

- **Express 4.18+**
  - Middleware-based HTTP server
  - Routing for API endpoints
  - Error handling middleware
  - Static file serving
  - Session management

- **Environment Configuration**
  - dotenv for environment variables
  - Configuration based on NODE_ENV

### API Architecture

- **RESTful API Design**
  - Resource-based URL structure
  - Standard HTTP methods (GET, POST, PUT, DELETE)
  - JSON request/response format
  - Consistent error format

- **API Security**
  - CORS configuration
  - helmet for security headers
  - Rate limiting for public endpoints
  - Input validation for all requests

### Authentication

- **Passport.js**
  - Flexible authentication middleware
  - Local strategy for username/password
  - Session-based authentication
  - Role-based access control for admin features

- **Session Management**
  - express-session for session handling
  - connect-pg-simple for PostgreSQL session store
  - Secure, HTTP-only cookies
  - CSRF protection

### Data Validation

- **Zod Schemas**
  - Runtime validation of request data
  - Type inference for TypeScript
  - Detailed error messages
  - Custom validators

- **Drizzle-Zod Integration**
  - Schema generation from database models
  - Consistent validation between frontend and backend

## Database Technologies

### Database System

- **PostgreSQL 15+**
  - Relational database for structured data
  - ACID-compliant transactions
  - JSON data type for flexible schema needs
  - Full-text search capabilities

- **Connection Pooling**
  - Efficient connection management
  - @neondatabase/serverless for serverless compatibility
  - WebSocket driver for Neon Postgres

### ORM

- **Drizzle ORM 0.29+**
  - Type-safe SQL query builder
  - Lightweight and performance-focused
  - No active record pattern (explicit queries)
  - Full TypeScript inference

- **Schema Design**
  - Table and column definitions in shared/schema.ts
  - Relations defined with Drizzle relations
  - Default values and constraints
  - Indexes for performance optimization

### Schema Management

- **Drizzle Kit**
  - Schema generation and management
  - Used for database migrations
  - Schema push for development convenience
  - SQL generation

### Migrations

- **Drizzle Migrations**
  - Version-controlled schema changes
  - Migration scripts in SQL format
  - Generated and applied with Drizzle Kit
  - Migration history tracking

## Development Tools

### Version Control

- **Git**
  - Feature branch workflow
  - Conventional commit messages
  - Pull request-based development
  - GitHub for repository hosting

### Type Checking

- **TypeScript 5.2+**
  - Strict mode enabled
  - Shared types between frontend and backend
  - Path aliases for cleaner imports
  - Strongly typed API endpoints

### Code Quality

- **ESLint**
  - TypeScript-aware linting
  - React-specific rules
  - Error prevention rules

- **Prettier**
  - Consistent code formatting
  - Integrated with editor tools
  - Pre-commit hooks for enforcement

### Development Environment

- **Replit**
  - Online IDE and runtime environment
  - Collaborative editing capabilities
  - Integrated terminal
  - Workflow management for servers

## Testing Stack

- **Testing Approach**
  - Current: Manual testing of features
  - Planned: Component testing with Vitest
  - Planned: E2E testing with Playwright

## Deployment and Infrastructure

- **Deployment Platform**
  - Replit Deployments
  - Automated deployments from main branch
  - Environment configuration

- **Infrastructure**
  - Node.js runtime environment
  - PostgreSQL database hosting
  - Static asset serving

## Third-party Services

- **Potential Integration: Stripe**
  - Payment processing
  - Subscription management
  - Secure checkout process
  - Webhook handling for events

- **Potential Integration: SendGrid**
  - Transactional email service
  - Email templates
  - Delivery tracking
  - Event webhooks

- **Potential Integration: OpenAI**
  - AI-powered features
  - GPT models for content generation
  - Embeddings for search enhancement
  - Multimodal capabilities

## Performance Optimization Tools

- **Frontend Optimization**
  - Code splitting via dynamic imports
  - Image optimization strategies
  - Lazy loading of components
  - Memoization for expensive computations

- **Backend Optimization**
  - Database query optimization
  - Connection pooling
  - Response caching
  - Efficient API design

## Version Information

Current stack versions as of April 2025:

- **Node.js:** 20.10.0
- **PostgreSQL:** 15.4
- **React:** 18.2.0
- **TypeScript:** 5.2.2
- **Express:** 4.18.2
- **Drizzle ORM:** 0.29.1
- **Vite:** 5.0.8
- **Tailwind CSS:** 3.3.3

## Key Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@tanstack/react-query": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "embla-carousel-react": "^8.0.0-rc14",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.9.1",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.2",
    "react-icons": "^4.11.0",
    "recharts": "^2.9.3",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^2.12.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

### Backend Dependencies

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.6.0",
    "connect-pg-simple": "^9.0.0",
    "drizzle-orm": "^0.29.1",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0",
    "ws": "^8.14.2",
    "zod-validation-error": "^1.5.0"
  },
  "devDependencies": {
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/ws": "^8.5.10",
    "drizzle-kit": "^0.20.6",
    "tsx": "^4.1.3"
  }
}
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && tsc --project tsconfig.server.json",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  }
}
```

This tech stack documentation provides a comprehensive overview of all technologies, libraries, and tools used in the RPM Auto dealership website. It serves as a reference for developers to understand the technical foundation of the application.