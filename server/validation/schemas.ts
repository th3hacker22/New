/**
 * Request validation — a deep module that turns messy `req.body` into either a
 * typed value or a short, user-safe error string. Routes only branch on the
 * error; they never re-implement the checks.
 */

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'] as const;
const MAX_BASE64_BYTES = 4 * 1024 * 1024; // ~3MB binary -> 4MB base64

export type MealType = (typeof MEAL_TYPES)[number];

export function validateText(text: unknown, maxLen = 500): string | null {
  if (typeof text !== 'string') return 'text must be string';
  if (text.trim().length === 0) return 'text is required';
  if (text.length > maxLen) return `text exceeds max length ${maxLen}`;
  return null;
}

export function validateMealType(value: unknown): value is MealType {
  return typeof value === 'string' && (MEAL_TYPES as readonly string[]).includes(value);
}

export function validateMinimalExercises(list: unknown): string | null {
  if (!Array.isArray(list)) return 'minimalExercises must be array';
  if (list.length === 0) return 'minimalExercises empty';
  if (list.length > 500) return 'minimalExercises too large';
  return null;
}

export interface ImagePayload {
  image: string;
  mimeType: string;
  mealTypeHint?: MealType;
}

export function validateImage(body: unknown): ImagePayload | { error: string; status: number } {
  const b = body as { image?: unknown; mimeType?: unknown; mealTypeHint?: unknown };
  if (typeof b.image !== 'string' || b.image.length === 0) {
    return { error: 'image base64 required', status: 400 };
  }
  if (b.image.length > MAX_BASE64_BYTES) {
    return { error: 'Image too large, max 3MB', status: 413 };
  }
  const mimeType = typeof b.mimeType === 'string' ? b.mimeType : 'image/jpeg';
  if (!(MIME_TYPES as readonly string[]).includes(mimeType)) {
    return { error: 'Unsupported mimeType', status: 400 };
  }
  let mealTypeHint: MealType | undefined;
  if (b.mealTypeHint !== undefined) {
    if (!validateMealType(b.mealTypeHint)) {
      return { error: 'Invalid mealTypeHint', status: 400 };
    }
    mealTypeHint = b.mealTypeHint;
  }
  return { image: b.image, mimeType, mealTypeHint };
}

export function validateState(state: unknown): string | null {
  if (!state || typeof state !== 'object') return 'state required';
  return null;
}

export function validateHistory(history: unknown): string | null {
  if (history === undefined) return null;
  if (!Array.isArray(history)) return 'history must be array';
  if (history.length > 20) return 'history too long, max 20';
  return null;
}
