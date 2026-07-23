import { type Exercise } from "@/types/exercise";
import { type WorkoutRoutine, generateWorkout } from "./workoutGenerator";

export const isAiEnabled = true;

export async function generateWorkoutAI(
  prompt: string,
  state: {
    gender: "male" | "female" | null;
    age: number;
    goal: "Strength" | "Hypertrophy" | "Weight Loss" | null;
    fitnessLevel: "Novice" | "Beginner" | "Advanced" | null;
    equipment: string[];
    selectedMuscles: string[];
  },
  availableExercises: Exercise[],
): Promise<WorkoutRoutine> {
  try {
    const minimalExercises = availableExercises.map((e) => ({
      id: e.id,
      name: e.name,
      target: e.target,
      equipment: e.equipment,
    }));

    const body = {
      prompt,
      state,
      minimalExercises,
    };

    const response = await fetch("/api/generate-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Server returned error: ${response.statusText}`);
    }

    const parsed = await response.json();

    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      throw new Error("Invalid format from Server");
    }

    // Map AI response IDs back to real Exercise objects
    const resolvedExercises = [];
    for (const aiEx of parsed.exercises) {
      const realEx = availableExercises.find((e) => e.id === aiEx.exerciseId);
      if (realEx) {
        resolvedExercises.push({
          exercise: realEx,
          sets: aiEx.sets || 3,
          reps: aiEx.reps || "8-12",
          restSeconds: aiEx.restSeconds || 90,
          progression: aiEx.progression || "Focus on form and slow negative.",
        });
      }
    }

    if (resolvedExercises.length === 0) {
      throw new Error("No valid exercises matched from AI response.");
    }

    return { exercises: resolvedExercises };
  } catch (error) {
    console.error(
      "AI Workout Generation failed. Falling back to algorithmic generator. Error:",
      error,
    );
    return generateWorkout(availableExercises, state);
  }
}

export async function refineWorkoutAI(
  currentRoutine: WorkoutRoutine,
  instruction: string,
  availableExercises: Exercise[],
  state: {
    gender: "male" | "female" | null;
    age: number;
    goal: "Strength" | "Hypertrophy" | "Weight Loss" | null;
    fitnessLevel: "Novice" | "Beginner" | "Advanced" | null;
    equipment: string[];
    selectedMuscles: string[];
  },
): Promise<WorkoutRoutine> {
  try {
    const minimalExercises = availableExercises.map((e) => ({
      id: e.id,
      name: e.name,
      target: e.target,
      equipment: e.equipment,
    }));

    const currentRoutineText = currentRoutine.exercises
      .map(
        (e) =>
          `- ${e.exercise.name} (ID: ${e.exercise.id}), ${e.sets} sets x ${e.reps} reps`,
      )
      .join("\n");

    const body = {
      instruction,
      state,
      minimalExercises,
      currentRoutineText,
    };

    const response = await fetch("/api/refine-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Server returned error: ${response.statusText}`);
    }

    const parsed = await response.json();

    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      throw new Error("Invalid format from Server");
    }

    const resolvedExercises = [];
    for (const aiEx of parsed.exercises) {
      const realEx = availableExercises.find((e) => e.id === aiEx.exerciseId);
      if (realEx) {
        resolvedExercises.push({
          exercise: realEx,
          sets: aiEx.sets || 3,
          reps: aiEx.reps || "8-12",
          restSeconds: aiEx.restSeconds || 90,
          progression: aiEx.progression || "Focus on form.",
        });
      }
    }

    if (resolvedExercises.length === 0) {
      throw new Error("No valid exercises matched from AI response.");
    }

    return { exercises: resolvedExercises };
  } catch (error) {
    console.error("AI Workout Refinement failed:", error);
    throw error;
  }
}
