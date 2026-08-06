import { describe, it, expect } from 'vitest';
import {
  validateText,
  validateMealType,
  validateMinimalExercises,
  validateImage,
  validateState,
  validateHistory,
} from './schemas';

describe('validateText', () => {
  it('accepts valid non-empty strings under max length', () => {
    expect(validateText('chicken and rice', 100)).toBeNull();
  });
  it('rejects non-strings', () => {
    expect(validateText(123)).not.toBeNull();
    expect(validateText(null)).not.toBeNull();
  });
  it('rejects empty / whitespace only', () => {
    expect(validateText('   ')).not.toBeNull();
  });
  it('rejects text exceeding the limit', () => {
    expect(validateText('x'.repeat(11), 10)).not.toBeNull();
  });
});

describe('validateMealType', () => {
  it.each(['breakfast', 'lunch', 'dinner', 'snack'] as const)('accepts %s', (m) => {
    expect(validateMealType(m)).toBe(true);
  });
  it('rejects unknown meal types', () => {
    expect(validateMealType('dessert')).toBe(false);
    expect(validateMealType(undefined)).toBe(false);
  });
});

describe('validateMinimalExercises', () => {
  it('requires an array', () => {
    expect(validateMinimalExercises('nope')).not.toBeNull();
  });
  it('rejects empty arrays', () => {
    expect(validateMinimalExercises([])).not.toBeNull();
  });
  it('rejects arrays over 500 entries', () => {
    expect(validateMinimalExercises(new Array(501).fill({ id: 'x' }))).not.toBeNull();
  });
  it('accepts a valid non-empty list', () => {
    expect(validateMinimalExercises([{ id: 'bench' }])).toBeNull();
  });
});

describe('validateState', () => {
  it('requires a truthy object', () => {
    expect(validateState(null)).not.toBeNull();
    expect(validateState({})).toBeNull();
  });
});

describe('validateHistory', () => {
  it('accepts undefined', () => {
    expect(validateHistory(undefined)).toBeNull();
  });
  it('rejects non-arrays', () => {
    expect(validateHistory('x')).not.toBeNull();
  });
  it('rejects more than 20 entries', () => {
    expect(validateHistory(new Array(21).fill({ text: 'a' }))).not.toBeNull();
  });
});

describe('validateImage', () => {
  it('rejects a missing image', () => {
    const result = validateImage({});
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.status).toBe(400);
  });

  it('rejects unsupported mime types', () => {
    const result = validateImage({ image: 'x', mimeType: 'image/gif' });
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.status).toBe(400);
  });

  it('rejects oversized base64 payloads', () => {
    const result = validateImage({ image: 'x'.repeat(5_000_000) });
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.status).toBe(413);
  });

  it('accepts a valid jpeg image and defaults mimeType', () => {
    const result = validateImage({ image: 'abc' });
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.mimeType).toBe('image/jpeg');
    }
  });

  it('validates meal type hint', () => {
    const bad = validateImage({ image: 'abc', mealTypeHint: 'bad' });
    expect('error' in bad).toBe(true);
    const good = validateImage({ image: 'abc', mealTypeHint: 'breakfast' });
    expect('error' in good).toBe(false);
  });
});
