import { Link } from "wouter";

export function MapSection() {
  return (
    <section className="h-96 bg-gray-100 relative">
      <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h3 className="font-['Poppins'] font-bold text-2xl mb-4">Find Us</h3>
          <p className="text-gray-600 mb-4">By appointment only, Vaughan, Ontario</p>
          <a 
            href="https://maps.google.com/maps?ll=43.834856,-79.508934&z=13&t=m&hl=en&gl=CA&mapclient=embed&q=RPM+Auto+Vaughan+Ontario" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-6 py-2 bg-[#E31837] text-white font-['Poppins'] font-semibold rounded hover:bg-opacity-90 transition"
          >
            Get Directions
          </a>
        </div>
      </div>
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2879.3083795305384!2d-79.5111229!3d43.8348564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2efa7a0c9c55%3A0x42ac466d0de4fa3e!2sRPM%20Auto!5e0!3m2!1sen!2sca!4v1689190193633!5m2!1sen!2sca"
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen={true} 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="RPM Auto Location"
      ></iframe>
    </section>
  );
}
