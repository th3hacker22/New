import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Search, Plus, Trash2, Check, Dumbbell, History, 
  Sparkles, Calendar, PlusCircle, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useQuickLogStore, type QuickLogSet } from "@/store/useQuickLogStore";
import { getExerciseName } from "@/types/exercise";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr?: boolean;
}

const POPULAR_EXERCISES = [
  { id: "bench-press", name: "Barbell Bench Press", nameAr: "ضغط بنش بالبار", muscle: "Chest", target: "Pectoralis Major" },
  { id: "squat", name: "Barbell Squat", nameAr: "سكوات بالبار", muscle: "Legs", target: "Quadriceps" },
  { id: "deadlift", name: "Barbell Deadlift", nameAr: "رفعة مميتة بالبار", muscle: "Back", target: "Gluteus Maximus" },
  { id: "overhead-press", name: "Barbell Overhead Press", nameAr: "ضغط كتف بالبار", muscle: "Shoulders", target: "Deltoids" },
  { id: "biceps-curl", name: "Barbell Biceps Curl", nameAr: "تبادل بايسبس بالبار", muscle: "Biceps", target: "Biceps Brachii" },
  { id: "triceps-pushdown", name: "Cable Triceps Pushdown", nameAr: "سحب ترايسبس حبل", muscle: "Triceps", target: "Triceps Brachii" },
];

export default function QuickLogModal({ isOpen, onClose, isAr = false }: QuickLogModalProps) {
  const { exercises, loadExercises } = useExerciseStore();
  const { quickLogs, addQuickLog, loadQuickLogs, deleteQuickLog } = useQuickLogStore();
  
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<typeof POPULAR_EXERCISES[0] | any>(POPULAR_EXERCISES[0]);
  const [sets, setSets] = useState<QuickLogSet[]>([
    { weight: "60", reps: "10" },
    { weight: "60", reps: "10" },
    { weight: "60", reps: "8" },
  ]);

  // Load exercises & past quick logs on open
  useEffect(() => {
    if (isOpen) {
      loadExercises();
      loadQuickLogs();
    }
  }, [isOpen, loadExercises, loadQuickLogs]);

  // Filter exercises based on search query
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return exercises.filter((ex) => {
      const nameMatch = ex.name?.toLowerCase().includes(query) || ex.nameEn?.toLowerCase().includes(query);
      const arMatch = ex.nameAr?.includes(query);
      const muscleMatch = ex.muscleGroup?.toLowerCase().includes(query) || ex.muscleGroupAr?.includes(query);
      return nameMatch || arMatch || muscleMatch;
    }).slice(0, 10); // Limit to 10 for speed & UX
  }, [searchQuery, exercises]);

  // Action: Add new set
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1] || { weight: "60", reps: "10" };
    setSets([...sets, { ...lastSet }]);
  };

  // Action: Remove specific set
  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return; // Must keep at least 1 set
    setSets(sets.filter((_, i) => i !== index));
  };

  // Action: Modify set values
  const handleUpdateSet = (index: number, field: keyof QuickLogSet, value: string) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };
    setSets(updated);
  };

  // Action: Submit the log
  const handleSave = async () => {
    // Basic validation
    const hasInvalid = sets.some((s) => !s.weight || !s.reps || isNaN(Number(s.weight)) || isNaN(Number(s.reps)));
    if (hasInvalid) {
      alert(isAr ? "برجاء كتابة وزن وتكرار صالحين لكل المجاميع!" : "Please provide a valid weight and repetition for all sets!");
      return;
    }

    const exId = selectedExercise.id;
    const exName = selectedExercise.name || selectedExercise.nameEn;
    const exNameAr = selectedExercise.nameAr;
    const exMuscle = selectedExercise.muscleGroup || selectedExercise.muscle || "General";
    const exTarget = selectedExercise.target || "General";

    await addQuickLog(exId, exName, exNameAr, exMuscle, exTarget, sets);
    
    // Switch to history tab to view the logged item
    setActiveTab("history");
  };

  const selectExercise = (ex: any) => {
    setSelectedExercise(ex);
    setSearchQuery("");
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
            className="relative w-full max-w-lg rounded-[24px] border border-border bg-bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col no-scrollbar text-text-primary"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {isAr ? "تسجيل تمرين سريع ⚡" : "Quick Log Workout"}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                    {isAr ? "سجل مجاميعك وثق أوزانك فوراً" : "Fast-track and document your lifting sets"}
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

            {/* Navigation Tabs */}
            <div className="flex bg-bg-surface-hover/60 p-1 rounded-xl mb-4 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab("log")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeTab === "log"
                    ? "bg-bg-surface border border-border text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Plus size={14} />
                {isAr ? "تسجيل أداء" : "Log Sets"}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-bg-surface border border-border text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <History size={14} />
                {isAr ? "السجل السريع" : "Quick History"}
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4">
              
              <AnimatePresence mode="wait">
                {activeTab === "log" ? (
                  <motion.div
                    key="log-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    {/* Selected Exercise Header Card */}
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4 flex justify-between items-center relative overflow-hidden">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest block">
                          💪 {isAr ? "التمرين المختار حالياً:" : "Selected Exercise:"}
                        </span>
                        <h4 className="text-sm font-black text-text-primary">
                          {isAr ? (selectedExercise.nameAr || selectedExercise.name) : (selectedExercise.nameEn || selectedExercise.name)}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-bg-surface-hover text-text-muted font-bold uppercase tracking-wider inline-block border border-border/40">
                          {isAr ? (selectedExercise.muscleGroupAr || selectedExercise.muscle) : (selectedExercise.muscleGroupEn || selectedExercise.muscle)}
                        </span>
                      </div>
                      
                      {selectedExercise.imageUrl && (
                        <img 
                          src={selectedExercise.imageUrl} 
                          alt="exercise" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-border/60 shrink-0"
                        />
                      )}
                    </div>

                    {/* Search Exercises Engine */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                        🔍 {isAr ? "البحث أو تغيير التمرين:" : "Search & Choose Exercise:"}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={isAr ? "ابحث عن تمرين (مثال: بنش، سكوات)..." : "Type to find exercise..."}
                          className="w-full text-xs font-bold rounded-xl border border-border bg-bg-surface-hover/40 pl-9 pr-3 py-2.5 text-text-primary outline-none focus:border-primary transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
                      </div>

                      {/* Dropdown search suggestions */}
                      <AnimatePresence>
                        {searchQuery.trim().length > 0 && (
                          <motion.div
                            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-bg-surface border border-border shadow-2xl rounded-xl divide-y divide-border/40 overflow-hidden max-h-48 overflow-y-auto no-scrollbar"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            {filteredExercises.length > 0 ? (
                              filteredExercises.map((ex) => (
                                <button
                                  key={ex.id}
                                  onClick={() => selectExercise(ex)}
                                  className="w-full px-3 py-2 text-left hover:bg-bg-surface-hover/80 text-xs font-bold text-text-secondary hover:text-text-primary flex justify-between items-center transition-colors cursor-pointer"
                                >
                                  <span>{getExerciseName(ex, isAr)}</span>
                                  <span className="text-[8px] uppercase tracking-wider text-text-muted bg-bg-surface-hover px-1.5 py-0.5 rounded border border-border/35">
                                    {isAr ? ex.muscleGroupAr : ex.muscleGroup}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-xs font-bold text-text-muted flex gap-1.5 items-center justify-center">
                                <AlertCircle size={13} className="text-text-muted/60" />
                                {isAr ? "لا توجد نتائج مطابقة" : "No matching exercises found"}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quick Tap Popular Exercises */}
                    {!searchQuery && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                          ⭐ {isAr ? "تمارين شائعة وسريعة:" : "Tap to Switch Exercise:"}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_EXERCISES.map((ex) => {
                            const isSelected = selectedExercise.id === ex.id;
                            return (
                              <button
                                key={ex.id}
                                onClick={() => setSelectedExercise(ex)}
                                className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-primary/15 border-primary text-primary"
                                    : "bg-bg-surface-hover/40 border-border/50 text-text-muted hover:text-text-primary"
                                }`}
                              >
                                {isAr ? ex.nameAr : ex.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sets Logger Table */}
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                          📋 {isAr ? "تفاصيل ومجاميع الأداء اليومي:" : "Enter Weight & Reps for each Set:"}
                        </label>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleAddSet}
                          className="text-[10px] font-black uppercase text-primary hover:text-primary-hover tracking-wider py-1 px-2 flex items-center gap-1"
                        >
                          <PlusCircle size={13} />
                          {isAr ? "إضافة مجموعة" : "Add Set"}
                        </Button>
                      </div>

                      {/* Header row */}
                      <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-text-muted uppercase tracking-wider px-2">
                        <div className="col-span-2 text-center">{isAr ? "المجموعة" : "Set"}</div>
                        <div className="col-span-5 text-center">{isAr ? "الوزن (كجم)" : "Weight (kg)"}</div>
                        <div className="col-span-4 text-center">{isAr ? "التكرارات" : "Reps"}</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Dynamic Sets rows */}
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {sets.map((set, index) => (
                          <div 
                            key={index}
                            className="grid grid-cols-12 gap-2 items-center bg-bg-surface-hover/30 hover:bg-bg-surface-hover/45 p-1.5 rounded-xl border border-border/40 transition-colors"
                          >
                            {/* Set Number */}
                            <div className="col-span-2 text-center text-xs font-black text-text-muted">
                              {index + 1}
                            </div>

                            {/* Weight input */}
                            <div className="col-span-5">
                              <input
                                type="number"
                                value={set.weight}
                                onChange={(e) => handleUpdateSet(index, "weight", e.target.value)}
                                className="w-full text-center text-xs font-black rounded-lg border border-border bg-bg-surface py-1 text-text-primary outline-none focus:border-primary transition-all"
                                placeholder="60"
                              />
                            </div>

                            {/* Reps input */}
                            <div className="col-span-4">
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => handleUpdateSet(index, "reps", e.target.value)}
                                className="w-full text-center text-xs font-black rounded-lg border border-border bg-bg-surface py-1 text-text-primary outline-none focus:border-primary transition-all"
                                placeholder="10"
                              />
                            </div>

                            {/* Delete set action */}
                            <div className="col-span-1 flex justify-center">
                              <button
                                onClick={() => handleRemoveSet(index)}
                                disabled={sets.length <= 1}
                                className={`text-text-muted hover:text-red-400 transition-colors cursor-pointer ${
                                  sets.length <= 1 ? "opacity-30 cursor-not-allowed" : ""
                                }`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Coach dynamic tips */}
                    <div className="rounded-xl border border-border bg-bg-surface-hover/40 p-2.5 text-[10px] text-text-secondary leading-relaxed font-bold flex gap-2">
                      <span>⚡</span>
                      <p>
                        {isAr 
                          ? "التسجيل السريع يعتبر جلسة تمرين مستقلة، وسيضاف فوراً لعداد الاستمرارية، سجل التطور وحقّق أهدافك اليومية!"
                          : "Quick Log automatically acts as an instant standalone workout. It adds to your streak metrics and calculates volume!"}
                      </p>
                    </div>

                    {/* Submit Section */}
                    <Button
                      onClick={handleSave}
                      className="w-full font-black text-xs uppercase tracking-wider py-2.5 shadow-glow-primary bg-primary text-black"
                    >
                      {isAr ? "حفظ كجولة تمرين كاملة 📥" : "Save as Workout Session"}
                    </Button>

                  </motion.div>
                ) : (
                  <motion.div
                    key="history-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3"
                  >
                    {/* List of past quick logged logs */}
                    {quickLogs.length > 0 ? (
                      <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                        {quickLogs.map((log) => (
                          <div 
                            key={log.id}
                            className="p-3 rounded-2xl border border-border bg-bg-surface-hover/20 flex flex-col gap-2 hover:border-primary/20 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-black text-text-primary">
                                  {log.exerciseName}
                                </h5>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted">
                                  <Calendar size={10} />
                                  {new Date(log.date).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                              </div>

                              <button
                                onClick={() => deleteQuickLog(log.id)}
                                className="text-text-muted hover:text-red-400 p-1.5 rounded-lg bg-bg-surface-hover/50 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                                title="Delete Log"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Sets list badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {log.sets.map((s, idx) => (
                                <span 
                                  key={idx}
                                  className="text-[9px] font-black bg-bg-surface-hover/90 border border-border/50 px-2 py-0.5 rounded text-text-secondary tabular-nums"
                                >
                                  {isAr ? `م${idx+1}:` : `S${idx+1}:`} <strong className="text-primary">{s.weight}</strong> {isAr ? "كجم" : "kg"} × <strong className="text-text-primary">{s.reps}</strong> {isAr ? "تكرار" : "reps"}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-bg-surface-hover flex items-center justify-center mx-auto text-text-muted/50">
                          <History size={18} />
                        </div>
                        <p className="text-xs font-black text-text-muted">
                          {isAr ? "لا توجد تسجيلات سريعة سابقة لغاية الآن." : "No quick logs recorded yet."}
                        </p>
                        <p className="text-[10px] text-text-muted/60 font-bold max-w-xs mx-auto">
                          {isAr 
                            ? "اضغط على تسجيل أداء وسجل تمرينتك الأولى فوراً لترى أرقامك الرائعة هنا!"
                            : "Record your very first quick sets today to view and manage them inside this pane!"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Footer */}
            <div className="border-t border-border/40 pt-4 shrink-0 flex justify-end gap-2.5">
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-xs font-black uppercase tracking-wider py-2"
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
