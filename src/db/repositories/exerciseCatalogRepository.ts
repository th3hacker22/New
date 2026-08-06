/**
 * Exercise catalog repository — local cache of the exercise dataset plus the
 * set of favorited exercise ids. Hides the Dexie table dialect from stores.
 */
import { db } from '../index';
import type { Exercise } from '@/types/exercise';

export const exerciseCatalogRepository = {
  count(): Promise<number> {
    return db.exercises_v2.count();
  },

  list(): Promise<Exercise[]> {
    return db.exercises_v2.toArray() as unknown as Promise<Exercise[]>;
  },

  bulkPut(exercises: Exercise[]): Promise<unknown> {
    return db.exercises_v2.bulkPut(exercises as never);
  },

  async listFavoriteIds(): Promise<string[]> {
    const rows = await db.favoriteExercises.toArray();
    return rows.map((r) => r.id);
  },

  isFavorite(id: string): Promise<{ id: string } | undefined> {
    return db.favoriteExercises.get(id);
  },

  addFavorite(id: string): Promise<unknown> {
    return db.favoriteExercises.put({ id });
  },

  removeFavorite(id: string): Promise<void> {
    return db.favoriteExercises.delete(id);
  },
};
