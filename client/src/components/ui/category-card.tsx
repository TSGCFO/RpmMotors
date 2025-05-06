import { Link } from "wouter";

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
}

export function CategoryCard({ title, image, link }: CategoryCardProps) {
  // Normalize image src path to handle different formats consistently
  const normalizedSrc = (() => {
    if (!image) return '/placeholders/placeholder-category.svg';
    if (image.startsWith('http') || image.startsWith('/')) return image;
    return `/${image}`;
  })();

  return (
    <div className="relative group overflow-hidden rounded-lg shadow-md">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 z-10"></div>
      <img 
        src={normalizedSrc} 
        alt={title} 
        className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.currentTarget.onerror = null; // Prevent infinite error loop
          e.currentTarget.src = '/placeholders/placeholder-category.svg';
        }}
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-['Poppins'] font-bold text-white mb-2">{title}</h3>
          <Link 
            href={link}
            className="inline-block text-white text-sm border-b border-white hover:border-[#E31837] hover:text-[#E31837] transition-colors"
          >
            View Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
