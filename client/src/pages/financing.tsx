import { useEffect } from "react";
import { Link } from "wouter";
import { FinancingCalculator } from "@/components/ui/financing-calculator";
import { ContactForm } from "@/components/ui/contact-form";

export default function Financing() {
  useEffect(() => {
    document.title = "Financing | RPM Auto";
  }, []);

  const financingOptions = [
    {
      title: "Traditional Financing",
      description: "Traditional auto loans with competitive interest rates and flexible terms. We work with multiple lenders to find the best rates for your credit profile.",
      icon: "fas fa-university"
    },
    {
      title: "Leasing Options",
      description: "Lease a luxury vehicle with lower monthly payments and the option to upgrade to a new model every few years. Perfect for those who enjoy driving the latest models.",
      icon: "fas fa-file-contract"
    },
    {
      title: "In-House Financing",
      description: "Our in-house financing options can help clients with unique credit situations. We believe everyone deserves to drive a quality vehicle.",
      icon: "fas fa-house-user"
    },
    {
      title: "International Financing",
      description: "Special financing programs for international clients and foreign nationals. We understand the unique requirements and can create customized solutions.",
      icon: "fas fa-globe-americas"
    }
  ];

  const faqs = [
    {
      question: "What credit score do I need to qualify for financing?",
      answer: "While a higher credit score typically results in better rates, we work with lenders who specialize in various credit profiles. We've successfully arranged financing for clients with scores ranging from poor to excellent."
    },
    {
      question: "How long can I finance a luxury vehicle?",
      answer: "Term lengths typically range from 24 to 84 months. Exotic and high-end luxury vehicles may qualify for extended terms up to 96 or 120 months through specialized lenders."
    },
    {
      question: "Is a down payment required?",
      answer: "Down payment requirements vary based on the vehicle, your credit profile, and financing terms. Generally, a down payment of 10-20% is recommended, but we offer options with little to no down payment for qualified buyers."
    },
    {
      question: "Can I get pre-approved before finding a vehicle?",
      answer: "Yes, we recommend getting pre-approved. This gives you a clear budget and strengthens your negotiating position. Pre-approval typically takes 24-48 hours and is valid for 30 days."
    },
    {
      question: "Do you offer refinancing on existing auto loans?",
      answer: "Yes, we can help you refinance your current vehicle to potentially lower your interest rate or monthly payment, even if you didn't purchase your vehicle from us."
    }
  ];

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black text-white py-16">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-['Poppins'] font-bold mb-6">Financing Solutions</h1>
            <p className="text-xl text-gray-300 mb-8">
              Flexible financing options tailored to help you drive the luxury vehicle of your dreams
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a href="#calculator" className="inline-block px-8 py-3 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition">
                Explore Payment Options
              </a>
              <Link href="/contact">
                <a className="inline-block px-8 py-3 bg-transparent border-2 border-white text-white font-['Poppins'] font-semibold rounded hover:bg-white hover:text-black transition">
                  Speak With a Specialist
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Financing Options</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a variety of financing solutions to suit your individual needs and financial situation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {financingOptions.map((option, index) => (
              <div key={index} className="bg-[#F5F5F5] p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#E31837] rounded-full flex items-center justify-center mr-4">
                    <i className={`${option.icon} text-white text-xl`}></i>
                  </div>
                  <h3 className="text-xl font-['Poppins'] font-bold">{option.title}</h3>
                </div>
                <p className="text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Calculator */}
      <section id="calculator" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Payment Calculator</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estimate your monthly payments with our financing calculator
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <FinancingCalculator vehiclePrice={100000} />
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-['Poppins'] font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our financing process
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 py-6">
                <h3 className="text-xl font-['Poppins'] font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-['Poppins'] font-bold mb-6">Ready to Take the Next Step?</h2>
              <p className="text-gray-600 mb-6">
                Our finance specialists are ready to help you explore your options and find the best solution for your needs. Complete the form to get started.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="text-[#E31837] mr-3 mt-1">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <p>Competitive interest rates from multiple lending partners</p>
                </li>
                <li className="flex items-start">
                  <div className="text-[#E31837] mr-3 mt-1">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <p>Specialized financing programs for luxury and exotic vehicles</p>
                </li>
                <li className="flex items-start">
                  <div className="text-[#E31837] mr-3 mt-1">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <p>Quick approval process, often within 24 hours</p>
                </li>
                <li className="flex items-start">
                  <div className="text-[#E31837] mr-3 mt-1">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <p>Personalized service from our experienced finance team</p>
                </li>
              </ul>
              <div className="bg-black text-white p-6 rounded-lg">
                <h3 className="text-xl font-['Poppins'] font-semibold mb-3">Contact Our Finance Department</h3>
                <div className="flex items-center mb-3">
                  <i className="fas fa-phone-alt mr-3 text-[#E31837]"></i>
                  <a href="tel:+1-905-264-1969" className="hover:text-[#E31837] transition-colors">(905) 264-1969</a>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-[#E31837]"></i>
                  <a href="mailto:finance@rpmauto.com" className="hover:text-[#E31837] transition-colors">finance@rpmauto.com</a>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-['Poppins'] font-bold mb-6">Financing Inquiry</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
