import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Base directory for file uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || 
  (process.env.NODE_ENV === 'production'
    ? '/var/data/uploads'
    : path.join(process.cwd(), 'public', 'uploads'));

console.log(`Using image upload directory: ${UPLOAD_DIR}`);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log(`Creating upload directory: ${UPLOAD_DIR}`);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Storage adapter for handling file operations in different environments
 * Works with both Replit and Render.com
 */
export const storageAdapter = {
  /**
   * Save an image file to storage (local filesystem or Replit Object Storage)
   * @param file The file object with buffer and mimetype
   * @param targetPath The target path/name for the file
   * @returns The public URL of the saved file
   */
  async saveImage(file: { buffer: Buffer, mimetype: string }, targetPath: string): Promise<string> {
    try {
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
    } catch (error: any) {
      console.error('Error saving image:', error);
      throw new Error(`Failed to save image: ${error?.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Delete an image from storage
   * @param imagePath The path to the image to delete
   * @returns True if deletion was successful, false otherwise
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      // First, check if this is a full URL or a relative path
      if (imagePath.startsWith('http')) {
        console.log('Cannot delete remote URL:', imagePath);
        return false;
      }
      
      // Extract the file path from the URL
      const relativeFilePath = imagePath.replace(/^\/uploads\//, '');
      const fullPath = path.join(UPLOAD_DIR, relativeFilePath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        console.log('File not found for deletion:', fullPath);
        return false;
      }
      
      await fsPromises.unlink(fullPath);
      console.log('Successfully deleted file:', fullPath);
      return true;
    } catch (error: any) {
      console.error(`Failed to delete file ${imagePath}:`, error);
      return false;
    }
  }
};

// Export the upload directory for use in Express static middleware
export const getUploadDir = () => UPLOAD_DIR;