import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface GoalShape {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodModalsProps {
  showAdd: boolean;
  showGoal: boolean;
  labels: Record<string, string>;
  goal: GoalShape;
  onCloseAdd: () => void;
  onCloseGoal: () => void;
  onSubmitFood: (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }) => void;
  onSubmitGoal: (g: Omit<GoalShape, 'id' | 'updatedAt'>) => void;
}

export function FoodModals({
  showAdd,
  showGoal,
  labels,
  goal,
  onCloseAdd,
  onCloseGoal,
  onSubmitFood,
  onSubmitGoal,
}: FoodModalsProps) {
  return (
    <>
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border"
            >
              <h2 className="text-lg font-black text-text-primary uppercase tracking-wider mb-4">
                {labels.addFood}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  onSubmitFood({
                    name: f.get('name') as string,
                    calories: Number(f.get('calories')),
                    protein: Number(f.get('protein')),
                    carbs: Number(f.get('carbs')),
                    fat: Number(f.get('fat')),
                    mealType: f.get('mealType') as 'breakfast' | 'lunch' | 'dinner' | 'snack',
                  });
                }}
                className="flex flex-col gap-4"
              >
                <Field label={labels.foodName}>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="e.g. Avocado Toast"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={labels.calories}>
                    <input
                      required
                      name="calories"
                      type="number"
                      placeholder="kcal"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={labels.mealType}>
                    <select required name="mealType" className={inputCls}>
                      <option value="breakfast">{labels.breakfast}</option>
                      <option value="lunch">{labels.lunch}</option>
                      <option value="dinner">{labels.dinner}</option>
                      <option value="snack">{labels.snack}</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label={`${labels.protein} (g)`}>
                    <input
                      required
                      name="protein"
                      type="number"
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${labels.carbs} (g)`}>
                    <input
                      required
                      name="carbs"
                      type="number"
                      placeholder="0"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${labels.fat} (g)`}>
                    <input required name="fat" type="number" placeholder="0" className={inputCls} />
                  </Field>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onCloseAdd}
                    className="flex-1 rounded-xl bg-bg-elevated py-3 text-xs font-bold text-text-primary uppercase tracking-wider hover:bg-bg-elevated/50"
                  >
                    {labels.cancel}
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3 text-xs font-black uppercase tracking-wider"
                  >
                    {labels.save}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-border"
            >
              <h2 className="text-lg font-black text-text-primary uppercase tracking-wider mb-4">
                {labels.editGoals}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  onSubmitGoal({
                    dailyCalories: Number(f.get('calories')),
                    protein: Number(f.get('protein')),
                    carbs: Number(f.get('carbs')),
                    fat: Number(f.get('fat')),
                  });
                }}
                className="flex flex-col gap-4"
              >
                <Field label={labels.dailyCalories}>
                  <input
                    required
                    defaultValue={goal.dailyCalories}
                    name="calories"
                    type="number"
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label={`${labels.protein} (g)`}>
                    <input
                      required
                      defaultValue={goal.protein}
                      name="protein"
                      type="number"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${labels.carbs} (g)`}>
                    <input
                      required
                      defaultValue={goal.carbs}
                      name="carbs"
                      type="number"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${labels.fat} (g)`}>
                    <input
                      required
                      defaultValue={goal.fat}
                      name="fat"
                      type="number"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onCloseGoal}
                    className="flex-1 rounded-xl bg-bg-elevated py-3 text-xs font-bold text-text-primary uppercase tracking-wider hover:bg-bg-elevated/50"
                  >
                    {labels.cancel}
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3 text-xs font-black uppercase tracking-wider"
                  >
                    {labels.save}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const inputCls =
  'w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-text-muted uppercase">{label}</label>
      {children}
    </div>
  );
}
