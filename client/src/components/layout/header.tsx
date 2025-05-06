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

  // Check if current location is employee portal
  const isEmployeePortal = location.startsWith('/employee');
  
  return (
    <header className={`relative ${isEmployeePortal ? 'bg-gray-900' : 'bg-black'} text-white w-full z-50`} role="banner" aria-label="Main Header">
      {isEmployeePortal && (
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E31837]"></div>
      )}
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 pb-3 px-4">
          {/* Logo Section */}
          <div className="logo-sect mb-3 md:mb-0">
            <Link href="/">
              <RPMLogo className="h-24 w-auto" />
            </Link>
          </div>

          {/* Contact Section */}
          <div className="contact-sect flex flex-col md:flex-row items-center">
            <div className="dealer-static-info mb-3 md:mb-0">
              <ul className="contact-list flex flex-col md:flex-row items-center md:items-start">
                <li className="address mb-2 md:mb-0 md:mr-4">
                  <a 
                    href="#" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center hover:text-[#E31837] transition-colors text-sm"
                  >
                    <i className="icon-contact-icons-08 mr-2"></i>
                    <span className="hidden md:inline">By appointment only<br />Vaughan, Ontario</span>
                    <span className="md:hidden">Visit Us</span>
                  </a>
                </li>
                <li className="hidden md:block h-8 w-px bg-gray-700 mx-3"></li>
                <li className="phone mb-2 md:mb-0 md:mr-4">
                  <a 
                    href="tel:+1-647-550-9590" 
                    className="flex items-center hover:text-[#E31837] transition-colors text-sm"
                  >
                    <i className="icon-phone-dark mr-2"></i>
                    <span>(647) 550-9590</span>
                  </a>
                </li>
                <li className="hidden md:block h-8 w-px bg-gray-700 mx-3"></li>
                <li className="social-sect">
                  <ul className="social-list flex space-x-2">
                    <li>
                      <a href="#" className="w-8 h-8 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-80 transition-opacity">
                        <i className="fab fa-facebook-f text-white text-sm"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="w-8 h-8 rounded-full bg-[#e4405f] flex items-center justify-center hover:opacity-80 transition-opacity">
                        <i className="fab fa-youtube text-white text-sm"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="w-8 h-8 rounded-full bg-[#cd201f] flex items-center justify-center hover:opacity-80 transition-opacity">
                        <i className="fab fa-instagram text-white text-sm"></i>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Search Bar - Desktop */}
            <div className="search-bar ml-0 md:ml-4 mt-3 md:mt-0 w-full md:w-auto">
              <SearchBar />
            </div>
            
            {/* Employee Portal Link */}
            <div className="employee-portal ml-0 md:ml-4 mt-3 md:mt-0">
              <Link href="/employee">
                <Button 
                  variant="outline" 
                  className="bg-transparent text-white border-white hover:bg-[#E31837] hover:text-white hover:border-[#E31837] text-xs uppercase font-semibold tracking-wide"
                >
                  <i className="fas fa-user-tie mr-2"></i>
                  Employee Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className={`${isEmployeePortal ? 'bg-gray-900' : 'bg-black'} border-t border-gray-800`}>
        <div className="container mx-auto">
          {/* Mobile Menu Button */}
          <div className="md:hidden px-4 py-4 flex justify-between items-center">
            <span className="font-semibold text-sm uppercase flex items-center">
              <RPMLogo className="h-8 w-auto mr-2" />
              Menu
            </span>
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <nav className="flex justify-center" role="navigation" aria-label="Main Navigation">
              <ul className="flex font-['Poppins'] font-semibold text-sm uppercase tracking-wide">
                <li>
                  <Link href="/" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>
                    Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/services" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/about" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden border-t border-gray-800 px-4 py-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <nav role="navigation" aria-label="Mobile Navigation">
              <ul className="flex flex-col space-y-4 font-['Poppins'] font-semibold text-sm uppercase tracking-wide">
                <li>
                  <Link href="/" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>
                    Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/services" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/about" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>
                    Contact Us
                  </Link>
                </li>
                <li className="border-t border-gray-800 pt-4 mt-2">
                  <Link href="/employee" className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/employee') ? 'text-[#E31837]' : ''}`}>
                    <span className="flex items-center">
                      <i className="fas fa-user-tie mr-2"></i>
                      Employee Portal
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
