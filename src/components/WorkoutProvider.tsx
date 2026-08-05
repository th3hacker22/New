import React, { createContext, useContext, useEffect, useMemo } from "react";
import {
  useWorkoutStore,
  type ActiveWorkout,
  type WorkoutSession,
  type WorkoutSet,
} from "@/store/useWorkoutStore";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { storage } from "@/lib/storage";

export interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  completedSessions: WorkoutSession[];
  isLoadingCompleted: boolean;
  restTimerActive: boolean;
  startWorkout: (exerciseIds: string[]) => Promise<string>;
  finishWorkout: (shareToFeed?: boolean) => Promise<void>;
  cancelWorkout: () => void;
  loadCompletedSessions: () => Promise<void>;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setId: string) => void;
  updateSet: (
    exerciseIndex: number,
    setId: string,
    updates: Partial<Pick<WorkoutSet, "weight" | "reps" | "rpe" | "setType">>,
  ) => void;
  toggleSetComplete: (exerciseIndex: number, setId: string) => void;
  replaceExercise: (
    exerciseIndex: number,
    newExerciseId: string,
  ) => Promise<void>;
  setExerciseNotes: (exerciseIndex: number, notes: string) => void;
  dismissRestTimer: () => void;
  deleteCompletedSession: (id: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const completedSessions = useWorkoutStore((s) => s.completedSessions);
  const isLoadingCompleted = useWorkoutStore((s) => s.isLoadingCompleted);
  const restTimerActive = useWorkoutStore((s) => s.restTimerActive);

  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const loadCompletedSessions = useWorkoutStore(
    (s) => s.loadCompletedSessions,
  );
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleSetComplete = useWorkoutStore((s) => s.toggleSetComplete);
  const replaceExercise = useWorkoutStore((s) => s.replaceExercise);
  const setExerciseNotes = useWorkoutStore((s) => s.setExerciseNotes);
  const dismissRestTimer = useWorkoutStore((s) => s.dismissRestTimer);
  const deleteCompletedSession = useWorkoutStore(
    (s) => s.deleteCompletedSession,
  );

  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const loadExercises = useExerciseStore((s) => s.loadExercises);

  // 1. On mount: hydrate completed sessions, routines, exercises, and restore active workout
  useEffect(() => {
    loadCompletedSessions();
    loadRoutines();
    loadExercises();

    try {
      const savedActive = storage.get<any>("active_workout" as any, null as any);
      if (savedActive && !activeWorkout) {
        const parsed = savedActive as any;
        // Handle both wrapped and direct formats
        const data = parsed?.data ? parsed.data : parsed;
        const workoutData = data?.exercises ? data : (parsed?.id ? parsed : null);
        const candidate = workoutData || (parsed && (parsed as any).id ? parsed : null);
        // Fallback try to read legacy raw
        const legacyRaw = localStorage.getItem("relift_active_workout");
        const finalParsed = candidate || (legacyRaw ? JSON.parse(legacyRaw) : null);
        if (finalParsed && finalParsed.id && Array.isArray(finalParsed.exercises)) {
          useWorkoutStore.setState({ activeWorkout: finalParsed });
        }
      } else {
        // legacy fallback
        const legacy = localStorage.getItem("relift_active_workout");
        if (legacy && !activeWorkout) {
          const parsed = JSON.parse(legacy);
          if (parsed && parsed.id && Array.isArray(parsed.exercises)) {
            useWorkoutStore.setState({ activeWorkout: parsed });
          }
        }
      }
    } catch (e) {
      console.error("Failed to restore active workout session from storage:", e);
    }
  }, []);

  // 2. Persist activeWorkout changes automatically to centralized storage
  useEffect(() => {
    try {
      if (activeWorkout) {
        storage.set("active_workout" as any, activeWorkout as any);
      } else {
        storage.remove("active_workout" as any);
        localStorage.removeItem("relift_active_workout");
      }
    } catch (e) {
      console.error("Failed to persist active workout session:", e);
    }
  }, [activeWorkout]);

  const value = useMemo(
    () => ({
      activeWorkout,
      completedSessions,
      isLoadingCompleted,
      restTimerActive,
      startWorkout,
      finishWorkout,
      cancelWorkout,
      loadCompletedSessions,
      addSet,
      removeSet,
      updateSet,
      toggleSetComplete,
      replaceExercise,
      setExerciseNotes,
      dismissRestTimer,
      deleteCompletedSession,
    }),
    [
      activeWorkout,
      completedSessions,
      isLoadingCompleted,
      restTimerActive,
      startWorkout,
      finishWorkout,
      cancelWorkout,
      loadCompletedSessions,
      addSet,
      removeSet,
      updateSet,
      toggleSetComplete,
      replaceExercise,
      setExerciseNotes,
      dismissRestTimer,
      deleteCompletedSession,
    ],
  );

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkoutContext(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error(
      "useWorkoutContext must be used within a WorkoutProvider component",
    );
  }
  return context;
}

export const useWorkout = useWorkoutContext;
