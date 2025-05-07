import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Get database connection details from environment
// For Render deployment
const dbUrl = process.env.DATABASE_URL || 'postgresql://rpm_auto_user:x0nth4SNq4DqSzyRtI839S9IE5WE5TG6@dpg-d0dtgaidbo4c739abnv0-a/rpm_auto';

console.log("Connecting to PostgreSQL database...");

// Connection parameters
const connectionOptions = {
  max: 10, // Connection pool size
  ssl: { rejectUnauthorized: false }, // Always use SSL with self-signed cert support
  idle_timeout: 30,
  connect_timeout: 10
};

console.log("Using SSL for database connection");

// Create the postgres client
const client = postgres(dbUrl, connectionOptions);

// Initialize Drizzle ORM with the postgres-js client
export const db = drizzle(client, { schema });

// Export the client for transaction support
export const sql = client;