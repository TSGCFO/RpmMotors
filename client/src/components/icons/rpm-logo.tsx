interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-10" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 1000 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RPM Auto Logo"
    >
      <g transform="translate(320, 250)">
        {/* Speedometer circle */}
        <circle cx="0" cy="0" r="120" fill="#272727" />
        <circle cx="0" cy="0" r="110" fill="none" stroke="#8a8a8a" strokeWidth="20" strokeDasharray="51 19" />
        
        {/* Needle */}
        <circle cx="0" cy="0" r="15" fill="#3a3a3a" />
        <circle cx="0" cy="0" r="8" fill="#1a1a1a" />
        <line x1="0" y1="0" x2="60" y2="-80" stroke="#3a3a3a" strokeWidth="6" strokeLinecap="round" />
      </g>
      
      {/* Car silhouette */}
      <path 
        d="M200,380 C280,340 370,330 500,330 C630,330 720,340 800,380 L850,380 C870,380 880,370 880,350 L880,320 C840,320 830,310 830,290 L830,270 C830,250 840,240 870,240 C860,230 840,220 810,220 C780,220 770,230 770,250 L770,260 C720,250 630,245 500,245 C370,245 280,250 230,260 L230,250 C230,230 220,220 190,220 C160,220 140,230 130,240 C160,240 170,250 170,270 L170,290 C170,310 160,320 120,320 L120,350 C120,370 130,380 150,380 L200,380 Z" 
        fill="none" 
        stroke="#3a3a3a" 
        strokeWidth="3"
      />
      
      {/* Text */}
      <text x="313" y="440" fontFamily="Arial" fontWeight="bold" fontSize="80" fill="#e31837">RPM</text>
      <text x="515" y="440" fontFamily="Arial" fontWeight="bold" fontSize="80" fill="#ffffff">AUTO</text>
    </svg>
  );
}
