import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { RPMLogo } from "@/components/icons/rpm-logo";
import { SearchBar } from "@/components/ui/search-bar";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-black text-white w-full z-50">
      {/* Top Bar */}
      <div className="container mx-auto px-6 py-2 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <div>
            <a href="https://maps.google.com/maps?ll=43.775688,-79.62554&z=13&t=m&hl=en&gl=CA&mapclient=embed&cid=4836009631269035094" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm flex items-center hover:text-[#E31837] transition-colors">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span>6260 Hwy 7 Unit 6, Woodbridge ON, L4H 4G3</span>
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="tel:+1-905-264-1969" className="text-sm flex items-center hover:text-[#E31837] transition-colors">
            <i className="fas fa-phone-alt mr-2"></i>
            <span>(905) 264-1969</span>
          </a>
          <div className="flex space-x-3">
            <a href="#" className="hover:text-[#E31837] transition-colors"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-[#E31837] transition-colors"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-[#E31837] transition-colors"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="logo mb-4 md:mb-0">
            <Link href="/">
              <a className="flex items-center">
                <RPMLogo className="h-40" />
              </a>
            </Link>
          </div>
          
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-white focus:outline-none" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-transform duration-300 ${isMobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-8 font-['Poppins'] font-semibold text-sm uppercase tracking-wide" id="desktop-menu">
            <Link href="/">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>Home</a>
            </Link>
            <Link href="/inventory">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>Inventory</a>
            </Link>
            <Link href="/services">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>Services</a>
            </Link>
            <Link href="/financing">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/financing') ? 'text-[#E31837]' : ''}`}>Financing</a>
            </Link>
            <Link href="/gallery">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>Gallery</a>
            </Link>
            <Link href="/about">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>About Us</a>
            </Link>
            <Link href="/contact">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>Contact Us</a>
            </Link>
          </nav>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden bg-black border-t border-gray-800 px-6 py-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <nav className="flex flex-col space-y-4 font-['Poppins'] font-semibold text-sm uppercase tracking-wide">
            <Link href="/">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>Home</a>
            </Link>
            <Link href="/inventory">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>Inventory</a>
            </Link>
            <Link href="/services">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>Services</a>
            </Link>
            <Link href="/financing">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/financing') ? 'text-[#E31837]' : ''}`}>Financing</a>
            </Link>
            <Link href="/gallery">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>Gallery</a>
            </Link>
            <Link href="/about">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>About Us</a>
            </Link>
            <Link href="/contact">
              <a className={`py-2 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>Contact Us</a>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-[#F5F5F5] py-3 px-6">
        <div className="container mx-auto">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
