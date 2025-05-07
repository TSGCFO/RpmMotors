# Image Storage Guide for Render.com Deployment

This guide explains how to handle image storage when deploying the RPM Auto Dealership application to Render.com.

## Overview

The application currently uses Replit's Object Storage for storing vehicle images. When deploying to Render.com, you'll need an alternative solution. Here are your options:

## Option 1: Using Render's Disk Storage (Simplest)

Render provides persistent disk storage for your web services. This is the simplest approach for a small to medium-sized application.

### Setup Steps:

1. In your Render dashboard, open your web service
2. Go to the "Disks" tab
3. Add a new disk:
   - Mount Path: `/opt/render/project/src/public/uploads`
   - Size: Choose an appropriate size (min 1GB recommended)

### Code Changes Required:

Create a new file at `server/storage-adapter.js`:

```javascript
// server/storage-adapter.js
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Base directory for file uploads
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/public/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveImageToStorage(file, targetPath) {
  const fullTargetPath = path.join(UPLOAD_DIR, targetPath);
  
  // Ensure directory exists
  const targetDir = path.dirname(fullTargetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write file
  await fsPromises.writeFile(fullTargetPath, file.buffer);
  
  // Return the public URL
  return `/uploads/${targetPath}`;
}

export async function deleteImageFromStorage(imagePath) {
  // Extract the file path from the URL
  const relativeFilePath = imagePath.replace(/^\/uploads\//, '');
  const fullPath = path.join(UPLOAD_DIR, relativeFilePath);
  
  try {
    await fsPromises.unlink(fullPath);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${fullPath}:`, error);
    return false;
  }
}
```

### Update Express Server

Add this to your `server/index.ts` before route registration:

```typescript
// Setup static file serving for uploads
app.use('/uploads', express.static(
  process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/public/uploads'
    : path.join(process.cwd(), 'public', 'uploads')
));
```

## Option 2: Using AWS S3 (Recommended for Production)

For a production environment, using AWS S3 or a similar cloud storage solution is recommended.

### Setup Steps:

1. Create an AWS S3 bucket
2. Set up appropriate CORS settings for your S3 bucket
3. Create an IAM user with permissions to read/write to this bucket
4. Add the following environment variables to your Render service:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
   - `AWS_REGION`

### Code Changes Required:

1. Install the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. Create a new file at `server/s3-storage.js`:

```javascript
// server/s3-storage.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

export async function saveImageToS3(file, targetPath) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: targetPath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Return the S3 URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${targetPath}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

export async function deleteImageFromS3(imageUrl) {
  // Extract the object key from the URL
  const urlParts = new URL(imageUrl);
  const key = urlParts.pathname.substring(1); // Remove leading slash
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

export async function getSignedUploadUrl(fileName, contentType) {
  const key = `uploads/${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return {
      uploadUrl: signedUrl,
      fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}
```

## Option 3: Using Cloudinary

Cloudinary offers an excellent image management service with a generous free tier.

### Setup Steps:

1. Create a Cloudinary account
2. Add the following environment variables to your Render service:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Code Changes Required:

1. Install the Cloudinary SDK:

```bash
npm install cloudinary
```

2. Create a new file at `server/cloudinary-storage.js`:

```javascript
// server/cloudinary-storage.js
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to convert buffer to stream
function bufferToStream(buffer) {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
  return readable;
}

export async function uploadImageToCloudinary(file, folder = 'vehicles') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    
    bufferToStream(file.buffer).pipe(uploadStream);
  });
}

export async function deleteImageFromCloudinary(imageUrl) {
  try {
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    
    const fullPublicId = `${folder}/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}
```

## Migrating Existing Images

When moving from Replit to Render, you'll need to migrate existing images:

1. Download all vehicle images from your Replit application
2. Upload them to your new storage solution using one of the methods above
3. Update database records if image paths have changed

### Migration Script Example (for AWS S3):

```javascript
// scripts/migrate-images.js
import fs from 'fs';
import path from 'path';
import { db } from '../server/db.js';
import { vehicles } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { saveImageToS3 } from '../server/s3-storage.js';

async function migrateImages() {
  // Get all vehicles
  const allVehicles = await db.select().from(vehicles);
  
  for (const vehicle of allVehicles) {
    const updatedImages = [];
    
    // Migrate each image
    for (const imagePath of vehicle.images) {
      try {
        // Skip already migrated images (those with full URLs)
        if (imagePath.startsWith('http')) {
          updatedImages.push(imagePath);
          continue;
        }
        
        // Read the image file
        const filePath = path.join(process.cwd(), 'public', imagePath);
        if (!fs.existsSync(filePath)) {
          console.warn(`Image not found: ${filePath}`);
          continue;
        }
        
        const fileBuffer = fs.readFileSync(filePath);
        const fileExt = path.extname(filePath);
        
        // Create a file-like object for the storage adapter
        const file = {
          buffer: fileBuffer,
          mimetype: `image/${fileExt.substring(1)}`,
        };
        
        // Upload to S3
        const s3Path = `vehicles/${vehicle.id}/${path.basename(imagePath)}`;
        const newUrl = await saveImageToS3(file, s3Path);
        
        updatedImages.push(newUrl);
        console.log(`Migrated: ${imagePath} -> ${newUrl}`);
      } catch (error) {
        console.error(`Failed to migrate image ${imagePath}:`, error);
        updatedImages.push(imagePath); // Keep original on failure
      }
    }
    
    // Update the vehicle record with new image URLs
    if (updatedImages.length > 0) {
      await db.update(vehicles)
        .set({ images: updatedImages })
        .where(eq(vehicles.id, vehicle.id));
      
      console.log(`Updated vehicle ${vehicle.id} with new image URLs`);
    }
  }
}

migrateImages()
  .then(() => console.log('Image migration completed'))
  .catch(err => console.error('Migration failed:', err));
```

## Recommended Approach

For simplicity and cost-effectiveness, we recommend Option 1 (Render Disk Storage) for development and small production sites. For larger applications with higher traffic, Option 2 (AWS S3) or Option 3 (Cloudinary) would be more appropriate.

Remember to update the environment variables in your Render service configuration based on your chosen solution.