import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Target,
  TrendingUp,
  ChevronRight,
  Zap,
  Dumbbell,
  Clock,
  Plus,
  Play,
  Trash2,
  Copy,
  Activity,
  Heart,
  Edit2,
  Utensils,
  Trophy,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { getWorkoutStreak, getTotalStats, db, type Routine } from "@/db";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useAchievementsStore } from "@/store/useAchievementsStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSocialStore } from "@/store/useSocialStore";
import { useToastStore } from "@/store/useToastStore";
import { Scale, Timer, Check, Save, X, Percent } from "lucide-react";
import AchievementBadge, { ACHIEVEMENT_ICONS } from "@/components/AchievementBadge";
import AchievementModal from "@/components/AchievementModal";
import { MuscleRecoveryHeatmap } from "@/components/stats/MuscleRecoveryHeatmap";
import { RestTimer } from "@/components/RestTimer";
import WarmupMobilityGenerator from "@/components/extras/WarmupMobilityGenerator";
import OneRepMaxCalculator from "@/components/extras/OneRepMaxCalculator";
import QuickLogModal from "@/components/extras/QuickLogModal";
import { useQuickLogStore } from "@/store/useQuickLogStore";
import emptyWorkoutImg from "@/assets/images/empty_workout_illustration_new_1784773586918.jpg";
import aiCoachImg from "@/assets/images/ai_coach_illustration_new_1784773553511.jpg";
import streakBgImg from "@/assets/images/streak_banner_bg_1784773532304.jpg";
import pushDayImg from "@/assets/images/push_day_routine_1784768080165.jpg";
import pullDayImg from "@/assets/images/pull_day_routine_1784768092799.jpg";
import legDayImg from "@/assets/images/leg_day_routine_1784768105158.jpg";
import fullBodyImg from "@/assets/images/full_body_routine_1784768116041.jpg";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import { Button } from "@/components/ui/Button";
import { ACHIEVEMENTS } from "@/data/achievements";
import {
  routineTemplates,
  buildTemplateRoutine,
} from "@/data/routineTemplates";
import { uid } from "@/utils/id";
import { FeedPost } from "@/services/socialService";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const statsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 22,
    },
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [weekActiveDays, setWeekActiveDays] = useState<boolean[]>([
    false, false, false, false, false, false, false,
  ]);
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<
    { id: string; name: string; date: string; exerciseCount: number }[]
  >([]);
  const [activityTab, setActivityTab] = useState<"local" | "social">("local");

  const routines = useRoutineStore((s) => s.routines);
  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);
  const saveRoutine = useRoutineStore((s) => s.saveRoutine);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const user = useAuthStore((s) => s.user);

  const { language } = useSettingsStore();
  const isAr = language === "ar";

  const exercises = useExerciseStore((s) => s.exercises);
  const loadExercises = useExerciseStore((s) => s.loadExercises);

  const { unlockedList, loadUnlocked, evaluateAchievements, newlyUnlocked, clearNewlyUnlocked } = useAchievementsStore();

  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isOneRepMaxOpen, setIsOneRepMaxOpen] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [lastWeight, setLastWeight] = useState<number | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const quickLogs = useQuickLogStore((s) => s.quickLogs);

  useEffect(() => {
    async function loadWeight() {
      const lastMeasurements = await db.bodyMeasurements.orderBy("date").reverse().limit(1).toArray();
      if (lastMeasurements.length > 0) {
        setLastWeight(lastMeasurements[0].weight || null);
      }
    }
    loadWeight();
  }, []);

  const handleWeightSubmit = async () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    
    const measurement = {
      id: uid(),
      date: new Date().toISOString(),
      weight: Number(newWeight),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.bodyMeasurements.add(measurement);
    setLastWeight(Number(newWeight));
    setNewWeight("");
    setShowWeightModal(false);
  };

  // ── Social Store For Live Community Activity ──
  const {
    feed,
    loadFollowing,
    loadFeed,
    giveKudos,
    isLoading: isSocialLoading,
  } = useSocialStore();

  useEffect(() => {
    loadRoutines();
    loadExercises();
    loadUnlocked();
    evaluateAchievements(user?.uid || undefined);
  }, [loadRoutines, loadExercises, loadUnlocked, evaluateAchievements, user?.uid]);

  useEffect(() => {
    async function loadData() {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // Mon = 0, Sun = 6
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const [streakData, statsData, sessions, thisWeekSessions] = await Promise.all([
        getWorkoutStreak(),
        getTotalStats(),
        db.workoutSessions.orderBy("date").reverse().limit(3).toArray(),
        db.workoutSessions
          .where("completed")
          .equals(1)
          .filter((s) => new Date(s.date) >= startOfWeek)
          .toArray(),
      ]);

      const activeDays = [false, false, false, false, false, false, false];
      thisWeekSessions.forEach((s) => {
        const d = new Date(s.date);
        const idx = (d.getDay() + 6) % 7;
        if (idx >= 0 && idx < 7) {
          activeDays[idx] = true;
        }
      });

      setStreak(streakData);
      setWeekActiveDays(activeDays);
      setTotalStats(statsData);
      setRecentWorkouts(
        sessions.map((s) => ({
          id: s.id,
          name: s.name,
          date: s.date,
          exerciseCount: s.exercises.length,
        })),
      );
    }
    if (exercises.length > 0) {
      loadData();
    }
  }, [exercises, quickLogs]);

  // Load social feed when community tab is active
  useEffect(() => {
    if (user && activityTab === "social") {
      loadFollowing(user.uid).then(() => loadFeed());
    }
  }, [user, activityTab, loadFollowing, loadFeed]);

  const formatVolume = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`;
    return `${kg}`;
  };

  const nextWorkout = useMemo(() => {
    if (routines.length > 0) {
      return {
        title: routines[0].name,
        subtitle: isAr ? "التمرين القادم من جداولك" : "Next up from your routines",
        exercises: routines[0].exercises.map((ex) => String(ex.exerciseId)),
      };
    }
    const defaultTpl = routineTemplates[0];
    if (defaultTpl && exercises.length > 0) {
      const built = buildTemplateRoutine(defaultTpl, exercises);
      return {
        title: defaultTpl.name,
        subtitle: isAr ? "قالب مقترح" : "Suggested Template",
        exercises: built.exercises.map((ex) => String(ex.exerciseId)),
      };
    }
    return {
      title: isAr ? "تمرين حر" : "Free Workout",
      subtitle: isAr ? "ابدأ التسجيل الفوري" : "Start tracking instantly",
      exercises: [],
    };
  }, [routines, exercises, isAr]);

  const formatTotalDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0m";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return isAr ? `${hours}س ${mins}د` : `${hours}h ${mins}m`;
    }
    return isAr ? `${mins}د` : `${mins}m`;
  };

  // Safe exercise list builder with fallback exercises
  const getPostExercises = (post: FeedPost) => {
    if (post.exercises && post.exercises.length > 0) {
      return post.exercises;
    }
    const mockDb = [
      {
        exerciseId: "bench-press",
        exerciseName: isAr ? "ضغط بنش بالبار" : "Barbell Bench Press",
        setsCount: 3,
        imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Bench_Press/images/0.jpg",
      },
      {
        exerciseId: "squat",
        exerciseName: isAr ? "سكوات بالبار" : "Barbell Squat",
        setsCount: 3,
        imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Squat/images/0.jpg",
      },
      {
        exerciseId: "lat-pulldown",
        exerciseName: isAr ? "سحب ظهر واسع" : "Cable Wide-Grip Lat Pulldown",
        setsCount: 4,
        imageUrl: "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Cable_Wide-Grip_Lat_Pulldown/images/0.jpg",
      },
    ];
    return mockDb.slice(0, post.exercisesCount || 3);
  };

  const formatFeedDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return isAr ? `${m} د` : `${m} min`;
  };

  const formatFeedVolume = (volume: number) => {
    if (isAr) {
      if (volume >= 1000) return `${(volume / 1000).toFixed(1)} طن`;
      return `${volume} كجم`;
    }
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
    return `${volume} kg`;
  };

  // Translations Map
  const t = {
    welcome: isAr ? "أهلاً بيك في ري‌ليفت يا بطل ⚡" : "Welcome to ReLift",
    keepPushing: isAr ? "عاش يا وحش، كمل طريقك! 🔥" : "Keep Pushing Forward!",
    startJourney: isAr ? "ابدأ فورمتك معانا 🚀" : "Start Your Fitness Journey",
    crushedWorkouts: (count: number) => isAr ? `قفلت ${count} تمرينة لحد دلوقتي. عاش يا بطل!` : `You've crushed ${count} workouts so far. Keep it up!`,
    trackWorkouts: isAr ? "سجل تمارينك، ظبط أهدافك، وتابع فورمتك — كله في مكان واحد." : "Track workouts, crush goals, and monitor progress — all in one place.",
    startWorkoutNow: isAr ? "ابدأ التمرينة دلوقتي" : "Start Workout Now",
    streak: isAr ? "أيام متواصلة" : "Streak",
    workouts: isAr ? "التمارين" : "Workouts",
    volume: isAr ? "الوزن التوتال" : "Volume",
    days: isAr ? "أيام" : "Days",
    sessions: isAr ? "تمرينة" : "Sessions",
    ton: isAr ? "طن" : "Ton",
    kg: isAr ? "كجم" : "Kg",
    activeChallenge: isAr ? "تحدي الأبطال 🏆" : "Active Challenge",
    challengeDesc: isAr ? "قفل ١٠٠ تمرينة وخد لقب البطل" : "Reach 100 total workouts (Centurion)",
    generatorTitle: isAr ? "عمل تمرينة بالذكاء الاصطناعي 🔮" : "AI Workout Generator",
    generatorDesc: isAr ? "هنعملك فورمة في ثواني" : "Get a custom plan in seconds",
    tryNow: isAr ? "جرب دلوقتي" : "Try Now",
    customRoutines: isAr ? "جداولك 📋" : "Custom Routines",
    buildNew: isAr ? "جدول جديد" : "Build New",
    exercisesCount: (count: number) => isAr ? `${count} تمارين` : `${count} Exercises`,
    start: isAr ? "ابدأ" : "Start",
    templates: isAr ? "جداول جاهزة" : "Templates",
    addToRoutines: isAr ? "إضافة إلى جداولي" : "Add to My Routines",
    recentActivity: isAr ? "آخر تمريناتك ⚡" : "Recent Activity",
    myActivityTab: isAr ? "تمريناتي" : "My Activity",
    socialFeedTab: isAr ? "أخبار الجيم 👥" : "Social Feed",
    viewAll: isAr ? "شوف كله" : "View All",
    noWorkoutsYet: isAr ? "لسه متمرنتش يا وحش" : "No Workouts Yet",
    startFirstWorkout: isAr ? "ابدأ أول تمرينة وهتلاقيها هنا" : "Start your first workout and it will appear here",
    statistics: isAr ? "أرقامك 📈" : "Statistics",
    bodyMetrics: isAr ? "قياسات جسمك ⚖️" : "Body Metrics",
    loadingSocial: isAr ? "بنجيب أخبار الجيم..." : "Loading ReLift Community Feed...",
    noSocialFeed: isAr ? "مفيش حد نزل حاجة لسه" : "No feed posts yet",
    noSocialDesc: isAr ? "تابع الوحوش من الاستكشاف عشان تشوف تمارينهم هنا!" : "Follow other athletes from the 'Explore' page to see their workouts here!",
    recordsLabel: isAr ? "مجاميع" : "Sets",
    volumeLabel: isAr ? "الحجم العضلي" : "Volume",
    durationLabel: isAr ? "المدة" : "Duration",
    kudos: isAr ? "دعم" : "Kudos",
  };

  const quickStats = [
    {
      label: t.streak,
      value: streak.toString(),
      unit: t.days,
      icon: Flame,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: t.workouts,
      value: totalStats.totalWorkouts.toString(),
      unit: t.sessions,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-muted",
    },
    {
      label: t.volume,
      value: formatVolume(totalStats.totalVolume),
      unit: totalStats.totalVolume >= 1000 ? t.ton : t.kg,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6 pb-16 animate-fade-in" dir={isAr ? "rtl" : "ltr"}>
      {/* ── 1. Hero Stat Card (Streak & Weekly Progress) ── */}
      <motion.div
        className="glass-card relative overflow-hidden rounded-[24px] p-5 border border-primary/30 bg-[#0c0f17] shadow-[0_0_25px_rgba(204,255,0,0.12)] group"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        {/* Abstract Cyber Fitness Illustration Background */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <img
            src={streakBgImg}
            alt="Streak Illustration Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right-bottom scale-110 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17] via-transparent to-[#0c0f17]/20" />
        </div>

        <div className="relative z-10 flex items-center justify-between mb-3">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">
            {isAr ? "الـسـريـك الـحـالـي" : "CURRENT STREAK"}
          </span>
          <Flame className={cn("h-5 w-5 drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]", streak > 0 ? "text-primary animate-pulse" : "text-text-muted")} />
        </div>

        <div className="relative z-10 flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black italic tracking-tighter text-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]">
              {streak}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-text-muted">
              {isAr ? "أيام" : "DAYS"}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              {isAr ? "أيام هذا الأسبوع" : "This week's"}
            </span>
            <div className="flex items-center gap-1.5">
              {weekActiveDays.map((active, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    active
                      ? "bg-primary shadow-[0_0_6px_rgba(204,255,0,0.8)]"
                      : "bg-white/10 border border-white/5"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-black text-primary">
          <span>{streak > 0 ? "🔥" : "⚡"}</span>
          <span className="uppercase tracking-wider">
            {streak > 0
              ? (isAr ? "أنت في قمة الاشتعال يا وحش!" : "You're on fire!")
              : (isAr ? "ابدأ أول تمرينة النهاردة لبناء السريك! 🚀" : "Start a workout today to build your streak!")}
          </span>
        </div>
      </motion.div>

      {/* ── 2. Stats Trio ── */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={statsContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={statCardVariants}
          whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-primary/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] cursor-pointer"
        >
          <Dumbbell className="h-5 w-5 text-primary mb-2 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" />
          <p className="text-xl font-black italic tracking-tight text-text-primary">
            {totalStats.totalWorkouts}
          </p>
          <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">
            {isAr ? "التمارين" : "WORKOUTS"}
          </p>
        </motion.div>

        <motion.div
          variants={statCardVariants}
          whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-cyan-400/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer"
        >
          <TrendingUp className="h-5 w-5 text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          <p className="text-xl font-black italic tracking-tight text-text-primary">
            {totalStats.totalVolume > 0 ? formatVolume(totalStats.totalVolume) : "0"}
          </p>
          <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">
            {isAr ? "الحجم (كجم)" : "VOLUME (KG)"}
          </p>
        </motion.div>

        <motion.div
          variants={statCardVariants}
          whileHover={{ y: -5, scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          className="glass-card flex flex-col items-center justify-center rounded-[20px] p-4 text-center border border-border/60 hover:border-emerald-400/60 transition-colors bg-bg-surface/80 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-pointer"
        >
          <Clock className="h-5 w-5 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
          <p className="text-xl font-black italic tracking-tight text-text-primary">
            {formatTotalDuration(totalStats.totalDuration)}
          </p>
          <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mt-1">
            {isAr ? "الوقت التوتال" : "TOTAL TIME"}
          </p>
        </motion.div>
      </motion.div>

      {/* ── 3. Start Workout Primary CTA ── */}
      <motion.div
        className="glass-card flex flex-col gap-2 rounded-[22px] p-5 border border-primary/50 bg-bg-surface shadow-xl relative overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            {isAr ? "ابدأ التمرين" : "Start Workout"}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
            {isAr ? "جاهز للرفع؟" : "READY TO LIFT?"}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-5 shadow-[0_0_25px_rgba(204,255,0,0.35)] hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] flex items-center justify-between gap-3 transition-all active:scale-98 cursor-pointer mt-1 group"
          onClick={async () => {
            const sessionId = await startWorkout(nextWorkout.exercises);
            navigate({
              to: `/workout/$sessionId`,
              params: { sessionId },
            });
          }}
        >
          <div className={cn("flex flex-col", isAr ? "items-start text-right" : "items-start text-left")}>
            <span className="text-black font-black text-sm md:text-base tracking-widest uppercase truncate max-w-[200px]">
              {nextWorkout.title}
            </span>
            <span className="text-black/70 font-bold text-[9px] md:text-[10px] uppercase">
              {nextWorkout.subtitle}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-black text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shrink-0">
            <Play size={18} className="fill-current ml-1" />
          </div>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-2xl font-black text-xs uppercase tracking-widest py-3 px-5 border border-primary/40 text-primary hover:bg-primary/10 flex items-center justify-between gap-3 transition-all active:scale-98 cursor-pointer mt-2 group"
          onClick={() => navigate({ to: "/wizard" })}
        >
          <span className="font-black text-sm tracking-widest uppercase">
            {isAr ? "عمل تمرينة بالذكاء الاصطناعي 🔮" : "AI Workout Generator"}
          </span>
          <Zap size={18} className="text-primary" />
        </Button>
        <p className="text-[10px] text-text-muted text-center font-bold tracking-wider mt-0.5">
          {nextWorkout.exercises.length > 0 
            ? (isAr ? "اضغط للبدء بهذا الجدول" : "Tap to start this routine")
            : (isAr ? "اضغط لبدء التسجيل الفوري" : "Tap to begin tracking")}
        </p>
      </motion.div>

      {/* ── 4. Quick Routines ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span>{isAr ? "الجداول السريعة" : "Quick Routines"}</span>
          </h2>
          <Link
            to="/builder"
            className="flex items-center gap-1 text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider cursor-pointer"
          >
            <span>{isAr ? "شوف كله" : "See all"}</span>
            <ChevronRight className={cn("h-3.5 w-3.5", isAr && "rotate-180")} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              name: isAr ? "يوم الدفع" : "Push Day",
              subtitle: isAr ? "صدر • كتف • ترايسبس" : "Chest • Shoulders • Triceps",
              badge: isAr ? "تمارين الدفع" : "PUSH",
              exercises: 6,
              duration: "45 MIN",
              image: pushDayImg,
              badgeStyle: "bg-primary/20 text-primary border-primary/40",
              templateIdx: 0,
            },
            {
              name: isAr ? "يوم السحب" : "Pull Day",
              subtitle: isAr ? "ظهر • بايسبس • كتف خلفي" : "Back • Biceps • Rear Delts",
              badge: isAr ? "تمارين السحب" : "PULL",
              exercises: 6,
              duration: "45 MIN",
              image: pullDayImg,
              badgeStyle: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
              templateIdx: 1,
            },
            {
              name: isAr ? "يوم الأرجل" : "Leg Day",
              subtitle: isAr ? "أرجل • هامات • سمانة" : "Quads • Hamstrings • Calves",
              badge: isAr ? "تمارين الأرجل" : "LEGS",
              exercises: 6,
              duration: "45 MIN",
              image: legDayImg,
              badgeStyle: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
              templateIdx: 2,
            },
            {
              name: isAr ? "كامل الجسم" : "Full Body",
              subtitle: isAr ? "شامل • قوة • لياقة" : "Compound • Power • Cardio",
              badge: isAr ? "تمارين شاملة" : "FULL BODY",
              exercises: 5,
              duration: "50 MIN",
              image: fullBodyImg,
              badgeStyle: "bg-purple-500/20 text-purple-400 border-purple-500/40",
              templateIdx: 3,
            },
          ].map((routine, idx) => {
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-[22px] border border-border/70 hover:border-primary/60 transition-all duration-300 group cursor-pointer bg-bg-surface flex flex-col justify-between p-3.5 min-h-[220px] shadow-lg hover:shadow-xl"
                onClick={async () => {
                  const tpl = routineTemplates[routine.templateIdx];
                  if (tpl && exercises.length > 0) {
                    const built = buildTemplateRoutine(tpl, exercises);
                    const ids = built.exercises.map((ex) => String(ex.exerciseId));
                    if (ids.length > 0) {
                      const sessionId = await startWorkout(ids);
                      navigate({
                        to: `/workout/$sessionId`,
                        params: { sessionId },
                      });
                      return;
                    }
                  }
                  navigate({ to: "/builder" });
                }}
              >
                {/* 3D Illustration Image Card Header */}
                <div className="relative w-full h-28 mb-2 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary/40 transition-all shadow-md">
                  <img
                    src={routine.image}
                    alt={routine.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-black/30" />
                  <div className="absolute top-2 left-2 z-10">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border backdrop-blur-md shadow-sm", routine.badgeStyle)}>
                      {routine.badge}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-[9px] font-black text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                      <Clock size={10} className="text-primary" />
                      {routine.duration}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 mb-2">
                  <h3 className="text-sm font-black italic tracking-tight text-text-primary group-hover:text-primary transition-colors">
                    {routine.name}
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold mt-0.5 line-clamp-1">
                    {routine.subtitle}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 pt-2 border-t border-border/40 flex items-center justify-between text-xs font-black">
                  <span className="text-[9px] font-bold text-text-muted bg-bg-elevated/80 px-2 py-0.5 rounded-md border border-border/30">
                    {routine.exercises} {isAr ? "تمارين" : "Exercises"}
                  </span>
                  <div className={cn("flex items-center gap-1 text-primary font-black transition-transform duration-200", isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1")}>
                    <Play size={11} className="fill-current ml-0.5" />
                    <span className="text-[10px] uppercase tracking-wider">{isAr ? "بدء" : "START"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 5. Muscle Recovery Heatmap ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3.5}
      >
        <MuscleRecoveryHeatmap isAr={isAr} />
      </motion.div>

      {/* ── 6. Achievements Strip ── */}
      {(() => {
        const unlockedIds = new Set(unlockedList.filter((a) => !a.deleted).map((a) => a.achievementId));
        const unlockedCount = unlockedIds.size;
        const totalAchievements = ACHIEVEMENTS.length;

        return (
          <motion.div
            className="glass-card rounded-[22px] p-4 border border-border/60 bg-bg-surface/80"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">
                  {isAr ? "الإنجازات والأوسمة" : "ACHIEVEMENTS"}
                </h2>
              </div>
              <button
                onClick={() => setIsAchievementsModalOpen(true)}
                className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{unlockedCount} / {totalAchievements}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedIds.has(ach.id);
                const title = isAr ? ach.titleAr : ach.title;
                const IconComp = ACHIEVEMENT_ICONS[ach.iconName] || Trophy;

                return (
                  <motion.button
                    key={ach.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAchievementsModalOpen(true)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all shrink-0 cursor-pointer w-20 text-center select-none",
                      isUnlocked
                        ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                        : "bg-bg-elevated/40 border-border/40 text-text-muted/50 grayscale opacity-80 hover:opacity-100"
                    )}
                    title={`${title} (${isUnlocked ? (isAr ? "مفتوح" : "Unlocked") : (isAr ? "انقر لمعرفة الشروط" : "Click to view conditions")})`}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
                        isUnlocked
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-bg-surface-hover text-text-muted/60"
                      )}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[9px] font-black leading-tight line-clamp-1 w-full text-text-primary">
                      {title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* ── 7. Quick Tools Grid ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4.5}
      >
        <div className="mb-3">
          <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">
            {isAr ? "الأدوات السريعة" : "Quick Tools Grid"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsOneRepMaxOpen(true)}
            className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
              <Percent size={20} />
            </div>
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
              {isAr ? "حاسبة 1RM" : "1RM Calc"}
            </h3>
            <p className="text-[9px] text-text-muted mt-0.5">
              {isAr ? "احسب أقصى وزن" : "Max strength"}
            </p>
          </button>

          <button
            onClick={() => setIsWarmupOpen(true)}
            className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success mb-2 group-hover:scale-110 transition-transform">
              <Timer size={20} />
            </div>
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
              {isAr ? "الإحماء" : "Warm-up"}
            </h3>
            <p className="text-[9px] text-text-muted mt-0.5">
              {isAr ? "تجهيز المفاصل" : "Mobility prep"}
            </p>
          </button>

          <button
            onClick={() => setIsQuickLogOpen(true)}
            className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning mb-2 group-hover:scale-110 transition-transform">
              <Utensils size={20} />
            </div>
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
              {isAr ? "تسجيل سريع" : "Quick Log"}
            </h3>
            <p className="text-[9px] text-text-muted mt-0.5">
              {isAr ? "سجل السعرات والتغذية" : "Nutrition & macros"}
            </p>
          </button>

          <button
            onClick={() => navigate({ to: "/wizard" })}
            className="glass-card flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-border/60 hover:border-primary/50 bg-bg-surface/80 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
              {isAr ? "مدرب الذكاء الاصطناعي" : "AI Coach"}
            </h3>
            <p className="text-[9px] text-text-muted mt-0.5">
              {isAr ? "برامج تدريبية ذكية" : "Smart workout plans"}
            </p>
          </button>
        </div>
      </motion.div>

      {/* ── Custom Routines ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
            {t.customRoutines}
          </h2>
          <Link
            to="/builder"
            className="flex items-center gap-1 text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider"
          >
            <Plus className="h-3 w-3" />
            {t.buildNew}
          </Link>
        </div>

        {routines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {routines.map((routine, idx) => (
              <motion.div
                key={routine.id}
                className="relative overflow-hidden rounded-[22px] border border-border/70 hover:border-primary/60 transition-all duration-300 bg-bg-surface flex flex-col justify-between p-4.5 shadow-lg hover:shadow-xl group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                        {isAr ? "روتين خاص" : "CUSTOM"}
                      </span>
                      <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                        <Clock size={11} className="text-primary" />
                        {routine.exercises.length * 7} {isAr ? "دقيقة تقريباً" : "min est."}
                      </span>
                    </div>
                    <h3 className="text-base font-black italic tracking-tight text-text-primary group-hover:text-primary transition-colors line-clamp-1 mt-1">
                      {routine.name}
                    </h3>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        navigate({
                          to: "/builder",
                          search: { editRoutineId: routine.id } as any,
                        })
                      }
                      className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title={isAr ? "تعديل الجدول" : "Edit Routine"}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setRoutineToDelete(routine)}
                      className="p-2 rounded-xl bg-bg-surface-hover text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title={isAr ? "حذف الجدول" : "Delete Routine"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exercise Preview Badges */}
                {routine.exercises && routine.exercises.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {routine.exercises.slice(0, 3).map((ex, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-text-muted border border-white/5"
                      >
                        {ex.exerciseName}
                      </span>
                    ))}
                    {routine.exercises.length > 3 && (
                      <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        +{routine.exercises.length - 3} {isAr ? "تمارين أخرى" : "more"}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer CTA */}
                <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">
                    {routine.exercises.length} {isAr ? "تمارين مسجلة" : "exercises"}
                  </span>
                  <Button
                    size="sm"
                    className="rounded-xl font-black text-xs uppercase tracking-wider py-2 px-4 bg-primary text-black hover:bg-primary-hover flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] cursor-pointer"
                    onClick={async () => {
                      const ids = routine.exercises.map((ex) =>
                        String(ex.exerciseId)
                      );
                      const sessionId = await startWorkout(ids);
                      navigate({
                        to: `/workout/$sessionId`,
                        params: { sessionId },
                      });
                    }}
                  >
                    <Play size={12} className="fill-current" />
                    <span>{isAr ? "ابدأ التمرين" : "START"}</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <DataEmptyState
              imageSrc={emptyWorkoutImg}
              title={isAr ? "مفيش جداول ليك لسه" : "No custom routines yet"}
              description={isAr ? "اعمل جدول ليك عشان تبدأ تتمرن على طول." : "Create your first routine to quick-start your workouts."}
              actionLabel={t.buildNew}
              onAction={() => navigate({ to: "/builder" })}
            />
          </div>
        )}

        {/* Delete Routine Confirmation Modal */}
        <AnimatePresence>
          {routineToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="w-full max-w-sm rounded-3xl bg-bg-card p-6 border border-border/80 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-danger">
                  <div className="p-3 rounded-2xl bg-danger/10 border border-danger/20">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-primary uppercase tracking-wider">
                      {isAr ? "حذف الجدول؟" : "Delete Routine?"}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {isAr ? "إجراء لا يمكن التراجع عنه" : "This action cannot be undone"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">
                  {isAr
                    ? `هل أنت متأكد من حذف جدول "${routineToDelete.name}"؟ هينحذف نهائياً من جداولك.`
                    : `Are you sure you want to delete "${routineToDelete.name}"? It will be removed from your custom routines.`}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider"
                    onClick={() => setRoutineToDelete(null)}
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-wider bg-danger text-white hover:bg-danger/90"
                    onClick={async () => {
                      await deleteRoutine(routineToDelete.id, user?.uid);
                      setRoutineToDelete(null);
                      useToastStore
                        .getState()
                        .addToast(
                          "success",
                          isAr ? "تم حذف الجدول بنجاح 📋" : "Routine deleted successfully"
                        );
                    }}
                  >
                    {isAr ? "تأكيد الحذف" : "Delete"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
            {t.templates}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {routineTemplates.map((template, idx) => (
            <motion.div
              key={template.name}
              className="glass-card rounded-[--radius-card] overflow-hidden flex flex-col hover:border-border transition-all group"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              {template.imageUrl && (
                <div className="relative h-28 w-full overflow-hidden bg-bg-surface-hover">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {template.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {template.description}
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    if (exercises.length === 0) return;
                    const generated = buildTemplateRoutine(template, exercises);
                    await saveRoutine(
                      {
                        id: uid(),
                        name: generated.name,
                        exercises: generated.exercises,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                      user?.uid,
                    );
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 h-8 text-[11px] font-bold uppercase tracking-wider border-border/70 text-text-primary hover:text-primary hover:border-primary"
                  icon={<Copy className="h-3.5 w-3.5" />}
                >
                  {t.addToRoutines}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Togglable Activity Section ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
              {t.recentActivity}
            </h2>
            {recentWorkouts.length > 0 && activityTab === "local" && (
              <Link
                to="/stats"
                className="text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider"
              >
                {t.viewAll}
              </Link>
            )}
          </div>

          {/* Activity Tabs Controller */}
          <div className="flex bg-bg-surface p-1 rounded-xl border border-border w-full">
            <button
              onClick={() => setActivityTab("local")}
              className={cn(
                "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                activityTab === "local"
                  ? "bg-bg-surface-hover text-primary shadow-md"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {t.myActivityTab}
            </button>
            <button
              onClick={() => setActivityTab("social")}
              className={cn(
                "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                activityTab === "social"
                  ? "bg-bg-surface-hover text-primary shadow-md"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {t.socialFeedTab}
            </button>
          </div>
        </div>

        {activityTab === "local" ? (
          recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout, idx) => (
                <motion.div
                  key={workout.id}
                  className="glass-card flex flex-row items-center gap-3 rounded-[--radius-card] p-4 hover:border-border transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted shrink-0">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate uppercase">
                      {workout.name}
                    </p>
                    <p className="text-xs text-text-muted font-bold">
                      {t.exercisesCount(workout.exerciseCount)} •{" "}
                      {new Date(workout.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Clock className="h-4 w-4 text-text-muted shrink-0" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-[--radius-card] border border-dashed border-border py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated">
                <Target className="h-7 w-7 text-text-muted" />
              </div>
              <p className="text-sm font-bold text-text-muted">
                {t.noWorkoutsYet}
              </p>
              <p className="text-xs text-text-muted text-center max-w-[200px] font-semibold">
                {t.startFirstWorkout}
              </p>
            </div>
          )
        ) : (
          /* COMMUNITY SOCIAL FEED INTEGRATION ON HOME PAGE */
          <div className="space-y-4">
            {isSocialLoading ? (
              <div className="text-xs text-text-muted text-center py-8 flex flex-col items-center justify-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span>{t.loadingSocial}</span>
              </div>
            ) : feed.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-[--radius-card] border border-dashed border-border py-12 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated">
                  <Activity className="h-7 w-7 text-text-muted" />
                </div>
                <p className="text-sm font-bold text-text-muted">
                  {t.noSocialFeed}
                </p>
                <p className="text-xs text-text-muted max-w-[260px] leading-relaxed font-semibold">
                  {t.noSocialDesc}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate({ to: "/feed" })}
                >
                  {isAr ? "روح شوف الناس بتتمرن إزاي 👥" : "Go to Explore"}
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {feed.slice(0, 3).map((post) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={"home-feed-" + post.id}
                    className="bg-bg-surface-hover rounded-2xl p-4 border border-border flex flex-col gap-4 shadow-xl hover:border-border transition-colors"
                  >
                    {/* Post Author info */}
                    <div className="flex items-center gap-3">
                      {post.authorPhotoURL ? (
                        <img
                          src={post.authorPhotoURL}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full bg-bg-surface-hover object-cover border border-border"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {post.authorName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-text-primary">
                          {post.authorName}
                        </span>
                        <span className="text-[9px] text-text-muted uppercase tracking-widest font-mono">
                          {new Date(post.createdAt).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Workout details card */}
                    <div className="bg-bg-surface/60 rounded-xl p-4 border border-border">
                      <h4 className="font-black text-text-primary capitalize text-sm mb-3">
                        {post.workoutTitle}
                      </h4>

                      {/* Stats strip */}
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border pb-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                            {t.recordsLabel}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Dumbbell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{post.exercisesCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                            {t.volumeLabel}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Activity className="w-3.5 h-3.5 text-warning shrink-0" />
                            <span>{formatFeedVolume(post.totalVolume || 0)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                            {t.durationLabel}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{formatFeedDuration(post.duration || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* HIGHLY POLISHED EXERCISE GRID */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {getPostExercises(post).map((ex, idx) => (
                          <div
                            key={"home-feed-ex-" + idx}
                            className="flex flex-col items-center bg-bg-surface-hover/60 border border-border rounded-xl p-2 hover:bg-bg-surface-hover transition-all group/item"
                          >
                            <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center overflow-hidden mb-1 border border-border relative">
                              {ex.imageUrl ? (
                                <img
                                  src={ex.imageUrl}
                                  alt={ex.exerciseName}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Dumbbell className="w-4 h-4 text-text-muted animate-pulse" />
                              )}
                            </div>
                            <span className="text-[9px] font-black text-primary leading-tight">
                              {ex.setsCount} {isAr ? "مجاميع" : "Sets"}
                            </span>
                            <span className="text-[8px] text-text-secondary font-bold truncate w-full text-center px-0.5 capitalize leading-tight mt-0.5">
                              {ex.exerciseName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Likes/Kudos Section */}
                    <div className="flex items-center justify-between border-t border-border/40 pt-2">
                      <button
                        onClick={() => giveKudos(post.id)}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors hover:scale-105 active:scale-95 group"
                      >
                        <Heart className="w-4 h-4 group-hover:fill-primary text-primary" />
                        <span className="text-xs font-black font-mono">
                          {post.kudosCount} {t.kudos}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Quick Links ── */}
      <motion.div
        className="grid grid-cols-2 gap-3 pb-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={6}
      >
        <Link
          to="/stats"
          className="glass-card flex flex-col items-center gap-3 rounded-[--radius-card] p-4 transition-colors hover:bg-bg-elevated"
        >
          <TrendingUp className="h-6 w-6 text-success" />
          <span className="text-sm font-bold text-text-primary tracking-wide">
            {t.statistics}
          </span>
        </Link>
        <Link
          to="/body"
          className="glass-card flex flex-col items-center gap-3 rounded-[--radius-card] p-4 transition-colors hover:bg-bg-elevated"
        >
          <Target className="h-6 w-6 text-warning" />
          <span className="text-sm font-bold text-text-primary tracking-wide">
            {t.bodyMetrics}
          </span>
        </Link>
      </motion.div>
      {/* ── Weight Modal ── */}
      <AnimatePresence>
        {showWeightModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWeightModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card relative w-full max-w-sm rounded-3xl p-6 border border-primary/20 shadow-2xl"
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-primary uppercase tracking-wider">
                      {isAr ? "سجل وزنك اليوم" : "Log Daily Weight"}
                    </h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase">
                      {new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", { month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder={isAr ? "٨٠.٥" : "80.5"}
                    autoFocus
                    className="w-full h-16 bg-bg-surface-hover border border-border rounded-2xl px-6 text-2xl font-black text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all tabular-nums text-center"
                  />
                  <span className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-sm font-black text-text-muted uppercase tracking-widest",
                    isAr ? "left-6" : "right-6"
                  )}>
                    {t.kg}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowWeightModal(false)}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-border"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={handleWeightSubmit}
                    variant="primary"
                    className="flex-1 h-12 rounded-2xl"
                    disabled={!newWeight}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {isAr ? "حفظ" : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RestTimer
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        isAr={isAr}
      />

      <WarmupMobilityGenerator
        isOpen={isWarmupOpen}
        onClose={() => setIsWarmupOpen(false)}
        isAr={isAr}
      />

      <OneRepMaxCalculator
        isOpen={isOneRepMaxOpen}
        onClose={() => setIsOneRepMaxOpen(false)}
        isAr={isAr}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        isAr={isAr}
      />

      <AchievementModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
      />


    </div>
  );
}
