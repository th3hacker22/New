import { useState, useEffect } from "react";
import { format, subDays, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Apple,
  Flame,
  Edit2,
  Trash2,
  Sparkles,
  Droplet,
  PlusCircle,
  Coffee,
  Utensils,
  Cookie,
  Moon,
  Calendar,
  Check,
  RotateCcw,
  Loader2,
  AlertCircle,
  ArrowRightLeft
} from "lucide-react";
import { useNutritionStore } from "@/store/useNutritionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { MealScanner } from "@/components/nutrition/MealScanner";
import { useSettingsStore } from "@/store/useSettingsStore";
import HealthySwapsHelper from "@/components/extras/HealthySwapsHelper";
import nutritionMacrosImg from "@/assets/images/nutrition_macros_illustration_1784768406683.jpg";
import breakfastMealImg from "@/assets/images/breakfast_meal_bg_1784776621698.jpg";
import nutritionMealsImg from "@/assets/images/nutrition_meals_illustration_1784776025732.jpg";
import aiFoodScannerImg from "@/assets/images/ai_food_scanner_illustration_1784776039871.jpg";

const ProteinMicroSvg = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
    <path d="M12 8v8M8 12h8" stroke="#ccff00" />
  </svg>
);

const CarbsMicroSvg = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M12 9L8 6M12 11L16 8M12 15L8 12M12 17L16 14" stroke="#00ffff" />
  </svg>
);

const FatMicroSvg = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-warning shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" strokeOpacity="0.2" />
    <path d="M12 7c-2.76 0-5 2.24-5 5s5 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

// Common presets with nutrition data
const PRESET_FOODS = [
  { name: "Boiled Eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10, mealType: "breakfast" as const },
  { name: "Grilled Chicken Breast (150g)", calories: 247, protein: 46, carbs: 0, fat: 4, mealType: "lunch" as const },
  { name: "Oatmeal with Honey", calories: 320, protein: 11, carbs: 54, fat: 6, mealType: "breakfast" as const },
  { name: "Sweet Banana", calories: 105, protein: 1, carbs: 27, fat: 0, mealType: "snack" as const },
  { name: "Basmati Rice cooked (150g)", calories: 200, protein: 4, carbs: 44, fat: 0, mealType: "lunch" as const },
  { name: "Protein Whey Shake", calories: 130, protein: 25, carbs: 2, fat: 2, mealType: "snack" as const },
  { name: "Dates (3 pieces)", calories: 80, protein: 1, carbs: 21, fat: 0, mealType: "snack" as const },
  { name: "Healthy Beef Tagine", calories: 450, protein: 32, carbs: 24, fat: 22, mealType: "dinner" as const },
];

export default function NutritionPage() {
  const { language } = useSettingsStore();
  const isAr = language === "ar";

  // Translation labels
  const labels = {
    title: isAr ? "مركز التغذية" : "Nutrition Hub",
    subtitle: isAr ? "تتبع سعراتك وماكروز وجباتك" : "Fuel your progress, track macros & log meals",
    caloriesRemaining: isAr ? "السعرات المتبقية" : "Calories Left",
    consumed: isAr ? "مستهلك" : "consumed",
    goal: isAr ? "الهدف" : "Goal",
    protein: isAr ? "بروتين" : "Protein",
    carbs: isAr ? "كارب" : "Carbs",
    fat: isAr ? "دهون" : "Fat",
    water: isAr ? "الميه" : "Water",
    waterGoal: isAr ? "الهدف: 3000 مل" : "Goal: 3000 ml",
    addWater: isAr ? "تسجيل الميه" : "Log Water",
    reset: isAr ? "إعادة" : "Reset",
    quickAdd: isAr ? "تسجيل سريع" : "Quick Log Presets",
    aiLogger: isAr ? "المسجل الذكي ✨" : "AI Smart Log ✨",
    aiPlaceholder: isAr ? "وصف وجبتك (مثلاً: 3 بيضات، نص افوكادو و 100 جرام شوفان)" : "Describe your meal (e.g., '3 boiled eggs, half an avocado and 100g oats')",
    aiAnalyze: isAr ? "تحليل بواسطة Gemini" : "Analyze with Gemini",
    aiAnalyzing: isAr ? "جاري تحليل الطعام..." : "AI is analyzing your food...",
    aiSuccess: isAr ? "تم تحليل وجبتك!" : "Gemini analyzed your meal!",
    aiAdd: isAr ? "إضافة للسجل" : "Add to Daily Log",
    aiReject: isAr ? "إلغاء" : "Cancel",
    addFood: isAr ? "إضافة يدوية" : "Manual Food Entry",
    scanMeal: isAr ? "تصوير الوجبة" : "Scan Meal Photo",
    foodName: isAr ? "اسم الأكل" : "Food Name",
    calories: isAr ? "السعرات" : "Calories (kcal)",
    mealType: isAr ? "نوع الوجبة" : "Meal Type",
    breakfast: isAr ? "فطار" : "Breakfast",
    lunch: isAr ? "غدا" : "Lunch",
    dinner: isAr ? "عشا" : "Dinner",
    snack: isAr ? "سناك" : "Snack",
    editGoals: isAr ? "تعديل الأهداف" : "Update Nutrition Goals",
    dailyCalories: isAr ? "هدف السعرات اليومي" : "Daily Calories Goal",
    save: isAr ? "حفظ" : "Save Changes",
    cancel: isAr ? "إلغاء" : "Cancel",
    noEntries: isAr ? "لا توجد وجبات مسجلة اليوم" : "No meals logged for today. Tap below or type to log!",
    popularFoods: isAr ? "أكلات شائعة" : "Popular Fitness Presets",
    waterUnit: isAr ? "مل" : "ml",
    today: isAr ? "اليوم" : "Today",
    targetMet: isAr ? "تم الوصول للهدف!" : "Target Met!",
    overLimit: isAr ? "تجاوزت الهدف" : "Over Target",
    confirmAdd: isAr ? "تمت الإضافة بنجاح!" : "Added successfully!",
    manualForm: isAr ? "إضافة يدوية" : "Manual Entry",
    aiResults: isAr ? "نتيجة التحليل" : "Analysis Result",
    waterTitle: isAr ? "حالة الترطيب" : "Hydration Status",
    waterLogs: isAr ? "سجل الميه اليومي" : "Daily Water intake",
    suggestedMeal: isAr ? "وجبة مقترحة" : "Suggested Meal",
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isMealScannerOpen, setIsMealScannerOpen] = useState(false);
  const [isSwapsOpen, setIsSwapsOpen] = useState(false);

  // AI Logger States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const {
    entries,
    goal,
    loadEntries,
    loadGoal,
    addFoodEntry,
    deleteFoodEntry,
    setGoal,
  } = useNutritionStore();
  
  const user = useAuthStore((s) => s.user);
  const formattedDate = format(currentDate, "yyyy-MM-dd");

  // Load entries and goals
  useEffect(() => {
    loadEntries(formattedDate);
  }, [currentDate, loadEntries, formattedDate]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  // Water persistence via centralized storage manager
  const [water, setWater] = useState(0);
  useEffect(() => {
    try {
      const { storage } = require("@/lib/storage");
      const saved = storage.getString(`water_intake_${formattedDate}` as any, "0");
      setWater(Number(saved) || 0);
    } catch {
      setWater(0);
    }
  }, [formattedDate]);

  const handleWaterAdd = (amount: number) => {
    const nextWater = Math.max(0, water + amount);
    setWater(nextWater);
    try {
      const { storage } = require("@/lib/storage");
      storage.set(`water_intake_${formattedDate}` as any, String(nextWater) as any);
    } catch {}
  };

  const handleWaterReset = () => {
    setWater(0);
    try {
      const { storage } = require("@/lib/storage");
      storage.set(`water_intake_${formattedDate}` as any, "0" as any);
    } catch {}
  };

  const safeGoal = goal || {
    dailyCalories: 2200,
    protein: 140,
    carbs: 220,
    fat: 70,
    id: "temp",
    updatedAt: "",
  };

  // Aggregated macros
  const totalCalories = entries.reduce((acc, sum) => acc + sum.calories, 0);
  const totalProtein = entries.reduce((acc, sum) => acc + sum.protein, 0);
  const totalCarbs = entries.reduce((acc, sum) => acc + sum.carbs, 0);
  const totalFat = entries.reduce((acc, sum) => acc + sum.fat, 0);

  const remainingCalories = safeGoal.dailyCalories - totalCalories;
  const calPercent = Math.min(100, (totalCalories / safeGoal.dailyCalories) * 100);

  // Generate last 7 days list
  const getWeekDays = () => {
    const days = [];
    for (let i = 5; i >= 0; i--) {
      days.push(subDays(new Date(), i));
    }
    days.push(addDays(new Date(), 1)); // allow 1 day in the future
    return days;
  };
  const weekDays = getWeekDays();

  // Handle submit manual form
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addFoodEntry(
      {
        date: formattedDate,
        name: formData.get("name") as string,
        calories: Number(formData.get("calories")),
        protein: Number(formData.get("protein")),
        carbs: Number(formData.get("carbs")),
        fat: Number(formData.get("fat")),
        mealType: formData.get("mealType") as any,
      },
      user?.uid,
    );
    setShowAddModal(false);
  };

  // Handle goals setting
  const handleGoalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await setGoal(
      {
        dailyCalories: Number(formData.get("calories")),
        protein: Number(formData.get("protein")),
        carbs: Number(formData.get("carbs")),
        fat: Number(formData.get("fat")),
      },
      user?.uid,
    );
    setShowGoalModal(false);
  };

  // Handle AI analysis
  const handleAiAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch("/api/parse-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiPrompt,
          mealTypeHint: "snack"
        })
      });

      if (!response.ok) {
        throw new Error("Unable to analyze food. Make sure the server config has an active GEMINI_API_KEY.");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError("Failed to analyze meal. Please ensure your Gemini key is valid.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiResult = async () => {
    if (!aiResult) return;
    await addFoodEntry({
      date: formattedDate,
      name: aiResult.name,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
      mealType: aiResult.mealType as any
    }, user?.uid);

    setAiPrompt("");
    setAiResult(null);
  };

  // Quick Preset Add
  const handleQuickAdd = async (preset: typeof PRESET_FOODS[0]) => {
    const name = preset.name;
    await addFoodEntry({
      date: formattedDate,
      name,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      mealType: preset.mealType
    }, user?.uid);
  };

  // Circular progress properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPercent / 100) * circumference;

  const handleScanResult = (data: any) => {
    setAiResult(data);
    // Scroll to results if needed
    window.scrollTo({ top: 300, behavior: 'smooth' });
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
        onScan={handleScanResult}
        isAr={isAr}
      />

      {/* ── 3D Nutrition Hero Banner ── */}
      <div className="relative w-full h-32 md:h-36 rounded-2xl overflow-hidden border border-border/60 shadow-xl group">
        <img
          src={nutritionMacrosImg}
          alt="3D Nutrition & Macros Illustration"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/90 via-bg-surface/60 to-transparent flex flex-col justify-center p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-md self-start mb-1 backdrop-blur-md">
            {isAr ? "تغذية ذكية 3D" : "3D MACRO TRACKER"}
          </span>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-text-primary">
            {labels.title}
          </h1>
          <p className="text-xs text-text-muted font-bold mt-0.5 max-w-md">
            {labels.subtitle}
          </p>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 gap-3">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-text-primary">
            {isAr ? "متابعة السعرات والماكروز اليومية" : "Daily Macro Overview"}
          </h2>
        </div>
        <button
          onClick={() => setIsSwapsOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-primary/30 bg-primary-dim/15 hover:bg-primary/20 hover:border-primary/50 text-xs font-black uppercase tracking-wider text-primary transition-all shadow-glow-primary/5 self-start sm:self-center cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-primary animate-pulse" />
          <span>{isAr ? "دليل البدائل ومصحح الغش" : "Swaps & Cheat Balance"}</span>
        </button>
      </div>

      {/* Modern Day Selector Component */}
      <div className="flex flex-col gap-3 rounded-2xl bg-bg-elevated/20 p-3 border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-text-muted font-bold uppercase tracking-wide">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(currentDate, "EEEE, MMMM dd")}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate((p) => subDays(p, 1))}
              className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg px-2 py-1 text-xs font-bold bg-primary-dim/30 text-primary hover:bg-primary-dim/50"
            >
              {labels.today}
            </button>
            <button
              onClick={() => setCurrentDate((p) => addDays(p, 1))}
              className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Week Selection */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, idx) => {
            const isSelected = isSameDay(day, currentDate);
            const isTodayDate = isSameDay(day, new Date());
            return (
              <button
                key={idx}
                onClick={() => setCurrentDate(day)}
                className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-primary to-primary-hover text-bg shadow-md scale-105"
                    : "bg-bg hover:bg-bg-elevated/40"
                } border ${isSelected ? "border-transparent" : "border-border/30"}`}
              >
                <span className={`text-[10px] font-black uppercase ${isSelected ? "text-bg" : "text-text-muted"}`}>
                  {format(day, "eee")}
                </span>
                <span className="text-base font-black leading-none mt-1">
                  {format(day, "d")}
                </span>
                {isTodayDate && !isSelected && (
                  <span className="h-1 w-1 rounded-full bg-primary mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Summary Rings & Progress & AI Helper */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Progress Ring Card */}
        <div className="glass-card relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-border/80 p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-base font-black uppercase tracking-wider">{labels.caloriesRemaining}</h2>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-all"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          {/* SVG Circular Ring */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <svg className="h-36 w-36 -rotate-90">
              {/* Background Track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-border"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Track */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-primary"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-text-primary">
                {remainingCalories >= 0 ? remainingCalories : 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {remainingCalories >= 0 ? labels.caloriesRemaining : labels.overLimit}
              </span>
            </div>
          </div>

          {/* Calories agg */}
          <div className="grid grid-cols-2 border-t border-border/40 pt-4 text-center">
            <div className="border-r border-border/40">
              <div className="text-[10px] font-bold uppercase text-text-muted">{labels.consumed}</div>
              <div className="text-lg font-black text-primary">{totalCalories} <span className="text-xs">kcal</span></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-text-muted">{labels.goal}</div>
              <div className="text-lg font-black text-text-secondary">{safeGoal.dailyCalories} <span className="text-xs">kcal</span></div>
            </div>
          </div>
        </div>

        {/* Middle Column: Macro Bars & Water Tracker */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Bento-Item 1: Macro Goals */}
          <div className="glass-card rounded-3xl border border-primary/10 bg-[#080a10]/60 p-6 flex flex-col gap-4 relative overflow-hidden group/macros">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
            
            <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2 relative z-10">
              <Apple className="h-5 w-5 text-primary filter drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]" />
              <span>Macronutrient Intake</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* Protein Bar */}
              <div className="flex flex-col gap-1.5 rounded-2xl bg-[#0c0f17] p-3.5 border border-white/5 hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <ProteinMicroSvg />
                    <span className="text-primary">{labels.protein}</span>
                  </div>
                  <span className="font-mono text-text-secondary">{totalProtein}g / {safeGoal.protein}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#141923] overflow-hidden p-[2px] border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover shadow-[0_0_8px_#ccff00]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalProtein / safeGoal.protein) * 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-[10px] text-text-muted text-right font-black">
                  {Math.round((totalProtein / safeGoal.protein) * 100) || 0}%
                </span>
              </div>

              {/* Carbs Bar */}
              <div className="flex flex-col gap-1.5 rounded-2xl bg-[#0c0f17] p-3.5 border border-white/5 hover:border-secondary/20 transition-all">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <CarbsMicroSvg />
                    <span className="text-secondary">{labels.carbs}</span>
                  </div>
                  <span className="font-mono text-text-secondary">{totalCarbs}g / {safeGoal.carbs}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#141923] overflow-hidden p-[2px] border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-cyan-400 shadow-[0_0_8px_#00ffff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalCarbs / safeGoal.carbs) * 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-[10px] text-text-muted text-right font-black">
                  {Math.round((totalCarbs / safeGoal.carbs) * 100) || 0}%
                </span>
              </div>

              {/* Fat Bar */}
              <div className="flex flex-col gap-1.5 rounded-2xl bg-[#0c0f17] p-3.5 border border-white/5 hover:border-warning/20 transition-all">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <FatMicroSvg />
                    <span className="text-warning">{labels.fat}</span>
                  </div>
                  <span className="font-mono text-text-secondary">{totalFat}g / {safeGoal.fat}g</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#141923] overflow-hidden p-[2px] border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-warning to-amber-400 shadow-[0_0_8px_#f59e0b]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalFat / safeGoal.fat) * 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-[10px] text-text-muted text-right font-black">
                  {Math.round((totalFat / safeGoal.fat) * 100) || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Bento-Item 2: Interactive Water Intake Tracker */}
          <div className="glass-card rounded-3xl border border-blue-500/20 bg-[#0c0f17] p-6 flex flex-col gap-4 relative overflow-hidden group/water shadow-[0_0_30px_rgba(6,182,212,0.04)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none" />
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
              {/* Dynamic Water wave level representation */}
              <div className="relative h-28 w-28 rounded-full border border-blue-500/30 bg-blue-950/20 overflow-hidden flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,191,255,0.2)]">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/80 to-blue-400/50"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (water / 3000) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 40 }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-text-primary drop-shadow-md">
                    {water} <span className="text-xs">{labels.waterUnit}</span>
                  </span>
                  <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest drop-shadow">
                    {Math.round((water / 3000) * 100)}%
                  </span>
                </div>
              </div>

              {/* Water logging actions */}
              <div className="flex-1 flex flex-col gap-3 w-full">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleWaterAdd(250)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-black transition-all cursor-pointer hover:scale-105"
                  >
                    <span className="text-sm">+250</span>
                    <span className="text-[9px] font-bold uppercase">{labels.waterUnit}</span>
                  </button>
                  <button
                    onClick={() => handleWaterAdd(500)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 text-blue-400 font-black transition-all cursor-pointer hover:scale-105"
                  >
                    <span className="text-sm">+500</span>
                    <span className="text-[9px] font-bold uppercase">{labels.waterUnit}</span>
                  </button>
                  <button
                    onClick={() => handleWaterAdd(1000)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 text-blue-400 font-black transition-all cursor-pointer hover:scale-105"
                  >
                    <span className="text-sm">+1L</span>
                    <span className="text-[9px] font-bold uppercase">{labels.waterUnit}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWaterReset}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{labels.reset}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Log Assistant (Stellar Box) */}
      <div className="glass-card overflow-hidden rounded-3xl border border-primary/20 shadow-lg shadow-primary/5 p-6 flex flex-col gap-4 relative">
        <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
            <span className="rounded-lg bg-primary/20 p-1.5 text-primary">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <span>{labels.aiLogger}</span>
          </h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            Powered by Gemini
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Text Area Column */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={labels.aiPlaceholder}
              className="w-full min-h-[105px] rounded-2xl border border-border bg-bg/50 p-4 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none transition-all h-full"
            />
          </div>

          {/* Holographic Food Scanner Column */}
          <div className="md:col-span-4 hidden md:flex flex-col items-center justify-center rounded-2xl border border-primary/20 p-5 relative overflow-hidden group/scanner shadow-[0_0_20px_rgba(204,255,0,0.1)] min-h-[160px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.1]" />
            
            {/* Background 3D Render Image */}
            <div className="absolute inset-0 z-0">
              <img
                src={aiFoodScannerImg}
                alt="AI Food Scanner"
                className="w-full h-full object-cover filter contrast-125 opacity-40 group-hover/scanner:scale-105 transition-transform duration-700 mix-blend-luminosity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a10]/80 via-[#080a10]/50 to-transparent" />
            </div>
            
            {/* Animated Laser Scan Line */}
            <motion.div
              className="absolute inset-x-0 h-[2px] bg-primary shadow-[0_0_12px_#ccff00] z-20 pointer-events-none"
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            
            <div className="text-center mt-auto relative z-20 w-full flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.8)] bg-black/60 px-2.5 py-1 rounded backdrop-blur-md border border-primary/20">
                {isAr ? "المسح الذكي بالرؤية" : "AI SENSORY SCAN"}
              </span>
              <p className="text-[9px] text-text-muted font-bold mt-2 drop-shadow-md bg-black/60 px-2 py-1 rounded backdrop-blur-md w-full">
                {isAr ? "تحليل السعرات الفوري بالذكاء الاصطناعي" : "Instant optical calorie extraction"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            {aiError && (
              <div className="flex items-center gap-1.5 text-xs text-danger font-semibold bg-danger/5 px-3 py-1.5 rounded-lg border border-danger/10">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button
                onClick={() => setIsMealScannerOpen(true)}
                variant="outline"
                className="px-4 font-black uppercase tracking-wider text-[10px] border border-secondary/40 hover:bg-secondary-dim/20"
                icon={<PlusCircle className="h-4 w-4 text-secondary" />}
              >
                {labels.scanMeal}
              </Button>
              <Button
                onClick={handleAiAnalyze}
                disabled={isAiLoading || !aiPrompt.trim()}
                variant="outline"
                className="px-5 font-black uppercase tracking-wider text-xs border border-primary/40 hover:bg-primary-dim/20"
                icon={isAiLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Sparkles className="h-4 w-4 text-primary" />}
              >
                {isAiLoading ? labels.aiAnalyzing : labels.aiAnalyze}
              </Button>
            </div>
          </div>

          {/* AI Result Cards Preview */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 rounded-2xl border border-primary/30 bg-primary-dim/10 p-4"
              >
                <div className="text-xs font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  <span>{labels.aiResults}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-text-primary">{aiResult.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {labels.suggestedMeal}: <span className="font-bold uppercase text-primary">{labels[aiResult.mealType as keyof typeof labels] || aiResult.mealType}</span>
                      </p>
                    </div>
                    <span className="rounded-xl bg-primary/20 px-3 py-1 text-sm font-black text-primary">
                      {aiResult.calories} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mt-1">
                    <div className="rounded-lg bg-bg/50 p-2 border border-border/30">
                      <div className="text-[9px] font-bold text-text-muted uppercase">{labels.protein}</div>
                      <div className="text-sm font-black text-text-secondary">{aiResult.protein}g</div>
                    </div>
                    <div className="rounded-lg bg-bg/50 p-2 border border-border/30">
                      <div className="text-[9px] font-bold text-text-muted uppercase">{labels.carbs}</div>
                      <div className="text-sm font-black text-text-secondary">{aiResult.carbs}g</div>
                    </div>
                    <div className="rounded-lg bg-bg/50 p-2 border border-border/30">
                      <div className="text-[9px] font-bold text-text-muted uppercase">{labels.fat}</div>
                      <div className="text-sm font-black text-text-secondary">{aiResult.fat}g</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setAiResult(null)}
                      className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-border/20 text-text-muted hover:bg-border/30 transition-all"
                    >
                      {labels.aiReject}
                    </button>
                    <Button
                      onClick={handleAddAiResult}
                      variant="primary"
                      className="flex-1 py-2 text-xs font-black uppercase tracking-wider"
                    >
                      {labels.aiAdd}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Add Presets Section */}
      <div className="glass-card rounded-3xl border border-border/80 p-6 flex flex-col gap-4">
        <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          <span>{labels.quickAdd}</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_FOODS.map((preset, idx) => {
            return (
              <button
                key={idx}
                onClick={() => handleQuickAdd(preset)}
                className="group relative flex flex-col items-start justify-between rounded-2xl bg-bg/40 border border-border/40 p-3 hover:border-primary/40 hover:bg-primary-dim/5 text-left transition-all"
              >
                <div className="flex w-full items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                    {preset.name}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-all shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-black text-text-secondary">{preset.calories} <span className="text-[9px] font-medium text-text-muted">kcal</span></span>
                  <span className="text-[10px] text-text-muted font-mono">{preset.protein}P</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Logs Classified by Meal Type */}
      <div className="flex flex-col gap-4">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => {
          const mealEntries = entries.filter((e) => e.mealType === meal);
          const mealCals = mealEntries.reduce((acc, sum) => acc + sum.calories, 0);

          let MealIcon = Coffee;
          if (meal === "lunch") MealIcon = Utensils;
          if (meal === "dinner") MealIcon = Moon;
          if (meal === "snack") MealIcon = Cookie;

          return (
            <div
              key={meal}
              className="group overflow-hidden rounded-3xl border border-border/50 bg-bg-elevated/10 p-5 transition-all hover:border-border/80 hover:bg-bg-elevated/20"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-bg-elevated/80 p-2 text-text-secondary">
                    <MealIcon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-text-primary">
                    {labels[meal]}
                  </h3>
                </div>
                <span className="rounded-full bg-bg-elevated/60 px-3 py-1 text-xs font-black text-text-secondary">
                  {mealCals} kcal
                </span>
              </div>

              {mealEntries.length === 0 ? (
                <div className="flex flex-col justify-end min-h-[140px] p-5 rounded-2xl border border-primary/15 relative overflow-hidden group/empty shadow-inner">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                      src={meal === "breakfast" ? breakfastMealImg : nutritionMealsImg}
                      alt="Meal Prep Illustration"
                      className={`w-full h-full object-cover filter contrast-125 opacity-30 group-hover/empty:scale-105 transition-transform duration-700 mix-blend-luminosity ${
                        meal === "lunch" ? "hue-rotate-180" : 
                        meal === "snack" ? "hue-rotate-90 saturate-200" : ""
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080a10] via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="text-right sm:text-left relative z-10 w-full mt-auto">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md backdrop-blur-md">
                        {isAr ? "وجبة مقترحة" : "Suggested Fuel"}
                      </span>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-text-primary drop-shadow-md">
                      {isAr ? `تسجيل وجبة ${labels[meal]}` : `Log your ${meal}`}
                    </h4>
                    <p className="text-[11px] text-text-muted font-bold mt-1 leading-relaxed max-w-[80%]">
                      {isAr 
                        ? `لم تسجل أي طعام في ${labels[meal]} بعد. حافظ على نمط حياتك المتوازن وسجل طعامك!` 
                        : `No entries logged in ${meal} yet. Fuel your body with fresh ingredients and record your macros.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-1">
                  {mealEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center bg-bg/40 border border-border/10 p-3 rounded-2xl hover:border-border/30 hover:bg-bg/60 transition-all group/item"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-extrabold text-text-primary">{entry.name}</span>
                        <span className="text-[10px] text-text-muted font-mono tracking-wide">
                          {entry.protein}g {labels.protein} • {entry.carbs}g {labels.carbs} • {entry.fat}g {labels.fat}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-text-primary">
                          {entry.calories} <span className="text-[10px] text-text-muted">kcal</span>
                        </span>
                        <button
                          onClick={() => deleteFoodEntry(entry.id, user?.uid)}
                          className="opacity-0 group-hover/item:opacity-100 rounded-lg p-1.5 text-danger/75 hover:bg-danger/10 hover:text-danger transition-all"
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

      {/* Floating Add Action Button */}
      <div className="fixed bottom-20 left-0 right-0 pointer-events-none flex justify-center z-40">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="pointer-events-auto rounded-full px-6 py-4 font-black uppercase tracking-wider shadow-lg shadow-primary/25 backdrop-blur-md"
          icon={<Plus className="h-5 w-5 text-bg" />}
        >
          {labels.addFood}
        </Button>
      </div>

      {/* Add Food Entry (Manual Modal) */}
      <AnimatePresence>
        {showAddModal && (
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
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">{labels.foodName}</label>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="e.g. Avocado Toast"
                    className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">{labels.calories}</label>
                    <input
                      required
                      name="calories"
                      type="number"
                      placeholder="kcal"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase">{labels.mealType}</label>
                    <select
                      required
                      name="mealType"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="breakfast">{labels.breakfast}</option>
                      <option value="lunch">{labels.lunch}</option>
                      <option value="dinner">{labels.dinner}</option>
                      <option value="snack">{labels.snack}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-primary">{labels.protein} (g)</label>
                    <input
                      required
                      name="protein"
                      type="number"
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-secondary">{labels.carbs} (g)</label>
                    <input
                      required
                      name="carbs"
                      type="number"
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-warning">{labels.fat} (g)</label>
                    <input
                      required
                      name="fat"
                      type="number"
                      placeholder="0"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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

      {/* Edit Goals (Modal) */}
      <AnimatePresence>
        {showGoalModal && (
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
              <form onSubmit={handleGoalSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted uppercase mb-1 block">
                    {labels.dailyCalories}
                  </label>
                  <input
                    required
                    defaultValue={safeGoal.dailyCalories}
                    name="calories"
                    type="number"
                    className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-primary mb-1 block">
                      {labels.protein} (g)
                    </label>
                    <input
                      required
                      defaultValue={safeGoal.protein}
                      name="protein"
                      type="number"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-secondary mb-1 block">
                      {labels.carbs} (g)
                    </label>
                    <input
                      required
                      defaultValue={safeGoal.carbs}
                      name="carbs"
                      type="number"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase text-warning mb-1 block">
                      {labels.fat} (g)
                    </label>
                    <input
                      required
                      defaultValue={safeGoal.fat}
                      name="fat"
                      type="number"
                      className="w-full rounded-xl border border-border bg-bg p-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
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

      <HealthySwapsHelper
        isOpen={isSwapsOpen}
        onClose={() => setIsSwapsOpen(false)}
        isAr={isAr}
      />
    </motion.div>
  );
}
