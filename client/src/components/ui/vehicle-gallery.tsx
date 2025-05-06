import { useState } from "react";

interface VehicleGalleryProps {
  photos: string[];
  vehicleName: string;
}

export function VehicleGallery({ photos, vehicleName }: VehicleGalleryProps) {
  const [mainImage, setMainImage] = useState(photos[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleThumbnailClick = (photo: string) => {
    setMainImage(photo);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const navigateLightbox = (direction: number) => {
    const newIndex = (lightboxIndex + direction + photos.length) % photos.length;
    setLightboxIndex(newIndex);
  };

  return (
    <div>
      {/* Main Image */}
      <div 
        className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-md mb-4 cursor-pointer"
        onClick={() => openLightbox(photos.indexOf(mainImage))}
      >
        <img 
          src={mainImage.startsWith('http') || mainImage.startsWith('/') ? mainImage : `/${mainImage}`} 
          alt={vehicleName} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholders/placeholder-car.svg';
          }}
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {photos.map((photo, index) => (
          <div 
            key={index}
            className={`rounded-lg overflow-hidden cursor-pointer transition-opacity ${
              photo === mainImage ? "ring-2 ring-[#E31837]" : "hover:opacity-80"
            }`}
            onClick={() => handleThumbnailClick(photo)}
          >
            <img 
              src={photo.startsWith('http') || photo.startsWith('/') ? photo : `/${photo}`} 
              alt={`${vehicleName} - View ${index + 1}`} 
              className="w-full h-20 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholders/placeholder-car.svg';
              }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 text-white text-3xl z-10"
            onClick={closeLightbox}
          >
            <i className="fas fa-times"></i>
          </button>

          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center z-10"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(-1);
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center z-10"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox(1);
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-8">
            <img 
              src={photos[lightboxIndex].startsWith('http') || photos[lightboxIndex].startsWith('/') ? photos[lightboxIndex] : `/${photos[lightboxIndex]}`} 
              alt={`${vehicleName} - View ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholders/placeholder-car.svg';
              }}
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p>{lightboxIndex + 1} / {photos.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}