# RPM Auto Dealership Website

## Overview

The RPM Auto website is a professional car dealership application built with modern web technologies. It features a React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM. The application provides vehicle inventory management, customer inquiries, and marketing features for a luxury car dealership.

## System Architecture

The application follows a client-server architecture with the following components:

- **Frontend**: React 18+ with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Replit Object Storage for vehicle images
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state management

The system uses a monorepo structure where frontend and backend code coexist, enabling type sharing and simplified development.

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom theme configuration
- **Image Handling**: Responsive image components with WebP support

### Backend Architecture
- **API Layer**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js for user authentication
- **Storage Interface**: Abstraction layer for file storage (Replit Object Storage)
- **Email Service**: SendGrid integration for customer inquiries

### Database Schema
The database includes tables for:
- **vehicles**: Complete vehicle inventory with specifications, images, and pricing
- **users**: User accounts with role-based access
- **inquiries**: Customer inquiries with status tracking
- **testimonials**: Customer reviews and ratings

## Data Flow

1. **Vehicle Display**: Frontend components fetch vehicle data from Express API endpoints
2. **Image Storage**: Vehicle images are stored in Replit Object Storage and served via CDN
3. **User Interactions**: Customer inquiries are processed through forms and stored in PostgreSQL
4. **Admin Operations**: Staff can manage inventory through protected admin routes
5. **Email Notifications**: Customer inquiries trigger email notifications via SendGrid

## External Dependencies

### Core Dependencies
- **@radix-ui/react-***: UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **@replit/object-storage**: File storage service
- **@sendgrid/mail**: Email service integration

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is designed for deployment on Render.com with the following configuration:

- **Build Command**: `npm run build` (builds both frontend and backend)
- **Start Command**: `npm run start` (serves the Express app with static files)
- **Database**: Neon PostgreSQL serverless database
- **Environment Variables**: Required for database connection, SendGrid API key, and storage configuration

The deployment includes:
- Static file serving for the React frontend
- API endpoints for vehicle data and customer inquiries
- Database migrations for schema updates
- Image storage integration

## Changelog

Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Updated "Our Story" section on About page with new founding date (April 2025) and refreshed company narrative

## User Preferences

Preferred communication style: Simple, everyday language.