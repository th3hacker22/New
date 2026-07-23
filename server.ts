import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());


const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

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

app.post("/api/parse-nutrition", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { text, mealTypeHint } = req.body;

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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/scan-meal", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { image, mimeType, mealTypeHint } = req.body;

    const systemPrompt = `You are an expert nutritionist. You are provided with an image of a meal.
Your job is to analyze the image, identify all food items present, estimate their portions/quantities, and calculate their total nutritional value (Calories, Protein, Carbs, Fat) as accurately as possible.
Output the data in JSON format.
If you can't identify the meal precisely, give your best estimate based on typical ingredients.
The recommended meal type hint is: ${mealTypeHint || "snack"}.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image, // base64 string
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-workout", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { prompt, state, minimalExercises } = req.body;

    const systemPrompt = `You are an expert fitness coach. Your task is to generate a workout plan based on user requests.
The user profile is: ${state.age}yo ${state.gender}, level: ${state.fitnessLevel}, goal: ${state.goal}.
Equipment available: ${state.equipment.join(", ")}.
Target muscles: ${state.selectedMuscles.join(", ")}.

IMPORTANT: You must ONLY output JSON.
IMPORTANT: The 'exerciseId' field in the JSON MUST exactly match the 'id' field from one of the exercises in the list below.
Do not invent any exercises that are not in this list.

List of available exercises (ID: Name - Target - Equipment):
${minimalExercises.map((e: any) => `${e.id}: ${e.name} - ${e.target} - ${e.equipment}`).join("\n")}
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/refine-workout", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { instruction, state, minimalExercises, currentRoutineText } = req.body;

    const systemPrompt = `You are an expert fitness coach refining an existing workout plan.
The user profile is: ${state.age}yo ${state.gender}, level: ${state.fitnessLevel}, goal: ${state.goal}.

Current Workout Plan:
${currentRoutineText}

User's Modification Request:
"${instruction}"

IMPORTANT: You must ONLY output JSON.
IMPORTANT: Modify the workout according to the request. The 'exerciseId' field in the JSON MUST exactly match the 'id' field from one of the exercises in the list below. Do not invent exercises.

List of available exercises:
${minimalExercises.map((e: any) => `${e.id}: ${e.name} - ${e.target} - ${e.equipment}`).join("\n")}
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
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/support-chat", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI is not enabled on the server." });
  }

  try {
    const { message, history } = req.body;

    const systemPrompt = `You are "Pulse Assistant", an elite AI Gym Coach and Support Specialist for Pulse Gym Log Tracker.
Your goals:
1. Provide extremely accurate, motivating, and science-backed fitness advice (hypertrophy, strength, nutrition, stretching, form).
2. Assist users with technical support for Pulse App (workout logging, stats, body metrics, goals, bar calculators).
3. Be friendly, humble, and speak with high professional composure. Use bullet points or code snippets when helpful.
4. If the user reports a bug, apologize warmly, give them immediate workaround tips, and reassure them the development team is on it!`;

    // format history into Gemini Content format if available
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
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
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
