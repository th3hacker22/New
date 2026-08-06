import { storage } from '@/lib/storage';
import {
  getTotalStats,
  getWorkoutStreak,
  getWeeklyTonnage,
  getPersonalRecords,
  workoutRepository,
  db,
} from '@/db';

export interface AchievementDef {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: 'milestones' | 'streaks' | 'volume' | 'lifestyle' | 'records' | 'social';
  xp: number;
  iconName: string;
  checkCriteria: () => Promise<boolean>;
  getProgress?: () => Promise<number>; // returns 0-100 percentage
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── MILESTONES ──
  {
    id: 'first_workout',
    title: 'First Steps',
    titleAr: 'أول خطوة 🏋️‍♂️',
    description: 'Complete your first workout session.',
    descriptionAr: 'سجلت أول تمرينة في رحلة الفورمة والقوة.',
    category: 'milestones',
    xp: 100,
    iconName: 'Trophy',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 1;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 1) * 100);
    },
  },
  {
    id: '5_workouts',
    title: 'Getting Warm',
    titleAr: 'تسخين وإحماء 💥',
    description: 'Complete 5 workouts total.',
    descriptionAr: 'أنجزت ٥ تمارين وتعودت على أجواء التمرين.',
    category: 'milestones',
    xp: 150,
    iconName: 'Award',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 5;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 5) * 100);
    },
  },
  {
    id: '10_workouts',
    title: 'Consistency Built',
    titleAr: 'بداية الالتزام 🎯',
    description: 'Complete 10 workouts total.',
    descriptionAr: 'أكملت ١٠ تمارين وأصبحت عادة حقيقية.',
    category: 'milestones',
    xp: 200,
    iconName: 'Target',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 10;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 10) * 100);
    },
  },
  {
    id: '25_workouts',
    title: 'Dedicated Athlete',
    titleAr: 'رياضي مخلص 🌟',
    description: 'Complete 25 workouts total.',
    descriptionAr: '٢٥ تمرينة! التزامك ملهم لمن حولك.',
    category: 'milestones',
    xp: 350,
    iconName: 'Star',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 25;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 25) * 100);
    },
  },
  {
    id: '50_workouts',
    title: 'Gym Regular',
    titleAr: 'ابن الجيم الأصلي 🏆',
    description: 'Complete 50 workouts total.',
    descriptionAr: '٥٠ تمرينة، الجيم أصل بيتك الثاني!',
    category: 'milestones',
    xp: 500,
    iconName: 'Crown',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 50;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 50) * 100);
    },
  },
  {
    id: '100_workouts',
    title: 'Centurion',
    titleAr: 'البطل المحترف 👑',
    description: 'Complete 100 workouts total.',
    descriptionAr: 'قفلت ١٠٠ تمرينة، مبروك دخول نادي المائة!',
    category: 'milestones',
    xp: 1000,
    iconName: 'Medal',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 100;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 100) * 100);
    },
  },
  {
    id: '250_workouts',
    title: 'Fitness Titan',
    titleAr: 'عملاق الفتنس ⚔️',
    description: 'Complete 250 workouts total.',
    descriptionAr: '٢٥٠ تمرينة! أسطورة صلبة ومصدر إلهام للجميع.',
    category: 'milestones',
    xp: 2500,
    iconName: 'Swords',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalWorkouts >= 250;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalWorkouts / 250) * 100);
    },
  },

  // ── STREAKS ──
  {
    id: '3_day_streak',
    title: 'Momentum',
    titleAr: 'جامد وعافر 🔥',
    description: 'Reach a 3-day workout streak.',
    descriptionAr: 'سجلت ٣ أيام تمرين ورا بعض بدون انقطاع.',
    category: 'streaks',
    xp: 150,
    iconName: 'Flame',
    checkCriteria: async () => {
      const streak = await getWorkoutStreak();
      return streak >= 3;
    },
    getProgress: async () => {
      const streak = await getWorkoutStreak();
      return Math.min(100, (streak / 3) * 100);
    },
  },
  {
    id: '7_day_streak',
    title: 'Unstoppable',
    titleAr: 'محدش يقدر يوقفك ⚡',
    description: 'Reach a 7-day workout streak.',
    descriptionAr: 'حققت ستريك ٧ أيام متواصلة قوة واستمرار.',
    category: 'streaks',
    xp: 300,
    iconName: 'Flame',
    checkCriteria: async () => {
      const streak = await getWorkoutStreak();
      return streak >= 7;
    },
    getProgress: async () => {
      const streak = await getWorkoutStreak();
      return Math.min(100, (streak / 7) * 100);
    },
  },
  {
    id: '14_day_streak',
    title: 'Iron Discipline',
    titleAr: 'انضباط حديدي 💪',
    description: 'Reach a 14-day workout streak.',
    descriptionAr: '١٤ يوم متواصل! انضباطك يفوق التوقعات.',
    category: 'streaks',
    xp: 600,
    iconName: 'Flame',
    checkCriteria: async () => {
      const streak = await getWorkoutStreak();
      return streak >= 14;
    },
    getProgress: async () => {
      const streak = await getWorkoutStreak();
      return Math.min(100, (streak / 14) * 100);
    },
  },
  {
    id: '30_day_streak',
    title: 'Streak Legend',
    titleAr: 'أسطورة الاستمرارية 👑',
    description: 'Reach a 30-day workout streak.',
    descriptionAr: 'شهر كامل من التمرين اليومي المتواصل!',
    category: 'streaks',
    xp: 1500,
    iconName: 'Flame',
    checkCriteria: async () => {
      const streak = await getWorkoutStreak();
      return streak >= 30;
    },
    getProgress: async () => {
      const streak = await getWorkoutStreak();
      return Math.min(100, (streak / 30) * 100);
    },
  },

  // ── VOLUME & HEAVY LIFTING ──
  {
    id: '1k_tonnage',
    title: '1 Ton Club',
    titleAr: 'نادي الطن الأول 🏋️‍♂️',
    description: 'Lift 1,000 kg total cumulative volume.',
    descriptionAr: 'رفعت أول ١,٠٠٠ كجم مجموع أوزان تمرينك.',
    category: 'volume',
    xp: 100,
    iconName: 'Dumbbell',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalVolume >= 1000;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalVolume / 1000) * 100);
    },
  },
  {
    id: '10k_tonnage',
    title: 'Heavy Lifter',
    titleAr: 'وحش الأوزان 💪',
    description: 'Reach 10,000 kg total volume in a week.',
    descriptionAr: 'شلت ١٠,٠٠٠ كجم توتال في أسبوع واحد.',
    category: 'volume',
    xp: 300,
    iconName: 'Dumbbell',
    checkCriteria: async () => {
      const tonnage = await getWeeklyTonnage(8);
      return tonnage.some((w) => w.tonnage >= 10000);
    },
    getProgress: async () => {
      const tonnage = await getWeeklyTonnage(1);
      const current = tonnage[0]?.tonnage || 0;
      return Math.min(100, (current / 10000) * 100);
    },
  },
  {
    id: '50k_volume',
    title: '50 Ton Destroyer',
    titleAr: 'نادي الـ ٥٠ طن 🚀',
    description: 'Reach 50,000 kg lifetime volume.',
    descriptionAr: 'حققت مجموع أوزان ٥٠,٠٠٠ كجم في تاريخك.',
    category: 'volume',
    xp: 600,
    iconName: 'Zap',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalVolume >= 50000;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalVolume / 50000) * 100);
    },
  },
  {
    id: '100k_volume',
    title: '100 Ton Beast',
    titleAr: 'وحش الـ ١٠٠ طن 💥',
    description: 'Reach 100,000 kg lifetime volume.',
    descriptionAr: 'كسرت حاجز الـ ١٠٠ ألف كجم أوزان مجمعة!',
    category: 'volume',
    xp: 1200,
    iconName: 'Sparkles',
    checkCriteria: async () => {
      const stats = await getTotalStats();
      return stats.totalVolume >= 100000;
    },
    getProgress: async () => {
      const stats = await getTotalStats();
      return Math.min(100, (stats.totalVolume / 100000) * 100);
    },
  },

  // ── LIFESTYLE & SPECIAL TIMES ──
  {
    id: 'night_owl',
    title: 'Night Owl',
    titleAr: 'خفاش الجيم 🦉',
    description: 'Complete a workout between 12 AM and 4 AM.',
    descriptionAr: 'اتمرنت في نص الليل (من ١٢ لـ ٤ الفجر).',
    category: 'lifestyle',
    xp: 200,
    iconName: 'Moon',
    checkCriteria: async () => {
      const sessions = await workoutRepository.completedSessions();
      return sessions.some((s) => {
        const hour = new Date(s.date).getHours();
        return hour >= 0 && hour < 4;
      });
    },
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    titleAr: 'وحش الصبح بدري 🌅',
    description: 'Complete a workout between 4 AM and 8 AM.',
    descriptionAr: 'صحيت وفجرت طاقة من ٤ لـ ٨ الصبح.',
    category: 'lifestyle',
    xp: 200,
    iconName: 'Sun',
    checkCriteria: async () => {
      const sessions = await workoutRepository.completedSessions();
      return sessions.some((s) => {
        const hour = new Date(s.date).getHours();
        return hour >= 4 && hour < 8;
      });
    },
  },
  {
    id: 'marathon_lifter',
    title: 'Marathon Lifter',
    titleAr: 'تمرين ماراتوني ⏱️',
    description: 'Complete a workout lasting over 75 minutes.',
    descriptionAr: 'استمريت في التمرين لأكثر من ٧٥ دقيقة متواصلة.',
    category: 'lifestyle',
    xp: 300,
    iconName: 'Activity',
    checkCriteria: async () => {
      const sessions = await workoutRepository.completedSessions();
      return sessions.some((s) => s.duration >= 4500); // 75 mins in secs
    },
  },

  // ── RECORDS & SETS ──
  {
    id: 'first_pr',
    title: 'Record Breaker',
    titleAr: 'كاسر الأرقام 🏆',
    description: 'Achieve your first Personal Record (PR).',
    descriptionAr: 'سجلت أول رقم قياسي شخصي جديد.',
    category: 'records',
    xp: 250,
    iconName: 'TrendingUp',
    checkCriteria: async () => {
      const prs = await getPersonalRecords();
      return prs.length >= 1;
    },
    getProgress: async () => {
      const prs = await getPersonalRecords();
      return Math.min(100, (prs.length / 1) * 100);
    },
  },
  {
    id: 'pr_master',
    title: 'PR Master',
    titleAr: 'ملك القياسات 👑',
    description: 'Achieve 5 or more Personal Records.',
    descriptionAr: 'كسرت ٥ أرقام قياسية مختلفة في تمارينك.',
    category: 'records',
    xp: 600,
    iconName: 'ShieldCheck',
    checkCriteria: async () => {
      const prs = await getPersonalRecords();
      return prs.length >= 5;
    },
    getProgress: async () => {
      const prs = await getPersonalRecords();
      return Math.min(100, (prs.length / 5) * 100);
    },
  },
  {
    id: 'iron_master',
    title: 'Iron Master',
    titleAr: 'جلسة حديدية 💥',
    description: 'Complete 20+ completed sets in a single session.',
    descriptionAr: 'أنجزت أكثر من ٢٠ جولة في تمرينة واحدة.',
    category: 'records',
    xp: 350,
    iconName: 'Zap',
    checkCriteria: async () => {
      const sessions = await workoutRepository.completedSessions();
      return sessions.some((s) => {
        const totalSets = s.exercises.reduce(
          (acc, ex) => acc + ex.sets.filter((set) => set.completed).length,
          0,
        );
        return totalSets >= 20;
      });
    },
  },

  // ── SOCIAL & NUTRITION ──
  {
    id: 'nutrition_tracker',
    title: 'Nutrition Minded',
    titleAr: 'اهتمام بالتغذية 🥗',
    description: 'Log 5 or more meals in the food diary.',
    descriptionAr: 'سجلت ٥ وجبات أو أكثر في مفكرة التغذية.',
    category: 'social',
    xp: 200,
    iconName: 'Utensils',
    checkCriteria: async () => {
      const count = await db.foodEntries.count();
      return count >= 5;
    },
    getProgress: async () => {
      const count = await db.foodEntries.count();
      return Math.min(100, (count / 5) * 100);
    },
  },
  {
    id: 'social_star',
    title: 'Community Star',
    titleAr: 'نجم المجتمع 🌟',
    description: 'Share a workout post to the community feed.',
    descriptionAr: 'شاركت تمرينة على حائط المجتمع.',
    category: 'social',
    xp: 200,
    iconName: 'Share2',
    checkCriteria: async () => {
      const hasShared = storage.getString('relift_has_shared_post' as any, '') === 'true';
      return hasShared;
    },
    getProgress: async () => {
      const hasShared = storage.getString('relift_has_shared_post' as any, '') === 'true';
      return hasShared ? 100 : 0;
    },
  },
];
