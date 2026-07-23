import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, X, Play, Pause, RotateCcw, BellRing } from "lucide-react";
import { cn } from "@/utils/cn";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

export function RestTimer({ isOpen, onClose, isAr }: RestTimerProps) {
  const [seconds, setSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(60);

  const reset = useCallback(() => {
    setSeconds(initialTime);
    setIsActive(false);
  }, [initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const next = s - 1;
          if (next === 0) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([150, 80, 150, 80, 250]); // Distinct attention-grabbing vibrations
            }
          } else if (next <= 3) {
            // Subtle countdown warning tick
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate(30);
            }
          }
          return next;
        });
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  if (!isOpen) return null;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (seconds / initialTime) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-24 left-4 right-4 z-50"
      >
        <div className="glass-card rounded-3xl p-5 border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-black text-text-primary uppercase tracking-widest">
                {isAr ? "مؤقت الراحة" : "Rest Timer"}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#CCFF00"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * progress) / 100}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-black tabular-nums text-primary">
                {formatTime(seconds)}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                {[30, 60, 90].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.vibrate) {
                        navigator.vibrate(10);
                      }
                      setInitialTime(t);
                      setSeconds(t);
                    }}
                    className={cn(
                      "flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all border",
                      initialTime === t
                        ? "bg-primary border-primary text-black"
                        : "bg-bg-surface border-border text-text-muted hover:border-primary/50"
                    )}
                  >
                    {t}s
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                      navigator.vibrate(12);
                    }
                    setIsActive(!isActive);
                  }}
                  className="flex-1 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                >
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                    reset();
                  }}
                  className="w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {seconds === 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-3 rounded-2xl bg-primary text-black flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-glow-primary"
            >
              <BellRing className="h-4 w-4 animate-bounce" />
              {isAr ? "انتهى الوقت! ادخل مجموعتك القادمة" : "Time's Up! Next Set"}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
