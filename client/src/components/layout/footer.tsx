import { Link } from "wouter";
import { RPMLogo } from "@/components/icons/rpm-logo";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8" role="contentinfo" aria-label="Site Footer">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Column */}
          <div>
            <div className="mb-6">
              <RPMLogo className="h-20 w-auto" />
            </div>
            <p className="text-gray-400 mb-6">
              RPM Auto specializes in premium and exotic vehicles, providing a curated selection of the world's most desirable automobiles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#E31837] transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#E31837] transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#E31837] transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#E31837] transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins'] font-bold text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3" role="navigation" aria-label="Footer Navigation">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Inventory
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Vehicle Categories */}
          <div>
            <h4 className="font-['Poppins'] font-bold text-xl mb-6">Vehicle Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/inventory?category=sports-cars" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Sports Cars
                </Link>
              </li>
              <li>
                <Link href="/inventory?category=luxury-sedans" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Luxury Sedans
                </Link>
              </li>
              <li>
                <Link href="/inventory?category=suvs-crossovers" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  SUVs & Crossovers
                </Link>
              </li>
              <li>
                <Link href="/inventory?category=exotic-collection" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Exotic Collection
                </Link>
              </li>
              <li>
                <Link href="/inventory?category=convertibles" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  Convertibles
                </Link>
              </li>
              <li>
                <Link href="/inventory?filter=new-arrivals" className="text-gray-400 hover:text-[#E31837] transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-['Poppins'] font-bold text-xl mb-6">Contact Information</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-[#E31837]"></i>
                <span className="text-gray-400">By appointment only, Vaughan, Ontario</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-[#E31837]"></i>
                <span className="text-gray-400">(647) 550-9590</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-[#E31837]"></i>
                <span className="text-gray-400">fateh@rpmautosales.ca</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-clock mt-1 mr-3 text-[#E31837]"></i>
                <div className="text-gray-400">
                  <p>Mon-Fri: 9AM - 7PM</p>
                  <p>Saturday: 10AM - 5PM</p>
                  <p>Sunday: By Appointment</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500">© {new Date().getFullYear()} RPM Auto. All rights reserved.</p>
          <div className="mt-4 space-x-4 text-sm">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-[#E31837] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/terms" className="text-gray-500 hover:text-[#E31837] transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/sitemap" className="text-gray-500 hover:text-[#E31837] transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
