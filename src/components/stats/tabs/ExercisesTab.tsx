import ExerciseProgressChart from "@/components/stats/ExerciseProgressChart";
import { Dumbbell } from "lucide-react";

interface Props {
  e1rms: { exerciseName: string; e1rm: number }[];
}

export default function ExercisesTab({ e1rms }: Props) {
  return (
    <div className="space-y-6">
      <ExerciseProgressChart />
      <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Estimated 1RM Achievements</h3>
        </div>
        {e1rms.length > 0 ? (
          <div className="space-y-3">
            {e1rms.map((pr) => (
              <div key={pr.exerciseName} className="bg-bg-surface-hover border border-border rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary capitalize">{pr.exerciseName}</span>
                <span className="text-sm font-black text-primary font-mono">{pr.e1rm} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted font-semibold">Complete barbell sets to record estimated 1RM targets!</p>
        )}
      </div>
    </div>
  );
}
