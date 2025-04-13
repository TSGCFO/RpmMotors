# RPM Auto Field Migration Guide

This guide provides detailed instructions for migrating field names across the RPM Auto codebase. It documents the history of field name changes and provides a methodology for safely updating field references in the future.

## Table of Contents

1. [Field Naming History](#field-naming-history)
2. [Migration Methodology](#migration-methodology)
3. [Component-by-Component Migration Checklist](#component-by-component-migration-checklist)
4. [Testing Field Migrations](#testing-field-migrations)
5. [Database Schema Evolution](#database-schema-evolution)

## Field Naming History

### Original Field Names

The initial implementation of the RPM Auto website used these frontend property names:

| Frontend Field | Data Type    | Description                           |
|---------------|--------------|---------------------------------------|
| `exteriorColor` | string       | Vehicle's exterior color              |
| `photos`      | string[]     | Array of vehicle photo URLs           |
| `thumbnail`   | string       | Main display photo URL                |
| `featured`    | boolean      | Whether vehicle is featured           |

### Current Field Names (April 2025)

The current schema standardizes field names:

| Frontend Field | Database Column | Data Type    | Description                           |
|---------------|----------------|--------------|---------------------------------------|
| `color`       | `color`        | string       | Vehicle's exterior color              |
| `images`      | `images`       | string[]     | Array of vehicle image URLs           |
| `images[0]`   | `images[0]`    | string       | First image used as primary display   |
| `isFeatured`  | `is_featured`  | boolean      | Whether vehicle is featured           |

## Migration Methodology

Follow these steps when migrating field names or structures:

### 1. Schema Update

1. Start by updating the schema in `shared/schema.ts`
2. Update the corresponding TypeScript types:
   - `InsertVehicle` for record creation
   - `Vehicle` for record retrieval and updates

### 2. Component Analysis

1. Use TypeScript to identify affected components:
   - Run a TypeScript check: `npx tsc --noEmit`
   - Review all TypeScript errors related to renamed fields
   - Create a list of all components that need updates

2. Use grep to find references in the codebase:
   ```bash
   grep -r "oldFieldName" client/src/
   ```

### 3. Systematic Updates

Update components in a specific order:

1. First update data service/API layers
2. Update reusable components that are widely used
3. Update page components 
4. Update utility functions and hooks

### 4. Add Null Checks

When updating field references, always add appropriate null checks:

```typescript
// For simple fields
{vehicle && vehicle.color ? vehicle.color : 'Not specified'}

// For array fields
{vehicle && vehicle.images && vehicle.images.length > 0 
  ? vehicle.images[0] 
  : defaultImage
}
```

## Component-by-Component Migration Checklist

Use this checklist when migrating field names:

### Core Components

- [ ] `CarCard.tsx` - Vehicle display card
- [ ] `VehicleDetails.tsx` - Detailed vehicle information
- [ ] `InventoryFilters.tsx` - Filtering controls
- [ ] `Gallery.tsx` - Image gallery component

### Page Components

- [ ] `inventory.tsx` - Vehicle listing page
- [ ] `vehicle-details.tsx` - Individual vehicle page
- [ ] `gallery.tsx` - Gallery page
- [ ] `home.tsx` - Featured vehicles on home page

### Admin Components

- [ ] `admin/inventory.tsx` - Inventory management
- [ ] `admin/analytics-dashboard.tsx` - Analytics dashboard
- [ ] `admin/index.tsx` - Admin overview

### Utility Components

- [ ] `recently-viewed-vehicles.tsx` - Recently viewed component
- [ ] `personalized-recommendations.tsx` - Recommendations component

## Testing Field Migrations

### Manual Testing Steps

After migrating field names, perform these manual tests:

1. **Visual Verification**
   - Check that all images display correctly
   - Verify that colors and features are displayed correctly
   - Confirm that featured vehicles appear in featured sections

2. **Form Testing**
   - Test adding a new vehicle with the admin form
   - Test editing an existing vehicle
   - Verify that all fields save and load correctly

3. **Filter Testing**
   - Test filtering by various criteria
   - Verify search functionality works with the new field names

### Automated Testing

Consider adding these automated tests:

1. **Component Tests**
   ```typescript
   test('renders vehicle color correctly', () => {
     const vehicle = { 
       id: 1, 
       color: 'Red',
       // other fields
     };
     render(<VehicleCard vehicle={vehicle} />);
     expect(screen.getByText('Red')).toBeInTheDocument();
   });
   ```

2. **API Integration Tests**
   ```typescript
   test('fetches and displays vehicles with correct fields', async () => {
     // Mock API response with new field names
     server.use(
       rest.get('/api/vehicles', (req, res, ctx) => {
         return res(ctx.json([{
           id: 1,
           make: 'Toyota',
           model: 'Camry',
           color: 'Blue',
           images: ['image1.jpg', 'image2.jpg'],
           isFeatured: true,
           // other fields
         }]));
       })
     );
     
     render(<InventoryPage />);
     
     // Wait for API data to load
     await screen.findByText('Toyota Camry');
     
     // Verify correct field rendering
     expect(screen.getByText('Blue')).toBeInTheDocument();
     expect(screen.getByAltText('Toyota Camry')).toHaveAttribute('src', 'image1.jpg');
   });
   ```

## Database Schema Evolution

When evolving the database schema, follow these best practices:

### 1. Backward Compatibility Period

When renaming fields:

1. First add the new field alongside the old one
2. Update database functions to write to both fields
3. Update frontend to read from the new field with fallback to the old field
4. After verifying everything works, remove the old field

Example backend code during transition:

```typescript
async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
  // During transition, write to both old and new fields
  const vehicleData = {
    ...insertVehicle,
    exteriorColor: insertVehicle.color, // Write to old field for compatibility
  };
  
  const [vehicle] = await db
    .insert(vehicles)
    .values(vehicleData)
    .returning();
  return vehicle;
}
```

Example frontend code during transition:

```typescript
// During transition, read from new field with fallback to old
const color = vehicle.color || vehicle.exteriorColor || 'Not specified';
```

### 2. Field Type Changes

When changing field types (e.g., string to number):

1. Add a new field with the new type
2. Create a data migration script to convert and copy data
3. Update frontend to use the new field
4. After confirming everything works, remove the old field

### 3. Documentation

Always document schema changes:

1. Update the schema documentation
2. Note the date of the change
3. Document any migration strategy for frontend components
4. Keep a history of field name changes for reference