import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Dumbbell,
  Award,
  Moon,
  Sun,
  Zap,
  Crown,
  Target,
  Star,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Utensils,
  Share2,
  CheckCircle2,
  Calendar,
  Swords,
  Medal,
  Activity,
  Lock,
} from "lucide-react";

export const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  Trophy,
  Flame,
  Dumbbell,
  Award,
  Moon,
  Sun,
  Zap,
  Crown,
  Target,
  Star,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Utensils,
  Share2,
  CheckCircle2,
  Calendar,
  Swords,
  Medal,
  Activity,
};

interface Props {
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  category?: string;
  xp?: number;
  progressPercent?: number;
  animate?: boolean;
}

export default function AchievementBadge({
  title,
  description,
  iconName,
  isUnlocked,
  unlockedAt,
  category,
  xp,
  progressPercent,
  animate = false,
}: Props) {
  const IconComponent = ACHIEVEMENT_ICONS[iconName] || Trophy;

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 250, damping: 15 }}
      className={`relative p-4 rounded-2xl flex flex-col items-center justify-between text-center gap-2 border transition-all select-none ${
        isUnlocked
          ? "bg-gradient-to-b from-primary/15 via-bg-surface to-bg-surface border-primary/40 shadow-[0_4px_20px_rgba(204,255,0,0.15)] ring-1 ring-primary/20"
          : "bg-bg-elevated/40 border-border/40 opacity-75 grayscale hover:grayscale-0 hover:opacity-100"
      }`}
    >
      {/* Top Badges */}
      <div className="w-full flex justify-between items-center text-[10px]">
        {xp ? (
          <span
            className={`font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
              isUnlocked ? "bg-primary/20 text-primary border border-primary/30" : "bg-bg-surface-hover text-text-muted"
            }`}
          >
            +{xp} XP
          </span>
        ) : <span />}

        {!isUnlocked && (
          <div className="p-1 rounded-full bg-bg-surface border border-border/60 text-text-muted">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Main Icon */}
      <div
        className={`p-3.5 rounded-2xl transition-transform ${
          isUnlocked
            ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(204,255,0,0.3)] scale-105"
            : "bg-bg-surface-hover text-text-muted/60"
        }`}
      >
        <IconComponent className="w-6 h-6 stroke-[2.2]" />
      </div>

      {/* Details */}
      <div className="flex flex-col items-center mt-1 w-full">
        <h4
          className={`text-xs font-black uppercase tracking-wider line-clamp-1 ${
            isUnlocked ? "text-text-primary" : "text-text-muted"
          }`}
        >
          {title}
        </h4>
        <p className="text-[10px] text-text-muted mt-1 leading-tight max-w-[130px] line-clamp-2 min-h-[24px]">
          {description}
        </p>

        {/* Progress Bar if locked & percent provided */}
        {!isUnlocked && typeof progressPercent === "number" && (
          <div className="w-full mt-2.5">
            <div className="w-full h-1.5 bg-bg-surface-hover rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-primary/80 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
            <span className="text-[9px] text-text-muted font-bold mt-0.5 block">
              {Math.round(progressPercent)}%
            </span>
          </div>
        )}

        {isUnlocked && unlockedAt && (
          <span className="text-[9px] text-primary/70 font-mono mt-2 font-bold">
            ✓ {new Date(unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}

