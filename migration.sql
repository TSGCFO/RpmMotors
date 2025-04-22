-- RPM Auto Database Migration Script

-- Check if users table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE "users" (
            "id" SERIAL PRIMARY KEY,
            "username" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "email" TEXT,
            "first_name" TEXT,
            "last_name" TEXT,
            "phone" TEXT,
            "role" TEXT DEFAULT 'customer',
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to users table if it exists but lacks these columns
        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
                ALTER TABLE "users" ADD COLUMN "email" TEXT;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
                ALTER TABLE "users" ADD COLUMN "first_name" TEXT;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
                ALTER TABLE "users" ADD COLUMN "last_name" TEXT;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
                ALTER TABLE "users" ADD COLUMN "phone" TEXT;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
                ALTER TABLE "users" ADD COLUMN "role" TEXT DEFAULT 'customer';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
                ALTER TABLE "users" ADD COLUMN "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
                ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            END IF;
        END;
    END IF;
END
$$;

-- Check if vehicles table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicles') THEN
        CREATE TABLE "vehicles" (
            "id" SERIAL PRIMARY KEY,
            "make" TEXT NOT NULL,
            "model" TEXT NOT NULL,
            "year" INTEGER NOT NULL,
            "price" INTEGER NOT NULL,
            "mileage" INTEGER NOT NULL,
            "fuel_type" TEXT NOT NULL,
            "transmission" TEXT NOT NULL,
            "color" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "condition" TEXT NOT NULL DEFAULT 'Used',
            "is_featured" BOOLEAN DEFAULT FALSE,
            "features" JSONB NOT NULL DEFAULT '[]',
            "images" JSONB NOT NULL DEFAULT '[]',
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "vin" TEXT NOT NULL UNIQUE
        );
    ELSE
        -- Add missing columns to vehicles table if it exists but lacks these columns
        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'category') THEN
                ALTER TABLE "vehicles" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Uncategorized';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'is_featured') THEN
                ALTER TABLE "vehicles" ADD COLUMN "is_featured" BOOLEAN DEFAULT FALSE;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'features') THEN
                ALTER TABLE "vehicles" ADD COLUMN "features" JSONB NOT NULL DEFAULT '[]';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'images') THEN
                ALTER TABLE "vehicles" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'created_at') THEN
                ALTER TABLE "vehicles" ADD COLUMN "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'condition') THEN
                ALTER TABLE "vehicles" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'Used';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'vin') THEN
                ALTER TABLE "vehicles" ADD COLUMN "vin" TEXT;
                -- Update with placeholder VINs
                UPDATE "vehicles" SET "vin" = 'VIN' || id;
                -- Then make it not null and unique
                ALTER TABLE "vehicles" ALTER COLUMN "vin" SET NOT NULL;
                ALTER TABLE "vehicles" ADD CONSTRAINT vehicles_vin_unique UNIQUE ("vin");
            END IF;
        END;
    END IF;
END
$$;

-- Check if saved_vehicles table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_vehicles') THEN
        CREATE TABLE "saved_vehicles" (
            "id" SERIAL PRIMARY KEY,
            "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
            "vehicle_id" INTEGER NOT NULL REFERENCES "vehicles"("id") ON DELETE CASCADE,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE ("user_id", "vehicle_id")
        );
    END IF;
END
$$;

-- Check if inquiries table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
        CREATE TABLE "inquiries" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "phone" TEXT,
            "subject" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "vehicle_id" INTEGER REFERENCES "vehicles"("id") ON DELETE SET NULL,
            "status" TEXT DEFAULT 'new',
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to inquiries table if it exists but lacks these columns
        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'status') THEN
                ALTER TABLE "inquiries" ADD COLUMN "status" TEXT DEFAULT 'new';
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'updated_at') THEN
                ALTER TABLE "inquiries" ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            END IF;
            -- Add foreign key to vehicle_id if it exists but doesn't have the constraint
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'vehicle_id') 
               AND NOT EXISTS (
                   SELECT FROM information_schema.table_constraints tc
                   JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
                   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'inquiries' AND ccu.column_name = 'vehicle_id'
               ) THEN
                BEGIN
                    ALTER TABLE "inquiries" ADD CONSTRAINT inquiries_vehicle_id_fkey FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL;
                EXCEPTION
                    WHEN others THEN
                        -- Handle potential errors (e.g., if vehicle_id references non-existent vehicles)
                        RAISE NOTICE 'Could not add foreign key constraint to inquiries.vehicle_id: %', SQLERRM;
                END;
            END IF;
        END;
    END IF;
END
$$;

-- Check if testimonials table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'testimonials') THEN
        CREATE TABLE "testimonials" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "vehicle" TEXT NOT NULL,
            "rating" INTEGER NOT NULL,
            "comment" TEXT NOT NULL,
            "is_approved" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Add missing columns to testimonials table if it exists but lacks these columns
        BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'is_approved') THEN
                ALTER TABLE "testimonials" ADD COLUMN "is_approved" BOOLEAN DEFAULT FALSE;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'created_at') THEN
                ALTER TABLE "testimonials" ADD COLUMN "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            END IF;
        END;
    END IF;
END
$$;

-- Create or update indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_featured ON vehicles(is_featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_vehicle_id ON inquiries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_saved_vehicles_user_id ON saved_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_vehicles_vehicle_id ON saved_vehicles(vehicle_id);

-- Grant appropriate permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO current_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO current_user;