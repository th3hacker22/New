import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Sparkles, Filter, Award, Zap, Flame, ShieldCheck, Dumbbell, Star } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { ACHIEVEMENTS, AchievementDef } from "@/data/achievements";
import AchievementBadge from "@/components/AchievementBadge";
import trophyImg from "@/assets/images/achievement_trophy_illustration_1784767069211.jpg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({ isOpen, onClose }: Props) {
  const { language } = useSettingsStore();
  const isAr = language === "ar";

  const { unlockedList, loadUnlocked, evaluateAchievements } = useAchievementsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUnlocked();
      evaluateAchievements();

      // Calculate live progress percentages for all achievements from IndexedDB
      setIsLoadingProgress(true);
      async function calcProgress() {
        const pMap: Record<string, number> = {};
        for (const ach of ACHIEVEMENTS) {
          if (ach.getProgress) {
            try {
              pMap[ach.id] = await ach.getProgress();
            } catch {
              pMap[ach.id] = 0;
            }
          }
        }
        setProgressMap(pMap);
        setIsLoadingProgress(false);
      }
      calcProgress();
    }
  }, [isOpen, loadUnlocked, evaluateAchievements]);

  if (!isOpen) return null;

  const unlockedIds = new Set(
    unlockedList.filter((a) => !a.deleted).map((a) => a.achievementId)
  );

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;
  const totalXP = ACHIEVEMENTS.reduce((acc, ach) => {
    return unlockedIds.has(ach.id) ? acc + (ach.xp || 0) : acc;
  }, 0);

  const categories = [
    { id: "all", label: isAr ? "الكل 🏆" : "All 🏆" },
    { id: "milestones", label: isAr ? "المحطات 🎯" : "Milestones 🎯" },
    { id: "streaks", label: isAr ? "الاستمرارية 🔥" : "Streaks 🔥" },
    { id: "volume", label: isAr ? "الأوزان 💪" : "Volume 💪" },
    { id: "records", label: isAr ? "الأرقام القياسية ⚡" : "Records ⚡" },
    { id: "lifestyle", label: isAr ? "التغذية والتتبع 🥗" : "Lifestyle 🥗" },
  ];

  const filteredAchievements = ACHIEVEMENTS.filter((ach) =>
    selectedCategory === "all" ? true : ach.category === selectedCategory
  ).sort((a, b) => {
    const isUnlockedA = unlockedIds.has(a.id);
    const isUnlockedB = unlockedIds.has(b.id);
    if (isUnlockedA && !isUnlockedB) return -1;
    if (!isUnlockedA && isUnlockedB) return 1;
    return (progressMap[b.id] || 0) - (progressMap[a.id] || 0);
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-bg-surface border border-border/80 rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-bg-surface-hover/50 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_15px_rgba(204,255,0,0.25)] shrink-0 bg-bg-surface">
                <img
                  src={trophyImg}
                  alt="Achievement Trophy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-black text-text-primary tracking-wide">
                  {isAr ? "سجل الإنجازات والأوسمة" : "Achievements & Medals"}
                </h2>
                <p className="text-xs text-text-muted">
                  {isAr
                    ? "إنجازات حقيقية تُحسب تلقائياً من تماريناتك وسجلاتك"
                    : "Real achievements earned automatically from your database logs"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-bg-surface hover:bg-bg-surface-hover border border-border/60 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* XP & Overall Progress Banner */}
          <div className="p-4 bg-gradient-to-r from-primary/10 via-bg-surface to-bg-surface border-b border-border/40 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-black uppercase text-text-primary tracking-wider">
                  {isAr ? "إجمالي النقاط المكتسبة" : "Total XP Earned"}
                </span>
              </div>
              <span className="text-sm font-black text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30">
                +{totalXP} XP
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-text-muted">
                  {isAr ? "الأوسمة المفتوحة" : "Badges Unlocked"}
                </span>
                <span className="text-primary font-mono font-black">
                  {unlockedCount} / {totalCount} ({Math.round((unlockedCount / totalCount) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden border border-border/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary via-primary-hover to-primary shadow-[0_0_12px_rgba(204,255,0,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 select-none ${
                  selectedCategory === cat.id
                    ? "bg-primary text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                    : "bg-bg-surface-hover/80 text-text-muted hover:text-text-primary border border-border/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAchievements.map((ach) => {
                const unlocked = unlockedList.find(
                  (u) => u.achievementId === ach.id && !u.deleted
                );
                const title = isAr ? ach.titleAr : ach.title;
                const description = isAr ? ach.descriptionAr : ach.description;
                const progressPct = progressMap[ach.id];

                return (
                  <AchievementBadge
                    key={ach.id}
                    title={title}
                    description={description}
                    iconName={ach.iconName}
                    isUnlocked={!!unlocked}
                    unlockedAt={unlocked?.unlockedAt}
                    category={ach.category}
                    xp={ach.xp}
                    progressPercent={progressPct}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
