import { useState, useEffect } from 'react';
import { getABTestVariant, trackABTestConversion } from '@/lib/cookieUtils';
import { Link } from 'wouter';

export default function CTABanner() {
  const [variant, setVariant] = useState<string>('A');
  
  useEffect(() => {
    // Get or assign A/B test variant
    const testVariant = getABTestVariant('cta_banner');
    setVariant(testVariant);
  }, []);
  
  const handleClick = () => {
    // Track when a user clicks the CTA
    trackABTestConversion('cta_banner', 'click');
  };
  
  return (
    <section 
      className={`py-12 ${
        variant === 'A' 
          ? 'bg-gradient-to-r from-black to-[#333333]' 
          : 'bg-gradient-to-r from-[#E31837] to-[#ff4c63]'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {variant === 'A' ? (
            // Variant A: Focus on affordability
            <>
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Poppins']">
                  Drive Your Dream Car Today
                </h2>
                <p className="text-gray-300 mb-6">
                  Affordable financing options available. Get pre-approved in minutes with rates as low as 3.99% APR.
                </p>
                <Link href="/financing">
                  <button 
                    className="inline-block bg-[#E31837] text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition duration-300 ease-in-out"
                    onClick={handleClick}
                  >
                    Apply For Financing
                  </button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="relative w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="block text-6xl font-bold text-[#E31837]">3.99%</span>
                    <span className="block text-gray-700 font-semibold">APR</span>
                  </div>
                  <div className="absolute -top-3 -right-3 bg-[#E31837] text-white text-sm py-1 px-3 rounded-full font-bold">
                    LIMITED TIME
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Variant B: Focus on selection/inventory
            <>
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Poppins']">
                  Over 100 Premium Vehicles
                </h2>
                <p className="text-white mb-6">
                  Explore our extensive inventory of luxury and performance vehicles. Find the perfect match for your lifestyle.
                </p>
                <Link href="/inventory">
                  <button 
                    className="inline-block bg-black text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition duration-300 ease-in-out"
                    onClick={handleClick}
                  >
                    Browse Inventory
                  </button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="text-center">
                  <div className="inline-block bg-white rounded-lg py-3 px-6 mb-3 shadow-lg">
                    <span className="block text-[#E31837] font-bold">High-End Selection</span>
                  </div>
                  <div className="inline-block bg-white rounded-lg py-3 px-6 mb-3 shadow-lg ml-4">
                    <span className="block text-[#E31837] font-bold">Premium Brands</span>
                  </div>
                  <div className="inline-block bg-white rounded-lg py-3 px-6 shadow-lg ml-8">
                    <span className="block text-[#E31837] font-bold">Expert Service</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}