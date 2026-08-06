/**
 * Centralized Storage Manager - ReLift
 * Solves: client-localstorage-schema, quota handling, versioning, unified naming
 *
 * Rules:
 * - All keys must be prefixed with `relift_` (legacy `pulse_` auto-migrated)
 * - Every JSON value stored with { v, data, timestamp }
 * - Graceful fallback on parse errors / quota exceeded
 * - Schema version for future migrations
 */

const STORAGE_PREFIX = 'relift_';
const STORAGE_VERSION = 2;
const LEGACY_PREFIXES = ['pulse_', 'relift_']; // pulse_ is legacy

type StoredWrapper<T> = {
  v: number;
  timestamp: number;
  data: T;
};

type StorageKey =
  | 'active_workout'
  | 'exercises_cache'
  | 'exercises_cache_expiry'
  | 'feature_suggestions'
  | 'bug_reports'
  | 'total_warmups'
  | 'recent_searches'
  | 'workout_goals'
  | 'has_shared_post'
  | 'profile_avatar'
  | `pinned_note_${string}`
  | `water_intake_${string}`;

// safe JSON parse
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    // Handle new wrapped format
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
      return (parsed as StoredWrapper<T>).data as T;
    }
    // Legacy direct JSON
    return parsed as T;
  } catch {
    return fallback;
  }
}

// quota-safe set
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    // QuotaExceededError -> try to free exercises cache first
    if (e?.name === 'QuotaExceededError') {
      console.warn(`[Storage] Quota exceeded for ${key}, attempting cleanup`);
      try {
        // Remove large cache
        localStorage.removeItem(`${STORAGE_PREFIX}exercises_cache`);
        localStorage.removeItem(`pulse_exercises_cache`);
        localStorage.removeItem(`pulse_exercises_cache_v2`);
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('[Storage] Failed even after cleanup');
        return false;
      }
    }
    console.error('[Storage] setItem failed', e);
    return false;
  }
}

function makeKey(key: StorageKey): string {
  return `${STORAGE_PREFIX}${key}`;
}

function legacyKeys(key: StorageKey): string[] {
  // Return possible old locations for this logical key
  const keys: string[] = [makeKey(key)];
  // Add legacy mappings
  const legacyMap: Record<string, string[]> = {
    active_workout: ['relift_active_workout', 'pulse_active_workout'],
    exercises_cache: [
      'pulse_exercises_cache',
      'pulse_exercises_cache_v2',
      'relift_exercises_cache',
    ],
    exercises_cache_expiry: ['pulse_exercises_cache_v2_expiry', 'relift_exercises_cache_expiry'],
    feature_suggestions: ['pulse_feature_suggestions'],
    bug_reports: ['pulse_bug_reports'],
    total_warmups: ['pulse_total_warmups'],
    recent_searches: ['recentSearches'],
    workout_goals: ['pulse_workout_goals'],
    has_shared_post: ['relift_has_shared_post', 'relift_has_shared'],
    profile_avatar: ['relift-profile-avatar', 'relift_profile_avatar'],
  };
  if (legacyMap[key]) {
    keys.push(...legacyMap[key]);
  }
  // For dynamic keys like pinned_note_XXX, water_intake_XXX
  if (key.startsWith('pinned_note_')) {
    const id = key.replace('pinned_note_', '');
    keys.push(`pulse_pinned_note_${id}`);
  }
  if (key.startsWith('water_intake_')) {
    const date = key.replace('water_intake_', '');
    keys.push(`water_intake_${date}`);
  }
  return [...new Set(keys)];
}

export const storage = {
  version: STORAGE_VERSION,

  get<T>(key: StorageKey, fallback: T): T {
    // Try all possible legacy keys
    for (const k of legacyKeys(key)) {
      const raw = localStorage.getItem(k);
      if (raw !== null) {
        const val = safeJsonParse<T>(raw, fallback);
        // If found via legacy key, migrate to new key
        if (k !== makeKey(key)) {
          this.set(key, val);
          // Optionally remove legacy after migration (keep for now to be safe)
          // localStorage.removeItem(k);
        }
        return val;
      }
    }
    return fallback;
  },

  getString(key: StorageKey, fallback = ''): string {
    return this.get<string>(key, fallback);
  },

  getNumber(key: StorageKey, fallback = 0): number {
    const val = this.get<any>(key, fallback);
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  },

  set<T>(key: StorageKey, data: T): boolean {
    const wrapper: StoredWrapper<T> = {
      v: STORAGE_VERSION,
      timestamp: Date.now(),
      data,
    };
    return safeSetItem(makeKey(key), JSON.stringify(wrapper));
  },

  // For raw string values that were historically stored raw (e.g., avatar emoji)
  setRaw(key: StorageKey, rawString: string): boolean {
    // Still wrap for versioning but allow string direct
    return this.set(key, rawString as any);
  },

  remove(key: StorageKey): void {
    for (const k of legacyKeys(key)) {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore - storage may be unavailable (private mode, quota exceeded)
      }
    }
  },

  // Specific typed helpers for large / frequent data

  getExercisesCache(): any[] | null {
    const expiry = this.getNumber('exercises_cache_expiry', 0);
    if (expiry && Date.now() > expiry) {
      return null;
    }
    const cached = this.get<any[]>('exercises_cache', [] as any);
    return cached && cached.length > 0 ? cached : null;
  },

  setExercisesCache(exercises: any[], ttlMs = 24 * 60 * 60 * 1000): boolean {
    const ok1 = this.set('exercises_cache', exercises);
    const ok2 = this.set('exercises_cache_expiry', Date.now() + ttlMs);
    return ok1 && ok2;
  },

  clearExpired(): void {
    // Cleanup expired exercises cache
    const expiry = this.getNumber('exercises_cache_expiry', 0);
    if (expiry && Date.now() > expiry) {
      this.remove('exercises_cache');
      this.remove('exercises_cache_expiry');
    }
  },

  // Migration helper called once on app start
  migrateLegacy(): void {
    try {
      // Migrate all known pulse_* to relift_*
      const keysToMigrate = [
        'feature_suggestions',
        'bug_reports',
        'recent_searches',
        'workout_goals',
      ] as StorageKey[];

      for (const k of keysToMigrate) {
        const legacyKey = legacyKeys(k).find(
          (lk) => lk !== makeKey(k) && localStorage.getItem(lk) !== null,
        );
        if (legacyKey) {
          const raw = localStorage.getItem(legacyKey);
          if (raw) {
            localStorage.setItem(makeKey(k), raw);
          }
        }
      }

      // Store version marker
      localStorage.setItem(`${STORAGE_PREFIX}storage_version`, String(STORAGE_VERSION));
    } catch (e) {
      console.error('[Storage] Migration failed', e);
    }
  },
};

// Auto-migrate on import if in browser
if (typeof window !== 'undefined') {
  try {
    storage.migrateLegacy();
    storage.clearExpired();
  } catch {
    // ignore - storage may be unavailable (private mode, quota exceeded)
  }
}
