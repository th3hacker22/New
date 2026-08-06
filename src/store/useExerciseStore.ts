import { create } from 'zustand';
import type { Exercise } from '@/types/exercise';
import {
  fetchExercisesFromGitHub,
  filterExercises,
  type ExerciseFilters,
} from '@/services/exerciseService';
import { exerciseCatalogRepository } from '@/db';

interface ExerciseState {
  // Data
  exercises: Exercise[];
  filteredExercises: Exercise[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: ExerciseFilters;
  favoriteIds: string[];

  // Actions
  loadExercises: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  setFilter: (key: keyof ExerciseFilters, value: any) => void;
  clearFilters: () => void;
  getExerciseById: (id: string) => Exercise | undefined;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  filteredExercises: [],
  isLoading: false,
  error: null,
  filters: {},
  favoriteIds: [],

  loadExercises: async () => {
    // Load favorites too
    await get().loadFavorites();

    // Don't reload if already loaded
    if (get().exercises.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 1. Try to load from IndexedDB first
      const count = await exerciseCatalogRepository.count();
      if (count > 0) {
        console.info('Loading exercises from IndexedDB database...');
        const exercises = await exerciseCatalogRepository.list();
        set({
          exercises,
          filteredExercises: exercises,
          isLoading: false,
        });
        return;
      }

      // 2. If not in IndexedDB, fetch from GitHub
      const exercises = await fetchExercisesFromGitHub();

      // 3. Seed the local IndexedDB database for offline usage and persistent storage
      if (exercises && exercises.length > 0) {
        try {
          // Add to DB bulk
          await exerciseCatalogRepository.bulkPut(exercises);
          console.info(`Seeded ${exercises.length} exercises into IndexedDB database.`);
        } catch (dbError) {
          console.error('Failed to seed exercises to IndexedDB:', dbError);
        }
      }

      set({
        exercises,
        filteredExercises: exercises,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: 'Failed to load exercises. Please try again.',
        isLoading: false,
      });
    }
  },

  loadFavorites: async () => {
    const favoriteIds = await exerciseCatalogRepository.listFavoriteIds();
    set({ favoriteIds });
  },

  setFilter: (key, value) => {
    const { exercises, filters, favoriteIds } = get();
    const newFilters = { ...filters, [key]: value };

    set({
      filters: newFilters,
      filteredExercises: filterExercises(exercises, newFilters, favoriteIds),
    });
  },

  clearFilters: () => {
    const { exercises } = get();
    set({
      filters: {},
      filteredExercises: exercises,
    });
  },

  getExerciseById: (id) => {
    return get().exercises.find((e) => e.id === id);
  },
}));
