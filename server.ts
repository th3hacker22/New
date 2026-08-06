import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Security Headers (Helmet-like) ──
function securityHeaders(_req: any, res: any, next: any) {
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS only in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
}

// ── CORS ──
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function corsMiddleware(req: any, res: any, next: any) {
  const origin = req.headers.origin as string | undefined;
  // Allow no-origin (mobile apps, curl) or allowed list, and in dev allow all
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev || !origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes("*")) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
}

// ── In-Memory Rate Limiter ──
type RateLimitEntry = { count: number; resetTime: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

function createRateLimiter(opts: { windowMs: number; max: number; keyPrefix: string; message?: string }) {
  return (req: any, res: any, next: any) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
    const key = `${opts.keyPrefix}:${ip}:${req.path}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + opts.windowMs };
    }
    entry.count += 1;
    rateLimitStore.set(key, entry);

    const remaining = Math.max(0, opts.max - entry.count);
    res.setHeader("X-RateLimit-Limit", String(opts.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetTime / 1000)));

    if (entry.count > opts.max) {
      return res.status(429).json({
        error: opts.message || "Too many requests, please try again later.",
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }
    next();
  };
}

// Clean up old entries periodically (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

// ── Body Parser Limits ──
// Default 100kb for most APIs, 5mb for image scan
const jsonParserSmall = express.json({ limit: "100kb" });
const jsonParserMedium = express.json({ limit: "1mb" });
const jsonParserLarge = express.json({ limit: "5mb" });

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());

// Global rate limit: 120 req / min per IP
app.use(createRateLimiter({ windowMs: 60 * 1000, max: 120, keyPrefix: "global", message: "Too many requests globally, slow down." }));

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// ── Schemas ──
const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    exercises: {
      type: Type.ARRAY,
      description: "List of exercises in the workout plan",
      items: {
        type: Type.OBJECT,
        properties: {
          exerciseId: {
            type: Type.STRING,
            description: "ID of the exercise. MUST exactly match one from the provided list.",
          },
          sets: { type: Type.INTEGER, description: "Number of sets" },
          reps: {
            type: Type.STRING,
            description: "Number of reps (e.g. '8-12' or '5')",
          },
          restSeconds: {
            type: Type.INTEGER,
            description: "Rest time in seconds between sets",
          },
          progression: {
            type: Type.STRING,
            description: "Short tip on progression or form for this exercise",
          },
        },
        required: ["exerciseId", "sets", "reps", "restSeconds"],
      },
    },
  },
  required: ["exercises"],
};

const foodSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the food item parsed cleanly (e.g. 'Scrambled Eggs' or 'بيض مسلوق')" },
    calories: { type: Type.INTEGER, description: "Total calories estimate" },
    protein: { type: Type.INTEGER, description: "Protein content in grams" },
    carbs: { type: Type.INTEGER, description: "Carbohydrates content in grams" },
    fat: { type: Type.INTEGER, description: "Fat content in grams" },
    mealType: { type: Type.STRING, description: "Recommended meal type: breakfast, lunch, dinner, or snack" }
  },
  required: ["name", "calories", "protein", "carbs", "fat", "mealType"]
};

// ── Validation Helpers ──
function validateTextInput(text: unknown, maxLen = 500): string | null {
  if (typeof text !== "string") return "text must be string";
  if (text.trim().length === 0) return "text is required";
  if (text.length > maxLen) return `text exceeds max length ${maxLen}`;
  return null;
}

function validateMinimalExercises(list: unknown): string | null {
  if (!Array.isArray(list)) return "minimalExercises must be array";
  if (list.length === 0) return "minimalExercises empty";
  if (list.length > 500) return "minimalExercises too large";
  return null;
}

// Strict rate limits for AI endpoints (expensive)
const aiRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 15, keyPrefix: "ai", message: "AI rate limit: max 15 requests per minute." });
const aiChatLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, keyPrefix: "ai-chat", message: "Chat rate limit: max 20 per minute." });
const scanLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10, keyPrefix: "scan", message: "Meal scan limit: max 10 per minute." });

app.post("/api/parse-nutrition", jsonParserSmall, aiRateLimiter, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { text, mealTypeHint } = req.body;

    const textErr = validateTextInput(text, 1000);
    if (textErr) return res.status(400).json({ error: textErr });

    if (mealTypeHint && !["breakfast","lunch","dinner","snack"].includes(mealTypeHint)) {
      return res.status(400).json({ error: "Invalid mealTypeHint" });
    }

    const systemPrompt = `You are an expert nutritionist. The user describes what they ate in natural language.
Your job is to analyze the text, identify the food item(s), and estimate their nutritional value (Calories, Protein, Carbs, Fat) as accurately as possible.
If the text is in another language (like Arabic, French, etc.), translate or keep the food name in that same language so it is friendly to the user, and perform the calculations.
If the meal type is not clear, use the hint provided: ${mealTypeHint || "any"}. It must be one of: "breakfast", "lunch", "dinner", "snack".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: foodSchema,
      },
    });

    const outputText = response.text;
    if (!outputText) throw new Error("No response text from Gemini");

    const parsed = JSON.parse(outputText);
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Nutrition Parsing failed:", error);
    res.status(500).json({ error: error.message?.substring(0, 500) || "Internal error" });
  }
});

app.post("/api/scan-meal", jsonParserLarge, scanLimiter, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { image, mimeType, mealTypeHint } = req.body;

    if (typeof image !== "string" || image.length === 0) {
      return res.status(400).json({ error: "image base64 required" });
    }
    if (image.length > 4 * 1024 * 1024) { // ~3MB binary -> 4MB base64
      return res.status(413).json({ error: "Image too large, max 3MB" });
    }

    if (mimeType && !["image/jpeg","image/png","image/webp","image/jpg"].includes(mimeType)) {
      return res.status(400).json({ error: "Unsupported mimeType" });
    }

    const systemPrompt = `You are an expert nutritionist. You are provided with an image of a meal.
Your job is to analyze the image, identify all food items present, estimate their portions/quantities, and calculate their total nutritional value (Calories, Protein, Carbs, Fat) as accurately as possible.
Output the data in JSON format.
If you can't identify the meal precisely, give your best estimate based on typical ingredients.
The recommended meal type hint is: ${mealTypeHint || "snack"}.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: "Analyze this meal for calories and macros." }] },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: foodSchema,
      },
    });

    const outputText = response.text;
    if (!outputText) throw new Error("No response text from Gemini");

    const parsed = JSON.parse(outputText);
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Meal Scanning failed:", error);
    res.status(500).json({ error: error.message?.substring(0, 500) || "Internal error" });
  }
});

app.post("/api/generate-workout", jsonParserMedium, aiRateLimiter, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { prompt, state, minimalExercises } = req.body;

    const promptErr = validateTextInput(prompt, 2000);
    if (promptErr) return res.status(400).json({ error: promptErr });
    const exErr = validateMinimalExercises(minimalExercises);
    if (exErr) return res.status(400).json({ error: exErr });

    if (!state || typeof state !== "object") {
      return res.status(400).json({ error: "state required" });
    }

    // Sanitize state to avoid prompt injection bloat
    const safeState = {
      age: String(state.age || "").substring(0, 10),
      gender: String(state.gender || "").substring(0, 10),
      fitnessLevel: String(state.fitnessLevel || "").substring(0, 20),
      goal: String(state.goal || "").substring(0, 30),
      equipment: Array.isArray(state.equipment) ? state.equipment.slice(0,20).map((e:any)=>String(e).substring(0,30)) : [],
      selectedMuscles: Array.isArray(state.selectedMuscles) ? state.selectedMuscles.slice(0,20).map((e:any)=>String(e).substring(0,30)) : [],
    };

    const safeExercises = (minimalExercises as any[]).slice(0, 300);

    const systemPrompt = `You are an expert fitness coach. Your task is to generate a workout plan based on user requests.
The user profile is: ${safeState.age}yo ${safeState.gender}, level: ${safeState.fitnessLevel}, goal: ${safeState.goal}.
Equipment available: ${safeState.equipment.join(", ")}.
Target muscles: ${safeState.selectedMuscles.join(", ")}.

IMPORTANT: You must ONLY output JSON.
IMPORTANT: The 'exerciseId' field in the JSON MUST exactly match the 'id' field from one of the exercises in the list below.
Do not invent any exercises that are not in this list.

List of available exercises (ID: Name - Target - Equipment):
${safeExercises.map((e: any) => `${e.id}: ${e.name} - ${e.target} - ${e.equipment}`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");

    const parsed = JSON.parse(text);
    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      throw new Error("Invalid format from Gemini");
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("AI Workout Generation failed:", error);
    res.status(500).json({ error: error.message?.substring(0, 500) || "Internal error" });
  }
});

app.post("/api/refine-workout", jsonParserMedium, aiRateLimiter, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { instruction, state, minimalExercises, currentRoutineText } = req.body;

    const instrErr = validateTextInput(instruction, 2000);
    if (instrErr) return res.status(400).json({ error: instrErr });
    const exErr = validateMinimalExercises(minimalExercises);
    if (exErr) return res.status(400).json({ error: exErr });

    const safeState = {
      age: String(state?.age || "").substring(0, 10),
      gender: String(state?.gender || "").substring(0, 10),
      fitnessLevel: String(state?.fitnessLevel || "").substring(0, 20),
      goal: String(state?.goal || "").substring(0, 30),
    };

    const safeExercises = (minimalExercises as any[]).slice(0, 300);
    const safeRoutineText = String(currentRoutineText || "").substring(0, 5000);

    const systemPrompt = `You are an expert fitness coach refining an existing workout plan.
The user profile is: ${safeState.age}yo ${safeState.gender}, level: ${safeState.fitnessLevel}, goal: ${safeState.goal}.

Current Workout Plan:
${safeRoutineText}

User's Modification Request:
"${instruction}"

IMPORTANT: You must ONLY output JSON.
IMPORTANT: Modify the workout according to the request. The 'exerciseId' field in the JSON MUST exactly match the 'id' field from one of the exercises in the list below. Do not invent exercises.

List of available exercises:
${safeExercises.map((e: any) => `${e.id}: ${e.name} - ${e.target} - ${e.equipment}`).join("\n")}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: instruction,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");

    const parsed = JSON.parse(text);
    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      throw new Error("Invalid format from Gemini");
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("AI Workout Refinement failed:", error);
    res.status(500).json({ error: error.message?.substring(0, 500) || "Internal error" });
  }
});

app.post("/api/support-chat", jsonParserMedium, aiChatLimiter, async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { message, history } = req.body;

    const msgErr = validateTextInput(message, 2000);
    if (msgErr) return res.status(400).json({ error: msgErr });

    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: "history must be array" });
    }
    if (Array.isArray(history) && history.length > 20) {
      return res.status(400).json({ error: "history too long, max 20" });
    }

    const systemPrompt = `You are "Pulse Assistant", an elite AI Gym Coach and Support Specialist for Pulse Gym Log Tracker.
Your goals:
1. Provide extremely accurate, motivating, and science-backed fitness advice (hypertrophy, strength, nutrition, stretching, form).
2. Assist users with technical support for Pulse App (workout logging, stats, body metrics, goals, bar calculators).
3. Be friendly, humble, and speak with high professional composure. Use bullet points or code snippets when helpful.
4. If the user reports a bug, apologize warmly, give them immediate workaround tips, and reassure them the development team is on it!`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        if (!h.text || typeof h.text !== "string") continue;
        // Sanitize each history entry to 1000 chars
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: String(h.text).substring(0, 1000) }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Support Chat failed:", error);
    res.status(500).json({ error: error.message?.substring(0, 500) || "Internal error" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", geminiEnabled: !!ai, timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Vite middlewares after API routes
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Don't intercept API
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler for payload too large
  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err?.type === "entity.too.large") {
      return res.status(413).json({ error: "Payload too large" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} | Gemini: ${ai ? "enabled" : "disabled"} | AllowedOrigins: ${ALLOWED_ORIGINS.join(",")}`);
  });
}

startServer();
