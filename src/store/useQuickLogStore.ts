import { create } from "zustand";
import { db } from "@/db";
import type { WorkoutSession } from "@/db";
import { useAuthStore } from "@/store/useAuthStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { useToastStore } from "@/store/useToastStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { pushToCloud } from "@/lib/syncEngine";
import { uid } from "@/utils/id";
import { playWorkoutStopSound } from "@/utils/audio";

export interface QuickLogSet {
  weight: string;
  reps: string;
}

export interface QuickLogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseNameAr?: string;
  muscleGroup: string;
  date: string;
  sets: QuickLogSet[];
}

interface QuickLogState {
  quickLogs: QuickLogEntry[];
  isLoading: boolean;
  
  // Actions
  addQuickLog: (
    exerciseId: string,
    exerciseName: string,
    exerciseNameAr: string | undefined,
    muscleGroup: string,
    target: string,
    sets: QuickLogSet[]
  ) => Promise<void>;
  loadQuickLogs: () => Promise<void>;
  deleteQuickLog: (id: string) => Promise<void>;
}

export const useQuickLogStore = create<QuickLogState>((set, get) => ({
  quickLogs: [],
  isLoading: false,

  loadQuickLogs: async () => {
    set({ isLoading: true });
    try {
      // Load quick log sessions from Dexie database
      // Quick logs have a naming convention or a flag, or we can just fetch workoutSessions where name starts with "Quick Log:"
      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .reverse()
        .toArray();

      const quickLogs: QuickLogEntry[] = sessions
        .filter((s) => s.name.startsWith("Quick Log:"))
        .map((s) => {
          const ex = s.exercises[0]; // Quick logs are single exercise
          return {
            id: s.id,
            exerciseId: String(ex.exerciseId),
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup || "",
            date: s.date,
            sets: ex.sets.map((set) => ({
              weight: String(set.weight),
              reps: String(set.reps),
            })),
          };
        });

      set({ quickLogs, isLoading: false });
    } catch (err) {
      console.error("Failed to load quick logs:", err);
      set({ isLoading: false });
    }
  },

  addQuickLog: async (exerciseId, exerciseName, exerciseNameAr, muscleGroup, target, sets) => {
    try {
      const sessionId = uid();
      
      // 1. Create fully compatible Dexie WorkoutSession object
      const session: WorkoutSession = {
        id: sessionId,
        name: `Quick Log: ${exerciseName}`,
        date: new Date().toISOString(),
        duration: 0, // Quick logs are immediate, no duration stopwatch
        exercises: [
          {
            exerciseId,
            exerciseName,
            muscleGroup,
            target,
            sets: sets.map((s) => ({
              weight: parseFloat(s.weight) || 0,
              reps: parseInt(s.reps, 10) || 0,
              completed: true,
              setType: "normal",
            })),
          },
        ],
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      };

      // 2. Add to Dexie database
      await db.workoutSessions.add(session);

      // 3. Play a subtle completion sound to reward the action
      try {
        playWorkoutStopSound();
      } catch {
        // ignore audio failure
      }

      // 4. Update the local Zustand slice state directly for premium zero-latency feedback
      const newEntry: QuickLogEntry = {
        id: sessionId,
        exerciseId,
        exerciseName,
        exerciseNameAr,
        muscleGroup,
        date: session.date,
        sets,
      };

      set({
        quickLogs: [newEntry, ...get().quickLogs],
      });

      // 5. Evaluate achievements and sync with server
      const user = useAuthStore.getState().user;
      if (user) {
        pushToCloud(user.uid).catch(console.error);
      }

      useAchievementsStore
        .getState()
        .evaluateAchievements(user?.uid || undefined)
        .catch(console.error);

      // Reload completed sessions so they appear instantly in Stats / Workout History tab
      useWorkoutStore.getState().loadCompletedSessions().catch(console.error);

      useToastStore.getState().addToast("success", "Quick Log saved successfully!");
    } catch (err) {
      console.error("Failed to save quick log:", err);
      useToastStore.getState().addToast("error", "Failed to save log. Try again.");
    }
  },

  deleteQuickLog: async (id) => {
    try {
      // Delete from Dexie DB
      await db.workoutSessions.delete(id);
      
      // Update store slice
      set({
        quickLogs: get().quickLogs.filter((log) => log.id !== id),
      });

      // Reload completed sessions to remove deleted logs instantly from charts & history
      useWorkoutStore.getState().loadCompletedSessions().catch(console.error);

      useToastStore.getState().addToast("success", "Log deleted successfully!");
    } catch (err) {
      console.error("Failed to delete quick log:", err);
      useToastStore.getState().addToast("error", "Failed to delete log.");
    }
  },
}));
