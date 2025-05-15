import { useState } from 'react';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUploadComplete: (fileUrl: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export function FileUploader({ onUploadComplete, maxSizeMB = 5, className = '' }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG and WebP images are allowed",
        variant: "destructive"
      });
      return;
    }

    // Create form data for upload
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulated progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          return newProgress;
        });
      }, 200);

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
      e.target.value = '';
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label 
        className={`flex items-center justify-center px-4 py-2 border-2 border-dashed 
                    rounded-md cursor-pointer hover:border-gray-400 
                    transition-all duration-200 
                    ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          {!isUploading ? (
            <>
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="text-sm text-gray-500">
                Click to upload an image (max {maxSizeMB}MB)
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

export function MultiFileUploader({ onUploadComplete, maxSizeMB = 5 }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const filesArray = Array.from(files);
    
    // Validate file sizes and types
    for (const file of filesArray) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSizeMB}MB limit`,
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image type`,
          variant: "destructive"
        });
        return;
      }
    }

    // Create form data with multiple files
    const formData = new FormData();
    filesArray.forEach(file => {
      formData.append('images', file);
    });

    setIsUploading(true);

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload files');
      }

      const data = await response.json();
      
      // Pass the file URLs back to the parent component
      data.files.forEach((file: {url: string}) => {
        onUploadComplete(file.url);
      });
      
      toast({
        title: "Upload successful",
        description: `${filesArray.length} images uploaded successfully`,
      });

      // Reset the file input
      e.target.value = '';
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <label 
        className={`flex items-center justify-center px-4 py-2 border-2 border-dashed 
                    rounded-md cursor-pointer hover:border-gray-400 
                    transition-all duration-200 
                    ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          {!isUploading ? (
            <>
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="text-sm text-gray-500">
                Click to upload multiple images (max {maxSizeMB}MB each)
              </span>
            </>
          ) : (
            <>
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-sm text-blue-500">
                Uploading images...
              </span>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          multiple
        />
      </label>
    </div>
  );
}