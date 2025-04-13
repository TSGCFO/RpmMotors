# RPM Auto - Professional Car Dealership Website

A professional car dealership website for RPM Auto, delivering a data-driven and interactive online vehicle browsing experience with advanced marketing technologies.

## Features

- Modern, responsive UI design with Tailwind CSS
- Interactive vehicle inventory management system
- Vehicle search and filtering capabilities
- Detailed vehicle listings with high-quality images
- Admin dashboard with analytics and marketing tools
- Personalized recommendations based on user behavior
- SEO optimizations with structured data
- A/B testing framework for marketing optimization
- Cookie-based user preference tracking

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Authentication**: Passport.js
- **Marketing Tools**: Custom analytics and A/B testing

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Main Documentation Index](./docs/README.md) - Start here for an overview
- [Developer Guide](./docs/DEVELOPER.md) - Complete developer documentation
- [Technical Wiki](./docs/TECHNICAL_WIKI.md) - In-depth technical details
- [Debugging Guide](./docs/DEBUGGING_GUIDE.md) - Help troubleshooting issues
- [Field Migration Guide](./docs/FIELD_MIGRATION_GUIDE.md) - Guide for field naming changes

## Recent Updates

### Field Compatibility Fixes (April 13, 2025)

We've recently completed a comprehensive update to fix field compatibility issues across the codebase:

- Standardized field naming conventions between frontend and backend
- Added proper null checking for all data access
- Improved type safety with correct TypeScript types
- Enhanced error handling for a more robust application

See the [Field Migration Guide](./docs/FIELD_MIGRATION_GUIDE.md) for details on these changes.

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Initialize the database:
   ```
   npm run db:push
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Development Workflow

1. Start the application with `npm run dev`
2. Access the website at `http://localhost:5000`
3. Access the admin dashboard at `http://localhost:5000/admin`
   - Default admin credentials: Username: `admin`, Password: `rpmauto2025`
   
## Deployment

The application can be deployed to any environment supporting Node.js and PostgreSQL.

## License

This project is proprietary software of RPM Auto.