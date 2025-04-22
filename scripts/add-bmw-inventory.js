// This script adds a BMW M4 to the inventory using the images you provided
import { db, pool } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function addBMWToInventory() {
  try {
    console.log("Starting BMW inventory addition script...");
    
    // Check if the BMW already exists in the database by VIN
    const existing = await db.execute(sql`
      SELECT * FROM vehicles WHERE vin = 'WBSXXXXXXXX333999'
    `);
    
    if (existing.rows.length > 0) {
      console.log("BMW M4 already exists in inventory");
      return;
    }
    
    // Add the BMW to inventory with the uploaded image paths
    await db.execute(sql`
      INSERT INTO vehicles (
        make, model, year, price, mileage, fuel_type, transmission, 
        color, description, category, condition, is_featured, 
        features, images, vin
      ) 
      VALUES (
        'BMW', 'M4', 2019, 85950, 32361, 'Gasoline', 'Automatic',
        'Black Sapphire Metallic', 
        'Stunning 2019 BMW M4 with Competition Package. This high-performance coupe features a twin-turbocharged 3.0L inline-6 engine producing 444 horsepower. Equipped with M Performance exhaust, carbon fiber accents, and M Sport steering wheel. Includes premium harman/kardon sound system, navigation, and heated seats. With only 32,361 miles, this immaculately maintained vehicle offers thrilling performance and luxury in perfect balance.',
        'Sports Cars', 'Excellent', TRUE,
        '["Competition Package", "M Performance Exhaust", "Carbon Fiber Trim", "Adaptive M Suspension", "Harman/Kardon Sound System", "Navigation System", "Heated Seats", "19-inch M Alloy Wheels", "LED Headlights", "M Carbon Ceramic Brakes"]'::jsonb,
        '["vehicles/bmw/bmw_image1.jpg", "vehicles/bmw/bmw_image2.jpg", "vehicles/bmw/bmw_image3.jpg", "vehicles/bmw/bmw_image4.jpg", "vehicles/bmw/bmw_image5.jpg"]'::jsonb,
        'WBSXXXXXXXX333999'
      )
      ON CONFLICT (vin) DO NOTHING
    `);

    console.log("✅ Successfully added BMW M4 to inventory");

  } catch (error) {
    console.error("❌ Error adding BMW to inventory:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
addBMWToInventory();