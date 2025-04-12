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
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 pb-3 px-4">
          {/* Logo Section */}
          <div className="logo-sect mb-3 md:mb-0">
            <Link href="/">
              <a>
                <RPMLogo className="h-16" />
              </a>
            </Link>
          </div>

          {/* Contact Section */}
          <div className="contact-sect flex flex-col md:flex-row items-center">
            <div className="dealer-static-info mb-3 md:mb-0">
              <ul className="contact-list flex flex-col md:flex-row items-center md:items-start">
                <li className="address mb-2 md:mb-0 md:mr-4">
                  <a 
                    href="https://maps.google.com/maps?ll=43.775688,-79.62554&z=13&t=m&hl=en&gl=CA&mapclient=embed&cid=4836009631269035094" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center hover:text-[#E31837] transition-colors text-sm"
                  >
                    <i className="icon-contact-icons-08 mr-2"></i>
                    <span className="hidden md:inline">6260 Hwy 7 Unit 6,<br />Woodbridge ON, L4H 4G3</span>
                    <span className="md:hidden">Visit Us</span>
                  </a>
                </li>
                <li className="hidden md:block h-8 w-px bg-gray-700 mx-3"></li>
                <li className="phone mb-2 md:mb-0 md:mr-4">
                  <a 
                    href="tel:+1-905-264-1969" 
                    className="flex items-center hover:text-[#E31837] transition-colors text-sm"
                  >
                    <i className="icon-phone-dark mr-2"></i>
                    <span>(905) 264-1969</span>
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
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div className="bg-black border-t border-gray-800">
        <div className="container mx-auto">
          {/* Mobile Menu Button */}
          <div className="md:hidden px-4 py-4 flex justify-between items-center">
            <span className="font-semibold text-sm uppercase">Menu</span>
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
            <nav className="flex justify-center">
              <ul className="flex font-['Poppins'] font-semibold text-sm uppercase tracking-wide">
                <li>
                  <Link href="/">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/inventory">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>Inventory</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>Services</a>
                  </Link>
                </li>
                <li>
                  <Link href="/financing">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/financing') ? 'text-[#E31837]' : ''}`}>Financing</a>
                  </Link>
                </li>
                <li>
                  <Link href="/gallery">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>Gallery</a>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>About Us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className={`block py-4 px-6 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>Contact Us</a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden border-t border-gray-800 px-4 py-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <nav>
              <ul className="flex flex-col space-y-4 font-['Poppins'] font-semibold text-sm uppercase tracking-wide">
                <li>
                  <Link href="/">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/') ? 'text-[#E31837]' : ''}`}>Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/inventory">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/inventory') ? 'text-[#E31837]' : ''}`}>Inventory</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/services') ? 'text-[#E31837]' : ''}`}>Services</a>
                  </Link>
                </li>
                <li>
                  <Link href="/financing">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/financing') ? 'text-[#E31837]' : ''}`}>Financing</a>
                  </Link>
                </li>
                <li>
                  <Link href="/gallery">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/gallery') ? 'text-[#E31837]' : ''}`}>Gallery</a>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/about') ? 'text-[#E31837]' : ''}`}>About Us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className={`block py-2 hover:text-[#E31837] transition-colors ${isActive('/contact') ? 'text-[#E31837]' : ''}`}>Contact Us</a>
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
