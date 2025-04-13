import fs from 'fs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket
neonConfig.webSocketConstructor = ws;

// Load SQL migration file
const migrationSQL = fs.readFileSync('./migration.sql', 'utf8');

// Create a database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    await client.query(migrationSQL);
    console.log('Migration successfully applied!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();