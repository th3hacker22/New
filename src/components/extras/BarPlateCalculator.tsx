import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { X, Dumbbell, Sparkles, Scale, Info, CheckCircle2 } from "lucide-react";

interface BarPlateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PLATES = [
  { weight: 25, color: "bg-red-600 border-red-500", text: "text-white", label: "25kg", active: true },
  { weight: 20, color: "bg-blue-600 border-blue-500", text: "text-white", label: "20kg", active: true },
  { weight: 15, color: "bg-yellow-500 border-yellow-400", text: "text-zinc-950", label: "15kg", active: true },
  { weight: 10, color: "bg-green-600 border-green-500", text: "text-white", label: "10kg", active: true },
  { weight: 5, color: "bg-bg-surface-hover border-border", text: "text-zinc-950", label: "5kg", active: true },
  { weight: 2.5, color: "bg-red-500/80 border-red-400", text: "text-white", label: "2.5kg", active: true },
  { weight: 1.25, color: "bg-blue-500/80 border-blue-400", text: "text-white", label: "1.25kg", active: true },
];

export default function BarPlateCalculator({ isOpen, onClose }: BarPlateCalculatorProps) {
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barWeight, setBarWeight] = useState<number>(20);
  const [plates, setPlates] = useState(DEFAULT_PLATES);
  const [result, setResult] = useState<{
    platesPerSide: { weight: number; count: number; color: string; label: string; text: string }[];
    actualWeight: number;
    error: string | null;
  }>({ platesPerSide: [], actualWeight: 20, error: null });

  // Toggle plate availability
  const togglePlate = (weight: number) => {
    setPlates(plates.map(p => p.weight === weight ? { ...p, active: !p.active } : p));
  };

  // Perform greedy plate calculation
  useEffect(() => {
    if (targetWeight < barWeight) {
      setResult({
        platesPerSide: [],
        actualWeight: barWeight,
        error: "Target weight is less than empty bar weight!",
      });
      return;
    }

    const remainingWeight = targetWeight - barWeight;
    const singleSideWeight = remainingWeight / 2;

    const availablePlatesSorted = [...plates]
      .filter(p => p.active)
      .sort((a, b) => b.weight - a.weight);

    let tempWeight = singleSideWeight;
    const platesNeeded: { weight: number; count: number; color: string; label: string; text: string }[] = [];

    for (const plate of availablePlatesSorted) {
      if (tempWeight >= plate.weight) {
        const count = Math.floor(tempWeight / plate.weight);
        if (count > 0) {
          platesNeeded.push({
            weight: plate.weight,
            count,
            color: plate.color,
            label: plate.label,
            text: plate.text,
          });
          tempWeight -= count * plate.weight;
        }
      }
    }

    const calculatedSingleSide = singleSideWeight - tempWeight;
    const calculatedTotal = barWeight + calculatedSingleSide * 2;

    setResult({
      platesPerSide: platesNeeded,
      actualWeight: calculatedTotal,
      error: tempWeight > 0 ? `Could not match exactly. Off by ${(tempWeight * 2).toFixed(2)} kg.` : null,
    });
  }, [targetWeight, barWeight, plates]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-surface-hover p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Bar & Plate Calculator
                  </h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                    Determine exact plates for any barbell target
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-surface-hover border border-border text-text-secondary hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  Target Weight (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetWeight || ""}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-bg-surface-hover px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary transition-all tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-text-muted">
                    kg
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                  Bar Weight (kg)
                </label>
                <select
                  value={barWeight}
                  onChange={(e) => setBarWeight(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-bg-surface-hover px-4 py-3 text-sm font-bold text-white outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value={20}>20 kg (Standard Olympic)</option>
                  <option value={15}>15 kg (Women's Bar)</option>
                  <option value={10}>10 kg (Technique Bar)</option>
                  <option value={2.5}>2.5 kg (Standard EZ-Bar)</option>
                </select>
              </div>
            </div>

            {/* Available plates picker */}
            <div className="mb-6">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                Available Plates in Gym
              </label>
              <div className="flex flex-wrap gap-2">
                {plates.map((plate) => (
                  <button
                    key={plate.weight}
                    onClick={() => togglePlate(plate.weight)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all ${
                      plate.active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-bg-surface-hover text-text-muted"
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full border ${plate.color} ${
                        !plate.active && "opacity-30"
                      }`}
                    />
                    {plate.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualization Section */}
            <div className="relative rounded-2xl border border-border bg-bg-surface-hover p-6 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] text-text-secondary uppercase tracking-widest font-mono">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                Live Barbell Rendering
              </div>

              {result.platesPerSide.length > 0 ? (
                <div className="flex items-center justify-center w-full h-24 mt-4 relative">
                  {/* Left sleeve guide */}
                  <div className="absolute left-[15%] w-[10%] h-1 bg-bg-surface-hover" />
                  
                  {/* Center shaft (red grips, silver bar) */}
                  <div className="absolute left-[25%] right-[25%] h-1.5 bg-bg-surface-hover rounded-full border-y border-border" />
                  
                  {/* Center barbell knurling rings */}
                  <div className="absolute left-[40%] w-[20%] h-2 bg-bg-surface-hover border border-border rounded-md shadow-inner flex justify-around items-center">
                    <span className="w-1 h-1 rounded-full bg-bg-surface-hover" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bg-surface-hover" />
                    <span className="w-1 h-1 rounded-full bg-bg-surface-hover" />
                  </div>

                  {/* Right sleeve guide */}
                  <div className="absolute right-[15%] w-[10%] h-1 bg-bg-surface-hover" />

                  {/* Right sleeve collar stop */}
                  <div className="absolute right-[25%] w-2.5 h-7 bg-bg-surface-hover border border-border rounded-md shadow-md z-10" />

                  {/* Plated stack on sleeve (Right Side stack) */}
                  <div className="absolute right-[15%] flex items-center gap-0.5 z-20">
                    {result.platesPerSide.map((stack, idx) => (
                      <div key={idx} className="flex gap-0.5">
                        {Array.from({ length: stack.count }).map((_, itemIdx) => {
                          // Determine height based on weight
                          let hClass = "h-16 w-3.5";
                          if (stack.weight <= 2.5) hClass = "h-10 w-2.5";
                          else if (stack.weight <= 5) hClass = "h-12 w-3";
                          else if (stack.weight <= 10) hClass = "h-14 w-3";

                          return (
                            <motion.div
                              key={itemIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`rounded-[3px] border shadow-lg flex items-center justify-center relative ${stack.color} ${hClass}`}
                            >
                              <span className={`text-[7px] font-black uppercase text-center tracking-tighter select-none font-mono leading-none ${stack.text}`}>
                                {stack.weight}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                    {/* Collars end cap */}
                    <div className="w-1.5 h-5 bg-bg-surface-hover border border-border rounded-[2px]" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Scale className="h-8 w-8 text-text-primary mx-auto mb-2" />
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    Add weights to view live plate stacks
                  </p>
                </div>
              )}
            </div>

            {/* Calculations Result Table */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                    Calculated Load
                  </span>
                  <p className="text-2xl font-black text-primary tabular-nums">
                    {result.actualWeight.toFixed(1)} <span className="text-xs text-text-secondary uppercase font-bold">kg</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                    Plates Per Side
                  </span>
                  <p className="text-sm font-bold text-white">
                    {result.platesPerSide.reduce((sum, item) => sum + item.count, 0)} plates total
                  </p>
                </div>
              </div>

              {/* Error warning if mismatch */}
              {result.error && (
                <div className="flex items-start gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-500 uppercase tracking-wider">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{result.error}</span>
                </div>
              )}

              {/* List of plate breakdown */}
              {result.platesPerSide.length > 0 && (
                <div className="rounded-xl bg-bg-surface-hover border border-border p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-3">
                    One Side Loading Instructions
                  </h4>
                  <div className="space-y-2">
                    {result.platesPerSide.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-text-primary font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full border ${item.color}`} />
                          <span>{item.weight} kg Plate</span>
                        </div>
                        <span className="font-mono bg-bg-surface-hover px-2.5 py-1 rounded-lg border border-border text-white font-black">
                          x{item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={onClose}
                variant="primary"
                className="w-full py-4 text-xs font-black uppercase tracking-wider mt-4"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
