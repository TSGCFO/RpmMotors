import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Base directory for file uploads
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? process.env.UPLOAD_DIR || '/opt/render/project/src/public/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directory:', error);
}

// Handle file uploads with fallback to Replit Object Storage if available
export const storageAdapter = {
  /**
   * Save an image file to storage (local filesystem or Replit Object Storage)
   * @param file The file object with buffer and mimetype
   * @param targetPath The target path/name for the file
   * @returns The public URL of the saved file
   */
  async saveImage(file: { buffer: Buffer, mimetype: string }, targetPath: string): Promise<string> {
    // If Replit Object Storage is available, use it
    if (process.env.REPL_ID && process.env.REPL_OWNER) {
      try {
        // Dynamically import Replit's Object Storage client only if in Replit environment
        const { Client } = await import('@replit/object-storage');
        const client = new Client();
        
        // Upload the file to Replit's Object Storage
        // For uploadFromBuffer use: client.uploadFromBuffer()
        // But since it might not be available in all versions, use uploadFromFilename with a temp file
        
        // Create a temporary file
        const tempFilePath = path.join(UPLOAD_DIR, `temp_${Date.now()}_${path.basename(targetPath)}`);
        const targetDir = path.dirname(tempFilePath);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Write buffer to temp file
        await fsPromises.writeFile(tempFilePath, file.buffer);
        
        // Upload using the temp file
        const { ok, error } = await client.uploadFromFilename(targetPath, tempFilePath);
        
        // Delete temp file
        try {
          await fsPromises.unlink(tempFilePath);
        } catch (unlinkError) {
          console.error('Error deleting temp file:', unlinkError);
        }
        
        if (!ok) {
          throw new Error(`Failed to upload to Replit Object Storage: ${error}`);
        }
        
        // Return the public URL (assuming standard Replit URL format)
        return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/${targetPath}`;
      } catch (error) {
        console.error('Error using Replit Object Storage, falling back to local storage:', error);
        // Fall back to local storage
      }
    }
    
    // Use local filesystem storage
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
  },
  
  /**
   * Delete an image from storage
   * @param imagePath The path to the image to delete
   * @returns True if deletion was successful, false otherwise
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    // If the image is from Replit Object Storage
    if (imagePath.includes('.repl.co/')) {
      try {
        // Dynamically import Replit's Object Storage client only if in Replit environment
        const { Client } = await import('@replit/object-storage');
        const client = new Client();
        
        // Extract the object key from the URL
        const urlParts = new URL(imagePath);
        const key = urlParts.pathname.substring(1); // Remove leading slash
        
        const { ok, error } = await client.delete(key);
        
        if (!ok) {
          throw new Error(`Failed to delete from Replit Object Storage: ${error}`);
        }
        
        return true;
      } catch (error) {
        console.error('Error deleting from Replit Object Storage:', error);
        return false;
      }
    }
    
    // For local file storage
    try {
      // Extract the file path from the URL
      const relativeFilePath = imagePath.replace(/^\/uploads\//, '');
      const fullPath = path.join(UPLOAD_DIR, relativeFilePath);
      
      if (fs.existsSync(fullPath)) {
        await fsPromises.unlink(fullPath);
        return true;
      }
      
      return false; // File doesn't exist
    } catch (error) {
      console.error(`Failed to delete file ${imagePath}:`, error);
      return false;
    }
  }
};

// Export the upload directory for use in Express static middleware
export const getUploadDir = () => UPLOAD_DIR;