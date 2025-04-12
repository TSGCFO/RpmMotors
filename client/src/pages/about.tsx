import { useEffect } from "react";
import { Link } from "wouter";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { useQuery } from "@tanstack/react-query";
import { Testimonial } from "@shared/schema";

export default function About() {
  useEffect(() => {
    document.title = "About Us | RPM Auto";
  }, []);

  // Fetch testimonials
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  // Team members data
  const teamMembers = [
    {
      name: "Michael Reynolds",
      position: "Founder & CEO",
      bio: "With over 20 years in the luxury automotive industry, Michael founded RPM Auto with a vision to provide an exceptional car buying experience focused on quality and customer satisfaction.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      name: "Sarah Chen",
      position: "Sales Director",
      bio: "Sarah brings 15 years of experience in luxury vehicle sales. Her deep product knowledge and commitment to understanding client needs ensures every customer finds their perfect vehicle.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
    },
    {
      name: "David Thompson",
      position: "Service Manager",
      bio: "A certified master technician with experience at premier European marques, David leads our service department ensuring every vehicle meets our exacting quality standards.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      name: "Rebecca Martinez",
      position: "Finance Manager",
      bio: "Rebecca's expertise in automotive financing helps our clients navigate the complexities of luxury vehicle purchases, ensuring transparent and tailored solutions for every situation.",
      image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    }
  ];

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-black text-white">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">About RPM Auto</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              A premier destination for luxury and exotic vehicles, providing exceptional service and an unparalleled selection of premium automobiles
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                RPM Auto was founded in 2013 with a simple mission: to provide discerning clients with access to the world's most exceptional automobiles, coupled with a purchasing experience that matches the caliber of these vehicles.
              </p>
              <p className="text-gray-700 mb-4">
                What began as a boutique dealership has evolved into one of the premier destinations for luxury and exotic vehicles in the Greater Toronto Area, while maintaining our commitment to personalized service and automotive excellence.
              </p>
              <p className="text-gray-700 mb-4">
                Our founder's passion for extraordinary automobiles and decades of experience in the luxury automotive sector laid the foundation for a business built on expertise, integrity, and an unwavering dedication to customer satisfaction.
              </p>
              <p className="text-gray-700">
                Today, RPM Auto continues to set the standard in the luxury automotive market, offering a carefully curated inventory, comprehensive services, and a team of specialists who share our clients' enthusiasm for exceptional vehicles.
              </p>
            </div>
            <div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1752&q=80" 
                  alt="RPM Auto Dealership" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#E31837] text-white p-6 rounded shadow-lg hidden md:block">
                  <p className="text-3xl font-['Poppins'] font-bold">10+</p>
                  <p className="text-sm uppercase tracking-wider">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at RPM Auto
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-award text-2xl text-[#E31837]"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-3">Excellence</h3>
              <p className="text-gray-600">
                We are committed to excellence in every aspect of our business, from the vehicles we offer to the service we provide.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl text-[#E31837]"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-3">Integrity</h3>
              <p className="text-gray-600">
                We operate with unwavering integrity, building trust through transparency, honesty, and ethical business practices.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-check text-2xl text-[#E31837]"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-3">Client Focus</h3>
              <p className="text-gray-600">
                Our clients are at the heart of everything we do. We listen, understand, and exceed expectations at every opportunity.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search-plus text-2xl text-[#E31837]"></i>
              </div>
              <h3 className="text-xl font-['Poppins'] font-semibold mb-3">Attention to Detail</h3>
              <p className="text-gray-600">
                We believe that perfection lies in the details. Every vehicle we offer is meticulously selected and prepared to the highest standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team of automotive experts is dedicated to providing you with an exceptional experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-['Poppins'] font-bold mb-1">{member.name}</h3>
                  <p className="text-[#E31837] font-semibold mb-4">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear what our valued clients have to say about their experience with RPM Auto
            </p>
          </div>
          
          {isLoadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials?.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Experience the RPM Auto Difference</h2>
            <p className="text-gray-300 mb-8">
              Visit our showroom today to explore our exceptional inventory and meet our team of automotive experts
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/inventory">
                <a className="inline-block px-8 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
                  Browse Inventory
                </a>
              </Link>
              <Link href="/contact">
                <a className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded hover:bg-white hover:text-black transition">
                  Contact Us
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
