/**
 * AI adapter — the seam between the app and the Gemini SDK.
 *
 * Routes depend on this small interface, not on `@google/genai` directly, so
 * the provider can be swapped (or stubbed in tests) without touching a route.
 * If no API key is configured, `getAi()` returns null and routes return 503.
 */
import { GoogleGenAI, Type, type GenerateContentParameters } from '@google/genai';

const MODEL = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export function getAi(): GoogleGenAI | null {
  return ai;
}

export const SCHEMAS = {
  workout: {
    type: Type.OBJECT,
    properties: {
      exercises: {
        type: Type.ARRAY,
        description: 'List of exercises in the workout plan',
        items: {
          type: Type.OBJECT,
          properties: {
            exerciseId: {
              type: Type.STRING,
              description: 'ID of the exercise. MUST exactly match one from the provided list.',
            },
            sets: { type: Type.INTEGER, description: 'Number of sets' },
            reps: { type: Type.STRING, description: "Number of reps (e.g. '8-12' or '5')" },
            restSeconds: { type: Type.INTEGER, description: 'Rest time in seconds between sets' },
            progression: {
              type: Type.STRING,
              description: 'Short tip on progression or form for this exercise',
            },
          },
          required: ['exerciseId', 'sets', 'reps', 'restSeconds'],
        },
      },
    },
    required: ['exercises'],
  },
  food: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      calories: { type: Type.INTEGER },
      protein: { type: Type.INTEGER },
      carbs: { type: Type.INTEGER },
      fat: { type: Type.INTEGER },
      mealType: { type: Type.STRING },
    },
    required: ['name', 'calories', 'protein', 'carbs', 'fat', 'mealType'],
  },
} as const;

type JsonConfig = Extract<GenerateContentParameters['config'], { responseMimeType?: string }>;

function jsonConfig(schema: unknown, systemInstruction: string): JsonConfig {
  return {
    systemInstruction,
    responseMimeType: 'application/json',
    responseSchema: schema as never,
  };
}

export async function parseNutrition(text: string, mealTypeHint?: string) {
  if (!ai) throw new Error('AI_DISABLED');
  const systemPrompt = `You are an expert nutritionist. The user describes what they ate in natural language.
Your job is to analyze the text, identify the food item(s), and estimate their nutritional value (Calories, Protein, Carbs, Fat) as accurately as possible.
If the text is in another language, keep the food name in that language.
If the meal type is not clear, use the hint: ${mealTypeHint || 'any'}. It must be one of: "breakfast", "lunch", "dinner", "snack".`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: text,
    config: jsonConfig(SCHEMAS.food, systemPrompt),
  });
  return JSON.parse(assertText(res.text));
}

export async function scanMeal(image: string, mimeType: string, mealTypeHint?: string) {
  if (!ai) throw new Error('AI_DISABLED');
  const systemPrompt = `You are an expert nutritionist. You are provided with an image of a meal.
Identify all food items, estimate portions, and calculate total nutritional value.
If you can't identify the meal precisely, give your best estimate.
The recommended meal type hint is: ${mealTypeHint || 'snack'}.`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType, data: image } },
        { text: 'Analyze this meal for calories and macros.' },
      ],
    },
    config: jsonConfig(SCHEMAS.food, systemPrompt),
  });
  return JSON.parse(assertText(res.text));
}

interface WorkoutState {
  age?: unknown;
  gender?: unknown;
  fitnessLevel?: unknown;
  goal?: unknown;
  equipment?: unknown;
  selectedMuscles?: unknown;
}

interface MinimalExercise {
  id: string;
  name: string;
  target: string;
  equipment: string;
}

function sanitizeState(state: WorkoutState) {
  return {
    age: String(state.age ?? '').substring(0, 10),
    gender: String(state.gender ?? '').substring(0, 10),
    fitnessLevel: String(state.fitnessLevel ?? '').substring(0, 20),
    goal: String(state.goal ?? '').substring(0, 30),
    equipment: Array.isArray(state.equipment)
      ? state.equipment.slice(0, 20).map((e) => String(e).substring(0, 30))
      : [],
    selectedMuscles: Array.isArray(state.selectedMuscles)
      ? state.selectedMuscles.slice(0, 20).map((e) => String(e).substring(0, 30))
      : [],
  };
}

function exerciseList(exercises: MinimalExercise[]) {
  return exercises
    .slice(0, 300)
    .map((e) => `${e.id}: ${e.name} - ${e.target} - ${e.equipment}`)
    .join('\n');
}

export async function generateWorkout(opts: {
  prompt: string;
  state: WorkoutState;
  minimalExercises: MinimalExercise[];
}) {
  if (!ai) throw new Error('AI_DISABLED');
  const s = sanitizeState(opts.state);
  const systemPrompt = `You are an expert fitness coach. Generate a workout plan based on the user's request.
The user profile is: ${s.age}yo ${s.gender}, level: ${s.fitnessLevel}, goal: ${s.goal}.
Equipment available: ${s.equipment.join(', ')}.
Target muscles: ${s.selectedMuscles.join(', ')}.

IMPORTANT: You must ONLY output JSON.
The 'exerciseId' MUST exactly match an 'id' from the list below. Do not invent exercises.

List of available exercises (ID: Name - Target - Equipment):
${exerciseList(opts.minimalExercises)}
`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: opts.prompt,
    config: jsonConfig(SCHEMAS.workout, systemPrompt),
  });
  return parseWorkoutResponse(assertText(res.text));
}

export async function refineWorkout(opts: {
  instruction: string;
  state: WorkoutState;
  minimalExercises: MinimalExercise[];
  currentRoutineText: string;
}) {
  if (!ai) throw new Error('AI_DISABLED');
  const s = sanitizeState(opts.state);
  const systemPrompt = `You are an expert fitness coach refining a workout plan.
The user profile is: ${s.age}yo ${s.gender}, level: ${s.fitnessLevel}, goal: ${s.goal}.

Current Workout Plan:
${String(opts.currentRoutineText ?? '').substring(0, 5000)}

User's Modification Request:
"${opts.instruction}"

IMPORTANT: ONLY output JSON. The 'exerciseId' MUST match an 'id' from the list.

List of available exercises:
${exerciseList(opts.minimalExercises)}
`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: opts.instruction,
    config: jsonConfig(SCHEMAS.workout, systemPrompt),
  });
  return parseWorkoutResponse(assertText(res.text));
}

export async function supportChat(message: string, history?: { role?: string; text?: string }[]) {
  if (!ai) throw new Error('AI_DISABLED');
  const systemPrompt = `You are "Pulse Assistant", an elite AI Gym Coach and Support Specialist for Pulse Gym Log Tracker.
1. Provide accurate, motivating, science-backed fitness advice.
2. Assist users with technical support for the app.
3. Be friendly and professional.
4. If the user reports a bug, apologize, give workaround tips, and reassure them the team is on it.`;

  const contents: Array<{ role: string; parts: [{ text: string }] }> = [];
  for (const h of (history ?? []).slice(-10)) {
    if (!h.text || typeof h.text !== 'string') continue;
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.text).substring(0, 1000) }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: systemPrompt },
  });
  return { reply: assertText(res.text) };
}

function parseWorkoutResponse(text: string) {
  const parsed = JSON.parse(text);
  if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
    throw new Error('Invalid format from AI');
  }
  return parsed;
}

function assertText(text: string | undefined): string {
  if (!text) throw new Error('No response text from AI');
  return text;
}
