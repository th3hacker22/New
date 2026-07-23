import { motion } from "motion/react";
import { cn } from "@/utils/cn";
import { Info } from "lucide-react";

interface WeeklyVolumeProps {
  data: { muscle: string; sets: number }[];
  isAr?: boolean;
}

const MUSCLE_TARGETS: Record<string, { min: number; max: number }> = {
  "Chest": { min: 10, max: 20 },
  "Back": { min: 10, max: 20 },
  "Quads": { min: 10, max: 20 },
  "Hamstrings": { min: 8, max: 15 },
  "Shoulders": { min: 8, max: 15 },
  "Triceps": { min: 6, max: 12 },
  "Biceps": { min: 6, max: 12 },
  "Abs": { min: 5, max: 10 },
  "Calves": { min: 5, max: 10 },
};

export function WeeklyVolumeTarget({ data, isAr }: WeeklyVolumeProps) {
  // Map Arabic muscle names if needed or just use as is
  const getProgress = (muscle: string, sets: number) => {
    const target = MUSCLE_TARGETS[muscle] || { min: 8, max: 15 };
    const progress = (sets / target.max) * 100;
    return Math.min(100, progress);
  };

  const getStatusColor = (muscle: string, sets: number) => {
    const target = MUSCLE_TARGETS[muscle] || { min: 8, max: 15 };
    if (sets === 0) return "bg-bg-elevated";
    if (sets < target.min) return "bg-warning";
    if (sets <= target.max) return "bg-success";
    return "bg-primary"; // Overreaching
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
          {isAr ? "حجم التدريب الأسبوعي (مجموعات)" : "Weekly Set Volume"}
        </h3>
        <div className="group relative">
          <Info className="h-3.5 w-3.5 text-text-muted cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 w-48 scale-0 rounded-lg bg-bg-card p-2 text-[10px] text-text-primary shadow-xl transition-all group-hover:scale-100 z-50 border border-border">
            {isAr 
              ? "الهدف المثالي للمتوسطين هو ١٠-٢٠ مجموعة قوية لكل عضلة أسبوعياً."
              : "Advanced lifters typically aim for 10-20 hard sets per muscle group per week."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              {isAr ? "لا توجد تمارين هذا الأسبوع" : "No workouts logged this week"}
            </p>
          </div>
        ) : (
          data.map((item, idx) => {
            const target = MUSCLE_TARGETS[item.muscle] || { min: 8, max: 15 };
            const progress = getProgress(item.muscle, item.sets);
            const colorClass = getStatusColor(item.muscle, item.sets);
            
            return (
              <div key={idx} className="space-y-1.5 relative z-10">
                <div className="flex items-center justify-between px-1 relative z-20">
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-tighter drop-shadow-md">
                    {item.muscle}
                  </span>
                  <div className="flex items-center gap-1.5 drop-shadow-md">
                    <span className="text-[10px] font-bold text-text-muted">
                      {item.sets} / {target.max}
                    </span>
                    {item.sets >= target.min && item.sets <= target.max && (
                      <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    )}
                  </div>
                </div>
                
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-bg-elevated/50 border border-border/30 z-0">
                  {/* Target Range Indicator */}
                  <div 
                    className="absolute inset-y-0 bg-success/10 border-x border-success/20"
                    style={{ 
                      left: `${(target.min / target.max) * 100}%`,
                      right: 0
                    }}
                  />
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-colors duration-500",
                      colorClass
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-warning" />
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Under</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Optimal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Over</span>
        </div>
      </div>
    </div>
  );
}
