import { create } from 'zustand';
import type { Routine } from '@/domain';
import { routineRepository } from '@/db';
import { pushToCloud } from '@/lib/syncEngine';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  loadRoutines: () => Promise<void>;
  saveRoutine: (routine: Routine, userId?: string) => Promise<void>;
  deleteRoutine: (id: string, userId?: string) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  isLoading: false,

  loadRoutines: async () => {
    set({ isLoading: true });
    try {
      const routines = await routineRepository.list();
      set({ routines, isLoading: false });
    } catch (error) {
      console.error('Failed to load routines:', error);
      set({ isLoading: false });
    }
  },

  saveRoutine: async (routine, userId) => {
    try {
      await routineRepository.put(routine);
      set({ routines: await routineRepository.list() });
      if (userId) pushToCloud(userId).catch(console.error);
    } catch (error) {
      console.error('Failed to save routine:', error);
    }
  },

  deleteRoutine: async (id, userId) => {
    try {
      await routineRepository.softDelete(id);
      set({ routines: await routineRepository.list() });
      if (userId) pushToCloud(userId).catch(console.error);
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  },
}));
