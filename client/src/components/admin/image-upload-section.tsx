import { X } from 'lucide-react';
import { MultiFileUploader } from '../ui/file-uploader';

interface ImageUploadSectionProps {
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (index: number) => void;
}

export function ImageUploadSection({ images, onAddImage, onRemoveImage }: ImageUploadSectionProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Images *
        </label>
      </div>
      
      {/* Image Upload Component */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Images
        </label>
        <MultiFileUploader 
          onUploadComplete={(fileUrl) => {
            onAddImage(fileUrl);
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload vehicle images directly (JPG, PNG, WebP formats, 5MB max per file)
        </p>
      </div>
      
      {/* Divider */}
      <div className="flex items-center my-2">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-xs text-gray-500">OR ENTER IMAGE URLS</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      {/* URL Input Fields */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Image URLs
        </label>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {images.map((image, index) => (
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
                  onClick={() => onRemoveImage(index)}
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
            No images added yet. Upload images or add URLs manually.
          </div>
        )}
        
        <div className="flex items-center mb-2">
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
                onAddImage(input.value);
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
  );
}