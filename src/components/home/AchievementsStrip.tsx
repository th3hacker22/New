import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ACHIEVEMENTS } from "@/data/achievements";
import AchievementBadge, { ACHIEVEMENT_ICONS } from "@/components/AchievementBadge";
import { useAchievementsStore } from "@/store/useAchievementsStore";

interface Props {
  isAr: boolean;
  onOpenModal: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function AchievementsStrip({ isAr, onOpenModal }: Props) {
  const { unlockedList } = useAchievementsStore();
  const unlockedIds = useMemo(() => new Set(unlockedList.filter((a) => !a.deleted).map((a) => a.achievementId)), [unlockedList]);
  const unlockedCount = unlockedIds.size;
  const total = ACHIEVEMENTS.length;

  return (
    <motion.div className="glass-card rounded-[22px] p-4 border border-border/60 bg-bg-surface/80" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{isAr ? "الإنجازات والأوسمة" : "ACHIEVEMENTS"}</h2>
        </div>
        <button onClick={onOpenModal} className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 cursor-pointer">
          <span>{unlockedCount} / {total}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);
          const title = isAr ? ach.titleAr : ach.title;
          const IconComp = ACHIEVEMENT_ICONS[ach.iconName] || Trophy;
          return (
            <motion.button
              key={ach.id}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenModal}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer w-20 text-center select-none",
                isUnlocked ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]" : "bg-bg-elevated/40 border-border/40 text-text-muted/50 grayscale opacity-80 hover:opacity-100"
              )}
              title={`${title} (${isUnlocked ? (isAr ? "مفتوح" : "Unlocked") : (isAr ? "انقر لمعرفة الشروط" : "Click to view conditions")})`}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform", isUnlocked ? "bg-primary/20 text-primary border border-primary/30" : "bg-bg-surface-hover text-text-muted/60")}>
                <IconComp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[9px] font-black leading-tight line-clamp-1 w-full text-text-primary">{title}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
