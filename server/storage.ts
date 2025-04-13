import { 
  User, InsertUser, users,
  Vehicle, InsertVehicle, vehicles,
  Inquiry, InsertInquiry, inquiries,
  Testimonial, InsertTestimonial, testimonials
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, asc, desc } from "drizzle-orm";

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
      .values(insertVehicle)
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
      .values(insertInquiry)
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
      .values(insertTestimonial)
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
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
      await this.createUser({
        username: "admin",
        password: "rpmauto2025" // Default admin password
      });
      console.log("Created default admin user");
    }
  }
  
  // Initialize sample data for demos and testing
  async initializeSampleData(): Promise<void> {
    // Check if we already have vehicles
    const existingVehicles = await db.select().from(vehicles);
    if (existingVehicles.length === 0) {
      // Sample vehicles
      const sampleVehicles = [
        {
          make: "Porsche",
          model: "911 GT3",
          year: 2023,
          price: 179900,
          mileage: 1500,
          fuelType: "Gasoline",
          transmission: "Automatic",
          color: "GT Silver",
          description: "2023 Porsche 911 GT3 in pristine condition. This vehicle features a naturally aspirated 4.0L flat-six engine producing 502 horsepower. Includes track-focused suspension, carbon ceramic brakes, and Porsche's PDK transmission.",
          category: "Sports Cars",
          condition: "Excellent",
          isFeatured: true,
          features: ["Carbon Ceramic Brakes", "Sport Chrono Package", "PDK Transmission", "Track Package"],
          images: [
            "https://images.unsplash.com/photo-1617814076668-4af3ff1dd40f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80",
            "https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"
          ],
          vin: "WP0AC2A99JS175960"
        },
        {
          make: "Mercedes-Benz",
          model: "S580",
          year: 2022,
          price: 154900,
          mileage: 8600,
          fuelType: "Gasoline",
          transmission: "Automatic",
          color: "Obsidian Black",
          description: "Luxurious 2022 Mercedes-Benz S580 with 4MATIC all-wheel drive. Features include Burmester 3D surround sound, augmented reality navigation, and level 2 autonomous driving capabilities. The interior showcases premium Nappa leather and open-pore wood trim.",
          category: "Luxury Sedans",
          condition: "Excellent",
          isFeatured: true,
          features: ["4MATIC All-Wheel Drive", "Burmester 3D Sound", "Augmented Reality Navigation", "Level 2 Autonomous Driving"],
          images: [
            "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
          ],
          vin: "WDDUG7GB5MA456789"
        },
        {
          make: "Ferrari",
          model: "F8 Tributo",
          year: 2021,
          price: 399900,
          mileage: 3200,
          fuelType: "Gasoline",
          transmission: "Automatic",
          color: "Rosso Corsa",
          description: "Stunning 2021 Ferrari F8 Tributo in the iconic Rosso Corsa. Features a twin-turbocharged 3.9L V8 engine producing 710 horsepower. Includes carbon fiber racing seats, advanced vehicle dynamics control, and Ferrari's 7-speed dual-clutch transmission.",
          category: "Exotic Collection",
          condition: "Excellent",
          isFeatured: true,
          features: ["Carbon Fiber Racing Seats", "Advanced Vehicle Dynamics", "Dual-Clutch Transmission", "Premium Sound System"],
          images: [
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
            "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
          ],
          vin: "ZFF92LMS000245789"
        }
      ];
      
      for (const vehicle of sampleVehicles) {
        await this.createVehicle(vehicle);
      }
      console.log("Created sample vehicles");
    }
    
    // Check if we already have testimonials
    const existingTestimonials = await db.select().from(testimonials);
    if (existingTestimonials.length === 0) {
      // Sample testimonials
      const sampleTestimonials = [
        {
          name: "Michael T.",
          vehicle: "Ferrari 488 Owner",
          rating: 5,
          comment: "The team at RPM Auto made buying my dream car an absolute pleasure. Their knowledge, professionalism, and attention to detail exceeded my expectations."
        },
        {
          name: "Sarah K.",
          vehicle: "Mercedes-Benz Collector",
          rating: 5,
          comment: "I've purchased multiple vehicles from RPM Auto over the years. Their inventory is exceptional, and their commitment to customer satisfaction is unmatched."
        },
        {
          name: "David R.",
          vehicle: "Porsche Cayenne Owner",
          rating: 4,
          comment: "The financing options offered by RPM Auto were flexible and competitive. They worked with me to find the perfect solution for my budget and preferences."
        }
      ];
      
      for (const testimonial of sampleTestimonials) {
        const newTestimonial = await this.createTestimonial(testimonial);
        await this.approveTestimonial(newTestimonial.id);
      }
      console.log("Created sample testimonials");
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