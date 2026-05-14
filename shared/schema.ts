import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, unique, index, type AnyPgColumn } from "drizzle-orm/pg-core";
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
  appraisalId: integer("appraisal_id").references((): AnyPgColumn => appraisals.id, { onDelete: 'set null' }),
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

// Blog schema for SEO content marketing
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  author: text("author").notNull().default("RPM Auto Team"),
  category: text("category").notNull(),
  tags: text("tags"), // JSON array stored as text
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Garage Register schema for tracking vehicle sales
export const garageRegister = pgTable("garage_register", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: 'restrict' }),
  make: text("make").notNull(),
  modelStyle: text("model_style").notNull(),
  colour: text("colour").notNull(),
  dateIntoStock: text("date_into_stock").notNull(), // Format: yyyy/mm/dd
  vinSerialNo: text("vin_serial_no").notNull(),
  purchasedFromName: text("purchased_from_name").notNull(),
  purchasedFromAddress: text("purchased_from_address").notNull(),
  purposeType: text("purpose_type").notNull(), // Resale, Wrecking, or Consignment
  dateOutOfStock: text("date_out_of_stock").notNull(), // Format: yyyy/mm/dd
  soldToName: text("sold_to_name").notNull(),
  soldToAddress: text("sold_to_address").notNull(),
  plateNo: text("plate_no").notNull(),
  odometerReading: integer("odometer_reading").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertGarageRegisterSchema = createInsertSchema(garageRegister).omit({
  id: true,
  createdAt: true
}).extend({
  purposeType: z.enum(["Resale", "Wrecking", "Consignment"], {
    errorMap: () => ({ message: "Purpose type must be one of: Resale, Wrecking, or Consignment" })
  }),
  dateIntoStock: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Date must be in format yyyy/mm/dd"),
  dateOutOfStock: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Date must be in format yyyy/mm/dd"),
  plateNo: z.string().regex(/^[A-Z0-9]+$/, "Plate number must be alphanumeric"),
  odometerReading: z.number().int().min(0, "Odometer reading must be positive"),
});

export type InsertGarageRegister = z.infer<typeof insertGarageRegisterSchema>;
export type GarageRegister = typeof garageRegister.$inferSelect;

// Relations for garage register
export const garageRegisterRelations = relations(garageRegister, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [garageRegister.vehicleId],
    references: [vehicles.id]
  }),
  createdByUser: one(users, {
    fields: [garageRegister.createdBy],
    references: [users.id]
  })
}));

// =========================
// Appraisal feature schema
// =========================

// Appraisal: a single AI-powered Ontario car price appraisal request.
// Stores both the user-submitted input snapshot and the AI pipeline result.
export const appraisals = pgTable("appraisals", {
  id: serial("id").primaryKey(),
  // Contact / lead info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  postalCode: text("postal_code"),
  // Vehicle info
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  mileage: integer("mileage").notNull(),
  vin: text("vin"),
  exteriorColor: text("exterior_color"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  conditionRating: text("condition_rating"),
  conditionNotes: text("condition_notes"),
  modifications: text("modifications"),
  accidentHistory: text("accident_history"),
  sellingTimeline: text("selling_timeline"),
  // Pipeline state
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  // AI result payload — full pipeline output (stage 1 + stage 2 + meta)
  result: jsonb("result").$type<Record<string, unknown> | null>().default(null),
  // Estimated valuation range (CAD), denormalized from result for sorting/filtering
  estimatedLow: integer("estimated_low"),
  estimatedHigh: integer("estimated_high"),
  estimatedMid: integer("estimated_mid"),
  // Anti-abuse / observability
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  turnstileVerified: boolean("turnstile_verified").default(false),
  // Lead routing
  inquiryId: integer("inquiry_id").references(() => inquiries.id, { onDelete: 'set null' }),
  staffNotified: boolean("staff_notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("appraisals_status_idx").on(table.status),
  createdAtIdx: index("appraisals_created_at_idx").on(table.createdAt),
  emailIdx: index("appraisals_email_idx").on(table.email),
}));

const currentYear = new Date().getFullYear();
const cleanFreeText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((s) => s.replace(/<[^>]*>/g, "").trim());

const optionalShortText = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? null : v.toString().replace(/<[^>]*>/g, "").trim()))
    .refine((v) => v === null || v.length <= max, { message: `Must be ${max} characters or fewer` })
    .transform((v) => (v && v.length > 0 ? v : null));

export const insertAppraisalSchema = createInsertSchema(appraisals)
  .omit({
    id: true,
    status: true,
    errorMessage: true,
    result: true,
    estimatedLow: true,
    estimatedHigh: true,
    estimatedMid: true,
    ipHash: true,
    userAgent: true,
    turnstileVerified: true,
    inquiryId: true,
    staffNotified: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: cleanFreeText(120).refine((s) => s.length > 0, { message: "Name is required" }),
    email: z.string().email("Invalid email address").max(200),
    phone: optionalShortText(40),
    postalCode: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (v == null ? null : v.toString().toUpperCase().replace(/\s+/g, "")))
      .refine(
        (v) => v === null || v.length === 0 || /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(v),
        { message: "Invalid Canadian postal code" }
      )
      .transform((v) => (v && v.length > 0 ? v : null)),
    year: z
      .number()
      .int()
      .min(1980, "Year must be 1980 or later")
      .max(currentYear + 1, `Year must be ${currentYear + 1} or earlier`),
    make: cleanFreeText(60).refine((s) => s.length > 0, { message: "Make is required" }),
    model: cleanFreeText(60).refine((s) => s.length > 0, { message: "Model is required" }),
    trim: optionalShortText(60),
    mileage: z.number().int().min(0, "Mileage must be 0 or greater").max(999999, "Mileage must be 999,999 or less"),
    vin: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (v == null ? null : v.toString().toUpperCase().replace(/\s+/g, "")))
      .refine((v) => v === null || v.length === 0 || /^[A-HJ-NPR-Z0-9]{17}$/.test(v), {
        message: "VIN must be 17 alphanumeric characters (no I, O, or Q)",
      })
      .transform((v) => (v && v.length > 0 ? v : null)),
    exteriorColor: optionalShortText(40),
    transmission: optionalShortText(40),
    drivetrain: optionalShortText(40),
    conditionRating: optionalShortText(40),
    conditionNotes: optionalShortText(500),
    modifications: optionalShortText(500),
    accidentHistory: optionalShortText(500),
    sellingTimeline: optionalShortText(60),
  });

export type InsertAppraisal = z.infer<typeof insertAppraisalSchema>;
export type Appraisal = typeof appraisals.$inferSelect;

// Rate limit counter: one row per appraisal submission keyed by hashed IP and email.
// Used to enforce per-IP / per-email rolling-window submission caps.
export const appraisalRateLimits = pgTable("appraisal_rate_limits", {
  id: serial("id").primaryKey(),
  ipHash: text("ip_hash"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ipIdx: index("appraisal_rate_limits_ip_idx").on(table.ipHash, table.createdAt),
  emailIdx: index("appraisal_rate_limits_email_idx").on(table.email, table.createdAt),
}));

export const insertAppraisalRateLimitSchema = createInsertSchema(appraisalRateLimits).omit({
  id: true,
  createdAt: true,
});

export type InsertAppraisalRateLimit = z.infer<typeof insertAppraisalRateLimitSchema>;
export type AppraisalRateLimit = typeof appraisalRateLimits.$inferSelect;

// Audit log: append-only record of significant appraisal lifecycle events
// (created, ai_stage1_ok, ai_stage1_failed, ai_stage2_ok, ai_stage2_failed,
// completed, email_sent, staff_viewed, staff_updated, ...).
export const appraisalAuditLog = pgTable("appraisal_audit_log", {
  id: serial("id").primaryKey(),
  appraisalId: integer("appraisal_id").notNull().references(() => appraisals.id, { onDelete: 'cascade' }),
  event: text("event").notNull(),
  actor: text("actor"),
  details: jsonb("details").$type<Record<string, unknown> | null>().default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  appraisalIdx: index("appraisal_audit_log_appraisal_idx").on(table.appraisalId, table.createdAt),
}));

export const insertAppraisalAuditLogSchema = createInsertSchema(appraisalAuditLog).omit({
  id: true,
  createdAt: true,
});

export type InsertAppraisalAuditLog = z.infer<typeof insertAppraisalAuditLogSchema>;
export type AppraisalAuditLog = typeof appraisalAuditLog.$inferSelect;

export const appraisalsRelations = relations(appraisals, ({ many, one }) => ({
  auditLogs: many(appraisalAuditLog),
  inquiry: one(inquiries, {
    fields: [appraisals.inquiryId],
    references: [inquiries.id],
  }),
}));

export const appraisalAuditLogRelations = relations(appraisalAuditLog, ({ one }) => ({
  appraisal: one(appraisals, {
    fields: [appraisalAuditLog.appraisalId],
    references: [appraisals.id],
  }),
}));
