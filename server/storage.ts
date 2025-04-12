import { 
  User, InsertUser, users,
  Vehicle, InsertVehicle, vehicles,
  Inquiry, InsertInquiry, inquiries,
  Testimonial, InsertTestimonial, testimonials
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private inquiries: Map<number, Inquiry>;
  private testimonials: Map<number, Testimonial>;
  
  private userId: number;
  private vehicleId: number;
  private inquiryId: number;
  private testimonialId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.inquiries = new Map();
    this.testimonials = new Map();
    
    this.userId = 1;
    this.vehicleId = 1;
    this.inquiryId = 1;
    this.testimonialId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }
  
  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getFeaturedVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(vehicle => vehicle.featured);
  }
  
  async getVehiclesByCategory(category: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      vehicle => vehicle.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async searchVehicles(query: string): Promise<Vehicle[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.vehicles.values()).filter(vehicle => 
      vehicle.make.toLowerCase().includes(lowerQuery) ||
      vehicle.model.toLowerCase().includes(lowerQuery) ||
      vehicle.year.toString().includes(lowerQuery) ||
      vehicle.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleId++;
    const now = new Date();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      createdAt: now
    };
    
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }
  
  // Inquiry methods
  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
  
  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }
  
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryId++;
    const now = new Date();
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      createdAt: now,
      status: "new"
    };
    
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
  
  async updateInquiryStatus(id: number, status: string): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    
    const updatedInquiry = { ...inquiry, status };
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  // Testimonial methods
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      testimonial => testimonial.approved
    );
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const now = new Date();
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      createdAt: now,
      approved: false
    };
    
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, approved: true };
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonials.delete(id);
  }
  
  // Initialize with sample data
  private initializeData() {
    // Sample admin user
    this.createUser({
      username: "admin",
      password: "adminpassword",
    });
    
    // Sample vehicles
    const sampleVehicles: InsertVehicle[] = [
      {
        make: "Porsche",
        model: "911 GT3",
        year: 2023,
        price: 179900,
        mileage: 1500,
        fuelType: "Gasoline",
        transmission: "Automatic",
        exteriorColor: "GT Silver",
        drivetrain: "RWD",
        description: "2023 Porsche 911 GT3 in pristine condition. This vehicle features a naturally aspirated 4.0L flat-six engine producing 502 horsepower. Includes track-focused suspension, carbon ceramic brakes, and Porsche's PDK transmission.",
        category: "Sports Cars",
        status: "available",
        featured: true,
        photos: [
          "https://images.unsplash.com/photo-1617814076668-4af3ff1dd40f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80",
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1617814076668-4af3ff1dd40f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80",
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
        exteriorColor: "Obsidian Black",
        drivetrain: "AWD",
        description: "Luxurious 2022 Mercedes-Benz S580 with 4MATIC all-wheel drive. Features include Burmester 3D surround sound, augmented reality navigation, and level 2 autonomous driving capabilities. The interior showcases premium Nappa leather and open-pore wood trim.",
        category: "Luxury Sedans",
        status: "available",
        featured: true,
        photos: [
          "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
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
        exteriorColor: "Rosso Corsa",
        drivetrain: "RWD",
        description: "Stunning 2021 Ferrari F8 Tributo in the iconic Rosso Corsa. Features a twin-turbocharged 3.9L V8 engine producing 710 horsepower. Includes carbon fiber racing seats, advanced vehicle dynamics control, and Ferrari's 7-speed dual-clutch transmission.",
        category: "Exotic Collection",
        status: "available",
        featured: true,
        photos: [
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
          "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
        vin: "ZFF92LMS000245789"
      },
      {
        make: "BMW",
        model: "X7 M50i",
        year: 2022,
        price: 118900,
        mileage: 12500,
        fuelType: "Gasoline",
        transmission: "Automatic",
        exteriorColor: "Mineral White",
        drivetrain: "AWD",
        description: "Luxurious 2022 BMW X7 M50i with xDrive all-wheel drive. This 7-passenger SUV features a twin-turbocharged 4.4L V8 engine, 22-inch wheels, panoramic sunroof, and premium Merino leather interior.",
        category: "SUVs & Crossovers",
        status: "available",
        featured: false,
        photos: [
          "https://images.unsplash.com/photo-1502877338535-766e1452ae87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1502877338535-766e1452ae87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1744&q=80",
        vin: "5UXCX8C50L9D56789"
      },
      {
        make: "Lamborghini",
        model: "Huracan EVO",
        year: 2022,
        price: 329900,
        mileage: 2800,
        fuelType: "Gasoline",
        transmission: "Automatic",
        exteriorColor: "Verde Mantis",
        drivetrain: "AWD",
        description: "2022 Lamborghini Huracan EVO in striking Verde Mantis. Features a naturally aspirated 5.2L V10 engine producing 640 horsepower. Includes Lamborghini Dynamic Steering, magnetorheological suspension, and carbon ceramic brakes.",
        category: "Exotic Collection",
        status: "available",
        featured: false,
        photos: [
          "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        vin: "ZHWEC2ZF8MLA16789"
      },
      {
        make: "Bentley",
        model: "Continental GT",
        year: 2021,
        price: 249900,
        mileage: 5600,
        fuelType: "Gasoline",
        transmission: "Automatic",
        exteriorColor: "Tungsten",
        drivetrain: "AWD",
        description: "Elegant 2021 Bentley Continental GT with W12 engine. This grand tourer features Bentley's Dynamic Ride system, rotating dashboard display, and handcrafted interior with premium leather and wood veneers.",
        category: "Luxury Sedans",
        status: "available",
        featured: false,
        photos: [
          "https://images.unsplash.com/photo-1542282811-943ef1a977c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
        ],
        thumbnail: "https://images.unsplash.com/photo-1542282811-943ef1a977c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        vin: "SCBDG4ZG1MC078912"
      }
    ];
    
    sampleVehicles.forEach(vehicle => {
      this.createVehicle(vehicle);
    });
    
    // Sample testimonials
    const sampleTestimonials: InsertTestimonial[] = [
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
    
    sampleTestimonials.forEach(testimonial => {
      const createdTestimonial = this.createTestimonial(testimonial);
      this.approveTestimonial((createdTestimonial as Promise<Testimonial>).then(t => t.id));
    });
  }
}

export const storage = new MemStorage();
