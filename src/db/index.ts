import Dexie, { type Table } from 'dexie';
import type { Exercise } from '@/types/exercise';
import { uid } from '@/utils/id';

// Domain types are the source of truth. Dexie's table schema mirrors them but
// the public app imports from `@/domain`, not from here.
import type {
  BodyMeasurement,
  FoodEntry,
  NutritionGoal,
  ProgressPhoto,
  Routine,
  UnlockedAchievement,
  UserProfile,
  WorkoutExercise,
  WorkoutSession,
} from '@/domain';

// Re-export types and the pure domain math so existing `import { ... } from '@/db'`
// call sites keep working. New code should import from '@/domain' instead.
export type {
  BodyMeasurement,
  FoodEntry,
  NutritionGoal,
  ProgressPhoto,
  Routine,
  RoutineExercise,
  UnlockedAchievement,
  UserProfile,
  WorkoutExercise,
  WorkoutSession,
} from '@/domain';

export { calculateSessionVolume, getWeekKey } from '@/domain';

// Legacy aliases — keep the exported names the rest of the app uses.
export type WorkoutExerciseData = WorkoutExercise;
export type ExerciseSetData = WorkoutSession['exercises'][number]['sets'][number];

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
    super('PulseDB');

    this.version(4).stores({
      exercises_v2: 'id, category, muscleGroup',
      workoutSessions: '++id, date, completed',
      bodyMeasurements: '++id, date',
      progressPhotos: '++id, date, type',
      userProfile: '++id',
      routines: '++id, name',
    });

    this.version(5)
      .stores({
        exercises_v2: 'id, category, muscleGroup',
        workoutSessions: '++id, date, completed',
        bodyMeasurements: '++id, date',
        progressPhotos: '++id, date, type',
        userProfile: '++id',
        routines: '++id, name',
      })
      .upgrade(async (tx) => {
        const upgradeCollection = async (tableName: string) => {
          const collection = tx.table(tableName);
          const records = await collection.toArray();
          for (const record of records) {
            if (typeof record.id === 'number') {
              await collection.delete(record.id);
              record.id = uid();
              await collection.add(record);
            }
          }
        };
        await upgradeCollection('workoutSessions');
        await upgradeCollection('bodyMeasurements');
        await upgradeCollection('progressPhotos');
        await upgradeCollection('userProfile');
        await upgradeCollection('routines');
      });

    this.version(6)
      .stores({
        exercises_v2: 'id, category, muscleGroup',
        workoutSessions: '++id, date, completed, updatedAt, deleted',
        bodyMeasurements: '++id, date, updatedAt, deleted',
        progressPhotos: '++id, date, type, updatedAt, deleted',
        userProfile: '++id, updatedAt, deleted',
        routines: '++id, name, updatedAt, deleted',
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
        await upgradeColl('workoutSessions');
        await upgradeColl('bodyMeasurements');
        await upgradeColl('userProfile');
        await upgradeColl('routines');
      });

    this.version(9).stores({
      exercises_v2: 'id, category, muscleGroup',
      workoutSessions: '++id, date, completed, updatedAt, deleted',
      bodyMeasurements: '++id, date, updatedAt, deleted',
      progressPhotos: '++id, date, type, updatedAt, deleted',
      userProfile: '++id, updatedAt, deleted',
      routines: '++id, name, updatedAt, deleted',
      foodEntries: 'id, date, mealType, updatedAt, deleted',
      nutritionGoals: 'id, updatedAt, deleted',
      unlockedAchievements: 'id, achievementId, updatedAt, deleted',
      favoriteExercises: 'id',
    });
  }
}

export const db = new PulseDB();

db.open().catch(async (err: { name?: string }) => {
  if (err.name === 'UpgradeError') {
    console.warn('Database schema change detected. Resetting local database...');
    await db.delete();
    window.location.reload();
  } else {
    console.error('Failed to open DB:', err);
  }
});

// ── Analytics API ──
// Thin wrappers around the workout repository so existing imports keep working.
// New code should import { workoutRepository } from '@/db/repositories'.
import { workoutRepository } from './repositories/workoutRepository';
import { routineRepository } from './repositories/routineRepository';
import { nutritionRepository } from './repositories/nutritionRepository';
import { bodyRepository } from './repositories/bodyRepository';
import { exerciseCatalogRepository } from './repositories/exerciseCatalogRepository';
export {
  workoutRepository,
  routineRepository,
  nutritionRepository,
  bodyRepository,
  exerciseCatalogRepository,
};
export type { NewFoodEntry } from './repositories/nutritionRepository';

export const getWorkoutStreak = () => workoutRepository.getStreak();
export const getTotalStats = () => workoutRepository.getTotalStats();
export const getPersonalRecords = () => workoutRepository.getPersonalRecords();
export const getWeeklyVolume = (weeks?: number) => workoutRepository.getWeeklyVolume(weeks);
export const getExerciseProgress = (exerciseId: string | number) =>
  workoutRepository.getExerciseProgress(exerciseId);
export const getEstimated1RM = (exerciseId: string | number) =>
  workoutRepository.getEstimated1RM(exerciseId);
export const getMuscleGroupStats = (exercises: Exercise[]) =>
  workoutRepository.getMuscleGroupStats(exercises);
export const getWeeklySetVolume = (exercises: Exercise[]) =>
  workoutRepository.getWeeklySetVolume(exercises);
export const getWorkoutDensity = () => workoutRepository.getWorkoutDensity();
export const getExerciseHistory = (exerciseId: string | number) =>
  workoutRepository.getExerciseHistory(exerciseId);

// Legacy wrapper retained for any lingering callers.
export async function getWorkoutStreakLegacy(): Promise<number> {
  return workoutRepository.getStreak();
}

// Weekly volume used to carry a "tonnage" alias; expose it for callers that
// historically expected { week, tonnage }[].
export async function getWeeklyTonnage(weeks = 4) {
  const data = await workoutRepository.getWeeklyVolume(weeks);
  return data.map(({ week, tonnage }) => ({ week, tonnage }));
}

// Compatibility re-export used by older imports.
export { getWeeklyVolumeData } from './analytics';
