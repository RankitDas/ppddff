"use client";

export function HeroArtwork() {
  return (
    <div className="w-full relative flex items-center justify-center min-h-[350px] overflow-hidden select-none">
      <svg className="w-full max-w-[380px] aspect-square animate-float" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Concentric sketch circles in brand blue */}
        <circle cx="200" cy="200" r="160" stroke="#0A84FF" strokeWidth="2.5" strokeDasharray="6 8" opacity="0.25" />
        <circle cx="200" cy="200" r="110" stroke="#0A84FF" strokeWidth="2" opacity="0.2" />
        <circle cx="200" cy="200" r="70" stroke="#0A84FF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.15" />

        {/* Hand-drawn sketch connector lines */}
        <path d="M 80,100 Q 140,50 200,100 T 320,100" stroke="#111827" strokeWidth="2.5" strokeDasharray="3 5" opacity="0.4" fill="none" />
        <path d="M 100,300 C 140,250 260,250 300,300" stroke="#0A84FF" strokeWidth="2" opacity="0.3" fill="none" />

        {/* Minimalist doodle clouds */}
        {/* Cloud 1 (top left) */}
        <g>
          <path d="M 50,130 C 50,110 75,100 100,110 C 112,100 140,100 152,110 C 165,110 177,122 177,130 Z" fill="#FFFFFF" stroke="#111827" strokeWidth="2.5" />
          <line x1="50" y1="130" x2="177" y2="130" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        
        {/* Cloud 2 (top right) */}
        <g>
          <path d="M 230,120 C 230,105 250,95 270,105 C 280,95 300,95 310,105 C 320,105 330,115 330,120 Z" fill="#FFFFFF" stroke="#111827" strokeWidth="2.5" />
          <line x1="230" y1="120" x2="330" y2="120" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Cloud 3 (center right) */}
        <g>
          <path d="M 240,200 C 240,175 270,165 300,180 C 315,165 348,165 362,180 C 378,180 392,192 392,200 Z" fill="#FFFFFF" stroke="#111827" strokeWidth="2.5" />
          <line x1="240" y1="200" x2="392" y2="200" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Cloud 4 (bottom left) */}
        <g>
          <path d="M 80,260 C 80,245 100,235 120,245 C 130,235 150,235 160,245 C 170,245 180,255 180,260 Z" fill="#FFFFFF" stroke="#111827" strokeWidth="2.5" />
          <line x1="80" y1="260" x2="180" y2="260" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Flying bird doodles */}
        <path d="M 120,70 C 128,58 138,58 145,70 C 152,58 162,58 170,70" stroke="#111827" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M 260,260 C 265,252 272,252 276,260 C 280,252 287,252 292,260" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Hand-drawn upload arrow */}
        <g>
          <circle cx="200" cy="200" r="22" fill="#FFFFFF" stroke="#111827" strokeWidth="2.5" />
          {/* Arrow */}
          <path d="M 200,188 V 212 M 193,205 L 200,212 L 207,205" stroke="#0A84FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating hand-drawn node circles */}
        <circle cx="90" cy="190" r="4.5" fill="#0A84FF" stroke="#111827" strokeWidth="2" />
        <circle cx="310" cy="150" r="3.5" fill="#22C55E" stroke="#111827" strokeWidth="1.5" />
      </svg>
      
      <style jsx>{`
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
