import { useEffect } from "react";
import { Link } from "wouter";
import { ServiceCard } from "@/components/ui/service-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PageMeta from "@/components/seo/page-meta";
import StructuredData from "@/components/seo/structured-data";
import CanonicalUrl from "@/components/seo/canonical-url";
import ServicesSchema from "@/components/seo/services-schema";
import JsonLdSchema, { createBreadcrumbSchema } from "@/components/seo/json-ld-schema";

export default function Services() {
  useEffect(() => {
    document.title = "Services | RPM Auto";
  }, []);

  const services = [
    {
      id: "vehicle-sourcing",
      icon: "fas fa-car",
      title: "Vehicle Sourcing",
      description: "We can source specific makes and models tailored to your preferences and requirements.",
      details: "Our extensive network of suppliers and dealers allows us to find virtually any vehicle you desire. Whether you're looking for a rare exotic car, a specific luxury model, or a unique configuration, our team will work tirelessly to locate and secure your dream car. We handle all the logistics, from initial search to delivery, ensuring a seamless experience."
    },
    {
      id: "trade-in",
      icon: "fas fa-exchange-alt",
      title: "Trade-In Options",
      description: "Get the best value for your current vehicle with our competitive trade-in program.",
      details: "Our professional appraisers will evaluate your vehicle based on its condition, market value, and demand. We pride ourselves on offering fair and competitive trade-in values. Trade-ins can be applied directly toward your new purchase, simplifying the transaction and potentially reducing sales tax implications. We handle all paperwork and make the process as efficient as possible."
    },
    {
      id: "inspection",
      icon: "fas fa-clipboard-check",
      title: "Vehicle Inspection",
      description: "Each vehicle undergoes a comprehensive inspection to ensure premium quality and performance.",
      details: "Our multi-point inspection process is conducted by factory-trained technicians who examine every aspect of the vehicle. This includes mechanical components, electrical systems, cosmetic condition, and road testing. We provide a detailed report outlining the condition of the vehicle, any repairs performed, and service history. All vehicles must meet our stringent quality standards before being offered for sale."
    },
    {
      id: "warranty",
      icon: "fas fa-file-contract",
      title: "Extended Warranty",
      description: "Protect your investment with our tailored extended warranty packages for peace of mind.",
      details: "We offer several warranty options to protect your investment beyond the manufacturer's coverage. Our plans cover mechanical breakdown, electrical issues, and can include roadside assistance. Options range from basic powertrain coverage to comprehensive bumper-to-bumper protection. Our team will help you select the warranty that provides the right level of protection for your driving habits and intended ownership period."
    },
    {
      id: "consignment",
      icon: "fas fa-handshake",
      title: "Consignment Service",
      description: "Let us handle the sale of your luxury vehicle with our professional consignment service.",
      details: "Our consignment service offers a hassle-free alternative to private selling. We handle all aspects of the sale, from professional photography and detailed listings to managing inquiries and negotiations. Your vehicle will be displayed in our showroom and marketed through our extensive network. We handle all paperwork and financial transactions, providing you with security and peace of mind."
    }
  ];

  // Prepare SEO metadata
  const pageTitle = "Luxury Car Services | RPM Auto";
  const pageDescription = "Explore our premium automotive services including vehicle sourcing, trade-ins, inspections, warranties and consignment at RPM Auto in Woodbridge, ON.";
  
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services", current: true }
  ];
  
  // Prepare business structured data
  const businessData = {
    name: "RPM Auto",
    description: "Premium automotive services for luxury and exotic vehicles in the Greater Toronto Area.",
    url: "https://rpmauto.com",
    telephone: "+1-905-264-1969",
    address: {
      streetAddress: "123 Main Street",
      addressLocality: "Woodbridge",
      addressRegion: "ON",
      postalCode: "L4H 0A1",
      addressCountry: "CA"
    },
    geo: {
      latitude: 43.7810,
      longitude: -79.5988
    },
    openingHours: [
      "Mo-Fr 09:00-18:00",
      "Sa 10:00-16:00"
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
        keywords="luxury car services, vehicle sourcing, trade-in, vehicle inspection, extended warranty, consignment, luxury cars, Woodbridge, Toronto"
        ogType="website"
        ogImage="/RPM Auto.png"
        canonical="https://rpmauto.com/services"
      />
      <CanonicalUrl path="/services" />
      
      {/* LocalBusiness structured data */}
      <StructuredData
        type="localBusiness"
        businessData={businessData}
      />
      
      {/* Breadcrumb structured data */}
      <JsonLdSchema
        schema={createBreadcrumbSchema([
          { name: "Home", item: "https://rpmauto.com/" },
          { name: "Services", item: "https://rpmauto.com/services" }
        ])}
      />
      
      {/* Services specific schema */}
      <ServicesSchema
        businessName="RPM Auto"
        businessUrl="https://rpmauto.com"
        services={services.map(service => ({
          name: service.title,
          description: service.description,
          url: `https://rpmauto.com/services#${service.id}`,
          image: `https://rpmauto.com/services/${service.id}.svg`,
          provider: {
            name: "RPM Auto",
            url: "https://rpmauto.com"
          },
          serviceType: "AutomotiveServices",
          areaServed: {
            addressLocality: "Woodbridge",
            addressRegion: "ON",
            postalCode: "L4H 0A1",
            addressCountry: "CA"
          },
          availableChannel: {
            name: "RPM Auto Service Center",
            serviceUrl: "https://rpmauto.com/contact"
          }
        }))}
      />
      
      {/* Breadcrumb */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="bg-black text-white py-16 relative">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover our comprehensive range of services designed to enhance your luxury car buying experience
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                icon={service.icon}
                title={service.title}
                description={service.description}
                link={`#${service.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Individual Service Sections */}
      {services.map((service, index) => (
        <section 
          key={service.id} 
          id={service.id} 
          className={`py-16 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}`}
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="text-center p-6 lg:p-0 lg:text-left">
                  <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
                    <i className={`${service.icon} text-2xl text-[#E31837]`}></i>
                  </div>
                  <h2 className="text-3xl font-['Poppins'] font-bold mb-6">{service.title}</h2>
                  <p className="text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0">
                    {service.details}
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                    <Link href="/contact" className="inline-block px-6 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
                      Inquire About This Service
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="rounded-lg overflow-hidden shadow-xl bg-white p-4">
                  <img 
                    src={`/services/${service.id}.svg`} 
                    alt={service.title} 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Ready to Experience Our Premium Services?</h2>
            <p className="text-gray-300 mb-8">
              Contact our team of automotive experts today to learn more about how we can assist you with your luxury vehicle needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/contact" className="inline-block px-8 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
                Contact Us
              </Link>
              <Link href="/inventory" className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded hover:bg-white hover:text-black transition">
                Browse Inventory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
