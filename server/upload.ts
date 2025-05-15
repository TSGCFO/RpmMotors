import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadDir } from './storage-adapter';
import { Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = getUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create vehicle-specific directories to organize uploads
    const vehicleDir = path.join(uploadDir, 'vehicles');
    if (!fs.existsSync(vehicleDir)) {
      fs.mkdirSync(vehicleDir, { recursive: true });
    }
    cb(null, vehicleDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwriting
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${uniqueId}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

// Set up the multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create upload router
const uploadRouter = Router();

// Single file upload endpoint
uploadRouter.post('/api/upload/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path that can be saved to the database
    const relativePath = path.relative(uploadDir, req.file.path);
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
    
    res.status(201).json({ 
      url: fileUrl,
      filename: req.file.filename,
      message: 'File uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Failed to upload file' });
  }
});

// Multiple file upload endpoint
uploadRouter.post('/api/upload/images', upload.array('images', 10), (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const filesData = files.map(file => {
      const relativePath = path.relative(uploadDir, file.path);
      const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;
      
      return {
        url: fileUrl,
        filename: file.filename
      };
    });

    res.status(201).json({ 
      files: filesData,
      message: 'Files uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: error.message || 'Failed to upload files' });
  }
});

export default uploadRouter;