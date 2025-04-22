# RPM Auto Database Schema

## Overview

This document outlines the complete database schema for the RPM Auto dealership website. The schema is designed to efficiently manage vehicle inventory, user accounts, inquiries, testimonials, and other dealership-related data.

## Tables

### 1. users
Stores user account information for customers, staff, and administrators.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer', -- Options: 'customer', 'staff', 'admin'
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. vehicles
Stores comprehensive details about each vehicle in the inventory.

```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  stock_number TEXT UNIQUE,
  vin TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  msrp INTEGER,
  mileage INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  drivetrain TEXT, -- e.g., AWD, FWD, RWD
  engine TEXT, -- e.g., "3.5L V6"
  exterior_color TEXT NOT NULL,
  interior_color TEXT,
  body_style TEXT, -- e.g., "Sedan", "SUV", "Truck", etc.
  description TEXT NOT NULL,
  features JSON NOT NULL DEFAULT '[]', -- Array of feature strings
  specifications JSON DEFAULT '{}', -- Key-value pairs of technical specifications
  images JSON NOT NULL DEFAULT '[]', -- Array of image URLs
  videos JSON DEFAULT '[]', -- Array of video URLs
  category TEXT NOT NULL, -- e.g., "Luxury Sedans", "Sports Cars", etc.
  condition TEXT NOT NULL DEFAULT 'Used', -- New, Used, Certified Pre-Owned
  status TEXT NOT NULL DEFAULT 'available', -- available, pending, sold
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sold_at TIMESTAMP
);
```

### 3. vehicle_history
Stores vehicle history records for each vehicle.

```sql
CREATE TABLE vehicle_history (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date TIMESTAMP NOT NULL,
  service_type TEXT NOT NULL, -- e.g., "maintenance", "repair", "accident"
  description TEXT NOT NULL,
  mileage INTEGER,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. saved_vehicles
Tracks which vehicles are saved/favorited by which users.

```sql
CREATE TABLE saved_vehicles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);
```

### 5. inquiries
Stores contact form submissions and vehicle inquiries.

```sql
CREATE TABLE inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new', -- new, in_progress, answered, closed
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Staff assigned to handle
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### 6. inquiry_responses
Stores responses to customer inquiries.

```sql
CREATE TABLE inquiry_responses (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  staff_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. testimonials
Stores customer testimonials and reviews.

```sql
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  vehicle TEXT NOT NULL, -- Vehicle description e.g., "2023 Porsche 911 Owner"
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  purchase_date TIMESTAMP,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. financing_applications
Stores customer financing applications.

```sql
CREATE TABLE financing_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'submitted', -- submitted, reviewing, approved, denied
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  employment_status TEXT NOT NULL, -- employed, self-employed, retired, student
  annual_income INTEGER NOT NULL,
  credit_score_range TEXT, -- e.g., "600-650", "700-750"
  down_payment INTEGER,
  loan_term INTEGER, -- in months
  trade_in BOOLEAN DEFAULT FALSE,
  trade_in_value INTEGER,
  trade_in_details TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. appointments
Stores test drive and dealership visit appointments.

```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  appointment_type TEXT NOT NULL, -- test_drive, sales_consultation, service
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, completed, canceled, no_show
  date TIMESTAMP NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. transactions
Stores vehicle purchase/sale transaction records.

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  transaction_type TEXT NOT NULL, -- purchase, lease, trade_in
  sale_price INTEGER NOT NULL,
  tax_amount INTEGER,
  fees_amount INTEGER,
  total_amount INTEGER NOT NULL,
  payment_method TEXT, -- cash, financing, lease
  financing_id INTEGER REFERENCES financing_applications(id) ON DELETE SET NULL,
  sales_rep_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 11. service_records
Stores vehicle service and maintenance records.

```sql
CREATE TABLE service_records (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL, -- oil_change, tire_rotation, inspection, repair, etc.
  description TEXT NOT NULL,
  cost INTEGER,
  mileage INTEGER,
  service_date TIMESTAMP NOT NULL,
  completed_date TIMESTAMP,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, canceled
  technician_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12. inventory_logs
Tracks changes to vehicle inventory for auditing purposes.

```sql
CREATE TABLE inventory_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- added, updated, removed, status_change
  details JSON NOT NULL, -- Fields that changed and their values
  performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. marketing_campaigns
Stores marketing campaign information.

```sql
CREATE TABLE marketing_campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  type TEXT NOT NULL, -- email, social, print, event, promotion
  target_audience TEXT, -- all, previous_customers, leads, etc.
  budget INTEGER,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 14. promotions
Stores special offers and promotions.

```sql
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT, -- percentage, fixed_amount, special_financing
  discount_value INTEGER, -- Percentage or amount in cents
  code TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  applicable_vehicles TEXT[], -- Array of vehicle IDs or categories
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 15. document_templates
Stores document templates for sales and service.

```sql
CREATE TABLE document_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- sales_agreement, financing, test_drive_waiver, etc.
  content TEXT NOT NULL,
  variables JSON DEFAULT '[]', -- List of variable placeholders in the template
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 16. website_analytics
Stores website analytics data.

```sql
CREATE TABLE website_analytics (
  id SERIAL PRIMARY KEY,
  page_view_count INTEGER DEFAULT 0,
  vehicle_view_details JSON DEFAULT '{}', -- Detailed vehicle view counts by ID
  search_queries JSON DEFAULT '[]', -- Popular search terms
  lead_sources JSON DEFAULT '{}', -- Where inquiries are coming from
  visitor_demographics JSON DEFAULT '{}', -- Anonymous visitor data
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Indexes

To optimize query performance, we'll create appropriate indexes:

```sql
-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Vehicles indexes
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_is_featured ON vehicles(is_featured);
CREATE INDEX idx_vehicles_condition ON vehicles(condition);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at);

-- Inquiries indexes
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_vehicle_id ON inquiries(vehicle_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);

-- Testimonials indexes
CREATE INDEX idx_testimonials_is_approved ON testimonials(is_approved);

-- Appointments indexes
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_vehicle_id ON appointments(vehicle_id);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_vehicle_id ON transactions(vehicle_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);

-- Service records indexes
CREATE INDEX idx_service_records_vehicle_id ON service_records(vehicle_id);
CREATE INDEX idx_service_records_customer_id ON service_records(customer_id);
CREATE INDEX idx_service_records_service_date ON service_records(service_date);
CREATE INDEX idx_service_records_status ON service_records(status);

-- Promotions indexes
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_code ON promotions(code);
```

## Relations Diagram

```
users
  ↑↓
  ↑ ↓
saved_vehicles → vehicles ← vehicle_history
                   ↑
                   ↓
inquiries ← inquiry_responses
  ↑
  ↓
appointments ← transactions ← financing_applications
                ↑
                ↓
              service_records
              
testimonials
         
inventory_logs
         
marketing_campaigns → promotions
         
document_templates
         
website_analytics
```

## Drizzle ORM Implementation

The schema will be implemented using Drizzle ORM with PostgreSQL. The tables created above will be defined in the `shared/schema.ts` file according to Drizzle's syntax.

## Data Migration Strategy

When ready to implement this schema:

1. Create a backup of existing data
2. Run migrations in stages, starting with core tables
3. Validate each migration step
4. Implement foreign key constraints after data is migrated
5. Apply indexes once all data is in place

## Schema Evolution

This schema is designed to be future-proof, but may need to evolve as the dealership's needs grow. Here are recommendations for future evolution:

1. Consider adding a parts inventory system for service department
2. Implement vehicle trade-in valuation tables
3. Add support for multiple dealership locations
4. Expand the analytics capabilities with more granular data
5. Implement a customer loyalty/rewards program structure