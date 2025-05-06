import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Vehicle, Testimonial } from "@shared/schema";
import { HeroSlider } from "@/components/ui/hero-slider";
import { CategoryCard } from "@/components/ui/category-card";
import { CarCard } from "@/components/ui/car-card";
import { ServiceCard } from "@/components/ui/service-card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { ContactForm } from "@/components/ui/contact-form";
import { MapSection } from "@/components/ui/map-section";
import { OptimizedImage } from "@/components/ui/optimized-image";
import CTABanner from "@/components/ui/cta-banner";
import PersonalizedRecommendations from "@/components/ui/personalized-recommendations";
import PageMeta from "@/components/seo/page-meta";
import StructuredData from "@/components/seo/structured-data";
import CanonicalUrl from "@/components/seo/canonical-url";
import JsonLdSchema, { createBusinessSchema, createFaqSchema } from "@/components/seo/json-ld-schema";

export default function Home() {
  // Fetch featured vehicles
  const { data: featuredVehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles/featured"],
  });
  
  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });
  
  // Business data for structured data
  const businessData = {
    name: "RPM Auto",
    description: "RPM Auto in Vaughan has New and Used Luxury Cars and SUVs for sale. Premium selection of luxury and exotic vehicles.",
    url: "https://rpmauto.com",
    telephone: "(647) 550-9590",
    address: {
      streetAddress: "By appointment only",
      addressLocality: "Vaughan",
      addressRegion: "Ontario",
      postalCode: "L4H 0A1",
      addressCountry: "CA"
    },
    geo: {
      latitude: 43.7856,
      longitude: -79.5857
    },
    openingHours: [
      "Monday 9:00-19:00",
      "Tuesday 9:00-19:00",
      "Wednesday 9:00-19:00",
      "Thursday 9:00-19:00",
      "Friday 9:00-19:00",
      "Saturday 10:00-17:00",
      "Sunday 11:00-16:00"
    ],
    image: "/RPM Auto.png",
    priceRange: "$$$$"
  };
  
  const categories = [
    {
      title: "Sports Cars",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      link: "/inventory?category=sports-cars"
    },
    {
      title: "Luxury Sedans",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      link: "/inventory?category=luxury-sedans"
    },
    {
      title: "SUVs & Crossovers",
      image: "https://images.unsplash.com/photo-1519245160967-4b32fb941b54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      link: "/inventory?category=suvs-crossovers"
    },
    {
      title: "Exotic Collection",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      link: "/inventory?category=exotic-collection"
    }
  ];
  
  const services = [
    {
      icon: "fas fa-car",
      title: "Vehicle Sourcing",
      description: "We can source specific makes and models tailored to your preferences and requirements.",
      link: "/services#vehicle-sourcing"
    },
    {
      icon: "fas fa-exchange-alt",
      title: "Trade-In Options",
      description: "Get the best value for your current vehicle with our competitive trade-in program.",
      link: "/services#trade-in"
    },
    {
      icon: "fas fa-money-check-alt",
      title: "Financing Solutions",
      description: "Customize your payment plan with our flexible financing options for all credit situations.",
      link: "/financing"
    },
    {
      icon: "fas fa-clipboard-check",
      title: "Vehicle Inspection",
      description: "Each vehicle undergoes a comprehensive inspection to ensure premium quality and performance.",
      link: "/services#inspection"
    },
    {
      icon: "fas fa-file-contract",
      title: "Extended Warranty",
      description: "Protect your investment with our tailored extended warranty packages for peace of mind.",
      link: "/services#warranty"
    },
    {
      icon: "fas fa-handshake",
      title: "Consignment Service",
      description: "Let us handle the sale of your luxury vehicle with our professional consignment service.",
      link: "/services#consignment"
    }
  ];

  return (
    <main>
      {/* SEO Components */}
      <PageMeta 
        title="RPM Auto: New & Used Luxury Cars Dealer | Vaughan, Ontario"
        description="RPM Auto in Vaughan has New and Used Luxury Cars and SUVs for sale. Premium selection of luxury and exotic vehicles with expert service."
        keywords="luxury cars, exotic cars, premium vehicles, car dealership, Vaughan, Toronto, Ontario, sports cars, SUVs, financing, auto service"
        ogType="website"
        ogImage="/RPM Auto.png"
        canonical="https://rpmauto.com/"
      />
      <CanonicalUrl path="/" />
      <StructuredData 
        type="localBusiness"
        businessData={businessData}
      />
      {/* JSON-LD Schema for more detailed structured data */}
      <JsonLdSchema
        schema={createBusinessSchema({
          name: "RPM Auto",
          description: "Premium luxury and exotic car dealership in Vaughan, Ontario offering a curated selection of high-end vehicles.",
          url: "https://rpmauto.com",
          telephone: "(647) 550-9590",
          address: {
            streetAddress: "By appointment only",
            addressLocality: "Vaughan",
            addressRegion: "Ontario",
            postalCode: "L4H 0A1",
            addressCountry: "CA"
          },
          geo: {
            latitude: 43.7856,
            longitude: -79.5857
          },
          openingHours: [
            "Monday 9:00-19:00",
            "Tuesday 9:00-19:00",
            "Wednesday 9:00-19:00",
            "Thursday 9:00-19:00",
            "Friday 9:00-19:00",
            "Saturday 10:00-17:00",
            "Sunday 11:00-16:00"
          ],
          image: "https://rpmauto.com/RPM Auto.png",
          priceRange: "$$$$",
          sameAs: [
            "https://www.facebook.com/rpmauto",
            "https://www.instagram.com/rpmauto",
            "https://twitter.com/rpmauto"
          ]
        })}
      />
      {/* FAQ schema for common questions */}
      <JsonLdSchema
        schema={createFaqSchema([
          {
            question: "What types of vehicles does RPM Auto offer?",
            answer: "RPM Auto specializes in premium and exotic vehicles, including luxury sedans, sports cars, SUVs, and collectible exotic cars from top manufacturers."
          },
          {
            question: "Does RPM Auto offer financing options?",
            answer: "Yes, we offer customized financing solutions for all credit situations. Our finance experts work with multiple lenders to find the best rates and terms."
          },
          {
            question: "Can RPM Auto help me find a specific vehicle?",
            answer: "Absolutely! Our vehicle sourcing service can help you locate specific makes and models tailored to your preferences and requirements."
          },
          {
            question: "Does RPM Auto accept trade-ins?",
            answer: "Yes, we offer competitive trade-in evaluations. Get the best value for your current vehicle with our trade-in program."
          }
        ])}
      />
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Explore Our Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of premium luxury vehicles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard 
                key={index}
                title={category.title}
                image={category.image}
                link={category.link}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Vehicles */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-2">Featured Vehicles</h2>
              <p className="text-gray-600">Explore our premium selection of luxury vehicles</p>
            </div>
            <Link 
              href="/inventory" 
              className="hidden md:inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
            >
              View All
            </Link>
          </div>
          
          {isLoadingVehicles ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md h-[460px] animate-pulse">
                  <div className="w-full h-56 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="space-y-2 w-2/5">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                      </div>
                      <div className="space-y-2 w-2/5">
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded mt-6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles?.map((vehicle) => (
                <CarCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/inventory" 
              className="inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
            >
              View All Inventory
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our comprehensive range of services designed to enhance your luxury car buying experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard 
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                link={service.link}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* About Us Preview */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <div className="relative">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1752&q=80" 
                  alt="RPM Auto Dealership Interior View" 
                  className="w-full h-[400px] object-cover rounded-lg shadow-xl"
                  width={1752}
                  height={1168}
                  priority={true}
                />
                <div className="absolute -bottom-6 -left-6 bg-[#E31837] text-white p-6 rounded shadow-lg hidden md:block">
                  <p className="text-3xl font-['Poppins'] font-bold">10+</p>
                  <p className="text-sm uppercase tracking-wider">Years of Excellence</p>
                </div>
              </div>
            </div>
            
            <div className="lg:order-1">
              <div className="md:max-w-lg">
                <h2 className="text-3xl font-['Poppins'] font-bold mb-6">About RPM Auto</h2>
                <p className="mb-6 text-gray-300">
                  At RPM Auto, we specialize in premium and exotic vehicles, providing a curated selection of the world's most desirable automobiles. Our team of automotive enthusiasts is dedicated to delivering an exceptional buying experience.
                </p>
                <p className="mb-8 text-gray-300">
                  With over a decade of experience in the luxury automotive industry, we've built our reputation on trust, quality, and unparalleled customer service. Each vehicle in our inventory is hand-selected and thoroughly inspected to ensure the highest standards of performance and reliability.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link 
                    href="/about" 
                    className="inline-block px-6 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
                  >
                    Learn More About Us
                  </Link>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center text-white hover:text-[#E31837] transition-colors"
                  >
                    <span className="mr-2">Contact Us</span>
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Personalized Recommendations */}
      <PersonalizedRecommendations />
      
      {/* Testimonials */}
      <section className="py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Client Testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear what our valued clients have to say about their experience with RPM Auto</p>
          </div>
          
          {isLoadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-lg shadow-md animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
                  <div className="h-20 bg-gray-300 rounded mb-6"></div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-400 rounded-full mr-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials?.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Contact Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions about our inventory or services? Contact our team of automotive experts today.
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
                    <p className="text-gray-600">info@rpmauto.com</p>
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
              <div className="bg-[#F5F5F5] p-8 rounded-lg">
                <h3 className="text-2xl font-['Poppins'] font-bold mb-6">Send Us a Message</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* A/B Tested CTA Banner */}
      <CTABanner />
      
      {/* Map Section */}
      <MapSection />
    </main>
  );
}
