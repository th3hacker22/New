/**
 * Domain types — the vocabulary of the fitness domain.
 *
 * These are framework-agnostic: no Dexie, no React, no Firebase.
 * Persistence shapes (Dexie tables) and UI shapes build on top of these.
 */

export type SetType = 'warmup' | 'working' | 'dropset' | 'failure' | 'assisted';

export type WeightUnit = 'kg' | 'lbs';
export type DistanceUnit = 'km' | 'miles';
export type MeasurementUnit = 'cm' | 'inches';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type PhotoType = 'front' | 'side' | 'back';

/** A single performed set within an exercise. */
export interface WorkoutSet {
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  completed: boolean;
  setType?: SetType | string;
}

/** An exercise performed (or planned) inside a workout session. */
export interface WorkoutExercise {
  exerciseId: string | number;
  exerciseName: string;
  muscleGroup?: string;
  target?: string;
  notes?: string;
  sets: WorkoutSet[];
}

/** A completed or in-progress workout session — the core aggregate. */
export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  isFreeze?: boolean;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
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

export interface NutritionGoal {
  id: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  mealType: MealType;
  createdAt: string;
  updatedAt: string;
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

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  deleted?: boolean;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  type: PhotoType;
  imageBlob: Blob;
  thumbnailBlob?: Blob;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  deleted?: boolean;
}

// ── Derived/read-model shapes returned by analytics ──

export interface PersonalRecord {
  exerciseId: string | number;
  exerciseName: string;
  maxWeight: number;
  date: string;
}

export interface WeeklyVolumePoint {
  week: string;
  volume: number;
  tonnage: number;
}

export interface MuscleVolumePoint {
  muscle: string;
  volume: number;
}

export interface MuscleSetPoint {
  muscle: string;
  sets: number;
}

export interface ExerciseProgressPoint {
  date: string;
  maxWeight: number;
}

export interface EstimatedOneRepMaxPoint {
  date: string;
  e1rm: number;
}

export interface ExerciseHistoryPoint {
  date: string;
  volume: number;
  maxWeight: number;
  estimated1RM: number;
}

export interface WorkoutDensityPoint {
  date: string;
  count: number;
}

export interface TotalStats {
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
}
