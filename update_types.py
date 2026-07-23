import re

with open('src/types/exercise.ts', 'r') as f:
    content = f.read()

# Add import
import_stmt = 'import { translateExerciseNameToEgyptian } from "../utils/egyptianGymDictionary";\n'
content = import_stmt + content

# Modify transformExercise
old_transform = """export function transformExercise(raw: ExerciseRaw): Exercise {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    bodyPart: raw.body_part,
    equipment: raw.equipment,
    instructions: raw.instructions.en,
    instructionSteps: raw.instruction_steps?.en || [raw.instructions.en],
    muscleGroup: raw.muscle_group,
    secondaryMuscles: raw.secondary_muscles,
    target: raw.target,
    imageUrl: `${MEDIA_BASE_URL}/${raw.image}`,
    gifUrl: `${MEDIA_BASE_URL}/${raw.gif_url}`,
  };
}"""

new_transform = """export function transformExercise(raw: ExerciseRaw): Exercise {
  // Translate to Egyptian Arabic
  const arName = translateExerciseNameToEgyptian(raw.name);
  const arBodyPart = translateExerciseNameToEgyptian(raw.body_part);
  const arEquipment = translateExerciseNameToEgyptian(raw.equipment);
  const arTarget = translateExerciseNameToEgyptian(raw.target);
  const arCategory = translateExerciseNameToEgyptian(raw.category);
  const arMuscleGroup = translateExerciseNameToEgyptian(raw.muscle_group);

  return {
    id: raw.id,
    name: arName,
    category: arCategory,
    bodyPart: arBodyPart,
    equipment: arEquipment,
    instructions: raw.instructions.en,
    instructionSteps: raw.instruction_steps?.en || [raw.instructions.en],
    muscleGroup: arMuscleGroup,
    secondaryMuscles: raw.secondary_muscles.map(translateExerciseNameToEgyptian),
    target: arTarget,
    imageUrl: `${MEDIA_BASE_URL}/${raw.image}`,
    gifUrl: `${MEDIA_BASE_URL}/${raw.gif_url}`,
  };
}"""

content = content.replace(old_transform, new_transform)

with open('src/types/exercise.ts', 'w') as f:
    f.write(content)
print("Updated src/types/exercise.ts")
