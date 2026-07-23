import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Info, Loader2 } from "lucide-react";
import { db } from "@/db";
import { useExerciseStore } from "@/store/useExerciseStore";
import { getMuscleIdsForExercise } from "@/utils/muscleMapper";
import AnatomyMap from "@/components/AnatomyMap";
import { cn } from "@/utils/cn";

interface MuscleRecoveryHeatmapProps {
  isAr?: boolean;
}

export function MuscleRecoveryHeatmap({ isAr }: MuscleRecoveryHeatmapProps) {
  const { exercises, loadExercises } = useExerciseStore();
  const [heatmapIntensity, setHeatmapIntensity] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function calculateRecovery() {
      setIsLoading(true);
      
      // Ensure exercises are loaded for mapping
      if (exercises.length === 0) {
        await loadExercises();
      }
      
      const sessions = await db.workoutSessions.where("completed").equals(1).toArray();
      const intensityMap: Record<string, number> = {};
      const now = new Date().getTime();
      const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

      // Map to store most recent training time for each muscle group
      const lastTrained: Record<string, number> = {};

      sessions.forEach((session) => {
        const sessionTime = new Date(session.date).getTime();
        session.exercises.forEach((ex) => {
          // find exercise in store to get target muscles
          const exerciseData = exercises.find((e) => String(e.id) === String(ex.exerciseId));
          if (exerciseData) {
            const muscleIds = getMuscleIdsForExercise(
              exerciseData.targetEn || exerciseData.target || "",
              exerciseData.secondaryMusclesEn || exerciseData.secondaryMuscles || []
            );
            muscleIds.forEach((mId) => {
              if (!lastTrained[mId] || sessionTime > lastTrained[mId]) {
                lastTrained[mId] = sessionTime;
              }
            });
          }
        });
      });

      // Calculate intensity based on time elapsed
      Object.entries(lastTrained).forEach(([mId, time]) => {
        const elapsed = now - time;
        if (elapsed < FORTY_EIGHT_HOURS) {
          // intensity is 1.0 at 0h, 0.0 at 48h
          // AnatomyMap uses: >0.7 (Red), >0.4 (Orange), >0 (Yellow)
          const intensity = Math.max(0.1, 1 - (elapsed / FORTY_EIGHT_HOURS));
          intensityMap[mId] = intensity;
        }
      });

      setHeatmapIntensity(intensityMap);
      setIsLoading(false);
    }

    calculateRecovery();
  }, [exercises.length, loadExercises]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl border border-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-xs font-black text-text-muted uppercase tracking-widest">
          {isAr ? "جاري حساب الاستشفاء..." : "Calculating Recovery..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-text-primary uppercase tracking-wider">
          <Activity className="h-5 w-5 text-primary" />
          {isAr ? "خريطة استشفاء العضلات 🩺" : "Muscle Recovery Heatmap 🩺"}
        </h2>
      </div>

      <div className="glass-card rounded-[--radius-card] border border-primary/10 overflow-hidden relative bg-gradient-to-br from-bg-elevated/40 to-transparent">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
          {/* Left: Map View */}
          <div className="w-full lg:w-1/2 p-6 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-[220px] aspect-[1/1.6] relative">
               <AnatomyMap heatmapIntensity={heatmapIntensity} readOnly hideHeader hideChips />
            </div>
          </div>
          
          {/* Right: Info & Legend */}
          <div className="flex-1 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/40 space-y-6">
            <div className="space-y-3">
              <p className={cn(
                "text-[13px] text-text-secondary leading-relaxed font-medium",
                isAr ? "text-right" : "text-left"
              )}>
                {isAr 
                  ? "توضح هذه الخريطة حالة تعافي عضلاتك بناءً على آخر تمارينك (نموذج ٤٨ ساعة). العضلات الحمراء هي الأكثر إرهاقاً وتحتاج لراحة."
                  : "This heatmap visualizes your muscle fatigue based on recent training history (48h model). Red areas indicate high fatigue and priority for rest."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-bg-surface/50 border border-border/40 group hover:border-danger/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-danger shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                    {isAr ? "إجهاد عالي" : "High Fatigue"}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-black px-2.5 py-1 rounded-lg bg-danger/10 text-danger tabular-nums">0-12h</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-bg-surface/50 border border-border/40 group hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                    {isAr ? "إجهاد متوسط" : "Moderate Fatigue"}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-black px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-500 tabular-nums">12-36h</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-bg-surface/50 border border-border/40 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary/40 shadow-[0_0_10px_rgba(204,255,0,0.3)]" />
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">
                    {isAr ? "متعافي" : "Recovered"}
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-black px-2.5 py-1 rounded-lg bg-primary/10 text-primary tabular-nums">36h+</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 items-start backdrop-blur-sm">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className={cn(
                "text-[10px] text-primary/80 font-bold italic leading-snug",
                isAr ? "text-right" : "text-left"
              )}>
                {isAr
                  ? "تقديرات مبنية على الوقت المنقضي. التعافي الفعلي يعتمد على النوم والتغذية وشدة التمرين."
                  : "Estimates based on elapsed time. Actual recovery depends on sleep, nutrition, and training intensity."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
