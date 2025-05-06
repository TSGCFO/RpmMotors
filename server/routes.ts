import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertInquirySchema, insertTestimonialSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper to parse pagination, sorting, and filter parameters
  const parseVehicleQueryOptions = (req: Request) => {
    const options: any = {};
    
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    options.pagination = { page, limit };
    
    // Parse sorting parameters
    if (req.query.sort) {
      const sortField = req.query.sort as string;
      const direction = req.query.direction === 'desc' ? 'desc' : 'asc';
      options.sort = { field: sortField, direction };
    }
    
    // Parse filtering parameters
    const filters: any = {};
    
    // String filters
    ['make', 'model', 'fuelType', 'transmission', 'color', 'category', 'condition'].forEach(param => {
      if (req.query[param]) {
        filters[param] = req.query[param] as string;
      }
    });
    
    // Number range filters
    ['minYear', 'maxYear', 'minPrice', 'maxPrice', 'minMileage', 'maxMileage'].forEach(param => {
      const value = parseInt(req.query[param] as string);
      if (!isNaN(value)) {
        filters[param] = value;
      }
    });
    
    // Boolean filters
    if (req.query.featured === 'true') {
      filters.isFeatured = true;
    } else if (req.query.featured === 'false') {
      filters.isFeatured = false;
    }
    
    if (Object.keys(filters).length > 0) {
      options.filters = filters;
    }
    
    return options;
  };

  // Vehicle routes
  app.get("/api/vehicles", async (req: Request, res: Response) => {
    try {
      const options = parseVehicleQueryOptions(req);
      const paginated = req.query.paginated === 'true';
      const includeAll = req.query.includeAll === 'true';
      
      // Check if this is a request that should include sold vehicles
      if (!includeAll && !options.filters) {
        options.filters = { status: 'available' };
      } else if (!includeAll && options.filters && !options.filters.status) {
        // If other filters exist but no status filter, add 'available' filter
        options.filters.status = 'available';
      }
      
      if (paginated) {
        const result = await storage.getPaginatedVehicles(options);
        res.json(result);
      } else {
        const vehicles = await storage.getVehicles(options);
        res.json(vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/featured", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || undefined;
      const includeAll = req.query.includeAll === 'true';
      
      // Get featured vehicles
      let featuredVehicles = await storage.getFeaturedVehicles(limit);
      
      // Filter out sold vehicles unless explicitly requested to include all
      if (!includeAll) {
        featuredVehicles = featuredVehicles.filter(vehicle => vehicle.status !== 'sold');
      }
      
      res.json(featuredVehicles);
    } catch (error) {
      console.error("Error fetching featured vehicles:", error);
      res.status(500).json({ message: "Failed to fetch featured vehicles" });
    }
  });

  app.get("/api/vehicles/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const options = parseVehicleQueryOptions(req);
      const vehicles = await storage.getVehiclesByCategory(category, options);
      res.json(vehicles);
    } catch (error) {
      console.error(`Error fetching vehicles by category ${req.params.category}:`, error);
      res.status(500).json({ message: "Failed to fetch vehicles by category" });
    }
  });

  app.get("/api/vehicles/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const options = parseVehicleQueryOptions(req);
      const vehicles = await storage.searchVehicles(query, options);
      res.json(vehicles);
    } catch (error) {
      console.error("Error searching vehicles:", error);
      res.status(500).json({ message: "Failed to search vehicles" });
    }
  });

  app.get("/api/vehicles/filter", async (req: Request, res: Response) => {
    try {
      const options = parseVehicleQueryOptions(req);
      
      if (!options.filters || Object.keys(options.filters).length === 0) {
        return res.status(400).json({ message: "At least one filter parameter is required" });
      }
      
      const vehicles = await storage.filterVehicles(options.filters, {
        pagination: options.pagination,
        sort: options.sort
      });
      
      res.json(vehicles);
    } catch (error) {
      console.error("Error filtering vehicles:", error);
      res.status(500).json({ message: "Failed to filter vehicles" });
    }
  });

  app.get("/api/vehicles/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getInventoryStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ message: "Failed to fetch inventory statistics" });
    }
  });

  app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const vehicle = await storage.getVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error(`Error fetching vehicle ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.get("/api/vehicles/:id/related", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const limit = parseInt(req.query.limit as string) || 4;
      const relatedVehicles = await storage.getRelatedVehicles(id, limit);
      res.json(relatedVehicles);
    } catch (error) {
      console.error(`Error fetching related vehicles for ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch related vehicles" });
    }
  });

  app.post("/api/vehicles", async (req: Request, res: Response) => {
    try {
      const validationResult = insertVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const vehicle = await storage.createVehicle(validationResult.data);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  app.put("/api/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      // Partial validation of the update data
      const updateVehicleSchema = insertVehicleSchema.partial();
      const validationResult = updateVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedVehicle = await storage.updateVehicle(id, validationResult.data);
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      console.error(`Error updating vehicle ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const deleted = await storage.deleteVehicle(id);
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting vehicle ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });
  
  // Update vehicle status endpoint
  app.put("/api/vehicles/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const { status } = req.body;
      if (!status || !['available', 'sold', 'reserved', 'pending'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value. Must be one of: available, sold, reserved, pending" });
      }
      
      const updatedVehicle = await storage.updateVehicle(id, { status });
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      console.error(`Error updating vehicle status ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update vehicle status" });
    }
  });

  // Inquiry routes
  app.post("/api/inquiries", async (req: Request, res: Response) => {
    try {
      const validationResult = insertInquirySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Create the inquiry in the database
      const inquiry = await storage.createInquiry(validationResult.data);
      
      // Import email service functions
      const { sendEmail, formatInquiryEmail } = await import('./email');
      
      // Format and send email notification
      const emailOptions = formatInquiryEmail(validationResult.data);
      sendEmail(emailOptions).then(success => {
        if (success) {
          console.log("Email notification sent successfully for inquiry:", inquiry.id);
        } else {
          console.error("Failed to send email notification for inquiry:", inquiry.id);
        }
      }).catch(err => {
        console.error("Error sending email notification:", err);
      });
      
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  app.get("/api/inquiries", async (_req: Request, res: Response) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const validationResult = insertTestimonialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const testimonial = await storage.createTestimonial(validationResult.data);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ message: "Failed to create testimonial" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
