import { translateExerciseNameToEgyptian } from "../utils/egyptianGymDictionary";
// ── Exercise Types from hasaneyldrm/exercises-dataset ──

export interface ExerciseRaw {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: {
    en: string;
    tr: string;
  };
  instruction_steps?: {
    en: string[];
    tr: string[];
  };
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  image: string;
  gif_url: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  category: string;
  categoryEn?: string;
  categoryAr?: string;
  bodyPart: string;
  bodyPartEn?: string;
  bodyPartAr?: string;
  equipment: string;
  equipmentEn?: string;
  equipmentAr?: string;
  instructions: string;
  instructionSteps: string[];
  muscleGroup: string;
  muscleGroupEn?: string;
  muscleGroupAr?: string;
  secondaryMuscles: string[];
  secondaryMusclesEn?: string[];
  secondaryMusclesAr?: string[];
  target: string;
  targetEn: string;
  targetAr?: string;
  imageUrl: string;
  gifUrl: string;
}

// ── Base URL for media ──
export const MEDIA_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

// ── Transform raw exercise to our format ──
export function transformExercise(raw: ExerciseRaw): Exercise {
  // Translate to Egyptian Arabic
  const arName = translateExerciseNameToEgyptian(raw.name);
  const arBodyPart = translateExerciseNameToEgyptian(raw.body_part);
  const arEquipment = translateExerciseNameToEgyptian(raw.equipment);
  const arTarget = translateExerciseNameToEgyptian(raw.target);
  const arCategory = translateExerciseNameToEgyptian(raw.category);
  const arMuscleGroup = translateExerciseNameToEgyptian(raw.muscle_group);
  const arSecondary = raw.secondary_muscles.map(translateExerciseNameToEgyptian);

  return {
    id: raw.id,
    name: raw.name,
    nameEn: raw.name,
    nameAr: arName,
    category: raw.category,
    categoryEn: raw.category,
    categoryAr: arCategory,
    bodyPart: raw.body_part,
    bodyPartEn: raw.body_part,
    bodyPartAr: arBodyPart,
    equipment: raw.equipment,
    equipmentEn: raw.equipment,
    equipmentAr: arEquipment,
    instructions: raw.instructions.en,
    instructionSteps: raw.instruction_steps?.en || [raw.instructions.en],
    muscleGroup: raw.muscle_group,
    muscleGroupEn: raw.muscle_group,
    muscleGroupAr: arMuscleGroup,
    secondaryMuscles: raw.secondary_muscles,
    secondaryMusclesEn: raw.secondary_muscles,
    secondaryMusclesAr: arSecondary,
    target: raw.target,
    targetEn: raw.target,
    targetAr: arTarget,
    imageUrl: `${MEDIA_BASE_URL}/${raw.image}`,
    gifUrl: `${MEDIA_BASE_URL}/${raw.gif_url}`,
  };
}

export function getExerciseName(ex: Exercise | undefined | null, isAr: boolean): string {
  if (!ex) return "";
  if (isAr) {
    return ex.nameAr || (ex.name ? translateExerciseNameToEgyptian(ex.name) : "");
  }
  return ex.nameEn || ex.name || "";
}

export function getExerciseBodyPart(ex: Exercise | undefined | null, isAr: boolean): string {
  if (!ex) return "";
  if (isAr) {
    return ex.bodyPartAr || (ex.bodyPart ? translateExerciseNameToEgyptian(ex.bodyPart) : "");
  }
  return ex.bodyPartEn || ex.bodyPart || "";
}

export function getExerciseEquipment(ex: Exercise | undefined | null, isAr: boolean): string {
  if (!ex) return "";
  if (isAr) {
    return ex.equipmentAr || (ex.equipment ? translateExerciseNameToEgyptian(ex.equipment) : "");
  }
  return ex.equipmentEn || ex.equipment || "";
}

export function getExerciseTarget(ex: Exercise | undefined | null, isAr: boolean): string {
  if (!ex) return "";
  if (isAr) {
    return ex.targetAr || (ex.target ? translateExerciseNameToEgyptian(ex.target) : "");
  }
  return ex.targetEn || ex.target || "";
}
