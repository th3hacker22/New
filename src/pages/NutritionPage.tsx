import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, PlusCircle, ArrowRightLeft } from 'lucide-react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n';
import { storage } from '@/lib/storage';
import { MealScanner } from '@/components/nutrition/MealScanner';
import HealthySwapsHelper from '@/components/extras/HealthySwapsHelper';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { AiFoodLogger } from '@/components/nutrition/AiFoodLogger';
import { MealLog } from '@/components/nutrition/MealLog';
import { WeekSelector } from '@/components/nutrition/WeekSelector';
import { FoodModals } from '@/components/nutrition/FoodModals';
import { PRESET_FOODS, type PresetFood } from '@/components/nutrition/presets';
import { Button } from '@/components/ui/Button';
import nutritionMacrosImg from '@/assets/images/nutrition_macros_illustration_1784768406683.jpg';
import type { MealType } from '@/domain';

interface AiResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
}

export default function NutritionPage() {
  const { t, isAr } = useTranslation();
  const labels = new Proxy({} as Record<string, string>, {
    get: (_, prop: string) => t(`nutrition.${prop}`),
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isMealScannerOpen, setIsMealScannerOpen] = useState(false);
  const [isSwapsOpen, setIsSwapsOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);

  const { entries, goal, loadEntries, loadGoal, addFoodEntry, deleteFoodEntry, setGoal } =
    useNutritionStore();
  const user = useAuthStore((s) => s.user);
  const formattedDate = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    loadEntries(formattedDate);
  }, [currentDate, loadEntries, formattedDate]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  // Water intake, persisted per day.
  const [water, setWater] = useState(0);
  useEffect(() => {
    try {
      setWater(Number(storage.getString(`water_intake_${formattedDate}` as never, '0')) || 0);
    } catch {
      setWater(0);
    }
  }, [formattedDate]);

  const persistWater = (value: number) => {
    setWater(value);
    storage.set(`water_intake_${formattedDate}` as never, String(value) as never);
  };
  const addWater = (amount: number) => persistWater(Math.max(0, water + amount));
  const resetWater = () => persistWater(0);

  const safeGoal = goal || {
    dailyCalories: 2200,
    protein: 140,
    carbs: 220,
    fat: 70,
    id: 'temp',
    updatedAt: '',
  };
  const totals = {
    calories: entries.reduce((a, e) => a + e.calories, 0),
    protein: entries.reduce((a, e) => a + e.protein, 0),
    carbs: entries.reduce((a, e) => a + e.carbs, 0),
    fat: entries.reduce((a, e) => a + e.fat, 0),
  };

  const addEntry = async (data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: MealType;
  }) => {
    await addFoodEntry({ date: formattedDate, ...data }, user?.uid);
    setShowAddModal(false);
  };

  const addQuickPreset = async (preset: PresetFood) => {
    await addFoodEntry({ date: formattedDate, ...preset }, user?.uid);
  };

  const addAiResult = (result: AiResult) => {
    addFoodEntry({ date: formattedDate, ...result }, user?.uid);
    setAiResult(null);
  };

  return (
    <motion.div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-28 text-text-primary"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MealScanner
        isOpen={isMealScannerOpen}
        onClose={() => setIsMealScannerOpen(false)}
        onScan={(data) => {
          setAiResult(data);
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        isAr={isAr}
      />

      {/* Hero */}
      <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden border border-border/60 shadow-xl group">
        <img
          src={nutritionMacrosImg}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/90 via-bg-surface/60 to-transparent flex flex-col justify-center p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-md self-start mb-1 backdrop-blur-md">
            {isAr ? 'تغذية ذكية 3D' : '3D MACRO TRACKER'}
          </span>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-text-primary">
            {labels.title}
          </h1>
          <p className="text-xs text-text-muted font-bold mt-0.5 max-w-md">{labels.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 gap-3">
        <h2 className="text-lg font-black uppercase tracking-tight text-text-primary">
          {isAr ? 'متابعة السعرات والماكروز' : 'Daily Macro Overview'}
        </h2>
        <button
          onClick={() => setIsSwapsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-primary/30 bg-primary-dim/15 hover:bg-primary/20 text-xs font-black uppercase tracking-wider text-primary transition-all self-start sm:self-center"
        >
          <ArrowRightLeft className="w-4 h-4 animate-pulse" />
          <span>{isAr ? 'دليل البدائل' : 'Swaps & Cheat Balance'}</span>
        </button>
      </div>

      <WeekSelector
        currentDate={currentDate}
        labels={{ today: labels.today }}
        onChange={setCurrentDate}
      />

      <MacroSummary
        goal={safeGoal}
        totals={totals}
        labels={labels}
        water={water}
        onEditGoal={() => setShowGoalModal(true)}
        onAddWater={addWater}
        onResetWater={resetWater}
      />

      <AiFoodLogger
        labels={labels}
        isAr={isAr}
        onScanClick={() => setIsMealScannerOpen(true)}
        onAdd={addAiResult}
      />
      {/* AiFoodLogger manages its own prompt/result; external aiResult kept for scan flow */}

      {/* Quick presets */}
      <div className="glass-card rounded-3xl border border-border/80 p-6 flex flex-col gap-4">
        <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          <span>{labels.quickAdd}</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_FOODS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => addQuickPreset(preset)}
              className="group flex flex-col items-start rounded-2xl bg-bg/40 border border-border/40 p-3 hover:border-primary/40 hover:bg-primary-dim/5 text-left transition-all"
            >
              <div className="flex w-full items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-text-primary group-hover:text-primary line-clamp-1">
                  {preset.name}
                </span>
                <Plus className="h-3.5 w-3.5 text-text-muted group-hover:text-primary shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-black text-text-secondary">
                  {preset.calories} <span className="text-[9px] text-text-muted">kcal</span>
                </span>
                <span className="text-[10px] text-text-muted font-mono">{preset.protein}P</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <MealLog
        entries={entries}
        labels={labels}
        isAr={isAr}
        onDelete={(id) => deleteFoodEntry(id, user?.uid)}
      />

      {/* Floating Add */}
      <div className="fixed bottom-20 left-0 right-0 pointer-events-none flex justify-center z-40">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="pointer-events-auto rounded-full px-6 py-4 font-black uppercase tracking-wider shadow-lg shadow-primary/25"
          icon={<Plus className="h-5 w-5 text-bg" />}
        >
          {labels.addFood}
        </Button>
      </div>

      <FoodModals
        showAdd={showAddModal}
        showGoal={showGoalModal}
        labels={labels}
        goal={safeGoal}
        onCloseAdd={() => setShowAddModal(false)}
        onCloseGoal={() => setShowGoalModal(false)}
        onSubmitFood={addEntry}
        onSubmitGoal={(g) => {
          setGoal(g, user?.uid);
          setShowGoalModal(false);
        }}
      />

      <HealthySwapsHelper isOpen={isSwapsOpen} onClose={() => setIsSwapsOpen(false)} isAr={isAr} />
    </motion.div>
  );
}
