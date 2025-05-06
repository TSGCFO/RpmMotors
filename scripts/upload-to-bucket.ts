
import { Client } from '@replit/object-storage';
import fs from 'fs';
import path from 'path';

const client = new Client();

async function uploadFolder(folderPath: string, bucketPath: string) {
  // Read all files in the directory
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  
  for (const file of files) {
    const sourcePath = path.join(folderPath, file.name);
    const targetPath = path.join(bucketPath, file.name);
    
    if (file.isDirectory()) {
      // Recursively upload subdirectories
      await uploadFolder(sourcePath, targetPath);
    } else {
      // Upload individual file
      console.log(`Uploading ${sourcePath} to ${targetPath}...`);
      const { ok, error } = await client.uploadFromFilename(targetPath, sourcePath);
      
      if (!ok) {
        console.error(`Failed to upload ${sourcePath}: ${error}`);
      } else {
        console.log(`Successfully uploaded ${sourcePath}`);
      }
    }
  }
}

// Get command line arguments
const sourceDir = process.argv[2];
const targetPath = process.argv[3] || sourceDir;

if (!sourceDir) {
  console.error('Please provide a source directory');
  console.log('Usage: tsx scripts/upload-to-bucket.ts <source_directory> [target_path]');
  process.exit(1);
}

// Start the upload process
uploadFolder(sourceDir, targetPath)
  .then(() => console.log('Upload completed!'))
  .catch(err => console.error('Upload failed:', err));
