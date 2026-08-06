export interface PresetFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

/** Common quick-add foods used on the nutrition dashboard. */
export const PRESET_FOODS: PresetFood[] = [
  { name: 'Boiled Eggs (2)', calories: 140, protein: 12, carbs: 1, fat: 10, mealType: 'breakfast' },
  {
    name: 'Grilled Chicken Breast (150g)',
    calories: 247,
    protein: 46,
    carbs: 0,
    fat: 4,
    mealType: 'lunch',
  },
  {
    name: 'Oatmeal with Honey',
    calories: 320,
    protein: 11,
    carbs: 54,
    fat: 6,
    mealType: 'breakfast',
  },
  { name: 'Sweet Banana', calories: 105, protein: 1, carbs: 27, fat: 0, mealType: 'snack' },
  {
    name: 'Basmati Rice cooked (150g)',
    calories: 200,
    protein: 4,
    carbs: 44,
    fat: 0,
    mealType: 'lunch',
  },
  { name: 'Protein Whey Shake', calories: 130, protein: 25, carbs: 2, fat: 2, mealType: 'snack' },
  { name: 'Dates (3 pieces)', calories: 80, protein: 1, carbs: 21, fat: 0, mealType: 'snack' },
  {
    name: 'Healthy Beef Tagine',
    calories: 450,
    protein: 32,
    carbs: 24,
    fat: 22,
    mealType: 'dinner',
  },
];

export const ProteinMicroSvg = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 text-primary shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
    <path d="M12 8v8M8 12h8" stroke="#ccff00" />
  </svg>
);

export const CarbsMicroSvg = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 text-secondary shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18M12 9L8 6M12 11L16 8M12 15L8 12M12 17L16 14" stroke="#00ffff" />
  </svg>
);

export const FatMicroSvg = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 text-warning shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" strokeOpacity="0.2" />
    <path
      d="M12 7c-2.76 0-5 2.24-5 5s5 5 5 5 5-2.24 5-5-2.24-5-5-5z"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);
