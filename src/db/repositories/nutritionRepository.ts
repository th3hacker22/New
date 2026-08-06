/**
 * Nutrition repository — food entries and daily goals over Dexie.
 * Goal is a singleton row keyed by 'default' for the current user.
 */
import { db } from '../index';
import type { FoodEntry, MealType, NutritionGoal } from '@/domain';

export interface NewFoodEntry {
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
}

const GOAL_ID = 'default';

export const nutritionRepository = {
  listByDate(date: string): Promise<FoodEntry[]> {
    return db.foodEntries.where('date').equals(date).toArray() as Promise<FoodEntry[]>;
  },

  async add(entry: NewFoodEntry): Promise<string> {
    const now = new Date().toISOString();
    const id = `food_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const row: FoodEntry = {
      id,
      createdAt: now,
      updatedAt: now,
      deleted: false,
      ...entry,
    };
    await db.foodEntries.add(row as never);
    return id;
  },

  async update(id: string, patch: Partial<NewFoodEntry>): Promise<void> {
    const existing = await db.foodEntries.get(id);
    if (!existing) return;
    await db.foodEntries.put({
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  },

  async softDelete(id: string): Promise<void> {
    const existing = await db.foodEntries.get(id);
    if (!existing) return;
    await db.foodEntries.put({
      ...existing,
      deleted: true,
      updatedAt: new Date().toISOString(),
    });
  },

  async getGoal(): Promise<NutritionGoal | null> {
    const all = await db.nutritionGoals.toArray();
    return all[0] ?? null;
  },

  async setGoal(
    goal: Pick<NutritionGoal, 'dailyCalories' | 'protein' | 'carbs' | 'fat'>,
  ): Promise<void> {
    const existing = await db.nutritionGoals.toArray();
    if (existing.length > 0) {
      await db.nutritionGoals.put({
        ...existing[0],
        ...goal,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await db.nutritionGoals.add({
        id: GOAL_ID,
        updatedAt: new Date().toISOString(),
        deleted: false,
        ...goal,
      } as never);
    }
  },

  count(): Promise<number> {
    return db.foodEntries.count();
  },
};
