import React from "react";
import { motion } from "framer-motion";
import { FRONT, BACK, FRONT_BODY, BACK_BODY } from "../AnatomyMap";

interface AnatomyModelProps {
  muscleLevels: Record<string, number>; // values 0 to 100
  view: "front" | "back" | "both";
  highlightColor?: "red" | "green" | "cyan" | "yellow";
  isAr?: boolean;
  onMuscleClick?: (muscle: string) => void;
  borderless?: boolean;
}

// Maps any premium muscle group ID to one of the 6 primary categories
const getCategoryForMuscleId = (id: string): string => {
  const lowercaseId = id.toLowerCase();
  
  if (lowercaseId.includes("chest")) return "Chest";
  if (
    lowercaseId.includes("traps") ||
    lowercaseId.includes("back") ||
    lowercaseId.includes("lats") ||
    lowercaseId.includes("neck")
  ) {
    return "Back";
  }
  if (
    lowercaseId.includes("quad") ||
    lowercaseId.includes("femoris") ||
    lowercaseId.includes("vmo") ||
    lowercaseId.includes("adductor") ||
    lowercaseId.includes("gastrocnemius") ||
    lowercaseId.includes("tibialis") ||
    lowercaseId.includes("soleus") ||
    lowercaseId.includes("glute") ||
    lowercaseId.includes("ham") ||
    lowercaseId.includes("gastroc")
  ) {
    return "Legs";
  }
  if (lowercaseId.includes("delt")) return "Shoulders";
  if (
    lowercaseId.includes("biceps") ||
    lowercaseId.includes("forearm") ||
    lowercaseId.includes("triceps")
  ) {
    return "Arms";
  }
  if (
    lowercaseId.includes("abs") ||
    lowercaseId.includes("obliques") ||
    lowercaseId.includes("core")
  ) {
    return "Core";
  }
  return "";
};

export default function AnatomyModel({
  muscleLevels,
  view = "both",
  highlightColor = "green",
  isAr = false,
  onMuscleClick,
  borderless = false,
}: AnatomyModelProps) {
  // Helper to resolve color based on recovery percentage or workout active status
  const getMuscleColor = (id: string) => {
    // Try to get specific muscle level first, then fall back to category
    const category = getCategoryForMuscleId(id);
    const level = muscleLevels[id] ?? muscleLevels[category] ?? 0;
    
    const inactiveColor = "rgba(15, 23, 42, 0.55)"; // subtle dark sci-fi backdrop
    
    if (level === 0 && !muscleLevels[category]) return inactiveColor;
    
    // 1. Worked-intensity mode (highlightColor === "red")
    if (highlightColor === "red") {
      if (level === 0) return inactiveColor;
      return `rgba(163, 230, 53, ${(0.35 + (level / 100) * 0.65).toFixed(2)})`;
    }

    // 2. Recovery theme mode
    if (level === 0) return "rgba(239, 68, 68, 0.5)"; 
    if (level === 100) return "rgba(132, 204, 22, 0.8)";
    
    if (level >= 90) return "rgba(132, 204, 22, 0.75)";
    if (level >= 60) return "rgba(245, 158, 11, 0.7)";
    return "rgba(239, 68, 68, 0.65)";
  };

  const drawFront = () => (
    <svg viewBox="0 0 676.49 1203.49" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[220px] md:max-h-[280px] mx-auto filter drop-shadow-[0_0_8px_rgba(6,182,212,0.15)]">
      {/* Detailed Front Muscles */}
      {FRONT.map((m) => {
        const fillCol = getMuscleColor(m.id);
        const category = getCategoryForMuscleId(m.id);
        const level = muscleLevels[m.id] ?? muscleLevels[category] ?? 0;
        const isActive = level > 0 || (category && muscleLevels[category] > 0);
        
        return (
          <g 
            key={m.id}
            onClick={() => {
              if (onMuscleClick && category) {
                onMuscleClick(category);
              }
            }}
            className={onMuscleClick && category ? "cursor-pointer hover:brightness-125 hover:opacity-95 transition-all duration-200" : ""}
            style={onMuscleClick && category ? { pointerEvents: "all" } : undefined}
          >
            {m.paths.map((d, i) => {
              const strokeColor = isActive 
                ? (highlightColor === "red" ? "rgba(190, 242, 100, 0.9)" : "rgba(255, 255, 255, 0.6)") 
                : "rgba(6, 182, 212, 0.25)";
              return (
                <path
                  key={i}
                  d={d}
                  fill={fillCol}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 1.8 : 1.2}
                  strokeLinejoin="round"
                  style={{ 
                    transition: "all 0.3s ease",
                    filter: isActive ? "drop-shadow(0 0 3px rgba(163, 230, 53, 0.4))" : "none"
                  }}
                />
              );
            })}
          </g>
        );
      })}
      {/* Body Outline Over the muscles for better definition with modern glow */}
      <g opacity="0.85">
        {FRONT_BODY.map((d, i) => (
          <path 
            key={i} 
            d={d} 
            fill="none" 
            stroke="rgba(6, 182, 212, 0.55)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ filter: "drop-shadow(0 0 3px rgba(6, 182, 212, 0.4))" }}
          />
        ))}
      </g>
    </svg>
  );

  const drawBack = () => (
    <svg viewBox="0 0 676.49 1203.49" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[220px] md:max-h-[280px] mx-auto filter drop-shadow-[0_0_8px_rgba(6,182,212,0.15)]">
      {/* Detailed Back Muscles */}
      {BACK.map((m) => {
        const fillCol = getMuscleColor(m.id);
        const category = getCategoryForMuscleId(m.id);
        const level = muscleLevels[m.id] ?? muscleLevels[category] ?? 0;
        const isActive = level > 0 || (category && muscleLevels[category] > 0);
        
        return (
          <g 
            key={m.id}
            onClick={() => {
              if (onMuscleClick && category) {
                onMuscleClick(category);
              }
            }}
            className={onMuscleClick && category ? "cursor-pointer hover:brightness-125 hover:opacity-95 transition-all duration-200" : ""}
            style={onMuscleClick && category ? { pointerEvents: "all" } : undefined}
          >
            {m.paths.map((d, i) => {
              const strokeColor = isActive 
                ? (highlightColor === "red" ? "rgba(190, 242, 100, 0.9)" : "rgba(255, 255, 255, 0.6)") 
                : "rgba(6, 182, 212, 0.25)";
              return (
                <path
                  key={i}
                  d={d}
                  fill={fillCol}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 1.8 : 1.2}
                  strokeLinejoin="round"
                  style={{ 
                    transition: "all 0.3s ease",
                    filter: isActive ? "drop-shadow(0 0 3px rgba(163, 230, 53, 0.4))" : "none"
                  }}
                />
              );
            })}
          </g>
        );
      })}
      {/* Body Outline Over the muscles for better definition with modern glow */}
      <g opacity="0.85">
        {BACK_BODY.map((d, i) => (
          <path 
            key={i} 
            d={d} 
            fill="none" 
            stroke="rgba(6, 182, 212, 0.55)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ filter: "drop-shadow(0 0 3px rgba(6, 182, 212, 0.4))" }}
          />
        ))}
      </g>
    </svg>
  );

  return (
    <div className="flex flex-row justify-center items-center gap-4 md:gap-8 w-full p-2 select-none">
      {(view === "front" || view === "both") && (
        <div className="flex flex-col items-center flex-1 max-w-[140px]">
          <span className="text-[10px] text-text-muted font-extrabold tracking-widest uppercase mb-1.5 opacity-80">
            {isAr ? "الأمام" : "ANTERIOR"}
          </span>
          <div 
            className={borderless ? "w-full relative overflow-hidden" : "w-full border border-neutral-800/80 rounded-3xl p-2 md:p-3 relative overflow-hidden transition-all duration-300 hover:border-neutral-700/60"}
            style={borderless ? {} : {
              background: "radial-gradient(circle at center, rgba(23, 28, 41, 0.95) 0%, rgba(10, 12, 18, 0.99) 100%)",
              boxShadow: "inset 0 0 20px rgba(6, 182, 212, 0.08), 0 8px 30px rgba(0, 0, 0, 0.65)"
            }}
          >
            {drawFront()}
          </div>
        </div>
      )}
      {(view === "back" || view === "both") && (
        <div className="flex flex-col items-center flex-1 max-w-[140px]">
          <span className="text-[10px] text-text-muted font-extrabold tracking-widest uppercase mb-1.5 opacity-80">
            {isAr ? "الخلف" : "POSTERIOR"}
          </span>
          <div 
            className={borderless ? "w-full relative overflow-hidden" : "w-full border border-neutral-800/80 rounded-3xl p-2 md:p-3 relative overflow-hidden transition-all duration-300 hover:border-neutral-700/60"}
            style={borderless ? {} : {
              background: "radial-gradient(circle at center, rgba(23, 28, 41, 0.95) 0%, rgba(10, 12, 18, 0.99) 100%)",
              boxShadow: "inset 0 0 20px rgba(6, 182, 212, 0.08), 0 8px 30px rgba(0, 0, 0, 0.65)"
            }}
          >
            {drawBack()}
          </div>
        </div>
      )}
    </div>
  );
}
