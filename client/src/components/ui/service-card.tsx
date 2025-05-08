import { Link, useLocation } from "wouter";

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  link: string;
}

export function ServiceCard({ icon, title, description, link }: ServiceCardProps) {
  const [location] = useLocation();
  
  // Function to handle navigation and scrolling
  const handleLearnMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Check if link is an anchor or full path
    const isAnchorOnly = link.startsWith('#');
    const hasAnchor = link.includes('#');
    
    if (isAnchorOnly && location === '/services') {
      // If we're already on the services page and the link is just an anchor
      const targetId = link.replace('#', '');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (hasAnchor) {
      // If link contains an anchor but is a full path (e.g., "/services#vehicle-sourcing")
      const path = link.split('#')[0];
      const anchor = link.split('#')[1];
      
      // If we're already on the correct page, just scroll
      if (location === path) {
        const targetElement = document.getElementById(anchor);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to the page with anchor
        window.location.href = link;
      }
    } else {
      // Regular navigation for links without anchors
      window.location.href = link;
    }
  };
  
  return (
    <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
        <i className={`${icon} text-2xl text-[#E31837]`}></i>
      </div>
      <h3 className="font-['Poppins'] font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a 
        href={link} 
        onClick={handleLearnMoreClick}
        className="text-[#E31837] font-semibold hover:text-black transition-colors cursor-pointer"
      >
        Learn More
      </a>
    </div>
  );
}
