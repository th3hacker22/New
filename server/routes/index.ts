/**
 * HTTP routes for the AI endpoints. Each route is thin: validate, call the AI
 * adapter, and map errors to status codes. Business shape lives in `server/ai`.
 */
import { Router, type Request, type Response } from 'express';
import { createRateLimiter } from '../middleware';
import {
  validateHistory,
  validateImage,
  validateMealType,
  validateMinimalExercises,
  validateState,
  validateText,
} from '../validation/schemas';
import {
  generateWorkout,
  getAi,
  parseNutrition,
  refineWorkout,
  scanMeal,
  supportChat,
} from '../ai/client';

const aiRateLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 15,
  keyPrefix: 'ai',
  message: 'AI rate limit: max 15 requests per minute.',
});
const aiChatLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 20,
  keyPrefix: 'ai-chat',
  message: 'Chat rate limit: max 20 per minute.',
});
const scanLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 10,
  keyPrefix: 'scan',
  message: 'Meal scan limit: max 10 per minute.',
});

function sendAiDisabled(res: Response) {
  res.status(503).json({ error: 'AI is not enabled on the server.' });
}

function handleError(res: Response, error: unknown) {
  console.error('AI request failed:', error);
  const message = error instanceof Error ? error.message : 'Internal error';
  res.status(500).json({ error: message.substring(0, 500) });
}

export function createApiRouter(): Router {
  const router = Router();

  router.post('/parse-nutrition', aiRateLimiter, async (req: Request, res: Response) => {
    if (!getAi()) return sendAiDisabled(res);
    const { text, mealTypeHint } = req.body as { text?: unknown; mealTypeHint?: unknown };

    const textErr = validateText(text, 1000);
    if (textErr) return res.status(400).json({ error: textErr });
    if (mealTypeHint && !validateMealType(mealTypeHint)) {
      return res.status(400).json({ error: 'Invalid mealTypeHint' });
    }

    try {
      const result = await parseNutrition(text as string, mealTypeHint as string | undefined);
      res.json(result);
    } catch (e) {
      handleError(res, e);
    }
  });

  router.post('/scan-meal', scanLimiter, async (req: Request, res: Response) => {
    if (!getAi()) return sendAiDisabled(res);
    const payload = validateImage(req.body);
    if ('error' in payload) return res.status(payload.status).json({ error: payload.error });

    try {
      const result = await scanMeal(payload.image, payload.mimeType, payload.mealTypeHint);
      res.json(result);
    } catch (e) {
      handleError(res, e);
    }
  });

  router.post('/generate-workout', aiRateLimiter, async (req: Request, res: Response) => {
    if (!getAi()) return sendAiDisabled(res);
    const { prompt, state, minimalExercises } = req.body as {
      prompt?: unknown;
      state?: unknown;
      minimalExercises?: unknown;
    };

    const promptErr = validateText(prompt, 2000);
    if (promptErr) return res.status(400).json({ error: promptErr });
    const exErr = validateMinimalExercises(minimalExercises);
    if (exErr) return res.status(400).json({ error: exErr });
    const stateErr = validateState(state);
    if (stateErr) return res.status(400).json({ error: stateErr });

    try {
      const result = await generateWorkout({
        prompt: prompt as string,
        state: state as Record<string, unknown>,
        minimalExercises: minimalExercises as Array<{
          id: string;
          name: string;
          target: string;
          equipment: string;
        }>,
      });
      res.json(result);
    } catch (e) {
      handleError(res, e);
    }
  });

  router.post('/refine-workout', aiRateLimiter, async (req: Request, res: Response) => {
    if (!getAi()) return sendAiDisabled(res);
    const { instruction, state, minimalExercises, currentRoutineText } = req.body as {
      instruction?: unknown;
      state?: unknown;
      minimalExercises?: unknown;
      currentRoutineText?: unknown;
    };

    const instrErr = validateText(instruction, 2000);
    if (instrErr) return res.status(400).json({ error: instrErr });
    const exErr = validateMinimalExercises(minimalExercises);
    if (exErr) return res.status(400).json({ error: exErr });

    try {
      const result = await refineWorkout({
        instruction: instruction as string,
        state: (state ?? {}) as Record<string, unknown>,
        minimalExercises: minimalExercises as Array<{
          id: string;
          name: string;
          target: string;
          equipment: string;
        }>,
        currentRoutineText: typeof currentRoutineText === 'string' ? currentRoutineText : '',
      });
      res.json(result);
    } catch (e) {
      handleError(res, e);
    }
  });

  router.post('/support-chat', aiChatLimiter, async (req: Request, res: Response) => {
    if (!getAi()) return sendAiDisabled(res);
    const { message, history } = req.body as { message?: unknown; history?: unknown };

    const msgErr = validateText(message, 2000);
    if (msgErr) return res.status(400).json({ error: msgErr });
    const histErr = validateHistory(history);
    if (histErr) return res.status(400).json({ error: histErr });

    try {
      const result = await supportChat(
        message as string,
        history as Array<{ role?: string; text?: string }> | undefined,
      );
      res.json(result);
    } catch (e) {
      handleError(res, e);
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', geminiEnabled: !!getAi(), timestamp: new Date().toISOString() });
  });

  return router;
}
