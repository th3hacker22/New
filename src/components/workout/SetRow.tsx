import { memo } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, Calculator } from "lucide-react";
import { cn } from "@/utils/cn";
import type { WorkoutSet } from "@/store/useWorkoutStore";
import { useSettingsStore } from "@/store/useSettingsStore";

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exerciseIndex: number;
  ghostWeight?: number;
  ghostReps?: number;
  onToggleComplete: () => void;
  onUpdateWeight: (value: string) => void;
  onUpdateReps: (value: string) => void;
  onUpdateRpe?: (value: string) => void;
  onRemoveSet?: () => void;
  onUpdateSetType?: (value: "normal" | "warmup" | "right" | "left" | "failure" | "drop" | "negative" | "partial" | "myoreps" | "feeder" | "top" | "backoff") => void;
  onOpenPlateCalc?: (weight: number) => void;
}

const SetRow = memo(
  ({
    set,
    setIndex,
    ghostWeight,
    ghostReps,
    onToggleComplete,
    onUpdateWeight,
    onUpdateReps,
    onUpdateRpe,
    onRemoveSet,
    onUpdateSetType,
    onOpenPlateCalc,
  }: SetRowProps) => {
    const isAr = useSettingsStore((s) => s.language === "ar");
    const isCompleted = set.completed;
    const setType = set.setType || "normal";

    let badgeLabel = String(setIndex + 1);
    let badgeColorClass = "bg-bg-elevated text-text-muted hover:bg-bg-hover";

    if (setType === "warmup") {
      badgeLabel = "W";
      badgeColorClass = "bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30";
    } else if (setType === "right") {
      badgeLabel = "R";
      badgeColorClass = "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30";
    } else if (setType === "left") {
      badgeLabel = "L";
      badgeColorClass = "bg-lime-500/20 text-lime-400 border border-lime-500/30 hover:bg-lime-500/30";
    } else if (setType === "failure") {
      badgeLabel = "F";
      badgeColorClass = "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30";
    } else if (setType === "drop") {
      badgeLabel = "D";
      badgeColorClass = "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30";
    } else if (setType === "negative") {
      badgeLabel = "N";
      badgeColorClass = "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/30";
    } else if (setType === "partial") {
      badgeLabel = "P";
      badgeColorClass = "bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30";
    } else if (setType === "myoreps") {
      badgeLabel = "M";
      badgeColorClass = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30";
    } else if (setType === "feeder") {
      badgeLabel = "E";
      badgeColorClass = "bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30";
    } else if (setType === "top") {
      badgeLabel = "T";
      badgeColorClass = "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30";
    } else if (setType === "backoff") {
      badgeLabel = "B";
      badgeColorClass = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30";
    } else if (isCompleted) {
      badgeColorClass = "bg-success/15 text-success border border-success/30";
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "grid grid-cols-[2rem_1fr_1fr_3rem_3rem_2rem] gap-2 px-4 py-2.5 transition-colors duration-300 items-center",
          isCompleted ? "bg-success/5" : "bg-transparent",
        )}
      >
        <div className="flex items-center justify-center relative">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black transition-all duration-200",
              badgeColorClass,
            )}
          >
            {badgeLabel}
          </span>
          <select
            value={setType}
            onChange={(e) => onUpdateSetType && onUpdateSetType(e.target.value as any)}
            disabled={isCompleted}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
            title="Set type"
          >
            <option value="normal">{isAr ? "مجموعة عادية" : "Normal Set (N)"}</option>
            <option value="warmup">{isAr ? "تسخين (W)" : "Warmup Set (W)"}</option>
            <option value="right">{isAr ? "اليمين (R)" : "Right Arm/Leg Set (R)"}</option>
            <option value="left">{isAr ? "اليسار (L)" : "Left Arm/Leg Set (L)"}</option>
            <option value="failure">{isAr ? "حتى الفشل (F)" : "Failure Set (F)"}</option>
            <option value="drop">{isAr ? "دروب سيت (D)" : "Drop Set (D)"}</option>
            <option value="negative">{isAr ? "تكرار سلبي (N)" : "Negative Reps (N)"}</option>
            <option value="partial">{isAr ? "تكرار جزئي (P)" : "Partial Reps (P)"}</option>
            <option value="myoreps">{isAr ? "مايو ريبس (M)" : "Myo Reps (M)"}</option>
            <option value="feeder">{isAr ? "تمهيدية (E)" : "Feeder Set (E)"}</option>
            <option value="top">{isAr ? "أعلى وزن (T)" : "Top Set (T)"}</option>
            <option value="backoff">{isAr ? "تخفيف وزن (B)" : "Backoff Set (B)"}</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={set.weight}
            onChange={(e) => onUpdateWeight(e.target.value)}
            placeholder={ghostWeight != null ? String(ghostWeight) : ""}
            readOnly={isCompleted}
            className={cn(
              "w-full min-w-0 px-1 h-10 rounded-xl border text-center text-sm font-semibold outline-none transition-all duration-200",
              isCompleted
                ? "border-success/20 bg-success/5 text-success"
                : "border-border bg-bg-elevated text-text-primary placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary",
            )}
          />
          {!isCompleted && onOpenPlateCalc && (
            <button
              onClick={() => onOpenPlateCalc(Number(set.weight) || 0)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg text-text-muted hover:text-primary transition-colors bg-bg-card/50"
              title="Plate Calculator"
            >
              <Calculator className="h-3 w-3" />
            </button>
          )}
        </div>

        <input
          type="number"
          inputMode="numeric"
          value={set.reps}
          onChange={(e) => onUpdateReps(e.target.value)}
          placeholder={ghostReps != null ? String(ghostReps) : ""}
          readOnly={isCompleted}
          className={cn(
            "w-full min-w-0 px-1 h-10 rounded-xl border text-center text-sm font-semibold outline-none transition-all duration-200",
            isCompleted
              ? "border-success/20 bg-success/5 text-success"
              : "border-border bg-bg-elevated text-text-primary placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary",
          )}
        />

        <input
          type="number"
          inputMode="numeric"
          value={set.rpe || ""}
          onChange={(e) => onUpdateRpe && onUpdateRpe(e.target.value)}
          placeholder="RPE"
          readOnly={isCompleted}
          className={cn(
            "w-full min-w-0 px-1 h-10 rounded-xl border text-center text-xs font-semibold outline-none transition-all duration-200",
            isCompleted
              ? "border-success/20 bg-success/5 text-success"
              : "border-border bg-bg-elevated text-text-primary placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary",
          )}
        />

        <div className="flex items-center justify-center">
          <motion.button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                if (!isCompleted) {
                  // Snappy double vibration pulse when checked completed
                  navigator.vibrate([15, 30, 20]);
                } else {
                  // Subtle single click when unchecked
                  navigator.vibrate(10);
                }
              }
              onToggleComplete();
            }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 relative",
              isCompleted
                ? "bg-success text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                : "border border-border bg-bg-elevated text-text-secondary hover:border-success/40 hover:text-success",
            )}
            whileTap={{ scale: 0.85 }}
          >
            <Check className="h-5 w-5" strokeWidth={isCompleted ? 3 : 2} />
            {isCompleted && (
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-xl border-2 border-success pointer-events-none"
              />
            )}
            {isCompleted && (
              <div className="absolute inset-0 pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <motion.div
                    key={angle}
                    initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 0, 
                      x: Math.cos(angle * Math.PI / 180) * 30,
                      y: Math.sin(angle * Math.PI / 180) * 30
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-success"
                  />
                ))}
              </div>
            )}
          </motion.button>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={onRemoveSet}
            disabled={isCompleted}
            className="text-text-muted hover:text-danger disabled:opacity-30 transition-colors p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  },
);

SetRow.displayName = "SetRow";

export default SetRow;
