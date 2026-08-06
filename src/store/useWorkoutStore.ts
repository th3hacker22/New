import { create } from 'zustand';
import { workoutRepository, type WorkoutSession } from '@/db';
export type { WorkoutSession };
import type { Exercise } from '@/types/exercise';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocialStore } from '@/store/useSocialStore';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { useToastStore } from '@/store/useToastStore';
import { pushToCloud } from '@/lib/syncEngine';
import { uid } from '@/utils/id';
import { playWorkoutStartSound, playWorkoutStopSound } from '@/utils/audio';

// ── Helpers ──
import { storage } from '@/lib/storage';

// ── Get exercises from cache via centralized manager ──
function getCachedExercises(): Exercise[] {
  return (
    (storage.getExercisesCache() as Exercise[]) ||
    storage.get<Exercise[]>('exercises_cache', [] as any) ||
    []
  );
}

// ── Types ──
export interface WorkoutSet {
  id: string;
  weight: string;
  reps: string;
  rpe?: string;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
  setType?:
    | 'normal'
    | 'warmup'
    | 'right'
    | 'left'
    | 'failure'
    | 'drop'
    | 'negative'
    | 'partial'
    | 'myoreps'
    | 'feeder'
    | 'top'
    | 'backoff';
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseNameEn: string;
  exerciseNameAr?: string;
  muscleGroup: string;
  equipment: string;
  tips: string[];
  imageUrl: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  notes?: string;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  exercises: WorkoutExerciseItem[];
  startedAt: number;
}

// ── Ghost Logging: Get last session data for an exercise ──
async function getLastExerciseData(
  exerciseId: string,
): Promise<{ weight: number; reps: number }[] | null> {
  try {
    // Optimization: Order by date descending and take last 10, then filter
    const sessions = await workoutRepository.recentCompleted(10);

    for (const session of sessions) {
      const ex = session.exercises.find((e) => String(e.exerciseId) === String(exerciseId));
      if (ex && ex.sets.length > 0) {
        return ex.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
      }
    }
  } catch {
    /* DB might be empty */
  }
  return null;
}

// ── Build an exercise item with ghost data from previous sessions ──
async function buildExerciseItem(exerciseId: string): Promise<WorkoutExerciseItem | null> {
  const exercises = getCachedExercises();
  const exercise = exercises.find((e) => e.id === exerciseId);
  if (!exercise) return null;

  const previousSets = await getLastExerciseData(exerciseId);

  const initialSetCount = 3;
  const sets: WorkoutSet[] = Array.from({ length: initialSetCount }, (_, i) => ({
    id: uid(),
    weight: '',
    reps: '',
    completed: false,
    previousWeight: previousSets?.[i]?.weight,
    previousReps: previousSets?.[i]?.reps,
    setType: 'normal',
  }));

  return {
    id: uid(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    exerciseNameEn: exercise.nameEn || exercise.name,
    exerciseNameAr: exercise.nameAr,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    tips: exercise.instructionSteps.slice(0, 3),
    imageUrl: exercise.imageUrl,
    gifUrl: exercise.gifUrl,
    target: exercise.target,
    secondaryMuscles: exercise.secondaryMuscles,
    sets,
  };
}

// ── Store Interface ──
interface WorkoutState {
  activeWorkout: ActiveWorkout | null;
  restTimerActive: boolean;
  completedSessions: WorkoutSession[];
  isLoadingCompleted: boolean;
  isDemoMode: boolean;

  // Actions
  startWorkout: (exerciseIds: string[]) => Promise<string>;
  replaceExercise: (exerciseIndex: number, newExerciseId: string) => Promise<void>;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setId: string) => void;
  setExerciseNotes: (exerciseIndex: number, notes: string) => void;
  updateSet: (
    exerciseIndex: number,
    setId: string,
    updates: Partial<Pick<WorkoutSet, 'weight' | 'reps' | 'rpe' | 'setType'>>,
  ) => void;
  toggleSetComplete: (exerciseIndex: number, setId: string) => void;
  dismissRestTimer: () => void;
  finishWorkout: (shareToFeed?: boolean) => Promise<void>;
  cancelWorkout: () => void;
  loadCompletedSessions: () => Promise<void>;
  deleteCompletedSession: (id: string) => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
}

// ── Store ──
export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  restTimerActive: false,
  completedSessions: [],
  isLoadingCompleted: false,
  isDemoMode: false,

  // ── Start a new workout session ──
  startWorkout: async (exerciseIds) => {
    const id = uid();
    const exercises: WorkoutExerciseItem[] = [];

    for (const exId of exerciseIds) {
      const item = await buildExerciseItem(exId);
      if (item) exercises.push(item);
    }

    set({
      activeWorkout: { id, exercises, startedAt: Date.now() },
      restTimerActive: false,
    });

    playWorkoutStartSound();

    return id;
  },

  // ── Replace exercise with an alternative (Shuffle) ──
  replaceExercise: async (exerciseIndex, newExerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const newItem = await buildExerciseItem(newExerciseId);
    if (!newItem) return;

    const exercises = [...activeWorkout.exercises];
    exercises[exerciseIndex] = newItem;

    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  // ── Add a new set to an exercise ──
  addSet: (exerciseIndex) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const exercise = exercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];

    exercises[exerciseIndex] = {
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          id: uid(),
          weight: lastSet?.weight || '',
          reps: lastSet?.reps || '',
          rpe: lastSet?.rpe || '',
          completed: false,
          previousWeight: lastSet?.previousWeight,
          previousReps: lastSet?.previousReps,
          setType: 'normal',
        },
      ],
    };

    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  // ── Remove a set from an exercise ──
  removeSet: (exerciseIndex, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const exercise = exercises[exerciseIndex];

    exercises[exerciseIndex] = {
      ...exercise,
      sets: exercise.sets.filter((s) => s.id !== setId),
    };

    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  // ── Set exercise notes ──
  setExerciseNotes: (exerciseIndex, notes) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      notes,
    };

    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  // ── Update weight/reps for a specific set ──
  updateSet: (exerciseIndex, setId, updates) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const exercise = exercises[exerciseIndex];

    exercises[exerciseIndex] = {
      ...exercise,
      sets: exercise.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
    };

    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  // ── Toggle set completion ──
  toggleSetComplete: (exerciseIndex, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const exercises = [...activeWorkout.exercises];
    const exercise = exercises[exerciseIndex];
    const targetSet = exercise.sets.find((s) => s.id === setId);
    if (!targetSet) return;

    const wasCompleted = targetSet.completed;

    exercises[exerciseIndex] = {
      ...exercise,
      sets: exercise.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
    };

    set({
      activeWorkout: { ...activeWorkout, exercises },
      restTimerActive: !wasCompleted ? true : get().restTimerActive,
    });
  },

  // ── Rest Timer ──
  dismissRestTimer: () => set({ restTimerActive: false }),

  // ── Finish workout & save to Dexie ──
  finishWorkout: async (shareToFeed?: boolean) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      const duration = Math.floor((Date.now() - activeWorkout.startedAt) / 1000);

      const session: WorkoutSession = {
        id: uid(),
        name: `ReLift Workout ${new Date().toLocaleDateString('en-US')}`,
        date: new Date().toISOString(),
        duration,
        exercises: activeWorkout.exercises
          .filter((e) => e.sets.some((s) => s.completed))
          .map((e) => ({
            exerciseId: e.exerciseId,
            exerciseName: e.exerciseName,
            muscleGroup: e.muscleGroup,
            target: e.target,
            notes: e.notes,
            sets: e.sets
              .filter((s) => s.completed)
              .map((s) => ({
                weight: Number(s.weight) || 0,
                reps: Number(s.reps) || 0,
                rpe: s.rpe ? Number(s.rpe) : undefined,
                completed: true,
                setType: s.setType || 'normal',
              })),
          })),
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await workoutRepository.add(session);

      const user = useAuthStore.getState().user;

      // Evaluate achievements
      useAchievementsStore
        .getState()
        .evaluateAchievements(user?.uid || undefined)
        .catch(console.error);

      if (user) {
        pushToCloud(user.uid).catch(console.error);
        if (shareToFeed) {
          const totalVolume = session.exercises.reduce(
            (sum, ex) => sum + ex.sets.reduce((sSum, set) => sSum + set.weight * set.reps, 0),
            0,
          );
          const exercisesToPublish = activeWorkout.exercises
            .filter((e) => e.sets.some((s) => s.completed))
            .map((e) => ({
              exerciseId: e.exerciseId,
              exerciseName: e.exerciseName,
              setsCount: e.sets.filter((s) => s.completed).length,
              imageUrl: e.imageUrl,
            }));
          useSocialStore
            .getState()
            .publishSession(user.uid, user.displayName || 'Unknown Athlete', user.photoURL, {
              workoutTitle: session.name,
              duration: session.duration,
              exercisesCount: session.exercises.length,
              totalVolume,
              exercises: exercisesToPublish,
            })
            .catch(console.error);
        }
      }

      set({
        activeWorkout: null,
        restTimerActive: false,
        completedSessions: [session, ...get().completedSessions],
      });
      playWorkoutStopSound();
      useToastStore.getState().addToast('success', 'Workout saved successfully!');
    } catch (error) {
      console.error('Failed to save workout session:', error);
      useToastStore.getState().addToast('error', 'Failed to save workout. Please try again.');
    }
  },

  // ── Cancel workout without saving ──
  cancelWorkout: () => {
    set({ activeWorkout: null, restTimerActive: false });
    playWorkoutStopSound();
  },

  // ── Load Completed Sessions from Dexie ──
  loadCompletedSessions: async () => {
    set({ isLoadingCompleted: true });
    try {
      if (get().isDemoMode) {
        const getDemoCompletedSessions = () => {
          const now = new Date();
          const subDays = (d: Date, days: number) => {
            const res = new Date(d);
            res.setDate(res.getDate() - days);
            return res;
          };
          return [
            {
              id: 'demo-s1',
              name: 'Push Power Day',
              date: now.toISOString(),
              duration: 3600,
              completed: true,
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-bench',
                  exerciseName: 'Barbell Bench Press',
                  muscleGroup: 'Chest',
                  sets: [
                    { weight: 80, reps: 10, completed: true },
                    { weight: 90, reps: 8, completed: true },
                    { weight: 100, reps: 6, completed: true },
                  ],
                },
                {
                  exerciseId: 'demo-ex-ohp',
                  exerciseName: 'Barbell Overhead Press',
                  muscleGroup: 'Shoulders',
                  sets: [
                    { weight: 50, reps: 8, completed: true },
                    { weight: 60, reps: 6, completed: true },
                    { weight: 65, reps: 5, completed: true },
                  ],
                },
                {
                  exerciseId: 'demo-ex-tricep',
                  exerciseName: 'Triceps Cable Pushdown',
                  muscleGroup: 'Arms',
                  sets: [
                    { weight: 25, reps: 12, completed: true },
                    { weight: 30, reps: 10, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s2',
              name: 'Pull Strength Day',
              date: subDays(now, 1).toISOString(),
              duration: 4200,
              completed: true,
              createdAt: subDays(now, 1).toISOString(),
              updatedAt: subDays(now, 1).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-row',
                  exerciseName: 'Barbell Row',
                  muscleGroup: 'Back',
                  sets: [
                    { weight: 70, reps: 10, completed: true },
                    { weight: 80, reps: 8, completed: true },
                    { weight: 85, reps: 8, completed: true },
                  ],
                },
                {
                  exerciseId: 'demo-ex-bicep',
                  exerciseName: 'Dumbbell Biceps Curl',
                  muscleGroup: 'Arms',
                  sets: [
                    { weight: 16, reps: 12, completed: true },
                    { weight: 18, reps: 10, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s3',
              name: 'Legs Hypertrophy',
              date: subDays(now, 3).toISOString(),
              duration: 4500,
              completed: true,
              createdAt: subDays(now, 3).toISOString(),
              updatedAt: subDays(now, 3).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-squat',
                  exerciseName: 'Barbell Squat',
                  muscleGroup: 'Legs',
                  sets: [
                    { weight: 110, reps: 8, completed: true },
                    { weight: 120, reps: 6, completed: true },
                    { weight: 130, reps: 5, completed: true },
                  ],
                },
                {
                  exerciseId: 'demo-ex-abs',
                  exerciseName: 'Core Plank Board',
                  muscleGroup: 'Core',
                  sets: [
                    { weight: 0, reps: 60, completed: true },
                    { weight: 0, reps: 60, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s4',
              name: 'Cardio & Abs Core',
              date: subDays(now, 4).toISOString(),
              duration: 2400,
              completed: true,
              createdAt: subDays(now, 4).toISOString(),
              updatedAt: subDays(now, 4).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-abs-2',
                  exerciseName: 'Hanging Leg Raise',
                  muscleGroup: 'Core',
                  sets: [
                    { weight: 0, reps: 15, completed: true },
                    { weight: 0, reps: 12, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s5',
              name: 'Chest & Arms Blast',
              date: subDays(now, 6).toISOString(),
              duration: 3800,
              completed: true,
              createdAt: subDays(now, 6).toISOString(),
              updatedAt: subDays(now, 6).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-bench-incline',
                  exerciseName: 'Incline Dumbbell Press',
                  muscleGroup: 'Chest',
                  sets: [
                    { weight: 32, reps: 10, completed: true },
                    { weight: 36, reps: 8, completed: true },
                  ],
                },
                {
                  exerciseId: 'demo-ex-bicep-2',
                  exerciseName: 'Barbell Curl',
                  muscleGroup: 'Arms',
                  sets: [
                    { weight: 35, reps: 10, completed: true },
                    { weight: 40, reps: 8, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s6',
              name: 'Full Back Workout',
              date: subDays(now, 8).toISOString(),
              duration: 4100,
              completed: true,
              createdAt: subDays(now, 8).toISOString(),
              updatedAt: subDays(now, 8).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-pullup',
                  exerciseName: 'Bodyweight Pullups',
                  muscleGroup: 'Back',
                  sets: [
                    { weight: 0, reps: 12, completed: true },
                    { weight: 0, reps: 10, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s7',
              name: 'Shoulders & Triceps',
              date: subDays(now, 11).toISOString(),
              duration: 3500,
              completed: true,
              createdAt: subDays(now, 11).toISOString(),
              updatedAt: subDays(now, 11).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-lateral',
                  exerciseName: 'Lateral Dumbbell Raise',
                  muscleGroup: 'Shoulders',
                  sets: [
                    { weight: 12, reps: 15, completed: true },
                    { weight: 14, reps: 12, completed: true },
                  ],
                },
              ],
            },
            {
              id: 'demo-s8',
              name: 'Posterior Leg Day',
              date: subDays(now, 15).toISOString(),
              duration: 4800,
              completed: true,
              createdAt: subDays(now, 15).toISOString(),
              updatedAt: subDays(now, 15).toISOString(),
              exercises: [
                {
                  exerciseId: 'demo-ex-rdl',
                  exerciseName: 'Romanian Deadlift',
                  muscleGroup: 'Legs',
                  sets: [
                    { weight: 80, reps: 12, completed: true },
                    { weight: 100, reps: 10, completed: true },
                  ],
                },
              ],
            },
          ];
        };
        set({ completedSessions: getDemoCompletedSessions(), isLoadingCompleted: false });
        return;
      }

      const sessions = await workoutRepository.completedSessionsDescending();
      set({ completedSessions: sessions, isLoadingCompleted: false });
    } catch (error) {
      console.error('Failed to load completed sessions:', error);
      set({ isLoadingCompleted: false });
    }
  },

  // ── Delete a completed session ──
  deleteCompletedSession: async (id: string) => {
    try {
      await workoutRepository.remove(id);
      set({
        completedSessions: get().completedSessions.filter((s) => s.id !== id),
      });
      useToastStore.getState().addToast('success', 'Workout session deleted!');
    } catch (error) {
      console.error('Failed to delete workout session:', error);
      useToastStore.getState().addToast('error', 'Failed to delete session.');
    }
  },

  // ── Set Demo Mode ──
  setDemoMode: (enabled: boolean) => {
    set({ isDemoMode: enabled });
    get().loadCompletedSessions();
  },
}));
