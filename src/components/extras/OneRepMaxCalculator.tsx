import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Dumbbell, Sparkles, HelpCircle, Activity, ChevronRight, 
  Check, Percent, Flame, RefreshCw, Trophy, Scale
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OneRepMaxCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

export default function OneRepMaxCalculator({ isOpen, onClose, isAr = false }: OneRepMaxCalculatorProps) {
  const [weight, setWeight] = useState<string>("80");
  const [reps, setReps] = useState<number>(5);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  // Calculate 1RM using Epley and Brzycki formulas
  const numWeight = parseFloat(weight) || 0;
  const epley = numWeight * (1 + reps / 30);
  const brzycki = numWeight / (1.0278 - 0.0278 * reps);
  
  // Use average of both for stability, or handle edge cases
  const estimated1RM = reps === 1 
    ? numWeight 
    : reps > 10 
      ? epley // Brzycki can get unstable above 10 reps
      : (epley + brzycki) / 2;

  const final1RM = Math.round(estimated1RM * 10) / 10;

  // Strength targets (percentages)
  const percentages = [
    { percent: 100, reps: 1, intensity: isAr ? "القوة القصوى" : "Max Strength" },
    { percent: 95, reps: 2, intensity: isAr ? "القوة القصوى" : "Max Strength" },
    { percent: 90, reps: 3, intensity: isAr ? "القوة المفرطة" : "Power / Strength" },
    { percent: 85, reps: 5, intensity: isAr ? "البناء العضلي المكثف" : "Strength / Hypertrophy" },
    { percent: 80, reps: 8, intensity: isAr ? "البناء العضلي (تضخيم)" : "Hypertrophy (Size)" },
    { percent: 75, reps: 10, intensity: isAr ? "البناء العضلي (تضخيم)" : "Hypertrophy (Size)" },
    { percent: 70, reps: 12, intensity: isAr ? "التحمل والبناء" : "Hypertrophy / Endurance" },
    { percent: 65, reps: 15, intensity: isAr ? "التحمل العضلي" : "Muscle Endurance" },
    { percent: 60, reps: 20, intensity: isAr ? "التحمل العضلي" : "Muscle Endurance" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-lg rounded-[24px] border border-border bg-bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col no-scrollbar text-text-primary"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "حاسبة الوزن الأقصى (1RM)" : "1-Rep Max (1RM) Calculator"}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? "احسب أقصى وزن تقدر تشيله جولة واحدة" : "Estimate your absolute peak lifting potential"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-bg-surface-hover hover:bg-bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
              
              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {isAr ? "الوزن المحمول" : "Weight Lifted"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full text-sm font-black rounded-xl border border-border bg-bg-surface-hover/50 pl-3 pr-12 py-2.5 text-text-primary outline-none focus:border-primary transition-all"
                      placeholder="80"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        onClick={() => setUnit(unit === "kg" ? "lbs" : "kg")}
                        className="text-[10px] font-black bg-bg-surface-hover border border-border px-1.5 py-0.5 rounded text-primary hover:text-primary-hover uppercase"
                      >
                        {unit}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {isAr ? "التكرارات (1-12)" : "Reps Performed (1-12)"}
                  </label>
                  <select
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value))}
                    className="w-full text-sm font-black rounded-xl border border-border bg-bg-surface-hover/50 px-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1} className="bg-bg-surface">
                        {i+1} {isAr ? "تكرار" : "Reps"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Big Result Display */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 text-center space-y-1 relative overflow-hidden">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  🏆 {isAr ? "أقصى وزن تقديري للجولة الواحدة" : "Your Estimated 1-Rep Max"}
                </span>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-text-primary tracking-tight tabular-nums">
                    {final1RM > 0 ? final1RM : "--"}
                  </span>
                  <span className="text-xs font-black text-text-muted uppercase">
                    {unit}
                  </span>
                </div>

                <p className="text-[10px] text-text-secondary leading-relaxed font-bold">
                  {isAr 
                    ? `مبني على أداء جولة بوزن ${weight} ${unit} لتكرار ${reps}`
                    : `Based on a lift of ${weight} ${unit} for ${reps} reps`}
                </p>
              </div>

              {/* Percentages Table */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  📊 {isAr ? "جدول نسب شدة التمرين المستهدفة:" : "Target Intensity Percentage Table:"}
                </label>

                <div className="rounded-2xl border border-border/80 bg-bg-surface-hover/30 divide-y divide-border/40 overflow-hidden">
                  <div className="grid grid-cols-3 px-3 py-2 text-[9px] font-black text-text-muted uppercase tracking-widest bg-bg-surface-hover/50">
                    <div>{isAr ? "النسبة" : "Percentage"}</div>
                    <div className="text-center">{isAr ? "الوزن التقريبي" : "Est. Weight"}</div>
                    <div className="text-right">{isAr ? "الهدف والتكرار" : "Goal / Reps"}</div>
                  </div>

                  {percentages.map((item) => {
                    const pctWeight = Math.round((final1RM * (item.percent / 100)) * 10) / 10;
                    const isPerfectMatch = item.reps === reps;
                    
                    return (
                      <div 
                        key={item.percent} 
                        className={`grid grid-cols-3 px-3 py-2.5 text-xs font-bold items-center transition-colors ${
                          isPerfectMatch 
                            ? "bg-primary/10 text-primary" 
                            : "text-text-secondary hover:bg-bg-surface-hover/20"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-black text-text-primary">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPerfectMatch ? "bg-primary animate-pulse" : "bg-text-muted/40"}`} />
                          {item.percent}%
                        </div>
                        <div className="text-center font-black text-text-primary tabular-nums">
                          {final1RM > 0 ? `${pctWeight} ${unit}` : "--"}
                        </div>
                        <div className="text-right text-[10px] font-black text-text-muted truncate">
                          {item.intensity} (~{item.reps} {isAr ? "تك" : "rep"})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pro Coach Advice */}
              <div className="rounded-xl border border-border bg-bg-surface-hover/40 p-3 flex gap-2.5">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  💡
                </div>
                <p className="text-[10px] leading-relaxed text-text-secondary">
                  {isAr 
                    ? "استخدم هذه النسب لتحديد أوزانك بدقة في تمرينك: القوة (85%+ تكرار 1-5)، التضخيم العضلي (70-80% تكرار 8-12)، والتحمل (60-65% تكرار 15+)."
                    : "Use these values to program your sets: Power/Strength (85%+ for 1-5 reps), Muscle Growth (70-80% for 8-12 reps), and Endurance (60-65% for 15+ reps)."}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-border/40 pt-4 shrink-0 flex justify-end gap-2.5">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-xs font-black uppercase tracking-wider py-2"
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
