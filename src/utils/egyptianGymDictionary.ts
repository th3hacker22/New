export const egyptianGymDictionary: Record<string, string> = {
  // Body parts & Targets
  "Chest": "بنش",
  "Back": "ظهر",
  "Legs": "رجل",
  "Shoulders": "كتف",
  "Arms": "دراع",
  "Core": "بطن",
  "Biceps": "باي",
  "Triceps": "تراي",
  "Forearm": "ساعد",
  "Calves": "سمانة",
  "Abs": "بطن",
  "Glutes": "جلوتس (خلفيات)",
  "Traps": "ترابيس",
  "Lats": "مجانص",

  // Exercises & Equipment
  "Barbell Bench Press": "دفع بنش بالبار",
  "Barbell Squat": "سكوات بالبار",
  "Barbell Deadlift": "ديدليفت",
  "Dumbbell Curl": "تبادل باي بالدمبل",
  "Pull-up": "عقلة",
  "Push-up": "ضغط",
  "Dumbbell Shoulder Press": "تجميع كتف بالدمبل",
  "Lat Pulldown": "سحب عالي",
  "Leg Press": "مكبس رجل",
  "Barbell Row": "تجديف بالبار",
  "Cable Triceps Pushdown": "تراي بالكابل",
  "Dumbbell Lateral Raise": "رفرفة جانبي بالدمبل",
  
  // General Keywords for dynamic translation
  "Barbell": "بار",
  "Dumbbell": "دمبل",
  "Cable": "كابل",
  "Machine": "جهاز",
  "Bench Press": "بنش برس",
  "Incline": "عالي",
  "Decline": "مقلوب",
  "Squat": "سكوات",
  "Deadlift": "ديدليفت",
  "Curl": "كيرل باي",
  "Triceps Extension": "تراي",
  "Push-Up": "ضغط",
  "Pull-Up": "عقلة",
  "Row": "سحب / تجديف",
  "Shoulder Press": "دفع كتف",
  "Lateral Raise": "رفرفة جانبي",
  "Front Raise": "رفرفة أمامي",
  "Chest Fly": "تفتيح بنش",
  "Leg Extension": "رفرفة رجل",
  "Leg Curl": "خلفي رجل",
  "Calf Raise": "سمانة",
  "Sit-Up": "بطن",
  "Crunch": "بطن",
  "Plank": "بلانك",
  "Shrug": "ترابيس",
  "Flat": "فلات",
  "Seated": "قاعد",
  "Standing": "واقف",
  "Overhead": "فوق الراس",
  "Close Grip": "قبضة ضيقة",
  "Wide Grip": "قبضة واسعة",
  "Reverse": "معكوس"
};

// Pre-compiled regexes for performance (js-hoist-regexp)
const DICTIONARY_REGEXES: { regex: RegExp; replacement: string }[] = Object.entries(egyptianGymDictionary).map(
  ([eng, ar]) => ({
    regex: new RegExp(`\\b${eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    replacement: ar,
  })
);

// Cache for translated results (js-cache-function-results)
const translationCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

export function translateExerciseNameToEgyptian(name: string): string {
  if (!name) return "";
  const cached = translationCache.get(name);
  if (cached) return cached;

  let translated = name;
  for (const { regex, replacement } of DICTIONARY_REGEXES) {
    translated = translated.replace(regex, replacement);
  }

  if (translationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = translationCache.keys().next().value;
    if (firstKey) translationCache.delete(firstKey);
  }
  translationCache.set(name, translated);
  return translated;
}
