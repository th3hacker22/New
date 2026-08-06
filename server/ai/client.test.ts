import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the GoogleGenAI SDK so we don't make real calls and don't need a key.
const mockGenerate = vi.fn();
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerate },
  })),
  Type: { OBJECT: 'object', STRING: 'string', INTEGER: 'integer', ARRAY: 'array' },
}));

describe('AI client', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
  });

  it('parses nutrition JSON on success', async () => {
    mockGenerate.mockResolvedValueOnce({
      text: JSON.stringify({
        name: 'Chicken Bowl',
        calories: 450,
        protein: 40,
        carbs: 30,
        fat: 15,
        mealType: 'lunch',
      }),
    });
    const { parseNutrition, getAi } = await import('./client');
    // Force module init even without GEMINI_API_KEY by importing after mock.
    if (!getAi()) {
      // If no key, the module set ai=null; inject by re-evaluating the env via dynamic reset.
      process.env.GEMINI_API_KEY = 'test-key';
      vi.resetModules();
    }
    const mod = await import('./client');
    const result = await mod.parseNutrition('150g chicken', 'lunch');
    expect(result.name).toBe('Chicken Bowl');
    expect(result.calories).toBe(450);
  });

  it('throws AI_DISABLED when no client is available', async () => {
    delete process.env.GEMINI_API_KEY;
    vi.resetModules();
    const mod = await import('./client');
    expect(mod.getAi()).toBeNull();
    await expect(mod.parseNutrition('egg')).rejects.toThrow();
  });
});
