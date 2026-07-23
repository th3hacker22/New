import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CHALLENGES, ChallengeDef } from "@/data/challenges";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  Swords,
  Zap,
  Target,
  Crown,
  Flame,
  CheckCircle2,
  Trophy,
  Sparkles,
} from "lucide-react";
import challengeImg from "@/assets/images/community_challenge_illustration_new_1784774073056.jpg";

const ICONS: Record<string, React.ElementType> = {
  Swords,
  Zap,
  Target,
  Crown,
  Flame,
  Trophy,
};

export default function ChallengesSection() {
  const { language } = useSettingsStore();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState<"all" | "weekly" | "monthly" | "special">("all");
  const [progressMap, setProgressMap] = useState<
    Record<string, { current: number; target: number; completed: boolean }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      const map: Record<string, { current: number; target: number; completed: boolean }> = {};
      for (const ch of CHALLENGES) {
        try {
          const res = await ch.checkProgress();
          map[ch.id] = res;
        } catch {
          map[ch.id] = { current: 0, target: ch.targetValue, completed: false };
        }
      }
      setProgressMap(map);
      setLoading(false);
    }
    loadProgress();
  }, []);

  const filtered = CHALLENGES.filter((c) => (activeTab === "all" ? true : c.category === activeTab));

  const totalCompleted = Object.values(progressMap).filter((p) => p.completed).length;

  return (
    <div className="space-y-4">
      {/* 3D Community Challenge Hero Banner */}
      <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden border border-border/60 shadow-xl group">
        <img
          src={challengeImg}
          alt="3D Community Challenge Illustration"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/90 via-bg-surface/60 to-transparent flex flex-col justify-center p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 border border-primary/30 px-2.5 py-0.5 rounded-md self-start mb-1 backdrop-blur-md">
            {isAr ? "التحديات والمنافسات 3D" : "3D ARENA & CHALLENGES"}
          </span>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-text-primary">
            {isAr ? "تحديات اللياقة المباشرة" : "Fitness Arena & Quests"}
          </h2>
          <p className="text-xs text-text-muted font-bold mt-0.5 max-w-md">
            {isAr ? "أكمل التحديات الأسبوعية والشهرية واكسب النقاط والأوسمة" : "Complete weekly and monthly quests to earn trophies and level up"}
          </p>
        </div>
      </div>

      {/* Header & Stats summary */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-bg-surface to-bg-surface p-4 rounded-2xl border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
              {isAr ? "التحديات الرياضية 🎯" : "Active Fitness Quests"}
            </h3>
            <p className="text-xs text-text-muted">
              {isAr ? "نفّذ التحديات، وجمّع نقااط XP وارفع مستواك" : "Complete quests, earn XP & level up"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {totalCompleted} / {CHALLENGES.length} {isAr ? "مكتمل" : "Done"}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: "all", label: isAr ? "الكل" : "All" },
          { id: "weekly", label: isAr ? "أسبوعية ⚡" : "Weekly" },
          { id: "monthly", label: isAr ? "شهرية 👑" : "Monthly" },
          { id: "special", label: isAr ? "خاصة 🔥" : "Special" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-primary text-primary-text shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                : "bg-bg-surface hover:bg-bg-surface-hover text-text-muted border border-border/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ch) => {
          const prog = progressMap[ch.id] || { current: 0, target: ch.targetValue, completed: false };
          const pct = Math.min(100, Math.round((prog.current / ch.targetValue) * 100));
          const IconComp = ICONS[ch.iconName] || Trophy;

          return (
            <motion.div
              key={ch.id}
              whileHover={{ y: -2 }}
              className={`relative p-4 rounded-2xl border transition-all ${
                prog.completed
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-primary/20"
                  : "bg-bg-surface/80 border-border/60 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      prog.completed
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-bg-surface-hover text-text-muted border-border/40"
                    }`}
                  >
                    <IconComp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                      <span>{isAr ? ch.titleAr : ch.titleEn}</span>
                      {prog.completed && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/20" />
                      )}
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
                      {isAr ? ch.descAr : ch.descEn}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    +{ch.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-text-muted">
                    {isAr ? "التقدم الحالي" : "Progress"}
                  </span>
                  <span className={prog.completed ? "text-primary font-black" : "text-text-primary"}>
                    {prog.current.toLocaleString()} / {ch.targetValue.toLocaleString()}{" "}
                    {isAr ? ch.unitAr : ch.unitEn} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-surface-hover rounded-full overflow-hidden border border-border/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      prog.completed
                        ? "bg-primary shadow-[0_0_10px_rgba(204,255,0,0.6)]"
                        : "bg-primary/70"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
