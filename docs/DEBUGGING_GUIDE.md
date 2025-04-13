# RPM Auto Debugging Guide

This document provides step-by-step procedures for identifying and resolving common issues in the RPM Auto website codebase, with specific focus on field compatibility problems.

## Table of Contents

1. [Identifying Field Compatibility Issues](#identifying-field-compatibility-issues)
2. [Debugging Frontend Components](#debugging-frontend-components)
3. [TypeScript Error Resolution](#typescript-error-resolution)
4. [Runtime Error Debugging](#runtime-error-debugging)
5. [Database Schema Validation](#database-schema-validation)
6. [API Error Troubleshooting](#api-error-troubleshooting)
7. [Common Error Patterns and Solutions](#common-error-patterns-and-solutions)

## Identifying Field Compatibility Issues

### TypeScript Errors

TypeScript errors are often the first indication of field compatibility issues. Look for errors like:

```
Property 'fieldName' does not exist on type 'Vehicle'
```

**Debugging Steps:**

1. Open the error location in the code
2. Check `shared/schema.ts` to see the correct field name in the schema
3. Compare the property name in your component with the schema definition
4. Update the property name to match the schema

### Blank or Missing Data

If a component displays blank areas where data should appear:

**Debugging Steps:**

1. Open browser developer tools (F12)
2. Check the console for any JavaScript errors
3. In the Network tab, find the API call and examine the response data
4. Compare the field names in the component with the actual data structure
5. Add temporary debug output to verify data is being received:

```jsx
<div>
  {console.log('Vehicle data:', vehicle)}
  {/* Component content */}
</div>
```

## Debugging Frontend Components

### Component Inspection

To debug a component's rendering:

1. Add React Developer Tools to your browser
2. Inspect the component in React DevTools
3. Examine the props and state to verify data structure
4. Add debugging code to check field access:

```jsx
{vehicle && (
  <div>
    DEBUG: 
    make: {vehicle.make}, 
    images: {vehicle.images ? `Array(${vehicle.images.length})` : 'undefined'},
    featured: {String(vehicle.isFeatured)}
  </div>
)}
```

### Prop Drilling Analysis

When data passes through multiple components:

1. Add console logs at each component level
2. Check for field name changes between components
3. Verify that the correct data is being passed down the component tree

## TypeScript Error Resolution

### Property Access Errors

For errors like `Property 'X' does not exist on type 'Y'`:

1. Check the type definition in `shared/schema.ts`
2. Verify the correct type is being imported and used
3. Update the property name to match the schema
4. Add proper type annotations to function parameters

```typescript
// Before
function VehicleCard({ vehicle }) {
  return <div>{vehicle.exteriorColor}</div>;
}

// After
import { Vehicle } from '@shared/schema';

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return <div>{vehicle.color}</div>;
}
```

### Null-related Errors

For errors about nullable fields:

1. Add null checks before accessing properties
2. Provide default values for nullable fields
3. Use optional chaining for deep property access

```typescript
// Before
const imageUrl = vehicle.images[0];

// After
const imageUrl = vehicle.images && vehicle.images.length > 0 
  ? vehicle.images[0] 
  : defaultImageUrl;
```

## Runtime Error Debugging

### Console Error Analysis

Common runtime errors include:

1. `TypeError: Cannot read property 'X' of undefined`
2. `TypeError: undefined is not an object (evaluating 'obj.property')`

**Resolution Steps:**

1. Identify the code location from the stack trace
2. Add defensive null checking
3. Provide fallback values

### Network Request Debugging

If data isn't loading correctly:

1. Check the Network tab in browser dev tools
2. Examine the request URL and parameters
3. Verify the response data structure
4. Check for error responses from the server
5. Add error handling for API calls:

```typescript
try {
  const response = await apiRequest('GET', '/api/vehicles');
  setVehicles(response.data);
} catch (error) {
  console.error('Failed to fetch vehicles:', error);
  setError('Failed to load vehicles. Please try again.');
}
```

## Database Schema Validation

### Field Definition Verification

To verify the database schema:

1. Review `shared/schema.ts` to understand all field definitions
2. Check column data types and constraints
3. Verify that frontend field names match the TypeScript types
4. Create a reference mapping of database columns to frontend properties

### Data Consistency Check

To check for data inconsistencies:

1. Use SQL queries to examine the actual data in the database
2. Verify that required fields have valid values
3. Check array fields like `images` and `features` for proper formatting
4. Add validation in the API routes to ensure data integrity

## API Error Troubleshooting

### Request/Response Analysis

When API calls fail:

1. Check the request payload in the Network tab
2. Verify that field names in the request match what the API expects
3. Examine error responses for specific error messages
4. Add more detailed error logging on the server:

```typescript
app.post("/api/vehicles", async (req: Request, res: Response) => {
  try {
    console.log('Received vehicle data:', req.body);
    const validationResult = insertVehicleSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = fromZodError(validationResult.error).message;
      console.error('Validation error:', errorMessage);
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

### API Route Debugging

For API route issues:

1. Add detailed logging to server routes
2. Check request parameters and body
3. Verify database operations
4. Return detailed error information during development

## Common Error Patterns and Solutions

### 1. Field Name Mismatches

**Error Pattern:**
```
Property 'exteriorColor' does not exist on type 'Vehicle'.
```

**Solution:**
Update property access to match schema:
```typescript
// Before
<span>{vehicle.exteriorColor}</span>

// After
<span>{vehicle.color}</span>
```

### 2. Array Access without Null Checking

**Error Pattern:**
```
TypeError: Cannot read property '0' of undefined
```

**Solution:**
Add null checking before array access:
```typescript
// Before
<img src={vehicle.images[0]} alt="Vehicle" />

// After
<img 
  src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : defaultImage} 
  alt="Vehicle" 
/>
```

### 3. Missing Properties in Mutation Input

**Error Pattern:**
```
Property 'createdAt' is missing in type '{ ... }' but required in type 'Omit<Vehicle, "id">'.
```

**Solution:**
Use the correct type for insert operations:
```typescript
// Before
mutationFn: (newVehicle: Omit<Vehicle, 'id'>) => 
  apiRequest('POST', '/api/vehicles', newVehicle),

// After
mutationFn: (newVehicle: InsertVehicle) => 
  apiRequest('POST', '/api/vehicles', newVehicle),
```

### 4. Method Calls on Potentially Null Values

**Error Pattern:**
```
TypeError: Cannot read property 'charAt' of null
```

**Solution:**
Add null checking before method calls:
```typescript
// Before
{inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}

// After
{inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : 'New'}
```