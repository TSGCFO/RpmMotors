import { 
  User, InsertUser, users,
  Vehicle, InsertVehicle, vehicles,
  Inquiry, InsertInquiry, inquiries,
  Testimonial, InsertTestimonial, testimonials,
  BlogPost, InsertBlogPost, blogPosts,
  GarageRegister, InsertGarageRegister, garageRegister,
  Appraisal, InsertAppraisal, appraisals,
  AppraisalAuditLog, InsertAppraisalAuditLog, appraisalAuditLog,
  appraisalRateLimits
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, asc, desc, sql, gte, type SQL } from "drizzle-orm";

export type AppraisalStatus =
  | "pending"
  | "stage1_running"
  | "stage1_complete"
  | "stage2_running"
  | "completed"
  | "failed";

export interface AppraisalListOptions {
  status?: AppraisalStatus;
  limit?: number;
  offset?: number;
}

export interface StaffAppraisalListOptions {
  offerRequestsOnly?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  // Sort support (Task #22). Default: createdAt desc.
  sortBy?: "createdAt" | "cost";
  sortDir?: "asc" | "desc";
}

export interface StaffAppraisalListResult {
  data: Appraisal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffAppraisalUpdate {
  staffNotes?: string | null;
  quotedPriceCad?: number | null;
}

export interface AppraisalResultUpdate {
  status: AppraisalStatus;
  result?: Record<string, unknown> | null;
  estimatedLow?: number | null;
  estimatedHigh?: number | null;
  estimatedMid?: number | null;
  errorMessage?: string | null;
  inquiryId?: number | null;
  staffNotified?: boolean;
  emailSentAt?: Date | null;
  emailError?: string | null;
  leadInquiryError?: string | null;
  // ---- Cost tracking (Task #22) ----
  stage1Model?: string | null;
  stage1InputTokens?: number | null;
  stage1OutputTokens?: number | null;
  stage1CacheCreationTokens?: number | null;
  stage1CacheReadTokens?: number | null;
  stage2Model?: string | null;
  stage2InputTokens?: number | null;
  stage2OutputTokens?: number | null;
  stage2CacheCreationTokens?: number | null;
  stage2CacheReadTokens?: number | null;
  stage1CostCents?: number | null;
  stage2CostCents?: number | null;
  totalCostCents?: number | null;
}

/** Single window stats — count of appraisals, total spend, average per appraisal. */
export interface CostBucket {
  count: number;
  totalCostCents: number;
  avgCostCents: number;
}

export interface AppraisalCostSummary {
  today: CostBucket;
  last7d: CostBucket;
  last30d: CostBucket;
  allTime: CostBucket;
}

export interface AppraisalRateLimitQuery {
  ipHash?: string | null;
  email?: string | null;
  windowMs: number;
  now?: Date; // clock fake hook
}

// Define interfaces for filtering, pagination, and sorting
export interface VehicleFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  category?: string;
  condition?: string;
  status?: string;
  isFeatured?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface VehicleQueryOptions {
  filters?: VehicleFilters;
  pagination?: PaginationOptions;
  sort?: SortOptions;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export interface InventoryStats {
  totalVehicles: number;
  totalValue: number;
  byMake: { make: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byYear: { year: number; count: number }[];
  byFuelType: { fuelType: string; count: number }[];
  featuredCount: number;
  priceRange: { min: number; max: number; avg: number };
  mileageRange: { min: number; max: number; avg: number };
}

export interface InquiryWithVehicle extends Inquiry {
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicles(options?: VehicleQueryOptions): Promise<Vehicle[]>;
  getPaginatedVehicles(options?: VehicleQueryOptions): Promise<PaginatedResult<Vehicle>>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  getFeaturedVehicles(limit?: number): Promise<Vehicle[]>;
  getVehiclesByCategory(category: string, options?: VehicleQueryOptions): Promise<Vehicle[]>;
  searchVehicles(query: string, options?: VehicleQueryOptions): Promise<Vehicle[]>;
  filterVehicles(filters: VehicleFilters, options?: VehicleQueryOptions): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  getRelatedVehicles(vehicleId: number, limit?: number): Promise<Vehicle[]>;
  getInventoryStats(): Promise<InventoryStats>;
  
  // Inquiry methods
  getInquiries(): Promise<InquiryWithVehicle[]>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined>;
  
  // Testimonial methods
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Blog methods for SEO content marketing
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  
  // Garage Register methods
  createGarageRegister(register: InsertGarageRegister): Promise<GarageRegister>;
  getGarageRegisterByVehicleId(vehicleId: number): Promise<GarageRegister | undefined>;
  getGarageRegisters(): Promise<GarageRegister[]>;

  // Appraisal methods
  createAppraisal(input: InsertAppraisal & {
    ipHash?: string | null;
    userAgent?: string | null;
    turnstileVerified?: boolean;
  }): Promise<Appraisal>;
  updateAppraisalWithResult(id: number, update: AppraisalResultUpdate): Promise<Appraisal | undefined>;
  setAppraisalStatus(id: number, status: AppraisalStatus, errorMessage?: string | null): Promise<Appraisal | undefined>;
  getAppraisal(id: number): Promise<Appraisal | undefined>;
  listAppraisals(options?: AppraisalListOptions): Promise<Appraisal[]>;
  countRecentAppraisalsByIpOrEmail(query: AppraisalRateLimitQuery): Promise<{ ipCount: number; emailCount: number }>;
  logAppraisalAudit(entry: InsertAppraisalAuditLog): Promise<AppraisalAuditLog>;
  // Staff admin appraisal methods
  listAppraisalsForStaff(options: StaffAppraisalListOptions): Promise<StaffAppraisalListResult>;
  countOfferRequestsSince(since: Date): Promise<number>;
  getAppraisalCostSummary(): Promise<AppraisalCostSummary>;
  getAppraisalAuditLog(appraisalId: number): Promise<AppraisalAuditLog[]>;
  updateAppraisalStaffFields(id: number, update: StaffAppraisalUpdate): Promise<Appraisal | undefined>;
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
  async getVehicles(options?: VehicleQueryOptions): Promise<Vehicle[]> {
    let query = db.select().from(vehicles);
    
    // Apply filters if provided
    if (options?.filters) {
      query = this.applyFilters(query, options.filters);
    }
    
    // Apply sorting if provided
    if (options?.sort) {
      query = this.applySorting(query, options.sort);
    }
    
    // Apply pagination if provided
    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    
    return await query;
  }
  
  async getPaginatedVehicles(options?: VehicleQueryOptions): Promise<PaginatedResult<Vehicle>> {
    // Get the total count
    let countQuery = db.select({ count: sql`count(*)` }).from(vehicles);
    
    // Apply filters to count query if provided
    if (options?.filters) {
      countQuery = this.applyFilters(countQuery, options.filters);
    }
    
    const [countResult] = await countQuery;
    const total = Number(countResult.count);
    
    // Set defaults for pagination
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 10;
    
    // Get the vehicles for the current page
    const data = await this.getVehicles({
      ...options,
      pagination: { page, limit }
    });
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }
  
  async getFeaturedVehicles(limit?: number): Promise<Vehicle[]> {
    let query = db.select().from(vehicles).where(eq(vehicles.isFeatured, true));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getVehiclesByCategory(category: string, options?: VehicleQueryOptions): Promise<Vehicle[]> {
    let query = db.select().from(vehicles).where(eq(vehicles.category, category));
    
    // Apply filters if provided (excluding category as it's already set)
    if (options?.filters) {
      const { category: _, ...otherFilters } = options.filters;
      query = this.applyFilters(query, otherFilters);
    }
    
    // Apply sorting if provided
    if (options?.sort) {
      query = this.applySorting(query, options.sort);
    }
    
    // Apply pagination if provided
    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    
    return await query;
  }
  
  async searchVehicles(query: string, options?: VehicleQueryOptions): Promise<Vehicle[]> {
    const searchPattern = `%${query}%`;
    
    let dbQuery = db.select().from(vehicles).where(
      or(
        like(vehicles.make, searchPattern),
        like(vehicles.model, searchPattern),
        like(vehicles.description, searchPattern),
        like(vehicles.color, searchPattern),
        like(vehicles.category, searchPattern),
        like(vehicles.vin, searchPattern)
      )
    );
    
    // Apply filters if provided
    if (options?.filters) {
      dbQuery = this.applyFilters(dbQuery, options.filters);
    }
    
    // Apply sorting if provided
    if (options?.sort) {
      dbQuery = this.applySorting(dbQuery, options.sort);
    }
    
    // Apply pagination if provided
    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const offset = (page - 1) * limit;
      dbQuery = dbQuery.limit(limit).offset(offset);
    }
    
    return await dbQuery;
  }
  
  async filterVehicles(filters: VehicleFilters, options?: VehicleQueryOptions): Promise<Vehicle[]> {
    let query = db.select().from(vehicles);
    
    // Apply the provided filters
    query = this.applyFilters(query, filters);
    
    // Apply sorting if provided
    if (options?.sort) {
      query = this.applySorting(query, options.sort);
    }
    
    // Apply pagination if provided
    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);
    }
    
    return await query;
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
  
  async getRelatedVehicles(vehicleId: number, limit: number = 4): Promise<Vehicle[]> {
    // First get the current vehicle to find related ones
    const vehicle = await this.getVehicleById(vehicleId);
    
    if (!vehicle) {
      return [];
    }
    
    // Find vehicles with same make or category, excluding the current vehicle
    return await db.select()
      .from(vehicles)
      .where(
        and(
          or(
            eq(vehicles.make, vehicle.make),
            eq(vehicles.category, vehicle.category)
          ),
          sql`${vehicles.id} != ${vehicleId}`
        )
      )
      .limit(limit);
  }
  
  async getInventoryStats(): Promise<InventoryStats> {
    // Get total count
    const [countResult] = await db.select({ count: sql`count(*)` }).from(vehicles);
    const totalVehicles = Number(countResult.count);
    
    // Get total value (sum of all prices)
    const [totalValueResult] = await db.select({ 
      sum: sql`COALESCE(SUM(price), 0)` 
    }).from(vehicles);
    const totalValue = Number(totalValueResult.sum);
    
    // Get counts by make
    const makeStats = await db
      .select({
        make: vehicles.make,
        count: sql`count(*)`
      })
      .from(vehicles)
      .groupBy(vehicles.make);
    
    // Get counts by category
    const categoryStats = await db
      .select({
        category: vehicles.category,
        count: sql`count(*)`
      })
      .from(vehicles)
      .groupBy(vehicles.category);
    
    // Get counts by year
    const yearStats = await db
      .select({
        year: vehicles.year,
        count: sql`count(*)`
      })
      .from(vehicles)
      .groupBy(vehicles.year);
    
    // Get counts by fuel type
    const fuelTypeStats = await db
      .select({
        fuelType: vehicles.fuelType,
        count: sql`count(*)`
      })
      .from(vehicles)
      .groupBy(vehicles.fuelType);
    
    // Get count of featured vehicles
    const [featuredResult] = await db
      .select({ count: sql`count(*)` })
      .from(vehicles)
      .where(eq(vehicles.isFeatured, true));
    const featuredCount = Number(featuredResult.count);
    
    // Get price range and average
    const [priceStats] = await db
      .select({
        min: sql`COALESCE(MIN(price), 0)`,
        max: sql`COALESCE(MAX(price), 0)`,
        avg: sql`COALESCE(AVG(price), 0)`
      })
      .from(vehicles);
    
    // Get mileage range and average
    const [mileageStats] = await db
      .select({
        min: sql`COALESCE(MIN(mileage), 0)`,
        max: sql`COALESCE(MAX(mileage), 0)`,
        avg: sql`COALESCE(AVG(mileage), 0)`
      })
      .from(vehicles);
    
    return {
      totalVehicles,
      totalValue,
      byMake: makeStats.map(stat => ({
        make: stat.make,
        count: Number(stat.count)
      })),
      byCategory: categoryStats.map(stat => ({
        category: stat.category,
        count: Number(stat.count)
      })),
      byYear: yearStats.map(stat => ({
        year: stat.year,
        count: Number(stat.count)
      })),
      byFuelType: fuelTypeStats.map(stat => ({
        fuelType: stat.fuelType,
        count: Number(stat.count)
      })),
      featuredCount,
      priceRange: {
        min: Number(priceStats.min),
        max: Number(priceStats.max),
        avg: Number(priceStats.avg)
      },
      mileageRange: {
        min: Number(mileageStats.min),
        max: Number(mileageStats.max),
        avg: Number(mileageStats.avg)
      }
    };
  }
  
  // Helper methods for query building
  private applyFilters<T>(query: any, filters: VehicleFilters): T {
    const conditions = [];
    
    if (filters.make) {
      conditions.push(eq(vehicles.make, filters.make));
    }
    
    if (filters.model) {
      conditions.push(eq(vehicles.model, filters.model));
    }
    
    if (filters.minYear !== undefined) {
      conditions.push(sql`${vehicles.year} >= ${filters.minYear}`);
    }
    
    if (filters.maxYear !== undefined) {
      conditions.push(sql`${vehicles.year} <= ${filters.maxYear}`);
    }
    
    if (filters.minPrice !== undefined) {
      conditions.push(sql`${vehicles.price} >= ${filters.minPrice}`);
    }
    
    if (filters.maxPrice !== undefined) {
      conditions.push(sql`${vehicles.price} <= ${filters.maxPrice}`);
    }
    
    if (filters.minMileage !== undefined) {
      conditions.push(sql`${vehicles.mileage} >= ${filters.minMileage}`);
    }
    
    if (filters.maxMileage !== undefined) {
      conditions.push(sql`${vehicles.mileage} <= ${filters.maxMileage}`);
    }
    
    if (filters.fuelType) {
      conditions.push(eq(vehicles.fuelType, filters.fuelType));
    }
    
    if (filters.transmission) {
      conditions.push(eq(vehicles.transmission, filters.transmission));
    }
    
    if (filters.color) {
      conditions.push(eq(vehicles.color, filters.color));
    }
    
    if (filters.category) {
      conditions.push(eq(vehicles.category, filters.category));
    }
    
    if (filters.condition) {
      conditions.push(eq(vehicles.condition, filters.condition));
    }
    
    if (filters.status) {
      conditions.push(eq(vehicles.status, filters.status));
    }
    
    if (filters.isFeatured !== undefined) {
      conditions.push(eq(vehicles.isFeatured, filters.isFeatured));
    }
    
    // Apply all conditions if there are any
    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    
    return query;
  }
  
  private applySorting<T>(query: any, sort: SortOptions): T {
    const { field, direction } = sort;
    
    // Map the field name to the actual column
    const columnMap: Record<string, any> = {
      id: vehicles.id,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      price: vehicles.price,
      mileage: vehicles.mileage,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      color: vehicles.color,
      category: vehicles.category,
      condition: vehicles.condition,
      status: vehicles.status,
      createdAt: vehicles.createdAt
    };
    
    const column = columnMap[field];
    
    if (column) {
      if (direction === 'asc') {
        return query.orderBy(asc(column));
      } else {
        return query.orderBy(desc(column));
      }
    }
    
    // Default sort by id if field not found
    return direction === 'asc' 
      ? query.orderBy(asc(vehicles.id)) 
      : query.orderBy(desc(vehicles.id));
  }
  
  // Inquiry methods
  async getInquiries(): Promise<InquiryWithVehicle[]> {
    const rows = await db
      .select()
      .from(inquiries)
      .leftJoin(vehicles, eq(inquiries.vehicleId, vehicles.id));

    return rows.map(row => ({
      ...row.inquiries,
      vehicleMake: row.vehicles?.make ?? null,
      vehicleModel: row.vehicles?.model ?? null,
      vehicleYear: row.vehicles?.year ?? null,
    }));
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
            -- Add status column to vehicles table if it doesn't exist
            IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'status') THEN
              ALTER TABLE "vehicles" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'available';
            END IF;
          END
          $$;
        `);
        console.log("Applied database migrations");
      } catch (migrationError) {
        console.error("Migration error:", migrationError);
      }
      
      // Check if the table exists and has required columns
      try {
        // Safe check if users table exists
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'users'
          )`;
        
        const tableExists = tableCheck[0]?.exists;
        
        if (!tableExists) {
          console.log("Users table doesn't exist, skipping admin creation");
          return;
        }
        
        // Now check if we have any users
        const existingUsers = await db.select().from(users).limit(1);
        if (existingUsers.length === 0) {
          // No users exist, create the default admin
          await db.insert(users).values({
            username: 'admin',
            password: 'rpmauto2025',
            role: 'admin'
          });
          console.log("Created default admin user");
        } else {
          console.log("Admin user already exists, skipping");
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
            color, description, category, condition, status, is_featured, 
            features, images, vin
          ) 
          VALUES (
            'Porsche', '911 GT3', 2023, 179900, 1500, 'Gasoline', 'Automatic',
            'GT Silver', '2023 Porsche 911 GT3 in pristine condition. This vehicle features a naturally aspirated 4.0L flat-six engine producing 502 horsepower. Includes track-focused suspension, carbon ceramic brakes, and Porsche''s PDK transmission.',
            'Sports Cars', 'Excellent', 'available', TRUE,
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

  // Blog methods for SEO content marketing
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    const posts = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));
    return posts;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select()
      .from(blogPosts)
      .where(and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.published, true)
      ))
      .limit(1);
    return post || undefined;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values(insertBlogPost)
      .returning();
    return blogPost;
  }
  
  // Garage Register methods
  async createGarageRegister(register: InsertGarageRegister): Promise<GarageRegister> {
    const [garageRegisterEntry] = await db
      .insert(garageRegister)
      .values(register)
      .returning();
    return garageRegisterEntry;
  }

  async getGarageRegisterByVehicleId(vehicleId: number): Promise<GarageRegister | undefined> {
    const [register] = await db
      .select()
      .from(garageRegister)
      .where(eq(garageRegister.vehicleId, vehicleId))
      .limit(1);
    return register || undefined;
  }

  async getGarageRegisters(): Promise<GarageRegister[]> {
    const registers = await db
      .select()
      .from(garageRegister)
      .orderBy(desc(garageRegister.createdAt));
    return registers;
  }

  // ----- Appraisal methods -----
  async createAppraisal(input: InsertAppraisal & {
    ipHash?: string | null;
    userAgent?: string | null;
    turnstileVerified?: boolean;
  }): Promise<Appraisal> {
    const { ipHash, userAgent, turnstileVerified, ...rest } = input;
    const normalizedEmail = rest.email.trim().toLowerCase();

    const insertValue: typeof appraisals.$inferInsert = {
      ...rest,
      email: normalizedEmail,
      ipHash: ipHash ?? null,
      userAgent: userAgent ?? null,
      turnstileVerified: !!turnstileVerified,
      status: "pending",
    };

    const rateLimitRow: typeof appraisalRateLimits.$inferInsert = {
      ipHash: ipHash ?? null,
      email: normalizedEmail,
    };

    // Atomic: appraisal + rate-limit ledger entry must succeed or fail together.
    return await db.transaction(async (tx) => {
      const [row] = await tx.insert(appraisals).values(insertValue).returning();
      await tx.insert(appraisalRateLimits).values(rateLimitRow);
      return row;
    });
  }

  async updateAppraisalWithResult(id: number, update: AppraisalResultUpdate): Promise<Appraisal | undefined> {
    const patch: Partial<typeof appraisals.$inferInsert> = {
      status: update.status,
      updatedAt: new Date(),
    };
    if (update.result !== undefined) patch.result = update.result;
    if (update.estimatedLow !== undefined) patch.estimatedLow = update.estimatedLow;
    if (update.estimatedHigh !== undefined) patch.estimatedHigh = update.estimatedHigh;
    if (update.estimatedMid !== undefined) patch.estimatedMid = update.estimatedMid;
    if (update.errorMessage !== undefined) patch.errorMessage = update.errorMessage;
    if (update.inquiryId !== undefined) patch.inquiryId = update.inquiryId;
    if (update.staffNotified !== undefined) patch.staffNotified = update.staffNotified;
    if (update.emailSentAt !== undefined) patch.emailSentAt = update.emailSentAt;
    if (update.emailError !== undefined) patch.emailError = update.emailError;
    if (update.leadInquiryError !== undefined) patch.leadInquiryError = update.leadInquiryError;
    if (update.stage1Model !== undefined) patch.stage1Model = update.stage1Model;
    if (update.stage1InputTokens !== undefined) patch.stage1InputTokens = update.stage1InputTokens;
    if (update.stage1OutputTokens !== undefined) patch.stage1OutputTokens = update.stage1OutputTokens;
    if (update.stage1CacheCreationTokens !== undefined) patch.stage1CacheCreationTokens = update.stage1CacheCreationTokens;
    if (update.stage1CacheReadTokens !== undefined) patch.stage1CacheReadTokens = update.stage1CacheReadTokens;
    if (update.stage2Model !== undefined) patch.stage2Model = update.stage2Model;
    if (update.stage2InputTokens !== undefined) patch.stage2InputTokens = update.stage2InputTokens;
    if (update.stage2OutputTokens !== undefined) patch.stage2OutputTokens = update.stage2OutputTokens;
    if (update.stage2CacheCreationTokens !== undefined) patch.stage2CacheCreationTokens = update.stage2CacheCreationTokens;
    if (update.stage2CacheReadTokens !== undefined) patch.stage2CacheReadTokens = update.stage2CacheReadTokens;
    if (update.stage1CostCents !== undefined) patch.stage1CostCents = update.stage1CostCents;
    if (update.stage2CostCents !== undefined) patch.stage2CostCents = update.stage2CostCents;
    if (update.totalCostCents !== undefined) patch.totalCostCents = update.totalCostCents;

    const [row] = await db
      .update(appraisals)
      .set(patch)
      .where(eq(appraisals.id, id))
      .returning();
    return row || undefined;
  }

  async setAppraisalStatus(id: number, status: AppraisalStatus, errorMessage?: string | null): Promise<Appraisal | undefined> {
    const patch: Partial<typeof appraisals.$inferInsert> = {
      status,
      errorMessage: errorMessage ?? null,
      updatedAt: new Date(),
    };
    const [row] = await db
      .update(appraisals)
      .set(patch)
      .where(eq(appraisals.id, id))
      .returning();
    return row || undefined;
  }

  async getAppraisal(id: number): Promise<Appraisal | undefined> {
    const [row] = await db.select().from(appraisals).where(eq(appraisals.id, id));
    return row || undefined;
  }

  async listAppraisals(options?: AppraisalListOptions): Promise<Appraisal[]> {
    let q = db.select().from(appraisals).$dynamic();
    if (options?.status) {
      q = q.where(eq(appraisals.status, options.status));
    }
    q = q.orderBy(desc(appraisals.createdAt));
    if (options?.limit !== undefined) q = q.limit(options.limit);
    if (options?.offset !== undefined) q = q.offset(options.offset);
    return await q;
  }

  async countRecentAppraisalsByIpOrEmail(query: AppraisalRateLimitQuery): Promise<{ ipCount: number; emailCount: number }> {
    const now = query.now ?? new Date();
    const cutoff = new Date(now.getTime() - query.windowMs);

    let ipCount = 0;
    let emailCount = 0;

    if (query.ipHash) {
      const [r] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(appraisalRateLimits)
        .where(and(eq(appraisalRateLimits.ipHash, query.ipHash), gte(appraisalRateLimits.createdAt, cutoff)));
      ipCount = Number(r?.count ?? 0);
    }

    if (query.email) {
      const normalizedEmail = query.email.trim().toLowerCase();
      const [r] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(appraisalRateLimits)
        .where(and(eq(appraisalRateLimits.email, normalizedEmail), gte(appraisalRateLimits.createdAt, cutoff)));
      emailCount = Number(r?.count ?? 0);
    }

    return { ipCount, emailCount };
  }

  async listAppraisalsForStaff(options: StaffAppraisalListOptions): Promise<StaffAppraisalListResult> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(200, Math.max(1, options.limit ?? 25));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (options.offerRequestsOnly) {
      // wantsOffer is true OR an inquiry was auto-created
      conditions.push(
        sql`((${appraisals.result}->>'wantsOffer')::boolean IS TRUE OR ${appraisals.inquiryId} IS NOT NULL)`,
      );
    }
    if (options.dateFrom) {
      conditions.push(sql`${appraisals.createdAt} >= ${options.dateFrom}`);
    }
    if (options.dateTo) {
      conditions.push(sql`${appraisals.createdAt} <= ${options.dateTo}`);
    }
    if (options.search && options.search.trim()) {
      const pat = `%${options.search.trim().toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${appraisals.name}) LIKE ${pat}
          OR LOWER(${appraisals.email}) LIKE ${pat}
          OR LOWER(${appraisals.make}) LIKE ${pat}
          OR LOWER(${appraisals.model}) LIKE ${pat})`,
      );
    }

    const whereClause: SQL | undefined = conditions.length ? and(...conditions) : undefined;

    const countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(appraisals)
      .$dynamic();
    const [countRow] = await (whereClause ? countQuery.where(whereClause) : countQuery);
    const total = Number(countRow?.count ?? 0);

    let q = db.select().from(appraisals).$dynamic();
    if (whereClause) q = q.where(whereClause);
    // Sort: createdAt (default) or cost. For cost, push NULLs to the end so
    // staff see populated rows first when sorting either direction.
    const dir = options.sortDir === "asc" ? "asc" : "desc";
    if (options.sortBy === "cost") {
      q = q.orderBy(
        dir === "asc"
          ? sql`${appraisals.totalCostCents} ASC NULLS LAST`
          : sql`${appraisals.totalCostCents} DESC NULLS LAST`,
      );
    } else {
      q = q.orderBy(dir === "asc" ? asc(appraisals.createdAt) : desc(appraisals.createdAt));
    }
    q = q.limit(limit).offset(offset);
    const data = await q;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async countOfferRequestsSince(since: Date): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(appraisals)
      .where(
        and(
          gte(appraisals.createdAt, since),
          sql`((${appraisals.result}->>'wantsOffer')::boolean IS TRUE OR ${appraisals.inquiryId} IS NOT NULL)`,
        ),
      );
    return Number(row?.count ?? 0);
  }

  async getAppraisalCostSummary(): Promise<AppraisalCostSummary> {
    // One pass over the table — aggregate per bucket using filtered counts
    // and sums. This avoids 4 separate round trips. "Today" uses the start
    // of the current UTC day so the bucket is stable as time advances.
    const now = new Date();
    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0,
    ));
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const bucketSql = (since: Date | null) => {
      const cond = since
        ? sql`${appraisals.createdAt} >= ${since} AND ${appraisals.totalCostCents} IS NOT NULL`
        : sql`${appraisals.totalCostCents} IS NOT NULL`;
      return {
        count: sql<number>`count(*) filter (where ${cond})::int`,
        total: sql<number>`coalesce(sum(${appraisals.totalCostCents}) filter (where ${cond}), 0)::int`,
        avg: sql<number>`coalesce(round(avg(${appraisals.totalCostCents}) filter (where ${cond})), 0)::int`,
      };
    };

    const today = bucketSql(startOfToday);
    const w7 = bucketSql(last7d);
    const w30 = bucketSql(last30d);
    const all = bucketSql(null);

    const [row] = await db
      .select({
        todayCount: today.count, todayTotal: today.total, todayAvg: today.avg,
        d7Count: w7.count, d7Total: w7.total, d7Avg: w7.avg,
        d30Count: w30.count, d30Total: w30.total, d30Avg: w30.avg,
        allCount: all.count, allTotal: all.total, allAvg: all.avg,
      })
      .from(appraisals);

    const toBucket = (count: unknown, total: unknown, avg: unknown): CostBucket => ({
      count: Number(count ?? 0),
      totalCostCents: Number(total ?? 0),
      avgCostCents: Number(avg ?? 0),
    });

    return {
      today: toBucket(row?.todayCount, row?.todayTotal, row?.todayAvg),
      last7d: toBucket(row?.d7Count, row?.d7Total, row?.d7Avg),
      last30d: toBucket(row?.d30Count, row?.d30Total, row?.d30Avg),
      allTime: toBucket(row?.allCount, row?.allTotal, row?.allAvg),
    };
  }

  async getAppraisalAuditLog(appraisalId: number): Promise<AppraisalAuditLog[]> {
    return await db
      .select()
      .from(appraisalAuditLog)
      .where(eq(appraisalAuditLog.appraisalId, appraisalId))
      .orderBy(desc(appraisalAuditLog.createdAt));
  }

  async updateAppraisalStaffFields(id: number, update: StaffAppraisalUpdate): Promise<Appraisal | undefined> {
    // Persist staff-editable fields inside the existing result jsonb under
    // result.staff. This keeps the schema unchanged (Task A scope) while
    // letting the detail view reliably surface staffNotes / quotedPriceCad.
    const current = await this.getAppraisal(id);
    if (!current) return undefined;

    const existingResult = (current.result ?? {}) as Record<string, unknown>;
    const existingStaff = ((existingResult.staff as Record<string, unknown>) ?? {});
    const nextStaff: Record<string, unknown> = { ...existingStaff };
    if (update.staffNotes !== undefined) nextStaff.staffNotes = update.staffNotes;
    if (update.quotedPriceCad !== undefined) nextStaff.quotedPriceCad = update.quotedPriceCad;

    const nextResult = { ...existingResult, staff: nextStaff };

    const [row] = await db
      .update(appraisals)
      .set({ result: nextResult, updatedAt: new Date() })
      .where(eq(appraisals.id, id))
      .returning();
    return row || undefined;
  }

  async logAppraisalAudit(entry: InsertAppraisalAuditLog): Promise<AppraisalAuditLog> {
    const insertValue: typeof appraisalAuditLog.$inferInsert = {
      appraisalId: entry.appraisalId,
      event: entry.event,
      actor: entry.actor ?? null,
      details: (entry.details ?? null) as Record<string, unknown> | null,
    };
    const [row] = await db.insert(appraisalAuditLog).values(insertValue).returning();
    return row;
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