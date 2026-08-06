/**
 * Workout repository — the seam between the app and Dexie's workoutSessions table.
 *
 * Before this module, every page and store reached straight into Dexie:
 *   db.workoutSessions.where('completed').equals(1).reverse().limit(n).toArray()
 * That Message Chain appeared ~12 times and leaked the boolean-index encoding
 * (`equals(1)`) across the codebase. This module is the **only** place allowed
 * to speak that dialect; everything above calls intention-revealing methods.
 *
 * All math is delegated to `src/domain` so this module stays about persistence.
 */
import { db } from '../index';
import type { WorkoutSession } from '@/domain';
import type { Exercise } from '@/types/exercise';
import {
  computeEstimated1RM,
  computeExerciseHistory,
  computeExerciseProgress,
  computeMuscleGroupVolume,
  computePersonalRecords,
  computeStreak,
  computeTotalStats,
  computeWeeklySetVolume,
  computeWeeklyVolume,
  computeWorkoutDensity,
  type EstimatedOneRepMaxPoint,
  type ExerciseHistoryPoint,
  type ExerciseProgressPoint,
  type MuscleSetPoint,
  type MuscleVolumePoint,
  type PersonalRecord,
  type TotalStats,
  type WorkoutDensityPoint,
} from '@/domain';

/** Dexie stores booleans as 0/1 on indexed columns. */
const COMPLETED_INDEX = 1;

export const workoutRepository = {
  /**
   * All completed sessions ordered by date (newest first). We sort in JS,
   * not by primary key, because rows can be inserted out of date order
   * (imports/backdated edits).
   */
  async completedSessions(): Promise<WorkoutSession[]> {
    return this.allCompletedOrdered();
  },

  /** All completed sessions, newest first. */
  async completedSessionsDescending(): Promise<WorkoutSession[]> {
    return this.allCompletedOrdered();
  },

  async allCompletedOrdered(): Promise<WorkoutSession[]> {
    const rows = (await db.workoutSessions
      .where('completed')
      .equals(COMPLETED_INDEX)
      .toArray()) as unknown as WorkoutSession[];
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /** Delete a session by id. */
  async remove(id: string): Promise<void> {
    await db.workoutSessions.delete(id);
  },

  /** Add a session row directly (used for streak freezes and migrations). */
  async add(session: WorkoutSession): Promise<string | number> {
    return db.workoutSessions.add(session as never);
  },

  /** Persist a new in-app session and return its id. */
  async create(input: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.workoutSessions.add({
      id,
      createdAt: now,
      updatedAt: now,
      ...input,
    } as never);
    return id;
  },

  /** Most recent completed sessions, newest first. */
  async recentCompleted(limit: number): Promise<WorkoutSession[]> {
    return (await this.allCompletedOrdered()).slice(0, limit);
  },

  /** Completed sessions since `since`, newest first. */
  async completedSince(since: Date): Promise<WorkoutSession[]> {
    return (await this.allCompletedOrdered()).filter((s) => new Date(s.date) >= since);
  },

  /** Completed sessions in the current week (Monday 00:00 local). */
  completedThisWeek(now = new Date()): Promise<WorkoutSession[]> {
    const startOfWeek = new Date(now);
    const dayOfWeek = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return this.completedSince(startOfWeek);
  },

  // ── Analytics (delegate to pure domain functions) ──

  getStreak(): Promise<number> {
    return this.completedSessions().then(computeStreak);
  },

  getTotalStats(): Promise<TotalStats> {
    return this.completedSessions().then(computeTotalStats);
  },

  getPersonalRecords(): Promise<PersonalRecord[]> {
    return this.completedSessions().then(computePersonalRecords);
  },

  getWeeklyVolume(weeks = 8) {
    return this.completedSessions().then((s) => computeWeeklyVolume(s, weeks));
  },

  getExerciseProgress(exerciseId: string | number): Promise<ExerciseProgressPoint[]> {
    return this.completedSessions().then((s) => computeExerciseProgress(s, exerciseId));
  },

  getEstimated1RM(exerciseId: string | number): Promise<EstimatedOneRepMaxPoint[]> {
    return this.completedSessions().then((s) => computeEstimated1RM(s, exerciseId));
  },

  getMuscleGroupStats(exercises: Exercise[]): Promise<MuscleVolumePoint[]> {
    return this.completedSessions().then((s) => computeMuscleGroupVolume(s, exercises));
  },

  getWeeklySetVolume(exercises: Exercise[]): Promise<MuscleSetPoint[]> {
    return this.completedSessions().then((s) => computeWeeklySetVolume(s, exercises));
  },

  getWorkoutDensity(): Promise<WorkoutDensityPoint[]> {
    return this.completedSessions().then(computeWorkoutDensity);
  },

  getExerciseHistory(exerciseId: string | number): Promise<ExerciseHistoryPoint[]> {
    return this.completedSessions().then((s) => computeExerciseHistory(s, exerciseId));
  },
};
