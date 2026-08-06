/**
 * Pure workout calculations — a deep module.
 *
 * No DB, no React, no side effects. Everything here is trivially unit-testable,
 * which is the whole point: the interface (a handful of well-named functions)
 * is much smaller than the implementation behind it.
 */

export interface SetLike {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface SessionLike {
  exercises: { sets: SetLike[] }[];
}

/** Sum of weight × reps across all sets in a session. */
export function calculateSessionVolume(session: SessionLike, onlyCompleted = false): number {
  return session.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce((setAcc, s) => {
        if (onlyCompleted && s.completed === false) return setAcc;
        return setAcc + (s.weight || 0) * (s.reps || 0);
      }, 0),
    0,
  );
}

/**
 * Stable week key within a year (e.g. "W32").
 * Uses ISO-style weeks starting Monday.
 */
export function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `W${weekNum}`;
}

/** Estimated one-rep-max using the Epley formula. */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** Calendar day key (YYYY-MM-DD) in local time. */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
