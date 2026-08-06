import { motion } from 'framer-motion';
import { Apple, Flame, Droplet, Edit2, RotateCcw } from 'lucide-react';
import { ProteinMicroSvg, CarbsMicroSvg, FatMicroSvg } from './presets';

interface NutritionGoal {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroSummaryProps {
  goal: NutritionGoal;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  labels: Record<string, string>;
  water: number;
  onEditGoal: () => void;
  onAddWater: (amount: number) => void;
  onResetWater: () => void;
}

export function MacroSummary({
  goal,
  totals,
  labels,
  water,
  onEditGoal,
  onAddWater,
  onResetWater,
}: MacroSummaryProps) {
  const remaining = goal.dailyCalories - totals.calories;
  const percent = Math.min(100, (totals.calories / goal.dailyCalories) * 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calorie ring */}
      <div className="glass-card relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-border/80 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-base font-black uppercase tracking-wider">
              {labels.caloriesRemaining}
            </h2>
          </div>
          <button
            onClick={onEditGoal}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
            aria-label="Edit goals"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex flex-col items-center justify-center py-4">
          <svg className="h-36 w-36 -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-border"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-primary"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black tracking-tight text-text-primary">
              {remaining >= 0 ? remaining : 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {remaining >= 0 ? labels.caloriesRemaining : labels.overLimit}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border/40 pt-4 text-center">
          <div className="border-r border-border/40">
            <div className="text-[10px] font-bold uppercase text-text-muted">{labels.consumed}</div>
            <div className="text-lg font-black text-primary">
              {totals.calories} <span className="text-xs">kcal</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-text-muted">{labels.goal}</div>
            <div className="text-lg font-black text-text-secondary">
              {goal.dailyCalories} <span className="text-xs">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macros + water */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="glass-card rounded-3xl border border-primary/10 bg-[#080a10]/60 p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
          <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2 relative z-10">
            <Apple className="h-5 w-5 text-primary" />
            <span>Macronutrient Intake</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <MacroBar
              icon={<ProteinMicroSvg />}
              color="primary"
              label={labels.protein}
              value={totals.protein}
              target={goal.protein}
            />
            <MacroBar
              icon={<CarbsMicroSvg />}
              color="secondary"
              label={labels.carbs}
              value={totals.carbs}
              target={goal.carbs}
            />
            <MacroBar
              icon={<FatMicroSvg />}
              color="warning"
              label={labels.fat}
              value={totals.fat}
              target={goal.fat}
            />
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-blue-500/20 bg-[#0c0f17] p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-400 animate-bounce" />
              <span>{labels.water}</span>
            </h2>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-400 border border-blue-500/20">
              {labels.waterGoal}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
            <div className="relative h-28 w-28 rounded-full border border-blue-500/30 bg-blue-950/20 overflow-hidden flex items-center justify-center">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/80 to-blue-400/50"
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(100, (water / 3000) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 40 }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-2xl font-black text-text-primary">
                  {water} <span className="text-xs">{labels.waterUnit}</span>
                </span>
                <span className="text-[9px] font-black text-blue-100 uppercase">
                  {Math.round((water / 3000) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full">
              <div className="grid grid-cols-3 gap-2">
                {[250, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => onAddWater(amount)}
                    className="flex flex-col items-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-black transition-all hover:scale-105"
                  >
                    <span className="text-sm">
                      {amount >= 1000 ? `+${amount / 1000}L` : `+${amount}`}
                    </span>
                    <span className="text-[9px] font-bold uppercase">{labels.waterUnit}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={onResetWater}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary text-xs font-bold transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {labels.reset}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroBar({
  icon,
  label,
  value,
  target,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  target: number;
  color: 'primary' | 'secondary' | 'warning';
}) {
  const pct = Math.min(100, (value / target) * 100);
  const barColor = {
    primary: 'from-primary to-primary-hover shadow-[0_0_8px_#ccff00]',
    secondary: 'from-secondary to-cyan-400 shadow-[0_0_8px_#00ffff]',
    warning: 'from-warning to-amber-400 shadow-[0_0_8px_#f59e0b]',
  }[color];
  const textColor = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    warning: 'text-warning',
  }[color];
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[#0c0f17] p-3.5 border border-white/5">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className={textColor}>{label}</span>
        </div>
        <span className="font-mono text-text-secondary">
          {value}g / {target}g
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-[#141923] overflow-hidden p-[2px] border border-white/5">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="text-[10px] text-text-muted text-right font-black">
        {Math.round(pct) || 0}%
      </span>
    </div>
  );
}
