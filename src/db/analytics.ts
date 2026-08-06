import { db } from './index';
import type { Exercise } from '@/types/exercise';

// Centralized volume calculation - DRY helper
export function calculateSessionVolume(
  session: { exercises: { sets: { weight: number; reps: number; completed?: boolean }[] }[] },
  onlyCompleted = false,
): number {
  return session.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, s) => {
        if (onlyCompleted && s.completed === false) return setAcc;
        return setAcc + (s.weight || 0) * (s.reps || 0);
      }, 0)
    );
  }, 0);
}

export function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `W${weekNum}`;
}

export async function getWeeklyVolumeData(
  weeks = 8,
): Promise<{ week: string; volume: number; tonnage: number }[]> {
  // Fixed: use equals(true) not 1 for boolean index portability
  const sessions = await db.workoutSessions.where('completed').equals(1).toArray();

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

export async function getWorkoutStreak(): Promise<number> {
  const sessions = await db.workoutSessions.where('completed').equals(1).toArray();
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map((s) => s.date.split('T')[0]))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (dates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}
