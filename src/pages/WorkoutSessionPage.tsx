import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { X, Clock, Flag, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { getWorkoutStreak } from "@/db";
import ExerciseWorkoutCard from "@/components/workout/ExerciseWorkoutCard";
import RestTimer from "@/components/workout/RestTimer";
import ShareCard from "@/components/workout/ShareCard";
import { ConfirmModal } from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/Button";
import { PlateCalculator } from "@/components/workout/PlateCalculator";
import { useSettingsStore } from "@/store/useSettingsStore";

// ── Timer Hook ──
function useElapsedTimer(startedAt: number) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return {
    elapsed,
    formatted: `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`,
  };
}

export default function WorkoutSessionPage() {
  const navigate = useNavigate();
  const { language } = useSettingsStore();
  const isAr = language === "ar";
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareToFeed, setShareToFeed] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [calcTargetWeight, setCalcTargetWeight] = useState(60);
  const [workoutSummary, setWorkoutSummary] = useState<{
    date: string;
    duration: number;
    totalVolume: number;
    exerciseCount: number;
    setCount: number;
    streak?: number;
  } | null>(null);

  const { elapsed, formatted: elapsedTime } = useElapsedTimer(
    activeWorkout?.startedAt ?? Date.now(),
  );

  // Redirect if no active workout and not showing share card
  useEffect(() => {
    if (!activeWorkout && !showShareCard) {
      navigate({ to: "/stats" });
    }
  }, [activeWorkout, showShareCard, navigate]);

  if (!activeWorkout && !showShareCard) return null;

  const totalCompleted =
    activeWorkout?.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0,
    ) ?? 0;

  const totalSets =
    activeWorkout?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0;

  // Calculate total volume
  const totalVolume =
    activeWorkout?.exercises.reduce((acc, ex) => {
      return (
        acc +
        ex.sets
          .filter((s) => s.completed)
          .reduce(
            (setAcc, s) =>
              setAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
            0,
          )
      );
    }, 0) ?? 0;

  // ── Fire Confetti Celebration ──
  const fireConfetti = () => {
    const defaults = {
      colors: ["#CCFF00", "#00FFFF", "#FF00FF", "#00FF66"], // High-energy Pulse neon colors
      origin: { y: 0.7 },
    };

    confetti({ ...defaults, particleCount: 60, spread: 55, angle: 60 });
    confetti({ ...defaults, particleCount: 60, spread: 55, angle: 120 });

    setTimeout(() => {
      confetti({ ...defaults, particleCount: 40, spread: 100 });
    }, 300);
  };

  // ── Handle Finish Workout ──
  const requestFinish = () => {
    if (!activeWorkout) return;
    setShowFinishConfirm(true);
  };

  const confirmFinish = async () => {
    setShowFinishConfirm(false);

    if (!activeWorkout) return;

    setIsFinishing(true);
    fireConfetti();

    // Triumphant physical vibration milestone feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([120, 80, 120, 80, 400]);
    }

    // Get streak before saving (it will increase after save)
    const currentStreak = await getWorkoutStreak();

    // Prepare summary for share card
    const summary = {
      date: new Date().toISOString(),
      duration: elapsed,
      totalVolume,
      exerciseCount: activeWorkout.exercises.filter((e) =>
        e.sets.some((s) => s.completed),
      ).length,
      setCount: totalCompleted,
      streak: currentStreak + 1,
    };

    setWorkoutSummary(summary);

    // Save to DB
    await finishWorkout(shareToFeed);

    // Show share card
    setTimeout(() => {
      setIsFinishing(false);
      setShowShareCard(true);
    }, 1500);
  };

  // ── Handle Cancel ──
  const requestCancel = () => {
    if (totalCompleted > 0) {
      setShowCancelConfirm(true);
    } else {
      cancelWorkout();
      navigate({ to: "/" });
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    cancelWorkout();
    navigate({ to: "/" });
  };

  // ── Handle Share Card Close ──
  const handleShareCardClose = () => {
    setShowShareCard(false);
    navigate({ to: "/stats" });
  };

  // If showing share card only
  if (showShareCard && workoutSummary) {
    return (
      <ShareCard
        isOpen={showShareCard}
        onClose={handleShareCardClose}
        workoutData={workoutSummary}
      />
    );
  }

  if (!activeWorkout) return null;

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-bg">
      {/* ── Workout Header ── */}
      <header className="sticky top-0 z-[90] border-b border-border bg-bg/80 px-5 py-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <button
            onClick={requestCancel}
            aria-label={isAr ? "إلغي التمرينة" : "Cancel Workout"}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-surface border border-border text-text-muted transition-all hover:bg-bg-hover hover:text-danger active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h1 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                Live Session
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xl font-black tabular-nums text-text-primary tracking-tighter">
                {elapsedTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-warning" />
                <span className="text-sm font-black text-text-primary tabular-nums">
                  {totalCompleted}/{totalSets}
                </span>
              </div>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Sets</p>
            </div>
          </div>
        </div>

        {/* ── Visual Progress Bar ── */}
        <div className="mt-4 h-1.5 w-full bg-bg-surface rounded-full overflow-hidden border border-border/30">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary-light to-primary"
            initial={{ width: 0 }}
            animate={{
              width: totalSets > 0 ? `${(totalCompleted / totalSets) * 100}%` : "0%",
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </div>
      </header>

      {/* ── Stats Strip ── */}
      <div className="flex divide-x divide-border border-b border-border bg-bg-surface/30">
        <div className="flex-1 px-4 py-3 text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">Volume</p>
          <p className="text-xs font-black text-primary tabular-nums">
            {totalVolume.toLocaleString()} <span className="text-[9px] opacity-70">kg</span>
          </p>
        </div>
        <div className="flex-1 px-4 py-3 text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">Intensity</p>
          <div className="flex items-center justify-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={cn_("w-1 h-3 rounded-full", i <= Math.ceil(totalCompleted / 4) ? "bg-primary" : "bg-bg-elevated")} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-3 text-center">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-0.5">Exercises</p>
          <p className="text-xs font-black text-text-primary">
            {activeWorkout.exercises.filter(e => e.sets.some(s => s.completed)).length} / {activeWorkout.exercises.length}
          </p>
        </div>
      </div>

      {/* ── Exercises List ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-safe no-scrollbar">
        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise, idx) => (
            <ExerciseWorkoutCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={idx}
              onOpenPlateCalc={(w) => {
                setCalcTargetWeight(w);
                setIsPlateCalcOpen(true);
              }}
            />
          ))}
        </div>

        <PlateCalculator 
          isOpen={isPlateCalcOpen}
          onClose={() => setIsPlateCalcOpen(false)}
          targetWeight={calcTargetWeight}
          isAr={isAr}
        />

        <motion.div
          className="mt-6 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="shareToFeed"
              checked={shareToFeed}
              onChange={(e) => setShareToFeed(e.target.checked)}
              className="w-4 h-4 rounded bg-bg-elevated border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="shareToFeed"
              className="text-sm text-text-muted cursor-pointer uppercase tracking-wider font-bold"
            >
              Share to Feed
            </label>
          </div>
          <Button
            onClick={requestFinish}
            disabled={isFinishing || totalCompleted === 0}
            aria-label="Finish Workout"
            variant="primary"
            className={cn_(
              "w-full py-4 text-base font-bold uppercase tracking-wider",
              isFinishing
                ? "bg-success text-[#0A0A0B] shadow-none"
                : totalCompleted === 0
                  ? "bg-bg-elevated text-text-muted shadow-none h-auto"
                  : ""
            )}
          >
            {isFinishing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Trophy className="h-6 w-6" />
              </motion.div>
            ) : (
              <>
                <Flag className="h-5 w-5" />
                <span>Finish Workout</span>
                {totalCompleted > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {totalCompleted} sets
                  </span>
                )}
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* ── Rest Timer Overlay ── */}
      <RestTimer />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title={isAr ? "إلغي التمرينة" : "Cancel Workout"}
        description={isAr ? "هل أنت تأكد من إلغاء التمرينة؟ سيتم فقدان التقدم." : "Are you sure you want to cancel the workout? All progress will be lost."}
        confirmText={isAr ? "إلغي التمرينة" : "Cancel Workout"}
      />

      <ConfirmModal
        isOpen={showFinishConfirm}
        onClose={() => setShowFinishConfirm(false)}
        onConfirm={confirmFinish}
        title="Finish Workout"
        description="Are you sure you want to finish the workout? Uncompleted sets will be discarded."
        confirmText="Finish Workout"
      />
    </div>
  );
}

function cn_(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
