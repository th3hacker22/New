import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/syncEngine', () => ({
  pushToCloud: vi.fn().mockResolvedValue(undefined),
}));

import { useRoutineStore } from './useRoutineStore';
import { db } from '@/db';

beforeEach(async () => {
  await db.routines.clear();
  useRoutineStore.setState({ routines: [], isLoading: false });
});

function routine(id: string, name: string, createdAt: string) {
  return {
    id,
    name,
    exercises: [],
    createdAt,
    updatedAt: createdAt,
    deleted: false,
  };
}

describe('useRoutineStore', () => {
  it('loads non-deleted routines newest first', async () => {
    const store = useRoutineStore.getState();
    await store.saveRoutine(routine('a', 'Old', '2026-01-01T00:00:00.000Z'));
    await store.saveRoutine(routine('b', 'New', '2026-06-01T00:00:00.000Z'));
    await useRoutineStore.getState().loadRoutines();
    const list = useRoutineStore.getState().routines;
    expect(list.map((r) => r.name)).toEqual(['New', 'Old']);
  });

  it('soft-deletes a routine', async () => {
    const store = useRoutineStore.getState();
    await store.saveRoutine(routine('x', 'Delete Me', '2026-06-01T00:00:00.000Z'));
    await store.deleteRoutine('x');
    expect(useRoutineStore.getState().routines).toHaveLength(0);
  });
});
