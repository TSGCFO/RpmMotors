const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

async function applyMigration() {
  console.log('Starting database migration...');
  
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create a new PostgreSQL client
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Read the migration SQL file
    const migrationFilePath = path.join(__dirname, 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log('Applying migration...');
    
    // Execute the migration SQL
    await pool.query(migrationSQL);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
applyMigration().catch(console.error);