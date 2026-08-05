import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface Props {
  title: string;
  subtitle: string;
  exerciseCount: number;
  isAr: boolean;
  onStart: () => void;
  onAi: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function StartWorkoutCta({ title, subtitle, exerciseCount, isAr, onStart, onAi }: Props) {
  return (
    <motion.div
      className="glass-card flex flex-col gap-2 rounded-[22px] p-5 border border-primary/50 bg-bg-surface shadow-xl relative overflow-hidden"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={2}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          {isAr ? "ابدأ التمرين" : "Start Workout"}
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
          {isAr ? "جاهز للرفع؟" : "READY TO LIFT?"}
        </span>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-5 shadow-[0_0_25px_rgba(204,255,0,0.35)] hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] flex items-center justify-between gap-3 transition-all active:scale-98 cursor-pointer mt-1 group"
        onClick={onStart}
      >
        <div className={cn("flex flex-col", isAr ? "items-start text-right" : "items-start text-left")}>
          <span className="text-black font-black text-sm md:text-base tracking-widest uppercase truncate max-w-[200px]">{title}</span>
          <span className="text-black/70 font-bold text-[9px] md:text-[10px] uppercase">{subtitle}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-black text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
          <Play size={18} className="fill-current ml-1" />
        </div>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="w-full rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-5 border border-primary/40 text-primary hover:bg-primary/10 flex items-center justify-between gap-3 transition-all active:scale-98 cursor-pointer mt-2 group"
        onClick={onAi}
      >
        <span className="font-black text-sm tracking-widest uppercase">{isAr ? "عمل تمرينة بالذكاء الاصطناعي 🔮" : "AI Workout Generator"}</span>
        <Zap size={18} className="text-primary" />
      </Button>

      <p className="text-[10px] text-text-muted text-center font-bold tracking-wider mt-0.5">
        {exerciseCount > 0 ? (isAr ? "اضغط للبدء بهذا الجدول" : "Tap to start this routine") : (isAr ? "اضغط لبدء التسجيل الفوري" : "Tap to begin tracking")}
      </p>
    </motion.div>
  );
}
