import { pgTable, text, serial, integer, boolean, timestamp, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema (current database schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: text("role").default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Forward declaration - will be fully defined after vehicle schema
export const savedVehicles = pgTable("saved_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Vehicle schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  color: text("color").notNull(), // Exterior color
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Sports Cars", "Luxury Sedans", etc.
  condition: text("condition").notNull().default("Used"), // New, Used, Certified Pre-Owned
  status: text("status").notNull().default("available"), // available, sold, reserved, pending
  isFeatured: boolean("is_featured").default(false),
  features: json("features").$type<string[]>().notNull().default([]),
  images: json("images").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  vin: text("vin").notNull().unique(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Complete the saved vehicles schema definition now that vehicles is defined
// Update the references
const savedVehiclesTable = pgTable("saved_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    unq: unique().on(table.userId, table.vehicleId)
  };
});

// Override the initial declaration
Object.assign(savedVehicles, savedVehiclesTable);

export const insertSavedVehicleSchema = createInsertSchema(savedVehicles).omit({
  id: true,
  createdAt: true
});

export type InsertSavedVehicle = z.infer<typeof insertSavedVehicleSchema>;
export type SavedVehicle = typeof savedVehicles.$inferSelect;

// Inquiry schema for contact forms
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: 'set null' }),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// Testimonial schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vehicle: text("vehicle").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  isApproved: true,
  createdAt: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  savedVehicles: many(savedVehicles)
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  savedVehicles: many(savedVehicles),
  inquiries: many(inquiries)
}));

export const savedVehiclesRelations = relations(savedVehicles, ({ one }) => ({
  user: one(users, {
    fields: [savedVehicles.userId],
    references: [users.id]
  }),
  vehicle: one(vehicles, {
    fields: [savedVehicles.vehicleId],
    references: [vehicles.id]
  })
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [inquiries.vehicleId],
    references: [vehicles.id]
  })
}));
