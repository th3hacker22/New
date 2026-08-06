/**
 * Body repository — body measurements and progress photos over Dexie.
 * Soft-delete semantics are applied by callers through the deleted flag.
 */
import { db } from '../index';
import type { BodyMeasurement, ProgressPhoto } from '@/domain';

export const bodyRepository = {
  listMeasurements(): Promise<BodyMeasurement[]> {
    return db.bodyMeasurements.orderBy('date').reverse().toArray() as unknown as Promise<
      BodyMeasurement[]
    >;
  },

  latestMeasurement(): Promise<BodyMeasurement | undefined> {
    return db.bodyMeasurements.orderBy('date').reverse().first() as unknown as Promise<
      BodyMeasurement | undefined
    >;
  },

  addMeasurement(m: BodyMeasurement): Promise<string> {
    return db.bodyMeasurements.add(m as never);
  },

  listPhotos(): Promise<ProgressPhoto[]> {
    return db.progressPhotos.orderBy('date').reverse().toArray() as unknown as Promise<
      ProgressPhoto[]
    >;
  },

  addPhoto(p: ProgressPhoto): Promise<string> {
    return db.progressPhotos.add(p as never);
  },

  removePhoto(id: string): Promise<void> {
    return db.progressPhotos.delete(id);
  },
};
