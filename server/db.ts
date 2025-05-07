import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Get database connection details from environment
const dbUrl = process.env.DATABASE_URL;

// Ensure DATABASE_URL is defined
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is required. Please set it before starting the application.");
}

console.log("Connecting to PostgreSQL database...");

// Determine if we need SSL (needed for Render and production)
const isProduction = process.env.NODE_ENV === 'production';
const isRenderDeploy = !!process.env.RENDER || isProduction;

// Connection parameters - use SSL for all connections
// Replit's PostgreSQL requires SSL
const connectionOptions = {
  max: 10, // Connection pool size
  ssl: { rejectUnauthorized: false }, // Always use SSL with self-signed cert support
  idle_timeout: 30,
  connect_timeout: 10
};

// Always using SSL for database connections
console.log("Using SSL for database connection");

// Create the postgres client
const client = postgres(dbUrl, connectionOptions);

// Initialize Drizzle ORM with the postgres-js client
export const db = drizzle(client, { schema });

// Export the client for transaction support
export const sql = client;