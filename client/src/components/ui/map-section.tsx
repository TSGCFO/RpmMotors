import { Link } from "wouter";

export function MapSection() {
  return (
    <section className="h-96 bg-gray-100 relative">
      <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h3 className="font-['Poppins'] font-bold text-2xl mb-4">Find Us</h3>
          <p className="text-gray-600 mb-4">11623 Yonge St., Unit 4, Richmond Hill, ON L4E 3N8</p>
          <a 
            href="https://maps.google.com/maps?daddr=11623+Yonge+St+Unit+4,+Richmond+Hill,+ON+L4E+3N8" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
          >
            Get Directions
          </a>
        </div>
      </div>
      <iframe 
        src="https://www.google.com/maps?q=11623+Yonge+St+Unit+4,+Richmond+Hill,+ON+L4E+3N8&output=embed"
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="RPM Auto Location - 11623 Yonge St., Unit 4, Richmond Hill"
      ></iframe>
    </section>
  );
}
