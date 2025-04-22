// This script adds a McLaren to the inventory using the images in public directory
import { db, pool } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function addMcLarenToInventory() {
  try {
    console.log("Starting McLaren inventory addition script...");
    
    // Check if the McLaren already exists in the database by VIN
    const existing = await db.execute(sql`
      SELECT * FROM vehicles WHERE vin = 'SBJQ1440MCRX72513'
    `);
    
    if (existing.rows.length > 0) {
      console.log("McLaren 720S already exists in inventory");
      return;
    }
    
    // Add the McLaren to inventory with the uploaded image paths
    // First five images
    const firstFiveImages = [
      'vehicles/maclaren/maclaren_image1.jpg',
      'vehicles/maclaren/maclaren_image2.jpg',
      'vehicles/maclaren/maclaren_image3.jpg',
      'vehicles/maclaren/maclaren_image4.jpg',
      'vehicles/maclaren/maclaren_image5.jpg'
    ];
    
    await db.execute(sql`
      INSERT INTO vehicles (
        make, model, year, price, mileage, fuel_type, transmission, 
        color, description, category, condition, is_featured, 
        features, images, vin
      ) 
      VALUES (
        'McLaren', '720S', 2021, 295000, 2650, 'Gasoline', 'Automatic',
        'Azores Orange', 
        'Stunning 2021 McLaren 720S in exclusive Azores Orange finish. This exotic supercar is powered by a 4.0L twin-turbocharged V8 engine delivering 710 horsepower with a 0-60 time of just 2.8 seconds. Features carbon fiber monocage construction, dihedral doors, and state-of-the-art aerodynamics. The luxurious interior boasts Alcantara trim, carbon fiber accents, and McLaren''s Folding Driver Display. With only 2,650 miles, this vehicle represents the pinnacle of automotive performance and design.',
        'Exotic Cars', 'Excellent', TRUE,
        '["4.0L Twin-Turbo V8", "Dihedral Doors", "Carbon Fiber Body", "McLaren Track Telemetry", "Variable Drift Control", "Bowers & Wilkins Audio System", "Carbon Ceramic Brakes", "Alcantara Interior", "Folding Driver Display", "Sports Exhaust"]'::jsonb,
        ${JSON.stringify(firstFiveImages)}::jsonb,
        'SBJQ1440MCRX72513'
      )
      ON CONFLICT (vin) DO NOTHING
    `);

    console.log("✅ Successfully added McLaren 720S to inventory");

  } catch (error) {
    console.error("❌ Error adding McLaren to inventory:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
addMcLarenToInventory();