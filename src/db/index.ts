import Dexie, { type Table } from "dexie";
import type { Exercise } from "@/types/exercise";
import { uid } from "@/utils/id";

// ── Import analytics helpers ──
import { calculateSessionVolume, getWeekKey as getWeekKeyInternal, getWorkoutStreak as getStreakNew, getWeeklyVolumeData } from "./analytics";
export { calculateSessionVolume, getWeeklyVolumeData };
export const getWeekKey = getWeekKeyInternal;
export const getWorkoutStreak = getStreakNew;

// ── Workout Types ──
export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExerciseData[];
  notes?: string;
  completed: boolean;
  isFreeze?: boolean;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface WorkoutExerciseData {
  exerciseId: string | number;
  exerciseName: string;
  muscleGroup?: string;
  target?: string;
  notes?: string;
  sets: ExerciseSetData[];
}

export interface ExerciseSetData {
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  setType?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  type: "front" | "side" | "back";
  imageBlob: Blob;
  thumbnailBlob?: Blob;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  weight?: number;
  height?: number;
  goal?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface RoutineExercise {
  exerciseId: string | number;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  restTimer: number;
  isSupersetWithNext?: boolean;
  order: number;
  imageUrl?: string;
  equipment?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface FoodEntry {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

export interface NutritionGoal {
  id: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: string;
  deleted?: boolean;
}

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  deleted?: boolean;
}

class PulseDB extends Dexie {
  exercises_v2!: Table<Exercise>;
  workoutSessions!: Table<WorkoutSession>;
  bodyMeasurements!: Table<BodyMeasurement>;
  progressPhotos!: Table<ProgressPhoto>;
  userProfile!: Table<UserProfile>;
  routines!: Table<Routine>;
  foodEntries!: Table<FoodEntry>;
  nutritionGoals!: Table<NutritionGoal>;
  unlockedAchievements!: Table<UnlockedAchievement>;
  favoriteExercises!: Table<{ id: string }>;

  constructor() {
    super("PulseDB");

    this.version(4).stores({
      exercises_v2: "id, category, muscleGroup",
      workoutSessions: "++id, date, completed",
      bodyMeasurements: "++id, date",
      progressPhotos: "++id, date, type",
      userProfile: "++id",
      routines: "++id, name",
    });

    this.version(5)
      .stores({
        exercises_v2: "id, category, muscleGroup",
        workoutSessions: "++id, date, completed",
        bodyMeasurements: "++id, date",
        progressPhotos: "++id, date, type",
        userProfile: "++id",
        routines: "++id, name",
      })
      .upgrade(async (tx) => {
        const upgradeCollection = async (tableName: string) => {
          const collection = tx.table(tableName);
          const records = await collection.toArray();
          for (const record of records) {
            if (typeof record.id === "number") {
              await collection.delete(record.id);
              record.id = uid();
              await collection.add(record);
            }
          }
        };
        await upgradeCollection("workoutSessions");
        await upgradeCollection("bodyMeasurements");
        await upgradeCollection("progressPhotos");
        await upgradeCollection("userProfile");
        await upgradeCollection("routines");
      });

    this.version(6)
      .stores({
        exercises_v2: "id, category, muscleGroup",
        workoutSessions: "++id, date, completed, updatedAt, deleted",
        bodyMeasurements: "++id, date, updatedAt, deleted",
        progressPhotos: "++id, date, type, updatedAt, deleted",
        userProfile: "++id, updatedAt, deleted",
        routines: "++id, name, updatedAt, deleted",
      })
      .upgrade(async (tx) => {
        const time = new Date().toISOString();
        const upgradeColl = async (tableName: string) => {
          const collection = tx.table(tableName);
          await collection.toCollection().modify((item) => {
            if (!item.updatedAt) item.updatedAt = item.createdAt || time;
            if (item.deleted === undefined) item.deleted = false;
          });
        };
        await upgradeColl("workoutSessions");
        await upgradeColl("bodyMeasurements");
        await upgradeColl("userProfile");
        await upgradeColl("routines");
      });

    this.version(9).stores({
      exercises_v2: "id, category, muscleGroup",
      workoutSessions: "++id, date, completed, updatedAt, deleted",
      bodyMeasurements: "++id, date, updatedAt, deleted",
      progressPhotos: "++id, date, type, updatedAt, deleted",
      userProfile: "++id, updatedAt, deleted",
      routines: "++id, name, updatedAt, deleted",
      foodEntries: "id, date, mealType, updatedAt, deleted",
      nutritionGoals: "id, updatedAt, deleted",
      unlockedAchievements: "id, achievementId, updatedAt, deleted",
      favoriteExercises: "id",
    });
  }
}

export const db = new PulseDB();

db.open().catch(async (err) => {
  if (err.name === "UpgradeError") {
    console.warn("Database schema change detected. Resetting local database...");
    await db.delete();
    window.location.reload();
  } else {
    console.error("Failed to open DB:", err);
  }
});

// ── Analytics Helpers (Refactored to avoid duplication) ──

// Wrapper for backward compat - now uses new implementation
export async function getWorkoutStreakLegacy(): Promise<number> {
  return getStreakNew();
}

export async function getPersonalRecords(): Promise<
  { exerciseId: string | number; exerciseName: string; maxWeight: number; date: string }[]
> {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const records: Map<string | number, { exerciseName: string; maxWeight: number; date: string }> = new Map();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.sets.length === 0) continue;
      const maxSetWeight = Math.max(...ex.sets.map((s) => s.weight || 0));
      const current = records.get(ex.exerciseId);
      if (!current || maxSetWeight > current.maxWeight) {
        records.set(ex.exerciseId, {
          exerciseName: ex.exerciseName,
          maxWeight: maxSetWeight,
          date: session.date,
        });
      }
    }
  }

  return Array.from(records.entries()).map(([exerciseId, data]) => ({
    exerciseId,
    ...data,
  }));
}

// Unified weekly volume - single source of truth
export async function getWeeklyVolume(weeks = 8): Promise<{ week: string; volume: number }[]> {
  const data = await getWeeklyVolumeData(weeks);
  return data.map(({ week, volume }) => ({ week, volume }));
}

export async function getWeeklyTonnage(weeks = 4): Promise<{ week: string; tonnage: number }[]> {
  const data = await getWeeklyVolumeData(weeks);
  return data.map(({ week, tonnage }) => ({ week, tonnage }));
}

export async function getExerciseProgress(
  exerciseId: string | number,
): Promise<{ date: string; maxWeight: number }[]> {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const progress: { date: string; maxWeight: number }[] = [];

  for (const session of sessions) {
    const ex = session.exercises.find((e) => String(e.exerciseId) === String(exerciseId));
    if (ex && ex.sets.length > 0) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0));
      progress.push({
        date: session.date.split("T")[0],
        maxWeight,
      });
    }
  }

  return progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEstimated1RM(
  exerciseId: string | number,
): Promise<{ date: string; e1rm: number }[]> {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const progress: { date: string; e1rm: number }[] = [];

  for (const session of sessions) {
    const ex = session.exercises.find((e) => String(e.exerciseId) === String(exerciseId));
    if (ex && ex.sets.length > 0) {
      const bestE1rm = Math.max(
        ...ex.sets
          .filter((s) => s.completed)
          .map((s) => s.weight * (1 + s.reps / 30)),
        0
      );
      if (bestE1rm > 0) {
        progress.push({
          date: session.date.split("T")[0],
          e1rm: Math.round(bestE1rm * 10) / 10,
        });
      }
    }
  }

  return progress.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getMuscleGroupStats(
  exercises: Exercise[],
): Promise<{ muscle: string; volume: number }[]> {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const muscleData = new Map<string, number>();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      const exerciseDef = exercises.find((e) => String(e.id) === String(ex.exerciseId));
      const muscle = ex.muscleGroup || exerciseDef?.muscleGroup;
      if (!muscle) continue;

      const volume = ex.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.weight * s.reps, 0);

      muscleData.set(muscle, (muscleData.get(muscle) || 0) + volume);
    }
  }

  return Array.from(muscleData.entries())
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume);
}

export async function getWeeklySetVolume(
  exercises: Exercise[],
): Promise<{ muscle: string; sets: number }[]> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Use where completed = true then filter by date - consistent with other queries
  const allSessions = await db.workoutSessions.where("completed").equals(true).toArray();
  const sessions = allSessions.filter((s) => new Date(s.date) >= startOfWeek);

  const muscleSets = new Map<string, number>();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      const exerciseDef = exercises.find((e) => String(e.id) === String(ex.exerciseId));
      const muscle = ex.muscleGroup || exerciseDef?.muscleGroup;
      if (!muscle) continue;

      const completedSets = ex.sets.filter((s) => s.completed).length;
      muscleSets.set(muscle, (muscleSets.get(muscle) || 0) + completedSets);
    }
  }

  return Array.from(muscleSets.entries())
    .map(([muscle, sets]) => ({ muscle, sets }))
    .sort((a, b) => b.sets - a.sets);
}

export async function getWorkoutDensity(): Promise<{ date: string; count: number }[]> {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const densityMap = new Map<string, number>();

  for (const session of sessions) {
    const date = session.date.split("T")[0];
    densityMap.set(date, (densityMap.get(date) || 0) + 1);
  }

  return Array.from(densityMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getTotalStats() {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const validSessions = sessions.filter((s) => !s.isFreeze);

  const totalWorkouts = validSessions.length;
  const totalVolume = validSessions.reduce((acc, s) => acc + calculateSessionVolume(s), 0);
  const totalDuration = validSessions.reduce((acc, s) => acc + s.duration, 0);

  return { totalWorkouts, totalVolume, totalDuration };
}

export async function getExerciseHistory(exerciseId: string) {
  const sessions = await db.workoutSessions.where("completed").equals(true).toArray();

  const history = sessions
    .filter((s) => s.exercises.some((ex) => String(ex.exerciseId) === String(exerciseId)))
    .map((s) => {
      const exercise = s.exercises.find((ex) => String(ex.exerciseId) === String(exerciseId))!;
      const totalVolume = exercise.sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
      const maxWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
      const bestSet = exercise.sets.reduce(
        (best, current) => (current.weight * current.reps > best.weight * best.reps ? current : best),
        exercise.sets[0],
      );

      return {
        date: s.date,
        volume: totalVolume,
        maxWeight,
        estimated1RM: maxWeight * (1 + bestSet.reps / 30),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return history;
}
