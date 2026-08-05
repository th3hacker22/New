import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/utils/cn";
import streakBgImg from "@/assets/images/streak_banner_bg_1784773532304.jpg";

interface Props {
  streak: number;
  weekActiveDays: boolean[];
  isAr: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function StreakBannerCard({ streak, weekActiveDays, isAr }: Props) {
  return (
    <motion.div
      className="glass-card relative overflow-hidden rounded-[24px] p-5 border border-primary/30 bg-[#0c0f17] shadow-[0_0_25px_rgba(204,255,0,0.12)] group"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
    >
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <img
          src={streakBgImg}
          alt="Streak"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-right-bottom scale-110 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17] via-transparent to-[#0c0f17]/20" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">
          {isAr ? "الـسـريـك الـحـالـي" : "CURRENT STREAK"}
        </span>
        <Flame className={cn("h-5 w-5 drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]", streak > 0 ? "text-primary animate-pulse" : "text-text-muted")} />
      </div>

      <div className="relative z-10 flex items-end justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black italic tracking-tighter text-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]">
            {streak}
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-text-muted">
            {isAr ? "أيام" : "DAYS"}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
            {isAr ? "أيام هذا الأسبوع" : "This week's"}
          </span>
          <div className="flex items-center gap-1.5">
            {weekActiveDays.map((active, idx) => (
              <span
                key={idx}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  active ? "bg-primary shadow-[0_0_6px_rgba(204,255,0,0.8)]" : "bg-white/10 border border-white/5"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-black text-primary">
        <span>{streak > 0 ? "🔥" : "⚡"}</span>
        <span className="uppercase tracking-wider">
          {streak > 0
            ? isAr ? "أنت في قمة الاشتعال يا وحش!" : "You're on fire!"
            : isAr ? "ابدأ أول تمرينة النهاردة لبناء السريك! 🚀" : "Start a workout today to build your streak!"}
        </span>
      </div>
    </motion.div>
  );
}
