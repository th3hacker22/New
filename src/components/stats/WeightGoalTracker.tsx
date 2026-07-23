import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/utils/cn";

interface WeightGoalProps {
  current: number;
  start: number;
  target: number;
  isAr?: boolean;
}

export function WeightGoalTracker({ current, start, target, isAr }: WeightGoalProps) {
  const totalChange = Math.abs(target - start);
  const currentChange = Math.abs(current - start);
  const progress = totalChange === 0 ? 0 : Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
  
  const isLoss = target < start;
  const remaining = Math.abs(target - current);
  
  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {isAr ? "الهدف" : "Target Progress"}
            </p>
            <p className="text-sm font-bold text-text-primary">
              {target} <span className="text-[10px] text-text-muted uppercase">kg</span>
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {isAr ? "المتبقي" : "Remaining"}
          </p>
          <div className="flex items-center gap-1 justify-end">
            {isLoss ? (
              <TrendingDown className="h-3 w-3 text-success" />
            ) : (
              <TrendingUp className="h-3 w-3 text-primary" />
            )}
            <p className={cn("text-sm font-bold tabular-nums", isLoss ? "text-success" : "text-primary")}>
              {remaining.toFixed(1)} <span className="text-[10px] opacity-70 uppercase font-medium">kg</span>
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-3 w-full bg-bg-elevated rounded-full overflow-hidden border border-border/50">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full",
            isLoss ? "bg-success shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-primary shadow-[0_0_10px_rgba(204,255,0,0.3)]"
          )}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-text-muted px-1">
        <span>{start} kg</span>
        <span>{progress.toFixed(0)}% {isAr ? "مكتمل" : "Complete"}</span>
        <span>{target} kg</span>
      </div>
    </div>
  );
}
