import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  glow?: boolean;
  size?: number;
}

export default function ReLiftLogo({ className, glow = true, size = 100 }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "transition-all duration-300",
          glow && "drop-shadow-[0_0_15px_rgba(204,255,0,0.55)]"
        )}
      >
        {/* Outer glowing sci-fi target rings with gaps */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#ccff00"
          strokeWidth="1.2"
          strokeDasharray="180 30 15 30"
          strokeLinecap="round"
          className="origin-center animate-[spin_12s_linear_infinite]"
          opacity="0.9"
        />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#ccff00"
          strokeWidth="0.8"
          strokeDasharray="40 90 20 80"
          strokeLinecap="round"
          className="origin-center animate-[spin_8s_linear_infinite_reverse]"
          opacity="0.6"
        />
        
        {/* Inner precise guide ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#ccff00"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          opacity="0.3"
        />

        {/* Core dark backplate inside rings to pop the 'R' */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="#0a0a0a"
          stroke="#ccff00"
          strokeWidth="0.8"
          opacity="0.8"
        />

        {/* Tiny tech crosshair dots */}
        <circle cx="50" cy="11" r="1" fill="#ccff00" opacity="0.8" />
        <circle cx="50" cy="89" r="1" fill="#ccff00" opacity="0.8" />
        <circle cx="11" cy="50" r="1" fill="#ccff00" opacity="0.8" />
        <circle cx="89" cy="50" r="1" fill="#ccff00" opacity="0.8" />

        {/* The gorgeous slanted, high-performance athletic 'R' */}
        <g transform="translate(1, 0)">
          <path
            d="M 38 28 
               L 57 28 
               C 66 28, 71 31.5, 71 38 
               C 71 43, 67 47, 58 49 
               L 66.5 72 
               L 55 72 
               L 47.5 52 
               L 41.5 52 
               L 35.5 72 
               L 26 72 
               Z 
               M 44.5 44 
               L 54 44 
               C 57.5 44, 59.5 42.5, 59.5 40 
               C 59.5 37.5, 57.5 36, 54 36 
               L 47 36 
               Z"
            fill="#ccff00"
            stroke="#ccff00"
            strokeWidth="0.5"
          />
        </g>
      </svg>
    </div>
  );
}
