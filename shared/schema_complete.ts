import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
  unique,
  foreignKey,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: text("role").default("customer"),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  stockNumber: text("stock_number").unique(),
  vin: text("vin").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  msrp: integer("msrp"),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  drivetrain: text("drivetrain"),
  engine: text("engine"),
  exteriorColor: text("exterior_color").notNull(),
  interiorColor: text("interior_color"),
  bodyStyle: text("body_style"),
  description: text("description").notNull(),
  features: json("features").$type<string[]>().notNull().default([]),
  specifications: json("specifications")
    .$type<Record<string, any>>()
    .default({}),
  images: json("images").$type<string[]>().notNull().default([]),
  videos: json("videos").$type<string[]>().default([]),
  category: text("category").notNull(),
  condition: text("condition").notNull().default("Used"),
  status: text("status").notNull().default("available"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  soldAt: timestamp("sold_at"),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  soldAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Vehicle History schema
export const vehicleHistory = pgTable("vehicle_history", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  serviceDate: timestamp("service_date").notNull(),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  mileage: integer("mileage"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleHistorySchema = createInsertSchema(
  vehicleHistory,
).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicleHistory = z.infer<typeof insertVehicleHistorySchema>;
export type VehicleHistory = typeof vehicleHistory.$inferSelect;

// Saved Vehicles schema
export const savedVehicles = pgTable(
  "saved_vehicles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      unq: unique().on(table.userId, table.vehicleId),
    };
  },
);

export const insertSavedVehicleSchema = createInsertSchema(savedVehicles).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedVehicle = z.infer<typeof insertSavedVehicleSchema>;
export type SavedVehicle = typeof savedVehicles.$inferSelect;

// Inquiries schema
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  status: text("status").default("new"),
  assignedTo: integer("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  assignedTo: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// Inquiry Responses schema
export const inquiryResponses = pgTable("inquiry_responses", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id")
    .notNull()
    .references(() => inquiries.id, { onDelete: "cascade" }),
  staffId: integer("staff_id").references(() => users.id, {
    onDelete: "set null",
  }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInquiryResponseSchema = createInsertSchema(
  inquiryResponses,
).omit({
  id: true,
  createdAt: true,
});

export type InsertInquiryResponse = z.infer<typeof insertInquiryResponseSchema>;
export type InquiryResponse = typeof inquiryResponses.$inferSelect;

// Testimonials schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vehicle: text("vehicle").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  purchaseDate: timestamp("purchase_date"),
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

// Financing Applications schema
export const financingApplications = pgTable("financing_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  status: text("status").default("submitted"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  employmentStatus: text("employment_status").notNull(),
  annualIncome: integer("annual_income").notNull(),
  creditScoreRange: text("credit_score_range"),
  downPayment: integer("down_payment"),
  loanTerm: integer("loan_term"),
  tradeIn: boolean("trade_in").default(false),
  tradeInValue: integer("trade_in_value"),
  tradeInDetails: text("trade_in_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFinancingApplicationSchema = createInsertSchema(
  financingApplications,
).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinancingApplication = z.infer<
  typeof insertFinancingApplicationSchema
>;
export type FinancingApplication = typeof financingApplications.$inferSelect;

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  appointmentType: text("appointment_type").notNull(),
  status: text("status").default("scheduled"),
  date: timestamp("date").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "restrict" }),
  transactionType: text("transaction_type").notNull(),
  salePrice: integer("sale_price").notNull(),
  taxAmount: integer("tax_amount"),
  feesAmount: integer("fees_amount"),
  totalAmount: integer("total_amount").notNull(),
  paymentMethod: text("payment_method"),
  financingId: integer("financing_id").references(
    () => financingApplications.id,
    { onDelete: "set null" },
  ),
  salesRepId: integer("sales_rep_id").references(() => users.id, {
    onDelete: "set null",
  }),
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionDate: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Service Records schema
export const serviceRecords = pgTable("service_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  customerId: integer("customer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  serviceType: text("service_type").notNull(),
  description: text("description").notNull(),
  cost: integer("cost"),
  mileage: integer("mileage"),
  serviceDate: timestamp("service_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").default("scheduled"),
  technicianNotes: text("technician_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceRecordSchema = createInsertSchema(
  serviceRecords,
).omit({
  id: true,
  completedDate: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceRecord = z.infer<typeof insertServiceRecordSchema>;
export type ServiceRecord = typeof serviceRecords.$inferSelect;

// Inventory Logs schema
export const inventoryLogs = pgTable("inventory_logs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  details: json("details").notNull(),
  performedBy: integer("performed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryLogSchema = createInsertSchema(inventoryLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>;
export type InventoryLog = typeof inventoryLogs.$inferSelect;

// Marketing Campaigns schema
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  type: text("type").notNull(),
  targetAudience: text("target_audience"),
  budget: integer("budget"),
  status: text("status").default("draft"),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMarketingCampaignSchema = createInsertSchema(
  marketingCampaigns,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketingCampaign = z.infer<
  typeof insertMarketingCampaignSchema
>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

// Promotions schema
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type"),
  discountValue: integer("discount_value"),
  code: text("code"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  applicableVehicles: json("applicable_vehicles").$type<string[]>(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  currentUses: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

// Document Templates schema
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  variables: json("variables").$type<string[]>().default([]),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentTemplateSchema = createInsertSchema(
  documentTemplates,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDocumentTemplate = z.infer<
  typeof insertDocumentTemplateSchema
>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// Website Analytics schema
export const websiteAnalytics = pgTable("website_analytics", {
  id: serial("id").primaryKey(),
  pageViewCount: integer("page_view_count").default(0),
  vehicleViewDetails: json("vehicle_view_details")
    .$type<Record<string, number>>()
    .default({}),
  searchQueries: json("search_queries").$type<string[]>().default([]),
  leadSources: json("lead_sources").$type<Record<string, number>>().default({}),
  visitorDemographics: json("visitor_demographics")
    .$type<Record<string, any>>()
    .default({}),
  date: date("date").notNull().defaultNow().unique(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWebsiteAnalyticsSchema = createInsertSchema(
  websiteAnalytics,
).omit({
  id: true,
  updatedAt: true,
});

export type InsertWebsiteAnalytics = z.infer<
  typeof insertWebsiteAnalyticsSchema
>;
export type WebsiteAnalytics = typeof websiteAnalytics.$inferSelect;

// Define relations between tables
export const relations = {
  users: {
    savedVehicles: many(savedVehicles, {
      relationName: "user_saved_vehicles",
      fields: [users.id],
      references: [savedVehicles.userId],
    }),
    appointments: many(appointments, {
      relationName: "user_appointments",
      fields: [users.id],
      references: [appointments.userId],
    }),
    assignedInquiries: many(inquiries, {
      relationName: "user_assigned_inquiries",
      fields: [users.id],
      references: [inquiries.assignedTo],
    }),
    transactions: many(transactions, {
      relationName: "user_transactions",
      fields: [users.id],
      references: [transactions.userId],
    }),
    salesTransactions: many(transactions, {
      relationName: "salesperson_transactions",
      fields: [users.id],
      references: [transactions.salesRepId],
    }),
    financingApplications: many(financingApplications, {
      relationName: "user_financing_applications",
      fields: [users.id],
      references: [financingApplications.userId],
    }),
    serviceRecords: many(serviceRecords, {
      relationName: "customer_service_records",
      fields: [users.id],
      references: [serviceRecords.customerId],
    }),
    inquiryResponses: many(inquiryResponses, {
      relationName: "staff_inquiry_responses",
      fields: [users.id],
      references: [inquiryResponses.staffId],
    }),
    inventoryLogs: many(inventoryLogs, {
      relationName: "user_inventory_logs",
      fields: [users.id],
      references: [inventoryLogs.performedBy],
    }),
    marketingCampaigns: many(marketingCampaigns, {
      relationName: "user_marketing_campaigns",
      fields: [users.id],
      references: [marketingCampaigns.createdBy],
    }),
    documentTemplates: many(documentTemplates, {
      relationName: "user_document_templates",
      fields: [users.id],
      references: [documentTemplates.createdBy],
    }),
  },
  vehicles: {
    savedVehicles: one(vehicles, {
      fields: [vehicles.id],
      references: [savedVehicles.vehicleId],
    }),
    vehicleHistory: one(vehicles, {
      fields: [vehicles.id],
      references: [vehicleHistory.vehicleId],
    }),
    inquiries: one(vehicles, {
      fields: [vehicles.id],
      references: [inquiries.vehicleId],
    }),
    appointments: one(vehicles, {
      fields: [vehicles.id],
      references: [appointments.vehicleId],
    }),
    transactions: one(vehicles, {
      fields: [vehicles.id],
      references: [transactions.vehicleId],
    }),
    financingApplications: one(vehicles, {
      fields: [vehicles.id],
      references: [financingApplications.vehicleId],
    }),
    serviceRecords: one(vehicles, {
      fields: [vehicles.id],
      references: [serviceRecords.vehicleId],
    }),
    inventoryLogs: one(vehicles, {
      fields: [vehicles.id],
      references: [inventoryLogs.vehicleId],
    }),
  },
  inquiries: {
    responses: one(inquiries, {
      fields: [inquiries.id],
      references: [inquiryResponses.inquiryId],
    }),
  },
  financingApplications: {
    transactions: one(financingApplications, {
      fields: [financingApplications.id],
      references: [transactions.financingId],
    }),
  },
  marketingCampaigns: {
    promotions: one(marketingCampaigns, {
      fields: [marketingCampaigns.id],
      references: [promotions.campaignId],
    }),
  },
};

// Helper functions for database serialization
import { sql } from "drizzle-orm";
