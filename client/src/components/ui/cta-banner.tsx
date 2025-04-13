import { Link } from 'wouter';
import ABTest from './ab-test';

export default function CTABanner() {
  return (
    <section className="py-12 bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="container mx-auto px-6">
        <ABTest
          testName="homepage_cta_design"
          defaultVariant="variant_a"
          conversionAction="click_cta"
          variants={{
            // Variant A: Modern, minimalist design with single button
            variant_a: (
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl font-['Poppins'] font-bold mb-6">
                  Ready to Find Your Dream Car?
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Our inventory is constantly updated with the finest luxury and performance vehicles.
                </p>
                <Link 
                  href="/inventory" 
                  className="inline-block px-8 py-4 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded-md hover:bg-opacity-90 transition text-lg"
                >
                  Explore Our Inventory
                </Link>
              </div>
            ),
            
            // Variant B: Dual-CTA with more urgency and FOMO
            variant_b: (
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 md:mr-12 md:max-w-2xl">
                  <h2 className="text-3xl font-['Poppins'] font-bold mb-4">
                    Don't Miss Out on Your Perfect Vehicle
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Luxury vehicles sell quickly. Our inventory changes regularly, so act fast to secure the car of your dreams. Schedule a test drive today!
                  </p>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <Link 
                      href="/inventory" 
                      className="px-6 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded-md hover:bg-opacity-90 transition text-center"
                    >
                      View Inventory
                    </Link>
                    <Link 
                      href="/contact" 
                      className="px-6 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded-md hover:bg-white hover:text-black transition text-center"
                    >
                      Schedule Test Drive
                    </Link>
                  </div>
                </div>
                <div className="bg-[#E31837] py-6 px-8 rounded-lg text-center">
                  <p className="text-sm uppercase tracking-wider font-semibold mb-2">Limited Time Offer</p>
                  <p className="text-2xl font-['Poppins'] font-bold mb-2">Financing from 2.9%</p>
                  <p className="text-sm mb-4">On selected models. Offer ends soon.</p>
                  <Link 
                    href="/financing" 
                    className="inline-block px-6 py-2 bg-white text-[#E31837] font-['Poppins'] font-semibold rounded-md hover:bg-gray-100 transition"
                  >
                    Get Pre-Approved
                  </Link>
                </div>
              </div>
            )
          }}
        />
      </div>
    </section>
  );
}