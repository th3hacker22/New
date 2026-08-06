import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

// Mock AI adapter so routes are deterministic.
vi.mock('../ai/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../ai/client')>();
  return {
    ...actual,
    getAi: () => ({ models: { generateContent: vi.fn() } }),
    parseNutrition: vi.fn().mockResolvedValue({
      name: 'Chicken',
      calories: 200,
      protein: 40,
      carbs: 0,
      fat: 4,
      mealType: 'lunch',
    }),
    scanMeal: vi.fn(),
    generateWorkout: vi.fn(),
    refineWorkout: vi.fn(),
    supportChat: vi.fn(),
  };
});

describe('API routes', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.geminiEnabled).toBe('boolean');
  });

  it('POST /api/parse-nutrition validates empty body', async () => {
    const res = await request(app).post('/api/parse-nutrition').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/parse-nutrition returns parsed result on success', async () => {
    const res = await request(app)
      .post('/api/parse-nutrition')
      .send({ text: '200g chicken', mealTypeHint: 'lunch' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Chicken');
    expect(res.body.calories).toBe(200);
  });

  it('POST /api/support-chat requires a message', async () => {
    const res = await request(app).post('/api/support-chat').send({});
    expect(res.status).toBe(400);
  });

  it('rejects oversized JSON at 5mb endpoint gracefully', async () => {
    const bigImage = 'x'.repeat(5_000_001);
    const res = await request(app)
      .post('/api/scan-meal')
      .send({ image: bigImage, mimeType: 'image/jpeg' });
    expect([400, 413, 500]).toContain(res.status);
  });
});
