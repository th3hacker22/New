import { create } from 'zustand';
import type { FoodEntry, NutritionGoal } from '@/domain';
import { nutritionRepository, type NewFoodEntry } from '@/db';
import { pushToCloud } from '@/lib/syncEngine';

interface NutritionState {
  entries: FoodEntry[];
  goal: NutritionGoal | null;
  isLoading: boolean;
  loadEntries: (date: string) => Promise<void>;
  loadGoal: () => Promise<void>;
  addFoodEntry: (entry: NewFoodEntry, userId?: string) => Promise<void>;
  deleteFoodEntry: (id: string, userId?: string) => Promise<void>;
  setGoal: (
    goal: Pick<NutritionGoal, 'dailyCalories' | 'protein' | 'carbs' | 'fat'>,
    userId?: string,
  ) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  entries: [],
  goal: null,
  isLoading: false,

  loadEntries: async (date) => {
    set({ isLoading: true });
    try {
      const entries = await nutritionRepository.listByDate(date);
      set({ entries: entries.filter((e) => !e.deleted), isLoading: false });
    } catch (error) {
      console.error('Failed to load food entries:', error);
      set({ isLoading: false });
    }
  },

  loadGoal: async () => {
    try {
      set({ goal: await nutritionRepository.getGoal() });
    } catch (error) {
      console.error('Failed to load nutrition goal:', error);
    }
  },

  addFoodEntry: async (entry, userId) => {
    try {
      const id = await nutritionRepository.add(entry);
      const created = (await nutritionRepository.listByDate(entry.date)).find((e) => e.id === id);
      if (created) set({ entries: [...get().entries, created] });
      if (userId) pushToCloud(userId).catch(console.error);
    } catch (error) {
      console.error('Failed to add food entry:', error);
    }
  },

  deleteFoodEntry: async (id, userId) => {
    try {
      await nutritionRepository.softDelete(id);
      set({ entries: get().entries.filter((e) => e.id !== id) });
      if (userId) pushToCloud(userId).catch(console.error);
    } catch (error) {
      console.error('Failed to delete food entry:', error);
    }
  },

  setGoal: async (goalArgs, userId) => {
    try {
      await nutritionRepository.setGoal(goalArgs);
      set({ goal: await nutritionRepository.getGoal() });
      if (userId) pushToCloud(userId).catch(console.error);
    } catch (error) {
      console.error('Failed to set nutrition goal:', error);
    }
  },
}));
