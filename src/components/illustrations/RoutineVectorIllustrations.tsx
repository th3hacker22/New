import React from "react";

interface VectorProps {
  className?: string;
  glowColor?: string;
}

/**
 * Push Day Vector Illustration - Chest, Shoulders, Triceps press mechanics
 * Premium SVG vector art with glowing lime accents and geometric force vectors
 */
export const PushDayIllustration: React.FC<VectorProps> = ({
  className = "w-full h-full",
  glowColor = "#ccff00",
}) => {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a3e600" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="pushGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient background glow */}
      <circle cx="100" cy="70" r="60" fill="url(#pushGlow)" />

      {/* Grid accents */}
      <path
        d="M20 110 H180 M30 120 H170"
        stroke={glowColor}
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Bench Press / Push Mechanics Vector Artwork */}
      {/* Bench Structure */}
      <path
        d="M50 110 L60 85 H140 L150 110 M75 85 V110 M125 85 V110"
        stroke="#4B5563"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Bench Pad */}
      <rect
        x="65"
        y="80"
        width="70"
        height="8"
        rx="4"
        fill="#1F2937"
        stroke="#374151"
        strokeWidth="1.5"
      />

      {/* Force / Push Vector Lines (Upward motion) */}
      <path
        d="M80 65 L80 35 M100 60 L100 25 M120 65 L120 35"
        stroke={glowColor}
        strokeWidth="2"
        strokeDasharray="2 3"
        strokeLinecap="round"
        opacity="0.8"
      />
      <polygon points="100,18 94,28 106,28" fill={glowColor} />
      <polygon points="80,28 76,35 84,35" fill={glowColor} opacity="0.7" />
      <polygon points="120,28 116,35 124,35" fill={glowColor} opacity="0.7" />

      {/* Barbell Assembly */}
      {/* Bar */}
      <path
        d="M25 40 H175"
        stroke="#E5E7EB"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Knurling center marks */}
      <path d="M85 40 H115" stroke={glowColor} strokeWidth="4" strokeDasharray="1 2" />

      {/* Plates Left */}
      <rect x="35" y="20" width="8" height="40" rx="3" fill="#111827" stroke={glowColor} strokeWidth="2" filter="url(#glowFilter)" />
      <rect x="45" y="25" width="6" height="30" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
      <rect x="29" y="30" width="4" height="20" rx="1" fill="#374151" />

      {/* Plates Right */}
      <rect x="157" y="20" width="8" height="40" rx="3" fill="#111827" stroke={glowColor} strokeWidth="2" filter="url(#glowFilter)" />
      <rect x="149" y="25" width="6" height="30" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
      <rect x="167" y="30" width="4" height="20" rx="1" fill="#374151" />

      {/* Stylized Chest / Deltoid Muscle Vector Silhouette */}
      <path
        d="M82 72 Q100 62 118 72 Q128 80 100 90 Q72 80 82 72 Z"
        fill="url(#pushGradient)"
        stroke={glowColor}
        strokeWidth="1.5"
      />
      
      {/* Shoulder / Arm push lines */}
      <circle cx="70" cy="72" r="6" fill={glowColor} opacity="0.8" />
      <circle cx="130" cy="72" r="6" fill={glowColor} opacity="0.8" />
    </svg>
  );
};

/**
 * Pull Day Vector Illustration - Back V-Taper, Pulldown & Rowing mechanics
 * Premium SVG vector art with glowing cyan accents
 */
export const PullDayIllustration: React.FC<VectorProps> = ({
  className = "w-full h-full",
  glowColor = "#06b6d4",
}) => {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="pullGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="100" cy="65" r="60" fill="url(#pullGlow)" />

      {/* Top Cable Pulley Machine Header */}
      <path d="M100 10 V30 M30 30 H170" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="20" r="5" fill="#1F2937" stroke={glowColor} strokeWidth="1.5" />

      {/* Cable Lines downward */}
      <path d="M50 30 L65 50 M150 30 L135 50" stroke={glowColor} strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Lat Pulldown Wide Bar */}
      <path
        d="M40 50 Q100 56 160 50"
        stroke="#E5E7EB"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Handles with neon grips */}
      <path d="M35 52 L45 48" stroke={glowColor} strokeWidth="5" strokeLinecap="round" />
      <path d="M155 48 L165 52" stroke={glowColor} strokeWidth="5" strokeLinecap="round" />

      {/* Downward Pull Motion Force Vectors */}
      <path
        d="M65 58 V85 M100 62 V92 M135 58 V85"
        stroke={glowColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <polygon points="100,98 94,88 106,88" fill={glowColor} />
      <polygon points="65,90 61,82 69,82" fill={glowColor} opacity="0.7" />
      <polygon points="135,90 131,82 139,82" fill={glowColor} opacity="0.7" />

      {/* V-Taper Back Muscle Anatomy Silhouette Vector */}
      <path
        d="M60 58 Q100 65 140 58 L125 105 Q100 115 75 105 Z"
        fill="url(#pullGradient)"
        stroke={glowColor}
        strokeWidth="1.5"
      />

      {/* Inner Lat & Traps Muscle Contours */}
      <path
        d="M85 70 Q100 80 115 70 M90 85 Q100 92 110 85"
        stroke="#E0F2FE"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
};

/**
 * Leg Day Vector Illustration - Squat Rack, Quads, Hamstrings & Power mechanics
 * Premium SVG vector art with glowing emerald accents
 */
export const LegDayIllustration: React.FC<VectorProps> = ({
  className = "w-full h-full",
  glowColor = "#10b981",
}) => {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="legGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="legGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="100" cy="70" r="60" fill="url(#legGlow)" />

      {/* Ground Platform */}
      <path d="M25 120 H175" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 120 L30 130 M160 120 L170 130" stroke={glowColor} strokeWidth="1.5" opacity="0.4" />

      {/* Squat Rack Uprights */}
      <path d="M45 25 V120 M155 25 V120" stroke="#4B5563" strokeWidth="3" />
      {/* J-Hooks */}
      <path d="M42 60 H52 M148 60 H158" stroke={glowColor} strokeWidth="2.5" />

      {/* Heavy Squat Barbell */}
      <path d="M20 58 H180" stroke="#F3F4F6" strokeWidth="4" strokeLinecap="round" />
      
      {/* Large Bumper Plates Left */}
      <rect x="32" y="30" width="10" height="56" rx="3" fill="#111827" stroke={glowColor} strokeWidth="2" />
      <rect x="22" y="35" width="8" height="46" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1.5" />

      {/* Large Bumper Plates Right */}
      <rect x="158" y="30" width="10" height="56" rx="3" fill="#111827" stroke={glowColor} strokeWidth="2" />
      <rect x="170" y="35" width="8" height="46" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1.5" />

      {/* Biomechanical Squat Angle Vectors (Quads & Glutes) */}
      {/* Quad Muscle Silhouette */}
      <path
        d="M75 75 Q100 68 125 75 L118 115 Q100 122 82 115 Z"
        fill="url(#legGradient)"
        stroke={glowColor}
        strokeWidth="1.5"
      />

      {/* Biomechanical Force Arcs */}
      <path
        d="M60 100 Q100 115 140 100"
        stroke={glowColor}
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <circle cx="100" cy="95" r="4" fill={glowColor} />
      <path d="M88 88 L100 95 L112 88" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Full Body / Cardio & Core Vector Illustration - Kettlebell, Dumbbell & Conditioning
 * Premium SVG vector art with glowing purple/violet accents
 */
export const FullBodyIllustration: React.FC<VectorProps> = ({
  className = "w-full h-full",
  glowColor = "#a855f7",
}) => {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="fullGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="fullGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="100" cy="70" r="60" fill="url(#fullGlow)" />

      {/* Dynamic Motion Ring */}
      <circle
        cx="100"
        cy="70"
        r="48"
        stroke={glowColor}
        strokeWidth="1.5"
        strokeDasharray="6 6"
        opacity="0.6"
      />

      {/* Kettlebell Vector Center */}
      <path
        d="M85 45 Q100 35 115 45 V55 H85 Z"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="100"
        cy="80"
        r="28"
        fill="url(#fullGradient)"
        stroke={glowColor}
        strokeWidth="2"
      />
      <circle cx="100" cy="80" r="12" fill="#111827" stroke={glowColor} strokeWidth="1" />

      {/* Dumbbell Left */}
      <g transform="translate(35, 65) rotate(-25)">
        <rect x="0" y="8" width="40" height="4" fill="#E5E7EB" rx="1" />
        <rect x="6" y="0" width="6" height="20" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
        <rect x="28" y="0" width="6" height="20" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
      </g>

      {/* Dumbbell Right */}
      <g transform="translate(125, 50) rotate(25)">
        <rect x="0" y="8" width="40" height="4" fill="#E5E7EB" rx="1" />
        <rect x="6" y="0" width="6" height="20" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
        <rect x="28" y="0" width="6" height="20" rx="2" fill="#1F2937" stroke={glowColor} strokeWidth="1" />
      </g>

      {/* Pulse / Heartbeat Conditioning Wave */}
      <path
        d="M20 115 H60 L70 100 L80 125 L90 110 L100 115 H180"
        stroke={glowColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
