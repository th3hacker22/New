/**
 * Cloud sync — push/pull local Dexie data to Firestore.
 *
 * Firestore is imported dynamically here because this module is referenced by
 * many stores; a static import would drag the ~400kb firestore chunk into the
 * initial bundle even for users who never open the sync flow. Lazy import
 * defers it until a sync actually runs (bundle-defer-third-party).
 */
import { db as dexieDb } from '@/db/index';
import { useToastStore } from '@/store/useToastStore';

const COLLECTION_MAP: Record<string, string> = {
  workoutSessions: 'workouts',
  bodyMeasurements: 'measurements',
  routines: 'routines',
  foodEntries: 'foodEntries',
  nutritionGoals: 'nutritionGoals',
  unlockedAchievements: 'unlockedAchievements',
};

function cleanUndefined<T>(value: T): T {
  if (value === null || value === undefined) return null as T;
  if (Array.isArray(value)) return value.map((item) => cleanUndefined(item)) as T;
  if (typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) cleaned[key] = cleanUndefined(v);
    }
    return cleaned as T;
  }
  return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DexieTable = {
  toArray: () => Promise<any[]>;
  bulkPut: (r: any[]) => Promise<unknown>;
  bulkDelete: (ids: string[]) => Promise<unknown>;
};

async function tableFor(name: string): Promise<DexieTable> {
  return (dexieDb as unknown as Record<string, DexieTable>)[name];
}

export async function pushToCloud(userId: string) {
  const { getDb } = await import('@/lib/firebase');
  const firestore = await getDb();
  const { doc, writeBatch } = await import('firebase/firestore');

  try {
    for (const [localTable, remoteCollection] of Object.entries(COLLECTION_MAP)) {
      const records = await (await tableFor(localTable)).toArray();
      let batch = writeBatch(firestore);
      let count = 0;

      for (const record of records) {
        if (!record.id) continue;
        const docRef = doc(firestore, `users/${userId}/${remoteCollection}/${record.id}`);
        batch.set(docRef, cleanUndefined(record));
        count++;
        if (count >= 450) {
          await batch.commit();
          batch = writeBatch(firestore);
          count = 0;
        }
      }
      if (count > 0) await batch.commit();
    }
  } catch (err) {
    console.error('Push to cloud failed:', err);
    useToastStore.getState().addToast('error', 'Sync to cloud failed, will retry later.');
    throw err;
  }
}

export async function pullFromCloud(userId: string) {
  const { getDb } = await import('@/lib/firebase');
  const firestore = await getDb();
  const { collection, getDocs } = await import('firebase/firestore');

  try {
    for (const [localTable, remoteCollection] of Object.entries(COLLECTION_MAP)) {
      const snapshot = await getDocs(collection(firestore, `users/${userId}/${remoteCollection}`));
      const localCollection = await tableFor(localTable);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toPut: any[] = [];
      const toDelete: string[] = [];

      const localRecordsArr = await localCollection.toArray();
      const localRecords = new Map(localRecordsArr.map((r: { id: string }) => [r.id, r]));

      snapshot.forEach((docSnap) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remote = docSnap.data() as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const local = localRecords.get(remote.id) as any;
        if (
          !local ||
          new Date(remote.updatedAt || 0).getTime() > new Date(local.updatedAt || 0).getTime()
        ) {
          if (remote.deleted) toDelete.push(remote.id);
          else toPut.push(remote);
        }
      });

      if (toPut.length) await localCollection.bulkPut(toPut);
      if (toDelete.length) await localCollection.bulkDelete(toDelete);
    }
  } catch (err) {
    console.error('Pull from cloud failed:', err);
    useToastStore.getState().addToast('error', 'Sync from cloud failed.');
    throw err;
  }
}

export async function syncAll(userId: string) {
  try {
    await pullFromCloud(userId);
    await pushToCloud(userId);
  } catch (err) {
    console.error('Sync all failed:', err);
  }
}
