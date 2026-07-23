import { db, getWorkoutStreak } from "@/db";

export interface ChallengeDef {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  category: "weekly" | "monthly" | "special";
  targetValue: number;
  unitEn: string;
  unitAr: string;
  xpReward: number;
  iconName: string;
  checkProgress: () => Promise<{ current: number; target: number; completed: boolean }>;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: "weekly_3_workouts",
    titleEn: "Weekly Warrior",
    titleAr: "محارب الأسبوع ⚔️",
    descEn: "Complete 3 workouts this week.",
    descAr: "أكمل ٣ تمارين خلال هذا الأسبوع.",
    category: "weekly",
    targetValue: 3,
    unitEn: "workouts",
    unitAr: "تمارين",
    xpReward: 300,
    iconName: "Swords",
    checkProgress: async () => {
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .toArray();
      const thisWeek = sessions.filter((s) => new Date(s.date) >= firstDayOfWeek);
      const current = thisWeek.length;
      return { current, target: 3, completed: current >= 3 };
    },
  },
  {
    id: "weekly_15k_volume",
    titleEn: "Volume Surge",
    titleAr: "هجوم الأحمال 🏋️‍♂️",
    descEn: "Lift 15,000 kg total volume this week.",
    descAr: "ارفع مجموع أوزان ١٥,٠٠٠ كجم هذا الأسبوع.",
    category: "weekly",
    targetValue: 15000,
    unitEn: "kg",
    unitAr: "كجم",
    xpReward: 400,
    iconName: "Zap",
    checkProgress: async () => {
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .toArray();
      const thisWeek = sessions.filter((s) => new Date(s.date) >= firstDayOfWeek);
      const current = thisWeek.reduce((acc, s) => {
        return (
          acc +
          s.exercises.reduce((eAcc, ex) => {
            return (
              eAcc +
              ex.sets
                .filter((set) => set.completed)
                .reduce((sAcc, set) => sAcc + set.weight * set.reps, 0)
            );
          }, 0)
        );
      }, 0);
      return { current, target: 15000, completed: current >= 15000 };
    },
  },
  {
    id: "weekly_50_sets",
    titleEn: "Set Crusher",
    titleAr: "ماكينة الجولات 🎯",
    descEn: "Complete 50 sets this week.",
    descAr: "أكمل ٥٠ جولة تمرين هذا الأسبوع.",
    category: "weekly",
    targetValue: 50,
    unitEn: "sets",
    unitAr: "جولات",
    xpReward: 350,
    iconName: "Target",
    checkProgress: async () => {
      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .toArray();
      const thisWeek = sessions.filter((s) => new Date(s.date) >= firstDayOfWeek);
      let setTokens = 0;
      thisWeek.forEach((s) => {
        s.exercises.forEach((ex) => {
          setTokens += ex.sets.filter((set) => set.completed).length;
        });
      });
      return { current: setTokens, target: 50, completed: setTokens >= 50 };
    },
  },
  {
    id: "monthly_12_workouts",
    titleEn: "Monthly Titan",
    titleAr: "عملاق الشهر 👑",
    descEn: "Complete 12 workouts in a single month.",
    descAr: "أكمل ١٢ تمرينة خلال الشهر الحالي.",
    category: "monthly",
    targetValue: 12,
    unitEn: "workouts",
    unitAr: "تمارين",
    xpReward: 1000,
    iconName: "Crown",
    checkProgress: async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .toArray();
      const thisMonth = sessions.filter((s) => new Date(s.date) >= firstDayOfMonth);
      const current = thisMonth.length;
      return { current, target: 12, completed: current >= 12 };
    },
  },
  {
    id: "monthly_100k_volume",
    titleEn: "100 Ton Monthly Beast",
    titleAr: "وحش الـ ١٠٠ طن الشهري 💥",
    descEn: "Accumulate 100,000 kg volume this month.",
    descAr: "حقق مجموع أوزان ١٠٠,٠٠٠ كجم خلال الشهر.",
    category: "monthly",
    targetValue: 100000,
    unitEn: "kg",
    unitAr: "كجم",
    xpReward: 1500,
    iconName: "Flame",
    checkProgress: async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const sessions = await db.workoutSessions
        .where("completed")
        .equals(1)
        .toArray();
      const thisMonth = sessions.filter((s) => new Date(s.date) >= firstDayOfMonth);
      const current = thisMonth.reduce((acc, s) => {
        return (
          acc +
          s.exercises.reduce((eAcc, ex) => {
            return (
              eAcc +
              ex.sets
                .filter((set) => set.completed)
                .reduce((sAcc, set) => sAcc + set.weight * set.reps, 0)
            );
          }, 0)
        );
      }, 0);
      return { current, target: 100000, completed: current >= 100000 };
    },
  },
  {
    id: "streak_7_challenge",
    titleEn: "7-Day Streak Quest",
    titleAr: "تحدي الـ ٧ أيام استمرارية 🔥",
    descEn: "Maintain a 7-day workout streak.",
    descAr: "حافظ على ستريك تمرين لمدة ٧ أيام متواصلة.",
    category: "special",
    targetValue: 7,
    unitEn: "days",
    unitAr: "أيام",
    xpReward: 800,
    iconName: "Flame",
    checkProgress: async () => {
      const streak = await getWorkoutStreak();
      return { current: streak, target: 7, completed: streak >= 7 };
    },
  },
];
