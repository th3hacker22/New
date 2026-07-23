import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Timer } from "lucide-react";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { playTimerCompleteSound } from "@/utils/audio";

const CIRCUMFERENCE = 2 * Math.PI * 24; // r=24

export default function RestTimer() {
  const restTimerActive = useWorkoutStore((s) => s.restTimerActive);
  const dismissRestTimer = useWorkoutStore((s) => s.dismissRestTimer);
  const restDuration = useSettingsStore((s) => s.restDuration);
  const [seconds, setSeconds] = useState(restDuration);

  // Reset when activated
  useEffect(() => {
    if (restTimerActive) {
      setSeconds(restDuration);
    }
  }, [restTimerActive, restDuration]);

  // Countdown
  useEffect(() => {
    if (!restTimerActive || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev: number) => {
        if (prev <= 1) {
          playTimerCompleteSound();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([150, 80, 150, 80, 250]); // Distinct attention-grabbing vibrations
          }
          dismissRestTimer();
          return 0;
        }
        // Subtle haptic warning tick for final 3 seconds
        if (prev <= 4) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(30);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, seconds, dismissRestTimer]);

  const progress = seconds / restDuration;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatTime = `${mins}:${secs.toString().padStart(2, "0")}`;

  const handleDismiss = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
    dismissRestTimer();
  }, [dismissRestTimer]);

  return (
    <AnimatePresence>
      {restTimerActive && (
        <motion.div
          initial={{ y: 200, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 200, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="fixed inset-x-0 bottom-24 z-[100] mx-auto max-w-md px-6"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-bg-elevated/80 p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(204,255,0,0.15)]">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            
            <div className="flex flex-col items-center gap-6">
              {/* Circular Progress */}
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Timer className="h-6 w-6 text-primary mb-1" />
                  </motion.div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Rest</span>
                </div>
              </div>

              {/* Timer Info */}
              <div className="text-center">
                <motion.p 
                  key={seconds}
                  initial={{ scale: 1.1, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-black tabular-nums text-text-primary tracking-tighter"
                >
                  {formatTime}
                </motion.p>
                <p className="mt-1 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
                  Prepare for next set
                </p>
              </div>

              {/* Controls */}
              <div className="flex w-full items-center gap-3">
                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                      navigator.vibrate(12);
                    }
                    setSeconds((p: number) => p + 30);
                  }}
                  className="flex-1 h-12 flex items-center justify-center rounded-2xl bg-bg-surface border border-border text-sm font-bold text-text-primary transition-all hover:bg-bg-hover active:scale-95"
                >
                  +30s
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="flex-[2] h-12 flex items-center justify-center rounded-2xl bg-primary text-bg font-black text-sm uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] active:scale-95"
                >
                  Skip Rest
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-bg-surface border border-border text-text-muted transition-all hover:text-danger active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
