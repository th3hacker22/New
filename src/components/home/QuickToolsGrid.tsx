import { motion } from "framer-motion";
import { Percent, Timer, Utensils, Zap } from "lucide-react";

interface Props {
  isAr: boolean;
  onOneRepMax: () => void;
  onWarmup: () => void;
  onQuickLog: () => void;
  onAiCoach: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function QuickToolsGrid({ isAr, onOneRepMax, onWarmup, onQuickLog, onAiCoach }: Props) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4.5}>
      <div className="mb-3">
        <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{isAr ? "الأدوات السريعة" : "Quick Tools Grid"}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onOneRepMax} className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform"><Percent size={20} /></div>
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">{isAr ? "حاسبة 1RM" : "1RM Calc"}</h3>
          <p className="text-[9px] text-text-muted mt-0.5">{isAr ? "احسب أقصى وزن" : "Max strength"}</p>
        </button>
        <button onClick={onWarmup} className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success mb-2 group-hover:scale-110 transition-transform"><Timer size={20} /></div>
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">{isAr ? "الإحماء" : "Warm-up"}</h3>
          <p className="text-[9px] text-text-muted mt-0.5">{isAr ? "تجهيز المفاصل" : "Mobility prep"}</p>
        </button>
        <button onClick={onQuickLog} className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning mb-2 group-hover:scale-110 transition-transform"><Utensils size={20} /></div>
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">{isAr ? "تسجيل سريع" : "Quick Log"}</h3>
          <p className="text-[9px] text-text-muted mt-0.5">{isAr ? "سجل السعرات والتغذية" : "Nutrition & macros"}</p>
        </button>
        <button onClick={onAiCoach} className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform"><Zap size={20} /></div>
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">{isAr ? "مدرب الذكاء الاصطناعي" : "AI Coach"}</h3>
          <p className="text-[9px] text-text-muted mt-0.5">{isAr ? "برامج تدريبية ذكية" : "Smart workout plans"}</p>
        </button>
      </div>
    </motion.div>
  );
}
