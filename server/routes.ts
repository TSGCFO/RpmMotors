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
      
      // Create the inquiry in the database first so it's recorded even if email fails
      const inquiry = await storage.createInquiry(validationResult.data);
      
      // Import email service functions
      const { sendEmail, formatInquiryEmail } = await import('./email');
      
      // Format email notification with inquiry data
      const emailOptions = formatInquiryEmail({
        ...validationResult.data,
        inquiryId: inquiry.id, // Include the inquiry ID in the email
        phone: validationResult.data.phone || undefined, // Ensure phone is string or undefined, not null
        vehicleId: validationResult.data.vehicleId || null // Ensure vehicleId is number or null
      });
      
      console.log("Preparing to send email notification for inquiry:", inquiry.id);
      
      // Try to send the email asynchronously
      // We don't want to block the API response on email delivery
      sendEmail(emailOptions)
        .then(success => {
          if (success) {
            console.log("Email notification sent successfully for inquiry:", inquiry.id);
            
            // Update inquiry status to indicate email was sent
            storage.updateInquiryStatus(inquiry.id, "email-sent").catch(err => {
              console.error("Failed to update inquiry status after email sent:", err);
            });
          } else {
            console.error("Failed to send email notification for inquiry:", inquiry.id);
            
            // IMPORTANT: Email sending failed but the inquiry is still stored in the database
            // Record that email sending failed to ensure this inquiry is not missed
            storage.updateInquiryStatus(inquiry.id, "email-failed").catch(err => {
              console.error("Failed to update inquiry status after email failure:", err);
            });
            
            // Log the full inquiry data for manual recovery if needed
            console.log("IMPORTANT - INQUIRY RECORD (EMAIL FAILED):", JSON.stringify({
              id: inquiry.id,
              name: validationResult.data.name,
              email: validationResult.data.email,
              phone: validationResult.data.phone,
              subject: validationResult.data.subject,
              message: validationResult.data.message,
              vehicleId: validationResult.data.vehicleId,
              createdAt: inquiry.createdAt
            }, null, 2));
          }
        })
        .catch(err => {
          console.error(`Error sending email notification for inquiry ${inquiry.id}:`, err);
          
          // Log detailed error information for debugging
          if (err.response && err.response.body) {
            console.error("Email error details:", JSON.stringify(err.response.body, null, 2));
          }
          
          // Update inquiry status to indicate email error
          storage.updateInquiryStatus(inquiry.id, "email-error").catch(err => {
            console.error("Failed to update inquiry status after email error:", err);
          });
        });
      
      // Return success response immediately without waiting for email to send
      // We already saved the inquiry to the database
      res.status(201).json({
        ...inquiry,
        message: "Thank you for your inquiry. Our team will contact you shortly."
      });
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry. Please try again or contact us directly." });
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
  
  // Add endpoint to retry sending email for a failed inquiry
  app.post("/api/inquiries/:id/retry-email", async (req: Request, res: Response) => {
    try {
      const inquiryId = parseInt(req.params.id);
      
      if (isNaN(inquiryId)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      // Get the inquiry details
      const inquiry = await storage.getInquiryById(inquiryId);
      
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      console.log(`Retrying email notification for inquiry: ${inquiryId}`);
      
      // Import email service functions
      const { sendEmail, formatInquiryEmail } = await import('./email');
      
      // Format email notification with inquiry data
      const emailOptions = formatInquiryEmail({
        ...inquiry,
        phone: inquiry.phone || undefined,
        vehicleId: inquiry.vehicleId || null
      });
      
      // Try to send the email
      const success = await sendEmail(emailOptions);
      
      if (success) {
        console.log(`Email notification successfully resent for inquiry: ${inquiryId}`);
        await storage.updateInquiryStatus(inquiryId, "email-sent");
        res.status(200).json({ message: "Email notification resent successfully" });
      } else {
        console.error(`Failed to resend email notification for inquiry: ${inquiryId}`);
        await storage.updateInquiryStatus(inquiryId, "email-failed");
        res.status(500).json({ message: "Failed to resend email notification" });
      }
    } catch (error) {
      console.error("Error retrying email notification:", error);
      res.status(500).json({ message: "An error occurred while retrying email notification" });
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
