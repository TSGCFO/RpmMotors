# RPM Auto Dealership Website

## Overview

The RPM Auto website is a professional car dealership application built with modern web technologies. It features a comprehensive vehicle inventory management system, customer interaction tools, and a robust administrative dashboard. The application is designed to provide an excellent user experience for both customers browsing vehicles and employees managing the dealership operations.

## System Architecture

The application follows a full-stack TypeScript architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **React 18.2+** with TypeScript for the user interface
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui components for consistent styling
- **Wouter** for client-side routing
- **React Query** for efficient data fetching and caching
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with JSON communication
- **PostgreSQL** database with Drizzle ORM for type-safe database operations
- **Passport.js** for authentication and session management
- **Multer** for file upload handling

### Database Design
- **PostgreSQL** as the primary database
- **Drizzle ORM** for schema management and type generation
- Database migrations managed through Drizzle Kit
- Support for both Neon DB (serverless) and traditional PostgreSQL deployments

## Key Components

### Vehicle Management System
- Comprehensive vehicle inventory with detailed specifications
- Image gallery support with multiple photos per vehicle
- Advanced filtering and search capabilities
- Vehicle categorization (luxury, sports, SUV, etc.)
- Featured vehicle highlighting
- Vehicle status tracking (available, sold, pending)

### User System
- Customer accounts with profile management
- Role-based access control (customer, staff, admin)
- Authentication with session management
- Employee portal for staff operations

### Content Management
- Dynamic page content management
- SEO optimization with structured data
- Blog functionality for content marketing
- Gallery management for showcasing vehicles

### Business Features
- Lead generation through contact forms
- Email notifications via SendGrid
- Customer inquiry tracking
- Analytics and reporting tools
- Marketing automation features

## Data Flow

### Customer Journey
1. Customer visits the website and browses inventory
2. Vehicle search and filtering queries are processed server-side
3. Vehicle details are fetched from PostgreSQL via Drizzle ORM
4. Images are served from Replit Object Storage or filesystem
5. Customer inquiries are captured and stored in the database
6. Email notifications are sent to staff via SendGrid

### Employee Operations
1. Staff login through authenticated portal
2. Vehicle management operations (CRUD) via admin dashboard
3. Customer inquiry management and response tracking
4. Analytics dashboard for business insights
5. Content management for website updates

### Data Storage Pattern
- **Vehicles**: Stored in PostgreSQL with JSON fields for features and images
- **Users**: PostgreSQL with encrypted passwords and role management
- **Images**: File system storage with database references
- **Inquiries**: PostgreSQL with status tracking and email integration

## External Dependencies

### Third-party Services
- **SendGrid**: Email delivery service for notifications
- **Neon DB**: Serverless PostgreSQL hosting (optional)
- **Replit Object Storage**: Image and asset storage (development)

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production
- **Tailwind CSS**: Utility-first CSS framework

### UI Libraries
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **React Query**: Server state management
- **React Hook Form**: Form validation and handling

## Deployment Strategy

### Environment Configuration
The application supports multiple deployment environments:
- **Development**: Local development with Replit integration
- **Production**: Render.com deployment with PostgreSQL
- **Staging**: Configurable for testing environments

### Build Process
1. **Frontend Build**: Vite builds the React application to static files
2. **Backend Build**: ESBuild bundles the Express server
3. **Database Setup**: Drizzle migrations create/update database schema
4. **Asset Handling**: Images and static files are served appropriately

### Deployment Considerations
- Environment variables for database connections and API keys
- File upload directory configuration for different environments
- Email service configuration for production notifications
- Database migration strategy for schema updates

## Changelog

- July 05, 2025. Initial setup
- January 05, 2025. Implemented Garage Register feature
  - Added garage_register table to track vehicle sales in compliance with dealership regulations
  - Created auto-fill functionality that populates fields from vehicle data when marking as "Sold"
  - Built validation for all required garage register fields including Ontario license plate format
  - Integrated garage register dialog into employee portal's inventory management
  - Modified vehicle status update flow to require garage register completion before marking vehicles as "Sold"
- January 06, 2025. Fixed pagination bug in vehicle inventory system
  - Resolved issue where default pagination limit (10) was incorrectly applied when using includeAll=true
  - Improved parseVehicleQueryOptions to only apply pagination when appropriate
  - Ensured all vehicles display correctly in admin and employee inventory pages
  - Vehicle with VIN KMHD84LF0JU551892 (ID 13) now properly appears in all inventory views

## User Preferences

Preferred communication style: Simple, everyday language.