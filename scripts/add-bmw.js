import { sql } from 'drizzle-orm';
import { pool, db } from '../server/db.js';

// Script to add the BMW M4 to the inventory
async function addBMWToInventory() {
  try {
    // Check if the car already exists (using VIN)
    const existingVehicle = await db.execute(sql`
      SELECT * FROM vehicles WHERE vin = 'WBS3R9C53FK333999'
    `);

    if (existingVehicle.rows.length > 0) {
      console.log('BMW M4 is already in inventory');
      return;
    }

    // Add BMW to inventory
    await db.execute(sql`
      INSERT INTO vehicles (
        make, model, year, price, mileage, fuel_type, transmission, 
        color, description, category, condition, is_featured, 
        features, images, vin
      ) 
      VALUES (
        'BMW', 'M4', 2019, 85950, 32361, 'Gasoline', 'Automatic',
        'Black Sapphire Metallic', 
        'Rare 2019 BMW M4 with Competition Package in pristine condition. This stunning coupe features a twin-turbocharged 3.0L inline-6 engine producing 444 horsepower. Equipped with M Performance exhaust, carbon fiber accents, and M Sport steering wheel. Includes premium harman/kardon sound system, navigation, and heated seats.',
        'Sports Cars', 'Excellent', TRUE,
        '["Competition Package", "M Performance Exhaust", "Carbon Fiber Trim", "Adaptive M Suspension", "Harman/Kardon Sound System", "Navigation System", "Heated Seats", "19-inch M Alloy Wheels", "LED Headlights", "M Carbon Ceramic Brakes"]'::jsonb,
        '["vehicles/bmw/bmw_image1.jpg", "vehicles/bmw/bmw_image2.jpg", "vehicles/bmw/bmw_image3.jpg", "vehicles/bmw/bmw_image4.jpg", "vehicles/bmw/bmw_image5.jpg"]'::jsonb,
        'WBS3R9C53FK333999'
      )
      ON CONFLICT (vin) DO NOTHING
    `);
    
    console.log('Successfully added 2019 BMW M4 to inventory');
  } catch (error) {
    console.error('Error adding BMW to inventory:', error);
  } finally {
    // Close the pool connection when done
    await pool.end();
  }
}

// Execute the function
addBMWToInventory();