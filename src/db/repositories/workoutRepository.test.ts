import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../index';
import { workoutRepository } from './workoutRepository';
import type { WorkoutSession } from '@/domain';
import { uid } from '@/utils/id';

// NOTE: the `completed` column is indexed numerically in Dexie (1/0), so we
// persist it as 1 even though the domain type says boolean.
function session(over: Partial<WorkoutSession> = {}): WorkoutSession {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: 'Test',
    date: now,
    duration: 60,
    completed: 1 as unknown as boolean,
    createdAt: now,
    updatedAt: now,
    exercises: [],
    ...over,
  } as WorkoutSession;
}

beforeEach(async () => {
  await db.workoutSessions.clear();
});

describe('workoutRepository.recentCompleted', () => {
  it('returns only completed sessions, newest first, capped by limit', async () => {
    const old = session({ date: '2026-01-01T00:00:00.000Z', name: 'old' });
    const mid = session({ date: '2026-02-01T00:00:00.000Z', name: 'mid' });
    const newOne = session({ date: '2026-03-01T00:00:00.000Z', name: 'new' });
    const draft = session({ completed: false, name: 'draft' });
    await db.workoutSessions.bulkAdd([old, mid, newOne, draft] as never);

    const result = await workoutRepository.recentCompleted(2);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('new');
    expect(result[1].name).toBe('mid');
  });
});

describe('workoutRepository.getStreak / getTotalStats', () => {
  it('counts streak days and totals, excluding freezes', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86_400_000);
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);

    const s1 = session({
      date: today.toISOString(),
      duration: 10,
      exercises: [
        {
          exerciseId: 'bench',
          exerciseName: 'Bench',
          sets: [{ weight: 100, reps: 5, completed: true }],
        },
      ],
    });
    const s2 = session({
      date: yesterday.toISOString(),
      duration: 20,
      exercises: [
        {
          exerciseId: 'squat',
          exerciseName: 'Squat',
          sets: [{ weight: 80, reps: 5, completed: true }],
        },
      ],
    });
    const s3 = session({ date: twoDaysAgo.toISOString(), isFreeze: true, duration: 0 });

    await db.workoutSessions.bulkAdd([s1, s2, s3] as never);

    const streak = await workoutRepository.getStreak();
    const stats = await workoutRepository.getTotalStats();
    expect(streak).toBeGreaterThanOrEqual(2);
    expect(stats.totalWorkouts).toBe(2);
    expect(stats.totalDuration).toBe(30);
    // 100*5 + 80*5 = 900
    expect(stats.totalVolume).toBe(900);
  });
});

describe('workoutRepository.completedThisWeek', () => {
  it('filters to current week only', async () => {
    const now = new Date();
    const today = session({ date: now.toISOString() });
    const old = session({ date: new Date(now.getFullYear() - 1, 0, 1).toISOString() });
    await db.workoutSessions.bulkAdd([today, old] as never);
    const result = await workoutRepository.completedThisWeek(now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(today.id);
  });
});

describe('workoutRepository.add / remove', () => {
  it('adds a session and removes by id', async () => {
    const s = session();
    await workoutRepository.add(s);
    const count = await db.workoutSessions.count();
    expect(count).toBe(1);
    await workoutRepository.remove(s.id);
    expect(await db.workoutSessions.count()).toBe(0);
  });
});
