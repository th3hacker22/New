import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, Clock } from "lucide-react";

interface Props {
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
  isAr: boolean;
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 25, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
};

export default function StatsTrioCards({ totalWorkouts, totalVolume, totalDuration, isAr }: Props) {
  const formatVolume = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : `${kg}`);
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return isAr ? `${h}س ${m}د` : `${h}h ${m}m`;
    return isAr ? `${m}د` : `${m}m`;
  };

  return (
    <motion.div className="grid grid-cols-3 gap-3" variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} whileHover={{ y: -5, scale: 1.03 }} whileTap={{ scale: 0.96 }} className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-primary/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] cursor-pointer">
        <Dumbbell className="h-5 w-5 text-primary mb-2 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" />
        <p className="text-xl font-black italic tracking-tight text-text-primary">{totalWorkouts}</p>
        <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">{isAr ? "التمارين" : "WORKOUTS"}</p>
      </motion.div>

      <motion.div variants={item} whileHover={{ y: -5, scale: 1.03 }} whileTap={{ scale: 0.96 }} className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-cyan-400/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer">
        <TrendingUp className="h-5 w-5 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
        <p className="text-xl font-black italic tracking-tight text-text-primary">{totalVolume > 0 ? formatVolume(totalVolume) : "0"}</p>
        <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">{isAr ? "الحجم (كجم)" : "VOLUME (KG)"}</p>
      </motion.div>

      <motion.div variants={item} whileHover={{ y: -5, scale: 1.03 }} whileTap={{ scale: 0.96 }} className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-emerald-400/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer">
        <Clock className="h-5 w-5 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
        <p className="text-xl font-black italic tracking-tight text-text-primary">{formatDuration(totalDuration)}</p>
        <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">{isAr ? "الوقت التوتال" : "TOTAL TIME"}</p>
      </motion.div>
    </motion.div>
  );
}
