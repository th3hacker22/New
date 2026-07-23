import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Flame, Target, Compass, Sparkles, RefreshCw, 
  Check, Info, Calculator, Heart, Apple, Dumbbell 
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TDEECalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

export default function TDEECalculator({ isOpen, onClose, isAr = false }: TDEECalculatorProps) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState<string>("80");
  const [height, setHeight] = useState<string>("178");
  const [age, setAge] = useState<string>("25");
  const [activity, setActivity] = useState<number>(1.375); // Light active default
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("cut");

  // Calculations
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;

  // Harris-Benedict Formula (Revised)
  const bmr = gender === "male"
    ? 13.397 * w + 4.799 * h - 5.677 * a + 88.362
    : 9.247 * w + 3.098 * h - 4.33 * a + 447.593;

  const tdee = bmr * activity;

  // Target Calories based on Goal
  let targetCalories = tdee;
  if (goal === "cut") targetCalories = tdee - 500; // Caloric deficit
  if (goal === "bulk") targetCalories = tdee + 350; // Caloric surplus

  // Macro splitting (Roughly: Protein 2g/kg, Fat 1g/kg, Rest Carbs)
  const proteinGrams = Math.round(w * 2.2); // ~1g per lb
  const fatGrams = Math.round(w * 0.9);
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(remainingCalories / 4);

  const roundedTdee = Math.round(tdee);
  const roundedBmr = Math.round(bmr);
  const roundedTargetCal = Math.round(targetCalories);

  // Activity list
  const activityLevels = [
    { value: 1.2, label: isAr ? "خامل (بدون حركة)" : "Sedentary (Office job)", desc: isAr ? "لا يوجد تمارين على الإطلاق" : "Little or no exercise" },
    { value: 1.375, label: isAr ? "نشاط خفيف (١-٣ أيام)" : "Lightly Active (1-3 days)", desc: isAr ? "تمارين خفيفة ومشي يومي" : "Light exercise or sports" },
    { value: 1.55, label: isAr ? "نشاط معتدل (٣-٥ أيام)" : "Moderately Active (3-5 days)", desc: isAr ? "تمرين متوسط الجهد بالصالة" : "Moderate exercise or sports" },
    { value: 1.725, label: isAr ? "نشاط عالي (٦-٧ أيام)" : "Very Active (6-7 days)", desc: isAr ? "تدريب يومي مكثف ومرهق" : "Hard exercise or heavy sports" },
    { value: 1.9, label: isAr ? "نشاط خارق (رياضي محترف)" : "Extra Active (Athlete)", desc: isAr ? "تمرين مرتين باليوم أو عمل شاق جداً" : "Physical job or training 2x/day" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-xl rounded-[24px] border border-border bg-bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col no-scrollbar text-text-primary"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "حاسبة السعرات والماكروز TDEE" : "Scientific TDEE & Macro Calculator"}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? "احسب معدل الحرق اليومي وقسّم مغذياتك بدقة" : "Find your maintenance calories & perfect macronutrients"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-bg-surface-hover hover:bg-bg-surface-hover/80 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
              
              {/* Gender selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  {isAr ? "الجنس" : "Gender"}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      gender === "male"
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-bg-surface-hover/40 border-border/60 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    🙋‍♂️ {isAr ? "ذكر" : "Male"}
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      gender === "female"
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-bg-surface-hover/40 border-border/60 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    🙋‍♀️ {isAr ? "أنثى" : "Female"}
                  </button>
                </div>
              </div>

              {/* Grid for Weight, Height, Age */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {isAr ? "الوزن (كجم)" : "Weight (kg)"}
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-xs font-black rounded-xl border border-border bg-bg-surface-hover/50 px-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all text-center"
                    placeholder="80"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {isAr ? "الطول (سم)" : "Height (cm)"}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full text-xs font-black rounded-xl border border-border bg-bg-surface-hover/50 px-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all text-center"
                    placeholder="178"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    {isAr ? "العمر" : "Age (years)"}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full text-xs font-black rounded-xl border border-border bg-bg-surface-hover/50 px-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all text-center"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Activity Level Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  🏃‍♂️ {isAr ? "مستوى النشاط اليومي والرياضي:" : "Daily Activity Level:"}
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(parseFloat(e.target.value))}
                  className="w-full text-xs font-black rounded-xl border border-border bg-bg-surface-hover/50 px-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {activityLevels.map((act) => (
                    <option key={act.value} value={act.value} className="bg-bg-surface">
                      {act.label} - {act.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  🎯 {isAr ? "الهدف الرئيسي للتغذية:" : "Your Nutrition & Fitness Goal:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setGoal("cut")}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                      goal === "cut"
                        ? "bg-red-500/15 border-red-500 text-red-400"
                        : "bg-bg-surface-hover/40 border-border/60 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    🔥 {isAr ? "تنشيف / خسارة وزن" : "Cut / Fat Loss"}
                  </button>
                  <button
                    onClick={() => setGoal("maintain")}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                      goal === "maintain"
                        ? "bg-blue-500/15 border-blue-500 text-blue-400"
                        : "bg-bg-surface-hover/40 border-border/60 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    ⚖️ {isAr ? "المحافظة على الوزن" : "Maintain"}
                  </button>
                  <button
                    onClick={() => setGoal("bulk")}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                      goal === "bulk"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                        : "bg-bg-surface-hover/40 border-border/60 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    💪 {isAr ? "تضخيم / زيادة عضل" : "Bulk / Muscle Gain"}
                  </button>
                </div>
              </div>

              {/* Calculations Results Block */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                <div className="rounded-xl border border-border/60 bg-bg-surface p-2.5 text-center">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">{isAr ? "الأيض الأساسي BMR" : "BMR Calories"}</span>
                  <span className="text-sm font-black text-text-primary tracking-tight tabular-nums">{roundedBmr > 0 ? roundedBmr : "--"}</span>
                  <span className="text-[8px] text-text-muted font-bold block uppercase mt-0.5">{isAr ? "بالسرير" : "Rest Mode"}</span>
                </div>

                <div className="rounded-xl border border-border/60 bg-bg-surface p-2.5 text-center">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">{isAr ? "السعرات الحالية" : "TDEE Burn"}</span>
                  <span className="text-sm font-black text-text-primary tracking-tight tabular-nums">{roundedTdee > 0 ? roundedTdee : "--"}</span>
                  <span className="text-[8px] text-text-muted font-bold block uppercase mt-0.5">{isAr ? "تثبيت الوزن" : "Maintenance"}</span>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary/10 rounded-full blur-sm" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider block">{isAr ? "السعرات المستهدفة" : "Target Calories"}</span>
                  <span className="text-sm font-black text-primary tracking-tight tabular-nums">{roundedTargetCal > 0 ? roundedTargetCal : "--"}</span>
                  <span className="text-[8px] text-primary/80 font-bold block uppercase mt-0.5">{isAr ? "الهدف اليومي" : "Daily Goal"}</span>
                </div>
              </div>

              {/* Target Macronutrients Split */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                  🍗 {isAr ? "تقسيم الماكروز اليومي المقترح:" : "Your Daily Target Macronutrients:"}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Protein */}
                  <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-3 text-center space-y-1 relative overflow-hidden">
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block">{isAr ? "البروتين" : "Protein"}</span>
                    <span className="text-lg font-black text-text-primary tracking-tight tabular-nums">{proteinGrams}g</span>
                    <span className="text-[9px] text-text-muted block font-bold">{proteinGrams * 4} kcal</span>
                    <div className="w-full bg-rose-500/10 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-rose-500 h-full w-[35%]" />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-center space-y-1 relative overflow-hidden">
                    <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest block">{isAr ? "الدهون الصحية" : "Healthy Fats"}</span>
                    <span className="text-lg font-black text-text-primary tracking-tight tabular-nums">{fatGrams}g</span>
                    <span className="text-[9px] text-text-muted block font-bold">{fatGrams * 9} kcal</span>
                    <div className="w-full bg-yellow-500/10 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-yellow-500 h-full w-[25%]" />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-3 text-center space-y-1 relative overflow-hidden">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">{isAr ? "الكربوهيدرات" : "Carbohydrates"}</span>
                    <span className="text-lg font-black text-text-primary tracking-tight tabular-nums">{carbGrams}g</span>
                    <span className="text-[9px] text-text-muted block font-bold">{carbGrams * 4} kcal</span>
                    <div className="w-full bg-blue-500/10 h-1 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-blue-500 h-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Gym Tips */}
              <div className="rounded-xl border border-border bg-bg-surface-hover/40 p-3.5 flex gap-2.5 items-start">
                <div className="text-lg">💡</div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-wide block">{isAr ? "توجيهات التدريب والتغذية العميقة" : "Pro Gym Optimization Strategy:"}</span>
                  <p className="text-[10px] leading-relaxed text-text-secondary font-bold">
                    {isAr 
                      ? "تناول ما بين ١.٨ إلى ٢.٢ جرام بروتين لكل كيلوجرام لحماية الكتلة العضلية وتحفيز البناء. الكربوهيدرات ممتازة قبل التمرين لمدك بالطاقة لرفع أوزان أثقل، والدهون ضرورية لانتظام الهرمونات البنائية كالتستوستيرون."
                      : "Aim for 1.8-2.2g of protein per kg of bodyweight to trigger maximum muscle protein synthesis. Time your complex carbs pre-workout for dense muscle glycogen and absolute gym stamina."}
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-border/40 pt-4 shrink-0 flex justify-end gap-2.5">
              <Button
                onClick={onClose}
                variant="primary"
                className="text-xs font-black uppercase tracking-wider py-2 shadow-glow-primary"
              >
                {isAr ? "مفهوم يا كوتش" : "Perfect, Got it!"}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
