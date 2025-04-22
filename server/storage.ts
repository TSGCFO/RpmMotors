import { 
  User, InsertUser, users,
  Vehicle, InsertVehicle, vehicles,
  Inquiry, InsertInquiry, inquiries,
  Testimonial, InsertTestimonial, testimonials
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, asc, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  getFeaturedVehicles(): Promise<Vehicle[]>;
  getVehiclesByCategory(category: string): Promise<Vehicle[]>;
  searchVehicles(query: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Inquiry methods
  getInquiries(): Promise<Inquiry[]>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined>;
  
  // Testimonial methods
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }
  
  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }
  
  async getFeaturedVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.isFeatured, true));
  }
  
  async getVehiclesByCategory(category: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.category, category));
  }
  
  async searchVehicles(query: string): Promise<Vehicle[]> {
    const searchPattern = `%${query}%`;
    return await db.select().from(vehicles).where(
      or(
        like(vehicles.make, searchPattern),
        like(vehicles.model, searchPattern),
        like(vehicles.description, searchPattern)
      )
    );
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values([insertVehicle] as any)
      .returning();
    return vehicle;
  }
  
  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle || undefined;
  }
  
  async deleteVehicle(id: number): Promise<boolean> {
    const [deletedVehicle] = await db
      .delete(vehicles)
      .where(eq(vehicles.id, id))
      .returning();
    return !!deletedVehicle;
  }
  
  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }
  
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }
  
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values([insertInquiry] as any)
      .returning();
    return inquiry;
  }
  
  async updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined> {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry || undefined;
  }
  
  // Testimonial methods
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.isApproved, true));
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values([insertTestimonial] as any)
      .returning();
    return testimonial;
  }
  
  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set({ isApproved: true })
      .where(eq(testimonials.id, id))
      .returning();
    return updatedTestimonial || undefined;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    const [deletedTestimonial] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning();
    return !!deletedTestimonial;
  }

  // Initialize a default admin user if no users exist
  async initializeDefaultAdmin(): Promise<void> {
    try {
      // First attempt to run the migration to add missing columns
      try {
        await db.execute(sql`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
              ALTER TABLE "users" ADD COLUMN "email" TEXT;
            END IF;
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
              ALTER TABLE "users" ADD COLUMN "role" TEXT DEFAULT 'customer';
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
          END
          $$;
        `);
        console.log("Applied user table migration");
      } catch (migrationError) {
        console.error("Migration error:", migrationError);
      }
      
      // Now check the columns again after migration attempt
      const existingColumns = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
      `);
      
      const columnNames = existingColumns.rows.map(row => row.column_name);
      console.log("Available user columns (after migration):", columnNames);
      
      // Check if users table exists before trying to query it
      try {
        const allUsers = await db.execute(sql`
          SELECT * FROM users LIMIT 1
        `);
        
        if (allUsers.rows.length === 0) {
          // Use raw SQL to ensure we only insert fields that exist
          await db.execute(sql`
            INSERT INTO users (username, password) 
            VALUES ('admin', 'rpmauto2025')
          `);
          console.log("Created default admin user with minimal fields");
        }
      } catch (usersError) {
        console.error("Error checking for users:", usersError);
      }
    } catch (error) {
      console.error("Error initializing admin user:", error);
    }
  }
  
  // Initialize sample data for demos and testing
  async initializeSampleData(): Promise<void> {
    // Check if we already have vehicles
    const existingVehicles = await db.select().from(vehicles);
    if (existingVehicles.length === 0) {
      // Sample vehicles
      try {
        // Use raw SQL to insert the sample vehicle
        await db.execute(sql`
          INSERT INTO vehicles (
            make, model, year, price, mileage, fuel_type, transmission, 
            color, description, category, condition, is_featured, 
            features, images, vin
          ) 
          VALUES (
            'Porsche', '911 GT3', 2023, 179900, 1500, 'Gasoline', 'Automatic',
            'GT Silver', '2023 Porsche 911 GT3 in pristine condition. This vehicle features a naturally aspirated 4.0L flat-six engine producing 502 horsepower. Includes track-focused suspension, carbon ceramic brakes, and Porsche''s PDK transmission.',
            'Sports Cars', 'Excellent', TRUE,
            '["Carbon Ceramic Brakes", "Sport Chrono Package", "PDK Transmission", "Track Package"]'::jsonb,
            '["https://images.unsplash.com/photo-1617814076668-4af3ff1dd40f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80", "https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"]'::jsonb,
            'WP0AC2A99JS175960'
          )
          ON CONFLICT (vin) DO NOTHING
        `);
        console.log("Created sample vehicle");
      } catch (error) {
        console.error("Error creating sample vehicle:", error);
      }
    }
    
    // Check if we already have testimonials
    const existingTestimonials = await db.select().from(testimonials);
    if (existingTestimonials.length === 0) {
      try {
        // Use raw SQL to insert the sample testimonial
        await db.execute(sql`
          INSERT INTO testimonials (
            name, vehicle, rating, comment, is_approved
          ) 
          VALUES (
            'Michael T.', 'Ferrari 488 Owner', 5, 
            'The team at RPM Auto made buying my dream car an absolute pleasure. Their knowledge, professionalism, and attention to detail exceeded my expectations.',
            TRUE
          )
          ON CONFLICT DO NOTHING
        `);
        console.log("Created sample testimonial");
      } catch (error) {
        console.error("Error creating sample testimonial:", error);
      }
    }
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();

// Initialize default admin user and sample data
(async () => {
  try {
    await storage.initializeDefaultAdmin();
    await storage.initializeSampleData();
  } catch (error) {
    console.error("Error initializing data:", error);
  }
})();