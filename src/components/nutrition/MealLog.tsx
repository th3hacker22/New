import { Coffee, Utensils, Moon, Cookie, Trash2 } from 'lucide-react';
import type { FoodEntry } from '@/domain';
import breakfastMealImg from '@/assets/images/breakfast_meal_bg_1784776621698.jpg';
import nutritionMealsImg from '@/assets/images/nutrition_meals_illustration_1784776025732.jpg';

interface MealLogProps {
  entries: FoodEntry[];
  labels: Record<string, string>;
  isAr: boolean;
  onDelete: (id: string) => void;
}

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_ICONS = { breakfast: Coffee, lunch: Utensils, dinner: Moon, snack: Cookie };

export function MealLog({ entries, labels, isAr, onDelete }: MealLogProps) {
  return (
    <div className="flex flex-col gap-4">
      {MEALS.map((meal) => {
        const mealEntries = entries.filter((e) => e.mealType === meal);
        const cals = mealEntries.reduce((acc, e) => acc + e.calories, 0);
        const Icon = MEAL_ICONS[meal];
        return (
          <div
            key={meal}
            className="group overflow-hidden rounded-3xl border border-border/50 bg-bg-elevated/10 p-5 transition-all hover:border-border/80 hover:bg-bg-elevated/20"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-bg-elevated/80 p-2 text-text-secondary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-text-primary">
                  {labels[meal]}
                </h3>
              </div>
              <span className="rounded-full bg-bg-elevated/60 px-3 py-1 text-xs font-black text-text-secondary">
                {cals} kcal
              </span>
            </div>

            {mealEntries.length === 0 ? (
              <div className="flex flex-col justify-end min-h-[140px] p-5 rounded-2xl border border-primary/15 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src={meal === 'breakfast' ? breakfastMealImg : nutritionMealsImg}
                    alt=""
                    className={`w-full h-full object-cover opacity-30 mix-blend-luminosity ${
                      meal === 'lunch'
                        ? 'hue-rotate-180'
                        : meal === 'snack'
                          ? 'hue-rotate-90 saturate-200'
                          : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/80 to-transparent" />
                </div>
                <div className="text-right sm:text-left relative z-10 w-full mt-auto">
                  <h4 className="text-sm font-black uppercase tracking-wider text-text-primary">
                    {isAr ? `تسجيل وجبة ${labels[meal]}` : `Log your ${meal}`}
                  </h4>
                  <p className="text-[11px] text-text-muted font-bold mt-1 leading-relaxed max-w-[80%]">
                    {isAr
                      ? `لم تسجل أي طعام في ${labels[meal]} بعد.`
                      : `No entries logged in ${meal} yet. Fuel your body and record your macros.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                {mealEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center bg-bg/40 border border-border/10 p-3 rounded-2xl hover:border-border/30 hover:bg-bg/60 group/item"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-extrabold text-text-primary">{entry.name}</span>
                      <span className="text-[10px] text-text-muted font-mono tracking-wide">
                        {entry.protein}g {labels.protein} • {entry.carbs}g {labels.carbs} •{' '}
                        {entry.fat}g {labels.fat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-text-primary">
                        {entry.calories} <span className="text-[10px] text-text-muted">kcal</span>
                      </span>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="opacity-0 group-hover/item:opacity-100 rounded-lg p-1.5 text-danger/75 hover:bg-danger/10 hover:text-danger transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
