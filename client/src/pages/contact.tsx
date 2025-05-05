import { useEffect } from "react";
import { ContactForm } from "@/components/ui/contact-form";
import { MapSection } from "@/components/ui/map-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PageMeta from "@/components/seo/page-meta";
import CanonicalUrl from "@/components/seo/canonical-url";
import JsonLdSchema, { createBreadcrumbSchema } from "@/components/seo/json-ld-schema";
import StructuredData from "@/components/seo/structured-data";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Us | RPM Auto";
  }, []);

  // Prepare SEO metadata
  const pageTitle = "Contact RPM Auto | Luxury Car Dealership in Vaughan";
  const pageDescription = "Contact RPM Auto's sales or service departments. Visit our luxury car dealership in Vaughan, call us at (647) 550-9590, or send us a message online.";
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact", current: true }
  ];
  
  // Prepare business structured data
  const businessData = {
    name: "RPM Auto",
    description: "Premium automotive dealership specializing in luxury and exotic vehicles in the Greater Toronto Area.",
    url: "https://rpmauto.com",
    telephone: "+1-647-550-9590",
    address: {
      streetAddress: "By appointment only",
      addressLocality: "Vaughan",
      addressRegion: "Ontario",
      postalCode: "L4H 0A1",
      addressCountry: "CA"
    },
    geo: {
      latitude: 43.7810,
      longitude: -79.5988
    },
    openingHours: [
      "Mo-Fr 09:00-19:00",
      "Sa 10:00-17:00"
    ],
    image: "https://rpmauto.com/RPM Auto.png",
    priceRange: "$$$$"
  };
  
  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* SEO Components */}
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        keywords="contact RPM Auto, luxury car dealership, Vaughan dealership, car sales, vehicle service, Toronto luxury cars"
        ogType="website"
        ogImage="/RPM Auto.png"
        canonical="https://rpmauto.com/contact"
      />
      <CanonicalUrl path="/contact" />
      
      {/* LocalBusiness structured data */}
      <StructuredData
        type="localBusiness"
        businessData={businessData}
      />
      
      {/* Breadcrumb structured data */}
      <JsonLdSchema
        schema={createBreadcrumbSchema([
          { name: "Home", item: "https://rpmauto.com/" },
          { name: "Contact Us", item: "https://rpmauto.com/contact" }
        ])}
      />
      
      {/* ContactPage schema */}
      <JsonLdSchema
        schema={{
          "@type": "ContactPage",
          "name": "Contact RPM Auto",
          "description": pageDescription,
          "url": "https://rpmauto.com/contact",
          "mainEntity": {
            "@type": "AutoDealer",
            "name": "RPM Auto",
            "telephone": "+1-647-550-9590",
            "email": "fateh@rpmautosales.ca",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "By appointment only",
              "addressLocality": "Vaughan",
              "addressRegion": "Ontario",
              "postalCode": "L4H 0A1",
              "addressCountry": "CA"
            },
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+1-647-550-9590 ext. 1",
                "contactType": "sales",
                "email": "fateh@rpmautosales.ca",
                "availableLanguage": ["English"]
              },
              {
                "@type": "ContactPoint",
                "telephone": "+1-647-550-9590 ext. 3",
                "contactType": "customer service",
                "email": "fateh@rpmautosales.ca",
                "availableLanguage": ["English"]
              }
            ],
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "19:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Saturday"],
                "opens": "10:00",
                "closes": "17:00"
              }
            ]
          }
        }}
      />
      
      {/* Breadcrumb */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Have questions about our inventory or services? Get in touch with our team of automotive experts.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information and Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                We're here to assist you with any inquiries about our vehicles, services, or anything else. Our team of automotive experts is ready to help you find your dream car.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#F5F5F5] p-3 rounded-full mr-4">
                    <i className="fas fa-map-marker-alt text-[#E31837]"></i>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold mb-1">Visit Us</h3>
                    <p className="text-gray-600">By appointment only, Vaughan, Ontario</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#F5F5F5] p-3 rounded-full mr-4">
                    <i className="fas fa-phone-alt text-[#E31837]"></i>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold mb-1">Call Us</h3>
                    <p className="text-gray-600">(647) 550-9590</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#F5F5F5] p-3 rounded-full mr-4">
                    <i className="fas fa-envelope text-[#E31837]"></i>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-600">fateh@rpmautosales.ca</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#F5F5F5] p-3 rounded-full mr-4">
                    <i className="fas fa-clock text-[#E31837]"></i>
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday-Friday: 9 AM - 7 PM</p>
                    <p className="text-gray-600">Saturday: 10 AM - 5 PM</p>
                    <p className="text-gray-600">Sunday: By Appointment</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-['Poppins'] font-semibold mb-3">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-[#F5F5F5] hover:bg-[#E31837] text-gray-600 hover:text-white p-3 rounded-full transition-colors">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="bg-[#F5F5F5] hover:bg-[#E31837] text-gray-600 hover:text-white p-3 rounded-full transition-colors">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="bg-[#F5F5F5] hover:bg-[#E31837] text-gray-600 hover:text-white p-3 rounded-full transition-colors">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="bg-[#F5F5F5] hover:bg-[#E31837] text-gray-600 hover:text-white p-3 rounded-full transition-colors">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-['Poppins'] font-bold mb-6">Send Us a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-['Poppins'] font-bold mb-8 text-center">Department Contacts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-[#E31837] mb-4 text-center">
                <i className="fas fa-car text-4xl"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-4 text-center">Sales Department</h3>
              <div className="flex items-center justify-center mb-2">
                <i className="fas fa-phone-alt mr-2 text-[#E31837]"></i>
                <a href="tel:+1-647-550-9590" className="hover:text-[#E31837] transition-colors">(647) 550-9590 ext. 1</a>
              </div>
              <div className="flex items-center justify-center">
                <i className="fas fa-envelope mr-2 text-[#E31837]"></i>
                <a href="mailto:fateh@rpmautosales.ca" className="hover:text-[#E31837] transition-colors">fateh@rpmautosales.ca</a>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-[#E31837] mb-4 text-center">
                <i className="fas fa-tools text-4xl"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-4 text-center">Service Department</h3>
              <div className="flex items-center justify-center mb-2">
                <i className="fas fa-phone-alt mr-2 text-[#E31837]"></i>
                <a href="tel:+1-647-550-9590" className="hover:text-[#E31837] transition-colors">(647) 550-9590 ext. 3</a>
              </div>
              <div className="flex items-center justify-center">
                <i className="fas fa-envelope mr-2 text-[#E31837]"></i>
                <a href="mailto:fateh@rpmautosales.ca" className="hover:text-[#E31837] transition-colors">fateh@rpmautosales.ca</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <MapSection />
    </main>
  );
}
