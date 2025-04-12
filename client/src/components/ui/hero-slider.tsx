import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface SlideProps {
  image: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

const slides: SlideProps[] = [
  {
    image: "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    title: "Welcome to RPM Auto",
    subtitle: "Premium luxury vehicles with exceptional service",
    primaryButtonText: "Shop Inventory",
    primaryButtonLink: "/inventory",
    secondaryButtonText: "Contact Us",
    secondaryButtonLink: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1664&q=80",
    title: "Exotic Collection",
    subtitle: "Discover our premium selection of exotic vehicles",
    primaryButtonText: "View Collection",
    primaryButtonLink: "/inventory?category=exotic-collection",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about"
  },
  {
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    title: "Luxury Experience",
    subtitle: "Exceptional service and premium vehicles",
    primaryButtonText: "Our Services",
    primaryButtonLink: "/services",
    secondaryButtonText: "Contact Us",
    secondaryButtonLink: "/contact"
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative">
      <div className="hero-slider relative h-[500px] md:h-[600px]">
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/30 z-10"></div>
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="text-center px-6">
                <h1 className="text-4xl md:text-6xl font-['Poppins'] font-bold text-white mb-6">
                  {slide.title}
                </h1>
                <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link 
                    href={slide.primaryButtonLink} 
                    className="inline-block px-8 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
                  >
                    {slide.primaryButtonText}
                  </Link>
                  <Link 
                    href={slide.secondaryButtonLink} 
                    className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded hover:bg-white hover:text-black transition"
                  >
                    {slide.secondaryButtonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slider Controls */}
      <button 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
        onClick={goToPrevSlide}
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <button 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
        onClick={goToNextSlide}
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </section>
  );
}
