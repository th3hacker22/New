import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import type { Routine } from "@/db";
import { useToastStore } from "@/store/useToastStore";
import emptyWorkoutImg from "@/assets/images/empty_workout_illustration_new_1784773586918.jpg";

interface Props {
  routines: Routine[];
  isAr: boolean;
  onStartRoutine: (exerciseIds: string[]) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function CustomRoutinesSection({ routines, isAr, onStartRoutine, onDelete }: Props) {
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState<Routine | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-text-primary uppercase tracking-wider">{isAr ? "جداولك 📋" : "Custom Routines"}</h2>
        <Link to="/builder" className="flex items-center gap-1 text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider">
          <Plus className="h-3 w-3" />{isAr ? "جدول جديد" : "Build New"}
        </Link>
      </div>

      {routines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {routines.map((routine, idx) => (
            <motion.div key={routine.id} className="relative overflow-hidden rounded-[22px] border border-border/70 hover:border-primary/60 transition-all duration-300 bg-bg-surface flex flex-col justify-between p-4.5 shadow-lg hover:shadow-xl group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.08 }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">{isAr ? "روتين خاص" : "CUSTOM"}</span>
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1"><Clock size={11} className="text-primary" />{routine.exercises.length * 7} {isAr ? "دقيقة تقريباً" : "min est."}</span>
                  </div>
                  <h3 className="text-base font-black italic tracking-tight text-text-primary group-hover:text-primary transition-colors line-clamp-1 mt-1">{routine.name}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => navigate({ to: "/builder", search: { editRoutineId: routine.id } as any })} className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setToDelete(routine)} className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {routine.exercises?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-2">
                  {routine.exercises.slice(0, 3).map((ex, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-text-muted border border-white/5">{ex.exerciseName}</span>
                  ))}
                  {routine.exercises.length > 3 && (
                    <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">+{routine.exercises.length - 3} {isAr ? "تمارين أخرى" : "more"}</span>
                  )}
                </div>
              )}

              <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted">{routine.exercises.length} {isAr ? "تمارين مسجلة" : "exercises"}</span>
                <Button size="sm" className="rounded-xl font-black text-xs uppercase tracking-wider py-2 px-4 bg-primary text-black hover:bg-primary-hover flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] cursor-pointer" onClick={() => onStartRoutine(routine.exercises.map((ex) => String(ex.exerciseId)))}>
                  <Play size={12} className="fill-current" /><span>{isAr ? "ابدأ التمرين" : "START"}</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <DataEmptyState imageSrc={emptyWorkoutImg} title={isAr ? "مفيش جداول ليك لسه" : "No custom routines yet"} description={isAr ? "اعمل جدول ليك عشان تبدأ تتمرن على طول." : "Create your first routine to quick-start your workouts."} actionLabel={isAr ? "جدول جديد" : "Build New"} onAction={() => navigate({ to: "/builder" })} />
        </div>
      )}

      <AnimatePresence>
        {toDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="w-full max-w-sm rounded-3xl bg-bg-card p-6 border border-border/80 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-danger">
                <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20"><Trash2 className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-base font-black text-text-primary uppercase tracking-wider">{isAr ? "حذف الجدول؟" : "Delete Routine?"}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{isAr ? "إجراء لا يمكن التراجع عنه" : "This action cannot be undone"}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {isAr ? `هل أنت متأكد من حذف جدول "${toDelete.name}"؟` : `Are you sure you want to delete "${toDelete.name}"? It will be removed from your custom routines.`}
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider" onClick={() => setToDelete(null)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                <Button variant="danger" className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-danger text-white hover:bg-danger/90" onClick={async () => { await onDelete(toDelete.id); setToDelete(null); useToastStore.getState().addToast("success", isAr ? "تم حذف الجدول بنجاح 📋" : "Routine deleted successfully"); }}>{isAr ? "تأكيد الحذف" : "Delete"}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
