# RPM Auto Documentation

Welcome to the RPM Auto Website documentation. This comprehensive set of documents provides detailed information about the implementation, features, and development processes for the RPM Auto dealership website.

## Documentation Index

### Developer Resources

- [Developer Guide](./DEVELOPER.md) - Comprehensive developer documentation including project structure, component details, and development guidelines
- [Technical Wiki](./TECHNICAL_WIKI.md) - In-depth technical details on field compatibility issues, TypeScript type safety, and error handling
- [Tech Stack](./TECH_STACK.md) - Complete documentation of all technologies, frameworks, and libraries used in the project
- [Style Guide](./STYLE_GUIDE.md) - Detailed design system documentation including colors, typography, components, and styling principles
- [Code Architecture](./CODE_ARCHITECTURE.md) - Architectural patterns, code organization, and design principles
- [Debugging Guide](./DEBUGGING_GUIDE.md) - Step-by-step procedures for identifying and resolving common issues
- [Field Migration Guide](./FIELD_MIGRATION_GUIDE.md) - Documentation of field naming changes and migration strategies

## Recent Updates (April 13, 2025)

### Field Compatibility Fixes

A series of field compatibility fixes were implemented to ensure consistent naming between the database schema and frontend components:

1. Fixed field references in multiple components:
   - `exteriorColor` → `color`
   - `photos` → `images`
   - `thumbnail` → `images[0]`
   - `featured` → `isFeatured`

2. Added proper null checking for:
   - Image arrays
   - Boolean flags
   - Date fields
   - Status fields

3. Updated type definitions in mutation functions

See the [Developer Guide](./DEVELOPER.md) for detailed explanations of these changes.

## Getting Started

To start working with this codebase:

1. Review the [Developer Guide](./DEVELOPER.md) to understand the project structure and architecture
2. Consult the [Technical Wiki](./TECHNICAL_WIKI.md) for detailed technical information
3. Follow the development guidelines for consistent code quality

## Field Reference

Quick reference for the most commonly used fields in the Vehicle schema:

| Database Field | Type            | Description                           | Notes                                  |
|---------------|-----------------|---------------------------------------|----------------------------------------|
| `make`        | string          | Vehicle manufacturer                   |                                        |
| `model`       | string          | Vehicle model name                     |                                        |
| `year`        | number          | Manufacturing year                     |                                        |
| `price`       | number          | Price in dollars                       |                                        |
| `mileage`     | number          | Mileage in kilometers                  |                                        |
| `color`       | string          | Exterior color                         | Previously referenced as exteriorColor |
| `images`      | string[]        | Array of image URLs                    | Previously referenced as photos        |
| `isFeatured`  | boolean         | Whether vehicle is featured            | Previously referenced as featured      |
| `features`    | string[]        | Array of vehicle features              |                                        |
| `condition`   | string          | Vehicle condition (New, Used, etc.)    |                                        |
| `category`    | string          | Vehicle category (SUV, Sedan, etc.)    |                                        |
| `vin`         | string          | Vehicle identification number          |                                        |

## Contribution Guidelines

When contributing to this project:

1. Always start with the database schema when adding new features
2. Follow the naming conventions established in the schema
3. Ensure proper null checking for all field access
4. Test thoroughly across different scenarios
5. Document any changes to field names or data structures