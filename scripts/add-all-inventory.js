// This script adds all vehicles from the public/vehicles directory to inventory
import { db, pool } from '../server/db.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Vehicle data templates
const vehicleTemplates = {
  bmw: {
    make: 'BMW',
    model: 'M4',
    year: 2019,
    price: 85950,
    mileage: 32361,
    fuel_type: 'Gasoline', 
    transmission: 'Automatic',
    color: 'Black Sapphire Metallic',
    description: 'Stunning 2019 BMW M4 with Competition Package. This high-performance coupe features a twin-turbocharged 3.0L inline-6 engine producing 444 horsepower. Equipped with M Performance exhaust, carbon fiber accents, and M Sport steering wheel. Includes premium harman/kardon sound system, navigation, and heated seats. With only 32,361 miles, this immaculately maintained vehicle offers thrilling performance and luxury in perfect balance.',
    category: 'Sports Cars',
    condition: 'Excellent',
    is_featured: true,
    features: ['Competition Package', 'M Performance Exhaust', 'Carbon Fiber Trim', 'Adaptive M Suspension', 'Harman/Kardon Sound System', 'Navigation System', 'Heated Seats', '19-inch M Alloy Wheels', 'LED Headlights', 'M Carbon Ceramic Brakes'],
    vin: 'WBSXXXXXXXX333999'
  },
  maclaren: {
    make: 'McLaren',
    model: '720S',
    year: 2021,
    price: 295000,
    mileage: 2650,
    fuel_type: 'Gasoline', 
    transmission: 'Automatic',
    color: 'Azores Orange',
    description: 'Stunning 2021 McLaren 720S in exclusive Azores Orange finish. This exotic supercar is powered by a 4.0L twin-turbocharged V8 engine delivering 710 horsepower with a 0-60 time of just 2.8 seconds. Features carbon fiber monocage construction, dihedral doors, and state-of-the-art aerodynamics. The luxurious interior boasts Alcantara trim, carbon fiber accents, and McLaren\'s Folding Driver Display. With only 2,650 miles, this vehicle represents the pinnacle of automotive performance and design.',
    category: 'Exotic Cars',
    condition: 'Excellent',
    is_featured: true,
    features: ['4.0L Twin-Turbo V8', 'Dihedral Doors', 'Carbon Fiber Body', 'McLaren Track Telemetry', 'Variable Drift Control', 'Bowers & Wilkins Audio System', 'Carbon Ceramic Brakes', 'Alcantara Interior', 'Folding Driver Display', 'Sports Exhaust'],
    vin: 'SBJQ1440MCRX72513'
  },
  porche: {
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2022,
    price: 219950,
    mileage: 1850,
    fuel_type: 'Gasoline', 
    transmission: 'PDK',
    color: 'GT Silver Metallic',
    description: 'Incredible 2022 Porsche 911 Turbo S with just 1,850 miles. This cutting-edge sports car features a 3.8L twin-turbocharged flat-six engine delivering 640 horsepower and 590 lb-ft of torque through an 8-speed PDK transmission. With a top speed of 205 mph and 0-60 time of 2.6 seconds, this represents the pinnacle of Porsche engineering. Features include carbon ceramic brakes, Sport Chrono package, and full leather interior with contrast stitching. The perfect blend of luxury and extreme performance.',
    category: 'Exotic Cars',
    condition: 'Excellent',
    is_featured: true,
    features: ['Twin-Turbo Flat-Six', 'PDK Transmission', 'Carbon Ceramic Brakes', 'Sport Chrono Package', 'Burmester Audio System', 'Adaptive Sport Seats', 'Porsche Dynamic Chassis Control', 'Sport Exhaust System', 'LED Matrix Headlights', 'Rear Axle Steering'],
    vin: 'WP0AD2A99KS115960'
  },
  tesla: {
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2022,
    price: 119950,
    mileage: 4200,
    fuel_type: 'Electric', 
    transmission: 'Automatic',
    color: 'Midnight Silver Metallic',
    description: 'Revolutionary 2022 Tesla Model S Plaid - the fastest accelerating production car in the world. This cutting-edge electric vehicle features a tri-motor setup delivering 1,020 horsepower with a 0-60 time of just 1.99 seconds. With an EPA estimated range of 396 miles, this Model S combines unparalleled performance with everyday practicality. Features include a 17" central touchscreen, premium interior with carbon fiber accents, and the latest iteration of Tesla\'s Full Self-Driving capability. Experience the future of automotive technology.',
    category: 'Electric Vehicles',
    condition: 'Excellent',
    is_featured: true,
    features: ['Tri-Motor AWD', '1,020 Horsepower', '17" Touchscreen', 'Yoke Steering', 'Full Self-Driving Capability', 'Premium Sound System', 'Glass Roof', 'Carbon Fiber Decor', 'Ventilated Front Seats', 'Ambient Lighting'],
    vin: '5YJSA1E64MF123456'
  }
};

// Function to get image paths for a directory
function getImagePaths(vehicleType) {
  const dirPath = path.join('client/public/vehicles', vehicleType);
  
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Directory for ${vehicleType} doesn't exist: ${dirPath}`);
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    const imagePaths = files
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
      .map(file => `vehicles/${vehicleType}/${file}`);
    
    return imagePaths.slice(0, 5); // Limit to 5 images
  } catch (error) {
    console.error(`Error reading directory for ${vehicleType}:`, error);
    return [];
  }
}

async function addVehicleToInventory(vehicleType) {
  if (!vehicleTemplates[vehicleType]) {
    console.log(`No template for vehicle type: ${vehicleType}`);
    return;
  }
  
  try {
    const vehicle = vehicleTemplates[vehicleType];
    const imagePaths = getImagePaths(vehicleType);
    
    if (imagePaths.length === 0) {
      console.log(`No images found for ${vehicleType}. Skipping.`);
      return;
    }
    
    console.log(`Adding ${vehicle.make} ${vehicle.model} to inventory...`);
    
    // Check if the vehicle already exists in the database by VIN
    const existing = await db.execute(sql`
      SELECT * FROM vehicles WHERE vin = ${vehicle.vin}
    `);
    
    if (existing.rows.length > 0) {
      console.log(`${vehicle.make} ${vehicle.model} already exists in inventory`);
      return;
    }
    
    // Add the vehicle to inventory
    await db.execute(sql`
      INSERT INTO vehicles (
        make, model, year, price, mileage, fuel_type, transmission, 
        color, description, category, condition, is_featured, 
        features, images, vin
      ) 
      VALUES (
        ${vehicle.make}, ${vehicle.model}, ${vehicle.year}, ${vehicle.price}, 
        ${vehicle.mileage}, ${vehicle.fuel_type}, ${vehicle.transmission},
        ${vehicle.color}, ${vehicle.description}, ${vehicle.category}, 
        ${vehicle.condition}, ${vehicle.is_featured},
        ${JSON.stringify(vehicle.features)}::jsonb,
        ${JSON.stringify(imagePaths)}::jsonb,
        ${vehicle.vin}
      )
      ON CONFLICT (vin) DO NOTHING
    `);

    console.log(`✅ Successfully added ${vehicle.make} ${vehicle.model} to inventory`);
  } catch (error) {
    console.error(`❌ Error adding ${vehicleType} to inventory:`, error);
  }
}

async function addAllInventory() {
  try {
    console.log("Starting inventory addition script...");
    
    // Get all vehicle directories
    const vehiclesDir = 'client/public/vehicles';
    if (!fs.existsSync(vehiclesDir)) {
      console.error(`Vehicles directory doesn't exist: ${vehiclesDir}`);
      return;
    }
    
    const dirs = fs.readdirSync(vehiclesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`Found vehicle directories: ${dirs.join(', ')}`);
    
    // Add each vehicle
    for (const dir of dirs) {
      await addVehicleToInventory(dir);
    }
    
  } catch (error) {
    console.error("❌ Error adding inventory:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
addAllInventory();