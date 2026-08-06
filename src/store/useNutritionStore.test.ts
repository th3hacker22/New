import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock cloud sync so the store never touches Firebase in tests.
vi.mock('@/lib/syncEngine', () => ({
  pushToCloud: vi.fn().mockResolvedValue(undefined),
}));

import { useNutritionStore } from './useNutritionStore';
import { db } from '@/db';

beforeEach(async () => {
  await db.foodEntries.clear();
  await db.nutritionGoals.clear();
  useNutritionStore.setState({ entries: [], goal: null, isLoading: false });
});

describe('useNutritionStore', () => {
  it('loads entries for a date and excludes soft-deleted', async () => {
    const store = useNutritionStore.getState();
    await store.addFoodEntry({
      date: '2026-08-06',
      name: 'Oats',
      calories: 300,
      protein: 11,
      carbs: 54,
      fat: 6,
      mealType: 'breakfast',
    });
    await store.loadEntries('2026-08-06');
    const state = useNutritionStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].name).toBe('Oats');
  });

  it('deletes an entry from state after soft delete', async () => {
    const store = useNutritionStore.getState();
    await store.addFoodEntry({
      date: '2026-08-06',
      name: 'Rice',
      calories: 200,
      protein: 4,
      carbs: 44,
      fat: 0,
      mealType: 'lunch',
    });
    const id = useNutritionStore.getState().entries[0].id;
    await store.deleteFoodEntry(id);
    expect(useNutritionStore.getState().entries).toHaveLength(0);
  });

  it('sets and reloads the goal', async () => {
    const store = useNutritionStore.getState();
    await store.setGoal({ dailyCalories: 2500, protein: 160, carbs: 250, fat: 80 });
    expect(useNutritionStore.getState().goal?.dailyCalories).toBe(2500);
    await store.loadGoal();
    expect(useNutritionStore.getState().goal?.protein).toBe(160);
  });
});
