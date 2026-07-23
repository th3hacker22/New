import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calculator, Info } from "lucide-react";
import { cn } from "@/utils/cn";

interface PlateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeight: number;
  isAr?: boolean;
}

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const BAR_WEIGHT = 20;

export function PlateCalculator({ isOpen, onClose, targetWeight, isAr }: PlateCalculatorProps) {
  const [weight, setWeight] = useState(targetWeight || 60);
  
  const calculatePlates = (totalWeight: number) => {
    let remaining = (totalWeight - BAR_WEIGHT) / 2;
    const result: Record<number, number> = {};
    
    if (remaining <= 0) return {};

    for (const plate of PLATES) {
      const count = Math.floor(remaining / plate);
      if (count > 0) {
        result[plate] = count;
        remaining -= count * plate;
      }
    }
    return result;
  };

  const platesNeeded = calculatePlates(weight);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm rounded-[2rem] border border-primary/20 bg-bg-elevated p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_20px_rgba(204,255,0,0.1)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "حاسبة الأوزان" : "Plate Calculator"}
                  </h2>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                    {isAr ? "لكل جانب (بار ٢٠ كجم)" : "Per side (20kg Bar)"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface text-text-muted transition-colors hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-transparent text-center text-5xl font-black text-primary outline-none tabular-nums tracking-tighter"
                />
                <div className="mt-1 text-center text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">
                  Total Weight (kg)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PLATES.map((plate) => {
                  const count = platesNeeded[plate] || 0;
                  return (
                    <div
                      key={plate}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-300",
                        count > 0 
                          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border/50 bg-bg-surface/50 opacity-40"
                      )}
                    >
                      <span className="text-lg font-black text-text-primary tabular-nums">
                        {plate} <span className="text-[10px] font-bold text-text-muted">KG</span>
                      </span>
                      {count > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-bg shadow-lg"
                        >
                          x{count}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-bg-surface p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {isAr ? "الرؤية البصرية" : "Visual Breakdown"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 h-12">
                  <div className="h-2 w-16 bg-text-muted/30 rounded-full" /> {/* Bar */}
                  {Object.entries(platesNeeded).reverse().map(([p, c]) => 
                    Array.from({ length: c as number }).map((_, i) => (
                      <div 
                        key={`${p}-${i}`}
                        className={cn(
                          "rounded-sm border border-white/10",
                          Number(p) >= 20 ? "w-3 h-12 bg-zinc-800" :
                          Number(p) >= 15 ? "w-3 h-10 bg-zinc-700" :
                          Number(p) >= 10 ? "w-2.5 h-8 bg-zinc-600" : "w-2 h-6 bg-zinc-500"
                        )}
                        title={`${p}kg`}
                      />
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-primary text-bg font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(204,255,0,0.3)] active:scale-95 transition-all"
              >
                {isAr ? "تم" : "Done"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
