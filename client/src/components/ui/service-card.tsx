import { Link } from "wouter";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
}

export function ServiceCard({ icon, title, description, link }: ServiceCardProps) {
  return (
    <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
        <i className={`${icon} text-2xl text-[#E31837]`}></i>
      </div>
      <h3 className="font-['Poppins'] font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link 
        href={link} 
        className="text-[#E31837] font-semibold hover:text-black transition-colors"
      >
        Learn More
      </Link>
    </div>
  );
}
