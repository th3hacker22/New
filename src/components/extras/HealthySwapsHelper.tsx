import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Sparkles, Utensils, HelpCircle, Activity, ChevronRight, 
  Check, ArrowRightLeft, Smile, Flame, RefreshCw, LogIn, Heart
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNutritionStore } from "@/store/useNutritionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";

interface HealthySwapsHelperProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

interface SwapItem {
  id: string;
  junkName: string;
  junkNameAr: string;
  junkMacros: { cal: number; protein: number; carbs: number; fat: number };
  healthyName: string;
  healthyNameAr: string;
  healthyMacros: { cal: number; protein: number; carbs: number; fat: number };
  recipe: string;
  recipeAr: string;
  category: "sweet" | "savory" | "drink";
}

interface CheatItem {
  id: string;
  name: string;
  nameAr: string;
  calories: number;
  icon: string;
  activities: {
    lifting: number; // minutes
    hiit: number; // minutes
    running: number; // minutes
    walking: number; // minutes
  };
}

const SWAP_DATABASE: SwapItem[] = [
  {
    id: "s-1",
    junkName: "Double Fast Food Cheeseburger",
    junkNameAr: "برجر وجبات سريعة دبل تشيز",
    junkMacros: { cal: 740, protein: 32, carbs: 48, fat: 42 },
    healthyName: "High-Protein Turkey & Oats Burger",
    healthyNameAr: "برجر ديك رومي وشوفان عالي البروتين",
    healthyMacros: { cal: 390, protein: 44, carbs: 22, fat: 12 },
    recipe: "Mix 150g lean turkey breast mince with 20g ground oats, egg white, onion, garlic powder, and grill. Serve in a toasted whole wheat bun with mustard and low-fat cheddar slice.",
    recipeAr: "امزج 150 جم مفروم صدر رومي خالي من الدهون مع 20 جم شوفان مطحون، بياض بيضة، بصل، ثوم بودرة، واشويه. قدمه في خبز بر كامل الحبة مع خردل وشريحة جبن تشيدر قليل الدسم.",
    category: "savory"
  },
  {
    id: "s-2",
    junkName: "Deep Dish Pepperoni Pizza (2 Slices)",
    junkNameAr: "بيتزا بيبيروني سميكة (شريحتين)",
    junkMacros: { cal: 680, protein: 24, carbs: 84, fat: 28 },
    healthyName: "Oat-Crust High-Protein Chicken Pizza",
    healthyNameAr: "بيتزا دجاج صحية بعجينة الشوفان",
    healthyMacros: { cal: 420, protein: 38, carbs: 36, fat: 14 },
    recipe: "Blend 50g oat flour with 80g Greek yogurt and a pinch of baking powder to form a crust. Bake for 8 mins, top with sugar-free tomato paste, 100g shredded chicken breast, and 30g light mozzarella.",
    recipeAr: "اخلط 50 جم دقيق شوفان مع 80 جم زبادي يوناني ورشة بيكنج بودر لتشكيل العجينة. اخبزها 8 دقائق، ثم ضع معجون طماطم خالي من السكر، و100 جم صدر دجاج مفتت، و30 جم موتزاريلا لايت.",
    category: "savory"
  },
  {
    id: "s-3",
    junkName: "Commercial Chocolate Ice Cream Tub",
    junkNameAr: "علبة آيس كريم شوكولاتة جاهزة",
    junkMacros: { cal: 520, protein: 6, carbs: 64, fat: 26 },
    healthyName: "Blended Banana-Whey Cream (Pro-Yo)",
    healthyNameAr: "كريمة الموز مع واي بروتين (برو-يو)",
    healthyMacros: { cal: 240, protein: 26, carbs: 28, fat: 2 },
    recipe: "Blend 1 frozen ripe banana with 1 scoop of chocolate whey protein, 50ml unsweetened almond milk, and 1 tbsp of unsweetened cocoa powder until thick and smooth. Freeze for 10 mins.",
    recipeAr: "اخلط موزة واحدة ناضجة مجمدة مع سكوب واي بروتين شوكولاتة، و50 مل حليب لوز غير محلى، وملعقة كبيرة بودرة كاكاو غير محلى حتى يتماسك. ضعه في الفريزر 10 دقائق.",
    category: "sweet"
  },
  {
    id: "s-4",
    junkName: "Regular Sugary Soda Can (355ml)",
    junkNameAr: "علبة مياه غازية سكرية عادية (355 مل)",
    junkMacros: { cal: 150, protein: 0, carbs: 39, fat: 0 },
    healthyName: "Sparkling Lemon-Mint BCAA Mocktail",
    healthyNameAr: "مشروب ليمون ونعناع فوار بـ BCAA الخالي من السكر",
    healthyMacros: { cal: 10, protein: 2, carbs: 0, fat: 0 },
    recipe: "Mix 1 scoop of zero-calorie lemon-lime BCAAs or amino acids with 300ml cold sparkling soda water, crushed mint leaves, and fresh lime slices.",
    recipeAr: "امزج سكوب من الأحماض الأمينية BCAA بنكهة الليمون مع 300 مل مياه فوارة باردة، أوراق نعناع مسحوقة، وشرائح ليمون طازجة.",
    category: "drink"
  },
  {
    id: "s-5",
    junkName: "Large Salted Potato Chips Bag",
    junkNameAr: "كيس بطاطس شيبسي مملح كبير",
    junkMacros: { cal: 480, protein: 5, carbs: 52, fat: 28 },
    healthyName: "Air-Fried Paprika Potato & Beet Crisps",
    healthyNameAr: "رقائق بطاطس وبنجر مقرمشة بالقلاية الهوائية",
    healthyMacros: { cal: 180, protein: 4, carbs: 38, fat: 1 },
    recipe: "Slice 150g sweet potato or beet micro-thin. Spray lightly with olive oil spray, toss in smoked paprika and sea salt, and air-fry at 180°C for 12-15 minutes until perfectly crispy.",
    recipeAr: "قطع 150 جم بطاطا حلوة أو بنجر لشرائح رقيقة جداً. رش بخاخ زيت زيتون خفيف، تبله بالبابريكا المدخنة وملح البحر، واخبزه في القلاية الهوائية على 180 درجة لـ 12-15 دقيقة.",
    category: "savory"
  },
  {
    id: "s-6",
    junkName: "Milk Chocolate Candy Bar (50g)",
    junkNameAr: "أصبع شوكولاتة بالحليب جاهز (50 جم)",
    junkMacros: { cal: 260, protein: 3, carbs: 30, fat: 14 },
    healthyName: "Dark Choco-Peanut Protein Rice Cakes",
    healthyNameAr: "كيك الأرز بزبدة الفول وشوكولاتة داكنة",
    healthyMacros: { cal: 150, protein: 10, carbs: 16, fat: 5 },
    recipe: "Spread 15g natural peanut butter onto two whole-grain unsalted rice cakes. Drizzle with 10g melted 85% dark chocolate and a sprinkle of coarse sea salt.",
    recipeAr: "ادهن 15 جم زبدة فول سوداني طبيعية على قطعتين كيك أرز كامل الحبوب. اسكب فوقها 10 جم شوكولاتة داكنة ذائبة 85% ورشة ملح بحر خشن.",
    category: "sweet"
  }
];

const CHEAT_DATABASE: CheatItem[] = [
  {
    id: "c-1",
    name: "Fast Food Fried Chicken Meal",
    nameAr: "وجبة دجاج بروستد مقلي كاملة",
    calories: 1150,
    icon: "🍗",
    activities: { lifting: 145, hiit: 85, running: 95, walking: 220 }
  },
  {
    id: "c-2",
    name: "Classic Glazed Donut (Single)",
    nameAr: "دونات كلاسيك مغطى بالسكر (حبة)",
    calories: 270,
    icon: "🍩",
    activities: { lifting: 35, hiit: 20, running: 22, walking: 50 }
  },
  {
    id: "c-3",
    name: "Creamy Frappuccino with Whipped Cream",
    nameAr: "مشروب فرابوتشينو بالكريمة المخفوقة",
    calories: 420,
    icon: "🥤",
    activities: { lifting: 55, hiit: 31, running: 34, walking: 80 }
  },
  {
    id: "c-4",
    name: "Large Chocolate Cookie Muffins",
    nameAr: "مافن كوكيز بالشوكولاتة كبير",
    calories: 550,
    icon: "🧁",
    activities: { lifting: 70, hiit: 40, running: 45, walking: 105 }
  }
];

export default function HealthySwapsHelper({ isOpen, onClose, isAr = false }: HealthySwapsHelperProps) {
  const [activeTab, setActiveTab] = useState<"swaps" | "compensator">("swaps");
  const [selectedSwap, setSelectedSwap] = useState<SwapItem | null>(null);
  const [selectedCheat, setSelectedCheat] = useState<CheatItem | null>(null);
  const [logSuccess, setLogSuccess] = useState(false);

  const { addFoodEntry } = useNutritionStore();
  const user = useAuthStore((s) => s.user);

  // Handle logging healthy swap directly into the nutrition journal
  const handleLogSwapToJournal = async (item: SwapItem) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    await addFoodEntry({
      date: todayStr,
      name: isAr ? item.healthyNameAr : item.healthyName,
      calories: item.healthyMacros.cal,
      protein: item.healthyMacros.protein,
      carbs: item.healthyMacros.carbs,
      fat: item.healthyMacros.fat,
      mealType: item.category === "sweet" ? "snack" : "lunch"
    }, user?.uid);

    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 2000);
  };

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
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "مساعد البدائل الصحية والتعويض" : "Smart Food Swaps & Balance Guide"}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? "تجاوز الرغبات الشديدة وحقق توازن مرن" : "Beat cravings & balance cheat days like a pro"}
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

            {/* Custom Interactive Tabs */}
            <div className="flex gap-2 p-1 bg-bg-surface-hover/80 rounded-xl border border-border/50 mb-4 shrink-0">
              <button
                onClick={() => { setActiveTab("swaps"); setSelectedCheat(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeTab === "swaps"
                    ? "bg-primary text-primary-text shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{isAr ? "البدائل الصحية" : "Healthy Swaps"}</span>
              </button>
              <button
                onClick={() => { setActiveTab("compensator"); setSelectedSwap(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeTab === "compensator"
                    ? "bg-primary text-primary-text shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isAr ? "مصحح الوجبات" : "Cheat Balance"}</span>
              </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
              
              {activeTab === "swaps" ? (
                /* SWAPS SCREEN */
                <div className="space-y-4">
                  {/* Swap Selector list or active detail view */}
                  {!selectedSwap ? (
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-bold text-text-secondary bg-primary/5 border border-primary/10 rounded-xl p-3 leading-relaxed">
                        ✨ {isAr 
                          ? "اختر الأكلة التي تشتهيها لترى كيف تستبدلها ببديل غني بالبروتين قليل السعرات وبنفس الطعم الرائع!" 
                          : "Select your craving to find a high-protein, calorie-cutting swap that fulfills your tastebuds!"}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {SWAP_DATABASE.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedSwap(item)}
                            className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-bg-surface-hover/40 hover:bg-bg-surface-hover hover:border-primary/30 transition-all text-right cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">🍔</span>
                              <div className="text-left">
                                <span className="text-xs line-through text-text-muted block">
                                  {isAr ? item.junkNameAr : item.junkName}
                                </span>
                                <span className="text-xs font-black text-text-primary block mt-0.5 group-hover:text-primary transition-colors">
                                  {isAr ? item.healthyNameAr : item.healthyName}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-[10px] text-red-500 font-bold line-through block">
                                  {item.junkMacros.cal} kcal
                                </span>
                                <span className="text-xs font-black text-emerald-400 block">
                                  {item.healthyMacros.cal} kcal
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-muted" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE SWAP DETAIL VIEW */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={() => setSelectedSwap(null)}
                        className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ← {isAr ? "العودة للقائمة" : "Back to Cravings List"}
                      </button>

                      {/* Head to Head Comparison */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Junk Food */}
                        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-3.5 space-y-2">
                          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">{isAr ? "الأكلة التقليدية" : "Traditional Cravings"}</span>
                          <h4 className="text-xs font-black text-text-primary leading-snug">
                            {isAr ? selectedSwap.junkNameAr : selectedSwap.junkName}
                          </h4>
                          <div className="space-y-1 pt-1 border-t border-red-500/10">
                            <div className="flex justify-between text-xs font-bold text-red-400/95">
                              <span>{isAr ? "سعرة" : "Cal"}</span>
                              <span>{selectedSwap.junkMacros.cal}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-muted">
                              <span>{isAr ? "بروتين" : "Protein"}</span>
                              <span>{selectedSwap.junkMacros.protein}g</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-muted">
                              <span>{isAr ? "كارب" : "Carbs"}</span>
                              <span>{selectedSwap.junkMacros.carbs}g</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-muted">
                              <span>{isAr ? "دهون" : "Fat"}</span>
                              <span>{selectedSwap.junkMacros.fat}g</span>
                            </div>
                          </div>
                        </div>

                        {/* Healthy Swap */}
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2 relative overflow-hidden">
                          <div className="absolute -top-1 -right-1 bg-emerald-500/15 w-8 h-8 rounded-full blur-lg" />
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                            <Sparkles className="w-3 h-3 animate-pulse" /> {isAr ? "البديل الصحي الذكي" : "Smart Fitness Swap"}
                          </span>
                          <h4 className="text-xs font-black text-emerald-300 leading-snug">
                            {isAr ? selectedSwap.healthyNameAr : selectedSwap.healthyName}
                          </h4>
                          <div className="space-y-1 pt-1 border-t border-emerald-500/15">
                            <div className="flex justify-between text-xs font-black text-emerald-400">
                              <span>{isAr ? "سعرة" : "Cal"}</span>
                              <span>{selectedSwap.healthyMacros.cal}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-300 font-bold">
                              <span>{isAr ? "بروتين" : "Protein"}</span>
                              <span>{selectedSwap.healthyMacros.protein}g</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-secondary">
                              <span>{isAr ? "كارب" : "Carbs"}</span>
                              <span>{selectedSwap.healthyMacros.carbs}g</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-text-secondary">
                              <span>{isAr ? "دهون" : "Fat"}</span>
                              <span>{selectedSwap.healthyMacros.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Visual Improvement Ribbon */}
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400">
                          🔥 {isAr ? `توفير حوالي ${selectedSwap.junkMacros.cal - selectedSwap.healthyMacros.cal} سعرة حرارية!` : `Saves ~${selectedSwap.junkMacros.cal - selectedSwap.healthyMacros.cal} kcal!`}
                        </span>
                        <span className="font-black text-emerald-300">
                          💪 +{selectedSwap.healthyMacros.protein - selectedSwap.junkMacros.protein}g {isAr ? "بروتين أكثر" : "Extra Protein"}
                        </span>
                      </div>

                      {/* Recipe Instructions */}
                      <div className="rounded-2xl border border-border/80 bg-bg-surface-hover p-4 space-y-2">
                        <h5 className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                          {isAr ? "كيفية التحضير السريعة" : "Quick Recipe & Prep Method"}
                        </h5>
                        <p className="text-xs leading-relaxed text-text-secondary">
                          {isAr ? selectedSwap.recipeAr : selectedSwap.recipe}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2.5 pt-2">
                        <Button
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setSelectedSwap(null)}
                        >
                          {isAr ? "تغيير الأكلة" : "Try Another Option"}
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-1 shadow-glow-primary"
                          onClick={() => handleLogSwapToJournal(selectedSwap)}
                          disabled={logSuccess}
                        >
                          {logSuccess ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Check className="w-4 h-4" /> {isAr ? "تم تسجيل الوجبة!" : "Logged!"}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <LogIn className="w-4 h-4" /> {isAr ? "تسجيل الوجبة باليوميات" : "Log this to Diary"}
                            </span>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* COMPENSATOR SCREEN */
                <div className="space-y-4">
                  {!selectedCheat ? (
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-bold text-text-secondary bg-warning/5 border border-warning/10 rounded-xl p-3 leading-relaxed">
                        🍕 {isAr 
                          ? "هل تناولت وجبة غش أو طعام غني بالدهون؟ لا تقلق، لا حاجة للشعور بالذنب! دعنا نرى بروتوكول حرق وتنسيق السعرات للحفاظ على مسار تقدمك بذكاء." 
                          : "Did you indulge in a heavy cheat meal? Don't stress or guilt-trip! Let's calculate exactly how to balance it safely without starvation."}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {CHEAT_DATABASE.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedCheat(item)}
                            className="flex flex-col text-right items-start p-3.5 rounded-2xl border border-border/60 bg-bg-surface-hover/40 hover:border-warning/30 hover:bg-bg-surface-hover transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-center w-full mb-2">
                              <span className="text-2xl">{item.icon}</span>
                              <span className="text-[10px] font-black text-warning bg-warning/10 px-2 py-0.5 rounded-md border border-warning/20">
                                {item.calories} kcal
                              </span>
                            </div>
                            <span className="text-xs font-black text-text-primary uppercase tracking-wide group-hover:text-warning transition-colors">
                              {isAr ? item.nameAr : item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ACTIVE COMPENSATOR DETAIL VIEW */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <button
                        onClick={() => setSelectedCheat(null)}
                        className="text-[10px] font-black text-warning uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        ← {isAr ? "العودة لقائمة وجبات الغش" : "Back to Indulgence List"}
                      </button>

                      {/* Header with selected food */}
                      <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl">{selectedCheat.icon}</span>
                          <div>
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-wide">
                              {isAr ? selectedCheat.nameAr : selectedCheat.name}
                            </h4>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5">
                              {isAr ? "الطاقة المكتسبة:" : "Energy Consumed:"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-warning tracking-tight">
                            {selectedCheat.calories}
                          </span>
                          <span className="text-[10px] font-black text-text-muted uppercase block">KCAL</span>
                        </div>
                      </div>

                      {/* Activities to burn it */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                          {isAr ? "الأنشطة المطلوبة لمعادلة السعرات (اختر واحداً):" : "Activity Required to Burn & Balance (Choose One):"}
                        </label>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="rounded-xl border border-border/60 bg-bg-surface p-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                              🏋️
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted uppercase font-bold block">{isAr ? "تمرين حديد ثقيل" : "Heavy Lifting"}</span>
                              <span className="text-xs font-black text-text-primary">{selectedCheat.activities.lifting} {isAr ? "دقيقة" : "min"}</span>
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-bg-surface p-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                              ⚡
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted uppercase font-bold block">{isAr ? "تدريب HIIT مكثف" : "HIIT Circuit"}</span>
                              <span className="text-xs font-black text-text-primary">{selectedCheat.activities.hiit} {isAr ? "دقيقة" : "min"}</span>
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-bg-surface p-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                              🏃
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted uppercase font-bold block">{isAr ? "جري معتدل" : "Steady Run"}</span>
                              <span className="text-xs font-black text-text-primary">{selectedCheat.activities.running} {isAr ? "دقيقة" : "min"}</span>
                            </div>
                          </div>

                          <div className="rounded-xl border border-border/60 bg-bg-surface p-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                              🚶
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted uppercase font-bold block">{isAr ? "مشي نشط (خطوات)" : "Active Walk"}</span>
                              <span className="text-xs font-black text-text-primary">{selectedCheat.activities.walking} {isAr ? "دقيقة" : "min"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coach advice */}
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                        <h5 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                          <Smile className="w-4 h-4" /> {isAr ? "نصيحة الكوتش الذكي:" : "Pro Coach Calorie Strategy:"}
                        </h5>
                        <p className="text-[11px] leading-relaxed text-text-secondary">
                          {isAr
                            ? "تجنب تماماً التجويع أو حرمان نفسك غداً! وجبة غش واحدة تعزز مخزون الجليكوجين وتنشط حرق الدهون. ببساطة، اشرب 1.5 لتر ماء إضافي اليوم، وضاعف خطواتك اليومية لـ 12,000 خطوة، واستمر في تمرينك كالمعتاد."
                            : "Never try to starve or punish yourself tomorrow. One cheat meal refills glycogen stores and keeps the thyroid active. Just drink 1.5L extra water today, hit 12k steps, and execute your normal heavy workout!"}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setSelectedCheat(null)}
                      >
                        {isAr ? "اختر وجبة أخرى" : "Try Another Indulgence"}
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
