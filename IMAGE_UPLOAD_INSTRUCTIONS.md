# Image Upload Implementation for RPM Auto

This guide explains how to implement direct image uploads in your employee portal. These changes should be added to your GitHub repository to deploy to Render.

## Files to Create or Modify

### 1. Create `server/upload.ts`

```typescript
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
```

### 2. Update `server/index.ts`

Add the following import near the top of the file:
```typescript
import uploadRouter from "./upload";
```

Add this line after the static file middleware (after line that uses `/uploads`):
```typescript
// Use the upload router for file uploads
app.use(uploadRouter);
```

### 3. Update Inventory Form Component

Add this to your inventory form in `client/src/pages/admin/inventory.tsx` to replace the current URL-only image section:

```tsx
// Add these imports at the top of the file
import { useState, useRef } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';

// Add this component inside the file (before the main component)
function ImageUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create form data for upload
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Simulated progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Upload the file
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      // Pass the file URL back to the parent component
      onUploadComplete(data.url);
      
      toast({
        title: "Upload successful",
        description: "Image has been uploaded successfully",
      });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="mb-4">
      <label 
        className={`flex items-center justify-center p-4 border-2 border-dashed 
                   rounded-md cursor-pointer hover:border-gray-400 
                   transition-all duration-200 
                   ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          {!isUploading ? (
            <>
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="text-sm text-gray-500">
                Click to upload an image (max 5MB)
              </span>
            </>
          ) : (
            <>
              {uploadProgress < 100 ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <Check className="w-6 h-6 text-green-500" />
              )}
              <span className="text-sm text-blue-500">
                {uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
              </span>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

// === Then replace the image section in the form with this ===

<div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">
      Images *
    </label>
  </div>
  
  {/* Image Upload Component */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Images
      </label>
      <ImageUploader 
        onUploadComplete={(url) => {
          setFormData({
            ...formData,
            images: [...formData.images, url]
          });
        }}
      />
      <p className="text-xs text-gray-500 mt-1">
        Upload vehicle images directly (JPG, PNG, WebP formats, 5MB max per file)
      </p>
    </div>
    
    {/* Divider */}
    <div className="flex items-center my-2">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="mx-2 text-xs text-gray-500">UPLOADED IMAGES</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
    
    {/* Image Preview */}
    {formData.images.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {formData.images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="h-24 w-full rounded-md overflow-hidden border border-gray-300">
              <img 
                src={image || '/placeholders/placeholder-car.svg'} 
                alt={`Vehicle image ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholders/placeholder-car.svg';
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeImageField(index)}
              className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
            <input
              type="hidden"
              value={image}
              name={`image-${index}`}
            />
            <div className="mt-1 text-xs text-gray-500 truncate">
              {image.split('/').pop() || 'No file selected'}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-sm text-gray-500 italic">
        No images added yet. Upload images above.
      </div>
    )}
    
    {/* Manual URL option */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Or Add Image URL Manually
      </label>
      <div className="flex items-center">
        <input
          type="url"
          id="manual-image-url"
          placeholder="https://example.com/image.jpg"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E31837]"
        />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById('manual-image-url') as HTMLInputElement;
            if (input && input.value) {
              setFormData({
                ...formData,
                images: [...formData.images, input.value]
              });
              input.value = "";
            }
          }}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</div>
```

### 4. Add Required Dependencies

```bash
npm install multer @types/multer uuid @types/uuid
```

## Implementation Steps

1. Add the new `server/upload.ts` file to your GitHub repository
2. Update your `server/index.ts` file with the import and router usage
3. Update your inventory form in `client/src/pages/admin/inventory.tsx`
4. Ensure your package.json includes the required dependencies
5. Push all changes to GitHub

## Render Deployment Configuration

Make sure your Render deployment has the correct environment variable:

- `UPLOAD_DIR`: `/var/data/uploads`

And that you have a disk mount configured in your Render dashboard:
- Mount Path: `/var/data/uploads`
- Size: 10GB (or your preferred size)

This configuration ensures that uploaded images are stored in a persistent location that survives deployments.