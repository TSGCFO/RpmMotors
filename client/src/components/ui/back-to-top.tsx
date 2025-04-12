import { useState, useEffect } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button 
      id="back-to-top" 
      className={`fixed bottom-6 right-6 bg-[#E31837] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition z-50 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <i className="fas fa-chevron-up"></i>
    </button>
  );
}
