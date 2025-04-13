import { Link } from "wouter";
import PageMeta from "@/components/seo/page-meta";
import CanonicalUrl from "@/components/seo/canonical-url";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function Sitemap() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Sitemap", href: "/sitemap", current: true }
  ];

  return (
    <main className="bg-[#F5F5F5] py-12 min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title="Sitemap | RPM Auto"
        description="Browse the complete sitemap of RPM Auto's website. Find all pages including inventory, services, gallery, financing, and contact information."
        keywords="sitemap, website map, RPM Auto pages, website navigation, luxury cars"
        canonical="https://rpmauto.com/sitemap"
      />
      <CanonicalUrl path="/sitemap" />
      
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-['Poppins'] font-bold mb-8 text-center">Site Map</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-['Poppins'] font-semibold mb-4 text-[#E31837]">Main Pages</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/inventory" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Inventory
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/financing" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Financing
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-['Poppins'] font-semibold mb-4 text-[#E31837]">Inventory Categories</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/inventory?category=sports-cars" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Sports Cars
                  </Link>
                </li>
                <li>
                  <Link href="/inventory?category=luxury-sedans" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Luxury Sedans
                  </Link>
                </li>
                <li>
                  <Link href="/inventory?category=suvs-crossovers" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    SUVs & Crossovers
                  </Link>
                </li>
                <li>
                  <Link href="/inventory?category=exotic-collection" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Exotic Collection
                  </Link>
                </li>
                <li>
                  <Link href="/inventory?category=convertibles" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Convertibles
                  </Link>
                </li>
                <li>
                  <Link href="/inventory?filter=new-arrivals" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-['Poppins'] font-semibold mb-4 text-[#E31837]">Additional Information</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-700 hover:text-[#E31837] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <a 
                    href="/sitemap.xml" 
                    className="text-gray-700 hover:text-[#E31837] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    XML Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-['Poppins'] font-semibold mb-4 text-[#E31837]">Featured Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/inventory/1" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2023 Porsche 911 GT3
              </Link>
              <Link href="/inventory/2" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2022 Ferrari Roma
              </Link>
              <Link href="/inventory/3" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2023 Lamborghini Huracan
              </Link>
              <Link href="/inventory/4" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2023 Audi R8
              </Link>
              <Link href="/inventory/5" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2022 Mercedes-Benz S-Class
              </Link>
              <Link href="/inventory/6" className="text-gray-700 hover:text-[#E31837] transition-colors">
                2023 BMW M5
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Can't find what you're looking for? <Link href="/contact" className="text-[#E31837] hover:underline">Contact us</Link> for assistance.
          </p>
        </div>
      </div>
    </main>
  );
}