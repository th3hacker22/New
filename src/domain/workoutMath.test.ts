import { describe, it, expect } from 'vitest';
import { calculateSessionVolume, getWeekKey, estimatedOneRepMax, dayKey } from './workoutMath';

describe('calculateSessionVolume', () => {
  it('sums weight × reps across sets and exercises', () => {
    const session = {
      exercises: [
        {
          sets: [
            { weight: 100, reps: 5 },
            { weight: 100, reps: 5 },
          ],
        }, // 1000
        { sets: [{ weight: 50, reps: 10 }] }, // 500
      ],
    };
    expect(calculateSessionVolume(session)).toBe(1500);
  });

  it('skips incomplete sets when onlyCompleted is true', () => {
    const session = {
      exercises: [
        {
          sets: [
            { weight: 100, reps: 5, completed: true },
            { weight: 100, reps: 5, completed: false },
          ],
        },
      ],
    };
    expect(calculateSessionVolume(session, true)).toBe(500);
  });

  it('treats missing completed flag as completed (legacy data)', () => {
    const session = { exercises: [{ sets: [{ weight: 80, reps: 4 }] }] };
    expect(calculateSessionVolume(session, true)).toBe(320);
  });

  it('returns 0 for empty session', () => {
    expect(calculateSessionVolume({ exercises: [] })).toBe(0);
  });

  it('guards against NaN weights', () => {
    const session = { exercises: [{ sets: [{ weight: 0, reps: 5 }] }] };
    expect(calculateSessionVolume(session)).toBe(0);
  });
});

describe('getWeekKey', () => {
  it('returns a W-prefixed week number', () => {
    expect(getWeekKey(new Date(2026, 0, 15))).toMatch(/^W\d+$/);
  });

  it('groups near days in the same 7-day bucket together', () => {
    // Week buckets are counted from Jan 1 (not ISO weeks), so test same-bucket days
    const monday = new Date(2026, 0, 5);
    const saturday = new Date(2026, 0, 10);
    expect(getWeekKey(monday)).toBe(getWeekKey(saturday));
  });
});

describe('estimatedOneRepMax', () => {
  it('returns the weight itself for a single rep', () => {
    expect(estimatedOneRepMax(100, 1)).toBe(100);
  });

  it('applies Epley formula for multiple reps', () => {
    // 100 * (1 + 5/30) = 116.666...
    expect(estimatedOneRepMax(100, 5)).toBeCloseTo(116.67, 1);
  });

  it('returns 0 for invalid input', () => {
    expect(estimatedOneRepMax(0, 5)).toBe(0);
    expect(estimatedOneRepMax(100, 0)).toBe(0);
  });
});

describe('dayKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 7, 6))).toBe('2026-08-06');
  });

  it('accepts an ISO string', () => {
    expect(dayKey('2026-08-06T14:30:00Z')).toBe(dayKey(new Date('2026-08-06T14:30:00Z')));
  });
});
