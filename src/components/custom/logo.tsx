"use client";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo SVG - Relógio + Moeda */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Relógio (roxo) */}
        <circle
          cx="22"
          cy="24"
          r="16"
          stroke="#800080"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Ponteiros do relógio */}
        <line
          x1="22"
          y1="24"
          x2="22"
          y2="14"
          stroke="#800080"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="24"
          x2="28"
          y2="24"
          stroke="#800080"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Centro do relógio */}
        <circle cx="22" cy="24" r="2" fill="#800080" />
        
        {/* Moeda (verde) - sobreposta e inclinada */}
        <g transform="translate(30, 28) rotate(-15)">
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="#4CAF50"
            stroke="white"
            strokeWidth="2"
          />
          {/* Símbolo $ */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            $
          </text>
        </g>
      </svg>

      {/* Nome do app */}
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${currentSize.text}`}>
          PlannerCell
        </span>
      )}
    </div>
  );
}
