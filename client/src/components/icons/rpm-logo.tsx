interface LogoProps {
  className?: string;
}

export function RPMLogo({ className = "h-10" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 1000 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RPM Auto Logo"
    >
      {/* Semi-circular speedometer/gauge */}
      <g transform="translate(500, 250)">
        <circle cx="0" cy="0" r="100" fill="none" />
        <path
          d="M-70,-70 L-40,-90 L-20,-95 L0,-100 L20,-95 L40,-90 L70,-70"
          stroke="#888888"
          strokeWidth="20"
          fill="none"
        />
        <path
          d="M-90,-50 L-80,-65 L-70,-80 L-60,-85 L-50,-90 L-40,-93 L-30,-95 L-20,-97 L-10,-98 L0,-99 L10,-98 L20,-97 L30,-95 L40,-93 L50,-90 L60,-85 L70,-80 L80,-65 L90,-50"
          stroke="#666666"
          strokeWidth="12"
          fill="none"
          strokeDasharray="15 8"
        />
        {/* Needle */}
        <circle cx="0" cy="0" r="12" fill="#333333" />
        <circle cx="0" cy="0" r="8" fill="#222222" />
        <line x1="0" y1="0" x2="0" y2="-75" stroke="#444444" strokeWidth="6" strokeLinecap="round" />
      </g>
      
      {/* Sports car silhouette */}
      <path 
        d="M250,450 C300,430 320,400 340,380 C360,360 390,350 420,350 C450,350 480,355 500,370 L550,370 C580,370 610,365 640,350 C670,335 700,330 730,350 C760,370 790,390 800,410 C820,440 830,470 800,480 C760,490 700,480 650,470 C600,460 550,455 500,455 C450,455 400,460 350,470 C300,480 240,490 200,480 C170,470 180,440 200,410 C210,390 220,380 250,450 Z" 
        fill="none" 
        stroke="#555555" 
        strokeWidth="3"
      />
      
      {/* Rear wing/spoiler */}
      <path
        d="M710,350 L740,320 L770,350"
        fill="none"
        stroke="#555555"
        strokeWidth="3"
      />
      
      {/* Windows/details */}
      <path
        d="M390,370 L420,350 L480,355 L520,370"
        fill="none"
        stroke="#555555"
        strokeWidth="2"
      />
      <circle cx="350" cy="420" r="10" fill="none" stroke="#555555" strokeWidth="2" />
      <circle cx="650" cy="420" r="10" fill="none" stroke="#555555" strokeWidth="2" />
      
      {/* Text */}
      <text x="310" y="530" fontFamily="Arial" fontWeight="bold" fontSize="80" fill="#e31837">RPM</text>
      <text x="550" y="530" fontFamily="Arial" fontWeight="bold" fontSize="80" fill="#ffffff">AUTO</text>
    </svg>
  );
}
