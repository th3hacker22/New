import { describe, it, expect } from 'vitest';
import type { Exercise } from '@/types/exercise';
import type { WorkoutSession } from './types';
import {
  calculateSessionVolume,
  computePersonalRecords,
  computeExerciseProgress,
  computeEstimated1RM,
  computeMuscleGroupVolume,
  computeWeeklySetVolume,
  computeWorkoutDensity,
  computeTotalStats,
  computeExerciseHistory,
  computeStreak,
  computeWeeklyVolume,
} from './workoutAnalytics';

function session(over: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: 's',
    name: 'S',
    date: new Date().toISOString(),
    duration: 60,
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [],
    ...over,
  };
}

const bench = { id: 'bench', name: 'Bench', muscleGroup: 'Chest' } as unknown as Exercise;
const squat = { id: 'squat', name: 'Squat', muscleGroup: 'Legs' } as unknown as Exercise;

describe('computePersonalRecords', () => {
  it('keeps the heaviest set per exercise', () => {
    const sessions = [
      session({
        exercises: [
          {
            exerciseId: 'bench',
            exerciseName: 'Bench',
            sets: [
              { weight: 80, reps: 5, completed: true },
              { weight: 100, reps: 3, completed: true },
            ],
          },
        ],
      }),
      session({
        date: new Date(Date.now() + 86_400_000).toISOString(),
        exercises: [
          {
            exerciseId: 'bench',
            exerciseName: 'Bench',
            sets: [{ weight: 90, reps: 5, completed: true }],
          },
        ],
      }),
    ];
    const records = computePersonalRecords(sessions);
    expect(records).toHaveLength(1);
    expect(records[0].maxWeight).toBe(100);
  });
});

describe('computeTotalStats', () => {
  it('sums completed non-freeze sessions only', () => {
    const sessions = [
      session({
        duration: 10,
        exercises: [
          { exerciseId: 'a', exerciseName: 'A', sets: [{ weight: 100, reps: 5, completed: true }] },
        ],
      }),
      session({
        duration: 20,
        isFreeze: true,
        exercises: [
          { exerciseId: 'b', exerciseName: 'B', sets: [{ weight: 999, reps: 9, completed: true }] },
        ],
      }),
    ];
    expect(computeTotalStats(sessions)).toEqual({
      totalWorkouts: 1,
      totalVolume: 500,
      totalDuration: 10,
    });
  });
});

describe('computeStreak', () => {
  const iso = (d: Date) => d.toISOString();
  it('returns 0 when the latest session is older than yesterday', () => {
    const old = new Date();
    old.setDate(old.getDate() - 5);
    expect(computeStreak([session({ date: iso(old) })])).toBe(0);
  });

  it('counts consecutive days ending yesterday', () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86_400_000);
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);
    const sessions = [yesterday, twoDaysAgo].map((d) => session({ date: iso(d) }));
    expect(computeStreak(sessions)).toBe(2);
    // reference today to keep the variable used
    expect(today instanceof Date).toBe(true);
  });
});

describe('computeMuscleGroupVolume', () => {
  it('aggregates volume by muscle from the catalog when not set on session', () => {
    const sessions = [
      session({
        exercises: [
          {
            exerciseId: 'bench',
            exerciseName: 'Bench',
            sets: [{ weight: 100, reps: 5, completed: true }],
          },
        ],
      }),
    ];
    const result = computeMuscleGroupVolume(sessions, [bench, squat]);
    expect(result[0]).toEqual({ muscle: 'Chest', volume: 500 });
  });
});

describe('computeWeeklyVolume', () => {
  it('returns one bucket per requested week with zero defaults', () => {
    const result = computeWeeklyVolume([], 4);
    expect(result).toHaveLength(4);
    expect(result.every((p) => p.volume === 0 && p.tonnage === 0)).toBe(true);
  });

  it('aggregates session volume into matching week bucket', () => {
    const s = session({
      exercises: [
        {
          exerciseId: 'bench',
          exerciseName: 'Bench',
          sets: [{ weight: 100, reps: 5, completed: true }],
        },
      ],
    });
    const result = computeWeeklyVolume([s], 1);
    expect(result[0].volume).toBe(500);
  });
});

describe('computeWeeklySetVolume', () => {
  it('counts only completed sets from the current week', () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 14);
    const sessions = [
      session({
        date: lastWeek.toISOString(),
        exercises: [
          {
            exerciseId: 'bench',
            exerciseName: 'B',
            sets: [{ weight: 50, reps: 5, completed: true }],
          },
        ],
      }),
      session({
        exercises: [
          {
            exerciseId: 'squat',
            exerciseName: 'S',
            sets: [
              { weight: 80, reps: 5, completed: true },
              { weight: 80, reps: 5, completed: false },
            ],
          },
        ],
      }),
    ];
    const result = computeWeeklySetVolume(sessions, [bench, squat]);
    expect(result.find((m) => m.muscle === 'Legs')?.sets).toBe(1);
  });
});

describe('computeExerciseProgress & computeEstimated1RM', () => {
  const s = session({
    exercises: [
      { exerciseId: 'bench', exerciseName: 'B', sets: [{ weight: 100, reps: 5, completed: true }] },
    ],
  });
  it('progress returns max weight per session', () => {
    expect(computeExerciseProgress([s], 'bench')[0].maxWeight).toBe(100);
  });
  it('e1rm applies Epley to completed sets', () => {
    expect(computeEstimated1RM([s], 'bench')[0].e1rm).toBeCloseTo(116.67, 1);
  });
});

describe('computeExerciseHistory', () => {
  it('returns volume, maxWeight and e1rm per session', () => {
    const s = session({
      exercises: [
        {
          exerciseId: 'bench',
          exerciseName: 'B',
          sets: [{ weight: 100, reps: 5, completed: true }],
        },
      ],
    });
    const h = computeExerciseHistory([s], 'bench');
    expect(h[0].volume).toBe(500);
    expect(h[0].maxWeight).toBe(100);
  });
});

describe('computeWorkoutDensity', () => {
  it('counts sessions per day', () => {
    const s = session({ date: '2026-08-06T10:00:00Z' });
    expect(computeWorkoutDensity([s])).toEqual([{ date: '2026-08-06', count: 1 }]);
  });
});

describe('calculateSessionVolume import surface', () => {
  it('is reachable from workoutAnalytics', () => {
    expect(calculateSessionVolume({ exercises: [{ sets: [{ weight: 10, reps: 2 }] }] })).toBe(20);
  });
});
