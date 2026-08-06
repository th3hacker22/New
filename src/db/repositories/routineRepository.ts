/**
 * Routine repository — the seam over the Dexie `routines` table.
 *
 * Pages and stores call intention-revealing methods instead of touching Dexie
 * directly. Soft-delete semantics live here, in one place.
 */
import { db } from '../index';
import type { Routine } from '@/domain';

export const routineRepository = {
  /** All non-deleted routines, newest first. */
  async list(): Promise<Routine[]> {
    const rows = await db.routines.toArray();
    return rows
      .filter((r) => !r.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  get(id: string): Promise<Routine | undefined> {
    return db.routines.get(id);
  },

  async put(routine: Routine): Promise<void> {
    await db.routines.put({ ...routine, updatedAt: new Date().toISOString() });
  },

  /** Soft-delete a routine by id. Returns true if a row was updated. */
  async softDelete(id: string): Promise<boolean> {
    const existing = await db.routines.get(id);
    if (!existing) return false;
    await db.routines.put({
      ...existing,
      deleted: true,
      updatedAt: new Date().toISOString(),
    });
    return true;
  },
};
