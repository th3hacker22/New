/**
 * Pure analytics computations over workout sessions.
 *
 * This is a deep module: callers pass an array of sessions (and optionally the
 * Exercise catalog for muscle-group lookup) and receive read-model data. No
 * database, no React, no I/O — trivially unit-testable.
 *
 * The Dexie repository in `src/db/repositories/` is the only place that knows
 * how to fetch sessions; it delegates all math to here.
 */
import { calculateSessionVolume, getWeekKey } from './workoutMath';
import type {
  BodyMeasurement,
  EstimatedOneRepMaxPoint,
  ExerciseHistoryPoint,
  ExerciseProgressPoint,
  MuscleSetPoint,
  MuscleVolumePoint,
  PersonalRecord,
  TotalStats,
  WeeklyVolumePoint,
  WorkoutDensityPoint,
  WorkoutSession,
} from './types';
import type { Exercise } from '@/types/exercise';

/** Inclusive-on-both-ends day key (YYYY-MM-DD) from a session's ISO date. */
function dayKey(iso: string): string {
  return iso.split('T')[0];
}

/** Start of the current local week (Sunday 00:00). */
export function startOfWeek(date = new Date()): Date {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Completed sessions, excluding soft-deleted and freeze entries. */
export function validCompletedSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter((s) => s.completed && !s.deleted && !s.isFreeze);
}

// Re-export math primitives so callers have one import surface.
export { calculateSessionVolume, getWeekKey } from './workoutMath';
export { estimatedOneRepMax } from './workoutMath';

/**
 * Volume per week-bucket for the last `weeks` weeks (oldest first).
 * Tonnage is an alias for volume kept for backwards compatibility.
 */
export function computeWeeklyVolume(sessions: WorkoutSession[], weeks = 8): WeeklyVolumePoint[] {
  const weeklyData = new Map<string, number>();
  for (let i = 0; i < weeks; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    weeklyData.set(getWeekKey(date), 0);
  }

  for (const session of sessions) {
    const weekKey = getWeekKey(new Date(session.date));
    if (weeklyData.has(weekKey)) {
      const volume = calculateSessionVolume(session, true);
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + volume);
    }
  }

  return Array.from(weeklyData.entries())
    .map(([week, volume]) => ({ week, volume, tonnage: volume }))
    .reverse();
}

/** Personal records: the heaviest set ever logged per exercise. */
export function computePersonalRecords(sessions: WorkoutSession[]): PersonalRecord[] {
  const records = new Map<
    string | number,
    { exerciseName: string; maxWeight: number; date: string }
  >();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.sets.length === 0) continue;
      const maxSetWeight = Math.max(...ex.sets.map((s) => s.weight || 0));
      const current = records.get(ex.exerciseId);
      if (!current || maxSetWeight > current.maxWeight) {
        records.set(ex.exerciseId, {
          exerciseName: ex.exerciseName,
          maxWeight: maxSetWeight,
          date: session.date,
        });
      }
    }
  }

  return Array.from(records.entries()).map(([exerciseId, data]) => ({
    exerciseId,
    ...data,
  }));
}

/** Per-exercise max weight over time, chronologically ordered. */
export function computeExerciseProgress(
  sessions: WorkoutSession[],
  exerciseId: string | number,
): ExerciseProgressPoint[] {
  const progress: ExerciseProgressPoint[] = [];
  for (const session of sessions) {
    const ex = session.exercises.find((e) => String(e.exerciseId) === String(exerciseId));
    if (ex && ex.sets.length > 0) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0));
      progress.push({ date: dayKey(session.date), maxWeight });
    }
  }
  return progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Per-exercise estimated 1RM over time (Epley), completed sets only. */
export function computeEstimated1RM(
  sessions: WorkoutSession[],
  exerciseId: string | number,
): EstimatedOneRepMaxPoint[] {
  const progress: EstimatedOneRepMaxPoint[] = [];
  for (const session of sessions) {
    const ex = session.exercises.find((e) => String(e.exerciseId) === String(exerciseId));
    if (ex && ex.sets.length > 0) {
      const bestE1rm = Math.max(
        ...ex.sets.filter((s) => s.completed).map((s) => s.weight * (1 + s.reps / 30)),
        0,
      );
      if (bestE1rm > 0) {
        progress.push({
          date: dayKey(session.date),
          e1rm: Math.round(bestE1rm * 10) / 10,
        });
      }
    }
  }
  return progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Total volume (completed sets) attributed to each muscle group. */
export function computeMuscleGroupVolume(
  sessions: WorkoutSession[],
  exercises: Exercise[],
): MuscleVolumePoint[] {
  const muscleData = new Map<string, number>();
  const byId = new Map(exercises.map((e) => [String(e.id), e]));

  for (const session of sessions) {
    for (const ex of session.exercises) {
      const def = byId.get(String(ex.exerciseId));
      const muscle = ex.muscleGroup || def?.muscleGroup;
      if (!muscle) continue;

      const volume = ex.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.weight * s.reps, 0);

      muscleData.set(muscle, (muscleData.get(muscle) || 0) + volume);
    }
  }

  return Array.from(muscleData.entries())
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume);
}

/** Completed-set counts per muscle group within the current week. */
export function computeWeeklySetVolume(
  sessions: WorkoutSession[],
  exercises: Exercise[],
  now = new Date(),
): MuscleSetPoint[] {
  const weekStart = startOfWeek(now);
  const thisWeek = sessions.filter((s) => new Date(s.date) >= weekStart);
  const byId = new Map(exercises.map((e) => [String(e.id), e]));

  const muscleSets = new Map<string, number>();
  for (const session of thisWeek) {
    for (const ex of session.exercises) {
      const def = byId.get(String(ex.exerciseId));
      const muscle = ex.muscleGroup || def?.muscleGroup;
      if (!muscle) continue;
      const completedSets = ex.sets.filter((s) => s.completed).length;
      muscleSets.set(muscle, (muscleSets.get(muscle) || 0) + completedSets);
    }
  }

  return Array.from(muscleSets.entries())
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}

/** Number of completed sessions per calendar day. */
export function computeWorkoutDensity(sessions: WorkoutSession[]): WorkoutDensityPoint[] {
  const densityMap = new Map<string, number>();
  for (const session of sessions) {
    const date = dayKey(session.date);
    densityMap.set(date, (densityMap.get(date) || 0) + 1);
  }
  return Array.from(densityMap.entries()).map(([date, count]) => ({ date, count }));
}

/** Aggregate totals across valid completed sessions. */
export function computeTotalStats(sessions: WorkoutSession[]): TotalStats {
  const valid = validCompletedSessions(sessions);
  const totalWorkouts = valid.length;
  const totalVolume = valid.reduce(
    (acc, s) =>
      acc +
      s.exercises.reduce(
        (exAcc, ex) => exAcc + ex.sets.reduce((setAcc, set) => setAcc + set.weight * set.reps, 0),
        0,
      ),
    0,
  );
  const totalDuration = valid.reduce((acc, s) => acc + s.duration, 0);
  return { totalWorkouts, totalVolume, totalDuration };
}

/** Volume + max weight + e1RM per session for an exercise, ordered. */
export function computeExerciseHistory(
  sessions: WorkoutSession[],
  exerciseId: string | number,
): ExerciseHistoryPoint[] {
  return sessions
    .filter((s) => s.exercises.some((ex) => String(ex.exerciseId) === String(exerciseId)))
    .map((s) => {
      const exercise = s.exercises.find((ex) => String(ex.exerciseId) === String(exerciseId))!;
      const totalVolume = exercise.sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
      const maxWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
      const bestSet = exercise.sets.reduce(
        (best, current) =>
          current.weight * current.reps > best.weight * best.reps ? current : best,
        exercise.sets[0],
      );
      return {
        date: s.date,
        volume: totalVolume,
        maxWeight,
        estimated1RM: maxWeight * (1 + (bestSet?.reps ?? 0) / 30),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Current consecutive-day streak ending today or yesterday. */
export function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map((s) => dayKey(s.date)))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86_400_000;
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

/** Latest body measurement (by date), or null if none recorded. */
export function latestBodyMeasurement(measurements: BodyMeasurement[]): BodyMeasurement | null {
  if (measurements.length === 0) return null;
  return (
    [...measurements]
      .filter((m) => !m.deleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null
  );
}
