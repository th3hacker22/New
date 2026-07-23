import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  Trophy,
  Flame,
  Dumbbell,
  TrendingUp,
  Calendar,
  Clock,
  ChevronDown,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Target,
  Award,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Scale,
  Ruler,
  Image as ImageIcon,
  ChevronsLeftRight,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { uid } from "@/utils/id";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  getWorkoutStreak,
  getPersonalRecords,
  getWeeklyVolume,
  getWeeklyTonnage,
  getExerciseProgress,
  getEstimated1RM,
  getTotalStats,
  getMuscleGroupStats,
  getWorkoutDensity,
  getWeeklySetVolume,
  db,
  type BodyMeasurement,
  type ProgressPhoto,
} from "@/db";
import { useExerciseStore } from "@/store/useExerciseStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import statsAnalyticsImg from "@/assets/images/stats_analytics_illustration_new_1784773571138.jpg";
import ExerciseProgressChart from "@/components/stats/ExerciseProgressChart";
import AnatomyModel from "@/components/stats/AnatomyModel";
import { WorkoutHeatmap } from "@/components/stats/WorkoutHeatmap";
import { PRProgressChart } from "@/components/stats/PRProgressChart";
import { WeightGoalTracker } from "@/components/stats/WeightGoalTracker";
import { WeeklyVolumeTarget } from "@/components/stats/WeeklyVolumeTarget";
import WorkoutHistoryList from "@/components/workout/WorkoutHistoryList";
import { AnimatedCounter } from "@/components/stats/AnimatedCounter";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 140,
      damping: 18,
    },
  },
};

// Weekly helper
function getStartAndEndOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

interface WorkoutGoal {
  id: string;
  type: "weekly_workouts" | "monthly_volume" | "weekly_time" | "exercise_1rm";
  target: number;
  exerciseId?: string | number;
  exerciseName?: string;
  createdAt: string;
}

const DEFAULT_GOALS: WorkoutGoal[] = [
  {
    id: "default-1",
    type: "weekly_workouts",
    target: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    type: "monthly_volume",
    target: 15000,
    createdAt: new Date().toISOString(),
  },
];

const monthsEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthsAr = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function StatsPage() {
  const navigate = useNavigate();
  const { exercises, loadExercises } = useExerciseStore();
  const { language } = useSettingsStore();
  const isAr = language === "ar";
  const { isDemoMode, setDemoMode } = useWorkoutStore();

  const getPrImageUrl = (pr: any) => {
    // 1. Try to find exact or fuzzy match in exercises list
    if (exercises && exercises.length > 0) {
      const pName = String(pr.exerciseName || "").toLowerCase();
      const pId = String(pr.exerciseId || "").toLowerCase();
      
      const ex = exercises.find((e) => 
        String(e.id).toLowerCase() === pId || 
        e.name.toLowerCase() === pName ||
        e.nameEn?.toLowerCase() === pName ||
        e.nameAr?.toLowerCase() === pName
      );
      if (ex && ex.imageUrl) {
        return ex.imageUrl;
      }

      // Fuzzy matching (e.g. if name contains search term)
      const fuzzyEx = exercises.find((e) => 
        e.name.toLowerCase().includes(pName) || 
        pName.includes(e.name.toLowerCase()) ||
        (e.nameEn && (e.nameEn.toLowerCase().includes(pName) || pName.includes(e.nameEn.toLowerCase())))
      );
      if (fuzzyEx && fuzzyEx.imageUrl) {
        return fuzzyEx.imageUrl;
      }
    }
    
    // 2. High-quality hardcoded mappings for standard exercises & translations
    const lowerName = String(pr.exerciseName || "").toLowerCase();
    
    if (lowerName.includes("bench") || lowerName.includes("chest") || lowerName.includes("بنش") || lowerName.includes("صدر") || lowerName.includes("دفع")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Bench_Press/images/0.jpg";
    }
    if (lowerName.includes("squat") || lowerName.includes("leg") || lowerName.includes("اسكوات") || lowerName.includes("رجل") || lowerName.includes("فخذ") || lowerName.includes("أرجل")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Squat/images/0.jpg";
    }
    if (lowerName.includes("row") || lowerName.includes("back") || lowerName.includes("ظهر") || lowerName.includes("سحب") || lowerName.includes("عقلة") || lowerName.includes("pullup") || lowerName.includes("lat")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Row/images/0.jpg";
    }
    if (lowerName.includes("overhead") || lowerName.includes("press") || lowerName.includes("shoulder") || lowerName.includes("كتف") || lowerName.includes("أكتاف") || lowerName.includes("ohp") || lowerName.includes("جانبي")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Overhead_Press/images/0.jpg";
    }
    if (lowerName.includes("deadlift") || lowerName.includes("rdl") || lowerName.includes("ديدليفت") || lowerName.includes("الرفعة المميتة")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Deadlift/images/0.jpg";
    }
    if (lowerName.includes("curl") || lowerName.includes("bicep") || lowerName.includes("tricep") || lowerName.includes("arm") || lowerName.includes("بايسبس") || lowerName.includes("ترايسبس") || lowerName.includes("ذراع") || lowerName.includes("ذراعين")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Dumbbell_Biceps_Curl/images/0.jpg";
    }
    if (lowerName.includes("abs") || lowerName.includes("core") || lowerName.includes("crunch") || lowerName.includes("situp") || lowerName.includes("بطن") || lowerName.includes("معدة")) {
      return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Ab_Wheel_Rollout/images/0.jpg";
    }
    
    // Default fallback to Bench Press diagram if all fails
    return "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Bench_Press/images/0.jpg";
  };

  // Sub-tab Navigation matching the video's top tab bar:
  // "نظرة سريعة" | "تمرينات" | "القياسات" | "صور"
  const [activeTab, setActiveTab] = useState<"overview" | "exercises" | "measurements" | "photos" | "history">("overview");

  // Interactivity States
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ── Tab 1: Overview States ──
  const [streak, setStreak] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
  });
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<{ week: string; volume: number }[]>([]);
  const [weeklyTonnage, setWeeklyTonnage] = useState<{ week: string; tonnage: number }[]>([]);
  const [muscleGroupStats, setMuscleGroupStats] = useState<{ muscle: string; volume: number }[]>([]);
  const [e1rms, setE1rms] = useState<{ exerciseName: string; e1rm: number }[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [muscleRecovery, setMuscleRecovery] = useState<Record<string, { percent: number; hoursLeft: number }>>({});
  const [workedThisWeek, setWorkedThisWeek] = useState<Record<string, number>>({});
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  // Sparkline Trends data
  const [workoutSparkline, setWorkoutSparkline] = useState<{ value: number }[]>([]);
  const [volumeSparkline, setVolumeSparkline] = useState<{ value: number }[]>([]);
  const [durationSparkline, setDurationSparkline] = useState<{ value: number }[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // ── Tab 3: Measurements States ──
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [measurementForm, setMeasurementForm] = useState({
    weight: "",
    bodyFat: "",
    waist: "",
    chest: "",
  });

  // ── Tab 4: Photos States ──
  const [photos, setPhotos] = useState<(ProgressPhoto & { url: string })[]>([]);
  const [sliderPos, setSliderPos] = useState(50);
  const [beforePhotoId, setBeforePhotoId] = useState<string>("");
  const [afterPhotoId, setAfterPhotoId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Workout Goals States ──
  const [goals, setGoals] = useState<WorkoutGoal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<WorkoutGoal | null>(null);
  const [goalType, setGoalType] = useState<WorkoutGoal["type"]>("weekly_workouts");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalExerciseId, setGoalExerciseId] = useState("");

  const [workoutDensity, setWorkoutDensity] = useState<{ date: string; count: number }[]>([]);
  const [weeklySetVolume, setWeeklySetVolume] = useState<{ muscle: string; sets: number }[]>([]);
  const [selectedPrId, setSelectedPrId] = useState<string | number | null>(null);
  const [prHistory, setPrHistory] = useState<any[]>([]);

  // Translate helper
  const t = {
    overview: isAr ? "نظرة سريعة" : "Overview",
    exercises: isAr ? "تمرينات" : "Exercises",
    measurements: isAr ? "القياسات" : "Measurements",
    photos: isAr ? "صور" : "Photos",
    streak: isAr ? "الاستمرارية 🔥" : "Commitment Streak 🔥",
    workouts: isAr ? "تمرينات" : "Workouts",
    volume: isAr ? "التوتال (حجم التمرين)" : "Training Volume",
    duration: isAr ? "الوقت" : "Duration",
    ton: isAr ? "طن" : "Ton",
    kg: isAr ? "كجم" : "Kg",
    days: isAr ? "أيام" : "Days",
    mins: isAr ? "دقيقة" : "mins",
    compared3Months: isAr ? "مقارنة بآخر ٣ شهور" : "Compared to last 3 months",
    totalEffort: isAr ? "الوقت الكلي للتمرين" : "Total effort time logged",
    muscleRecoveryTitle: isAr ? "استشفاء العضلات" : "Muscle Recovery",
    anyReadyToTrain: isAr ? "شوف إيه العضلات اللي جاهزة تتفرم" : "See which muscles are ready to train",
    viewAll: isAr ? "شوف كله" : "View All",
    readyToLift: isAr ? "جاهزة للدمار" : "READY TO LIFT",
    hoursRemaining: (h: number) => isAr ? `متبقي ${h} ساعة` : `${h}h remaining`,
    thisWeek: isAr ? "هذا الأسبوع" : "This Week",
    focusWhereThisWeek: isAr ? "تعرّف على عضلات تمرينك" : "See where you focused your workouts this week",
    suggestedGoal: isAr ? "هدفك الأسبوع ده" : "Suggested Goal",
    workoutsPerWeek: (n: number) => isAr ? `${n} تدريبات أسبوعياً` : `${n} workouts weekly`,
    completed: isAr ? "خلصتها" : "completed",
    setGoal: isAr ? "ظبط الهدف" : "Change Goal",
    thisMonthFocus: isAr ? "الشهر ده" : "This Month",
    whereFocusedMore: isAr ? "شوف ركزت على إيه أكتر" : "See where you focused more",
    exerciseLog: isAr ? "سجل التمارين" : "Exercise Log",
    personalRecordsTitle: isAr ? "أرقامك القياسية" : "Personal Records",
    prsDesc: isAr ? "شوف أعلى أوزان شلتها وتطورك" : "Track your strongest lifts over time",
    addFriendsTitle: isAr ? "شجع صحابك واتشجعوا!" : "Double your gains, double the fun!",
    addFriendsDesc: isAr ? "شير فورمتك مع أصحابك وادعموا بعض في الجيم." : "Inspire friends with your fitness journey and support each other.",
    addFriendsBtn: isAr ? "ضيف أصحابك" : "Add Friends",
    avgRecovery: isAr ? "متوسط استشفاء العضلات حسب تمرينات آخر ٧ أيام" : "Average recovery for all muscles based on training over the last 7 days",
    muscleStatusLabel: isAr ? "حالة العضلة والوقت عشان ترتاح" : "Muscle status & recovery countdown",
    addWeightLog: isAr ? "سجل وزن ومقاسات جديدة ⚖️" : "Log New Weight & Metrics ⚖️",
    weightLabel: isAr ? "الوزن (كجم)" : "Weight (kg)",
    fatLabel: isAr ? "نسبة الدهون (%)" : "Body Fat (%)",
    waistLabel: isAr ? "محيط الوسط (سم)" : "Waist (cm)",
    chestLabel: isAr ? "محيط الصدر (سم)" : "Chest (cm)",
    saveBtn: isAr ? "حفظ" : "إحفظ",
    cancelBtn: isAr ? "إلغاء" : "Cancel",
    beforeAfterTitle: isAr ? "مقارنة الصور ⚡" : "Interactive Before & After ⚡",
    uploadPhotoBtn: isAr ? "ارفع صورة لتطورك" : "Upload New Progress Photo",
    photoHistoryTitle: isAr ? "صورك القديمة" : "Photo History",
  };

  const getMuscleLabel = (muscle: string) => {
    if (!isAr) return muscle;
    const map: { [key: string]: string } = {
      Chest: "الصدر",
      Back: "الظهر",
      Legs: "الأرجل",
      Shoulders: "الأكتاف",
      Arms: "الذراعين",
      Core: "البطن"
    };
    return map[muscle] || muscle;
  };

  const getCategory = (ex: any): string => {
    const mGroup = (ex.muscleGroup || "").toLowerCase();
    const target = (ex.target || "").toLowerCase();
    const exName = (ex.exerciseName || "").toLowerCase();
    const combined = mGroup + " " + target + " " + exName;
    
    if (combined.includes("chest") || combined.includes("pectoral") || combined.includes("bench")) return "Chest";
    if (combined.includes("back") || combined.includes("lat") || combined.includes("trap") || combined.includes("row") || combined.includes("pullup")) return "Back";
    if (combined.includes("quad") || combined.includes("ham") || combined.includes("glute") || combined.includes("leg") || combined.includes("squat") || combined.includes("calf")) return "Legs";
    if (combined.includes("delt") || combined.includes("shoulder") || combined.includes("press")) return "Shoulders";
    if (combined.includes("biceps") || combined.includes("triceps") || combined.includes("arm") || combined.includes("curl")) return "Arms";
    if (combined.includes("abs") || combined.includes("core") || combined.includes("oblique") || combined.includes("crunch")) return "Core";
    return "";
  };

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // Load all overview statistics & calculate muscle recovery / week history
  useEffect(() => {
    async function loadData() {
      if (isDemoMode) {
        setStreak(12);
        setTotalStats({
          totalWorkouts: 34,
          totalVolume: 128500,
          totalDuration: 112200,
        });

        // 4 Mock PRs with realistic 1RMs
        const mockPRs = [
          { exerciseId: "demo-ex-bench", exerciseName: isAr ? "بنش بريس بالبار" : "Barbell Bench Press", maxWeight: 100, reps: 6, date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
          { exerciseId: "demo-ex-squat", exerciseName: isAr ? "اسكوات بالبار" : "Barbell Squat", maxWeight: 130, reps: 5, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
          { exerciseId: "demo-ex-row", exerciseName: isAr ? "سحب ظهر بالبار" : "Barbell Row", maxWeight: 85, reps: 8, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
          { exerciseId: "demo-ex-ohp", exerciseName: isAr ? "بريس كتف بالبار" : "Barbell Overhead Press", maxWeight: 65, reps: 5, date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() }
        ];
        setPersonalRecords(mockPRs);

        // Helper for week keys
        const getWKey = (d: Date) => {
          const startOfYear = new Date(d.getFullYear(), 0, 1);
          const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
          const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
          return `W${weekNum}`;
        };

        // Mock 8 weeks volume and tonnage with positive trend
        const mockVolumeData = [];
        for (let i = 7; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i * 7);
          const w = getWKey(d);
          mockVolumeData.push({
            week: w,
            volume: 18000 + (7 - i) * 1500 + Math.floor(Math.random() * 800)
          });
        }
        setWeeklyVolume(mockVolumeData);
        setWeeklyTonnage(mockVolumeData.map(v => ({ week: v.week, tonnage: v.volume / 1000 })));

        // Mock muscle group volume focus stats
        setMuscleGroupStats([
          { muscle: "Chest", volume: 28400 },
          { muscle: "Back", volume: 24500 },
          { muscle: "Legs", volume: 32100 },
          { muscle: "Shoulders", volume: 18400 },
          { muscle: "Arms", volume: 15200 },
          { muscle: "Core", volume: 9800 },
        ]);

        // Mock weekly set volume
        setWeeklySetVolume([
          { muscle: "Chest", sets: 18 },
          { muscle: "Back", sets: 15 },
          { muscle: "Legs", sets: 20 },
          { muscle: "Shoulders", sets: 12 },
          { muscle: "Arms", sets: 14 },
          { muscle: "Core", sets: 8 },
        ]);

        // Mock workout density data
        const mockDensity = [];
        for (let i = 84; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          // Log on approx 40% of days
          const isLogged = (i % 3 === 0) || (i % 7 === 1);
          mockDensity.push({
            date: dateStr,
            count: isLogged ? 1 + (i % 2) : 0,
          });
        }
        setWorkoutDensity(mockDensity);

        // Generate mock sessions spanning the current week & previous weeks
        const now = new Date();
        const subDays = (d: Date, days: number) => {
          const res = new Date(d);
          res.setDate(res.getDate() - days);
          return res;
        };

        const mockSessions = [
          {
            id: "demo-s1",
            name: isAr ? "تمرين دفع علوي" : "Push Power Day",
            routineName: isAr ? "تمرين دفع علوي" : "Push Power Day",
            date: now.toISOString(),
            duration: 3600,
            completed: true,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-bench",
                exerciseName: isAr ? "بنش بريس بالبار" : "Barbell Bench Press",
                muscleGroup: "Chest",
                sets: [
                  { weight: 80, reps: 10, completed: true },
                  { weight: 90, reps: 8, completed: true },
                  { weight: 100, reps: 6, completed: true },
                ]
              },
              {
                exerciseId: "demo-ex-ohp",
                exerciseName: isAr ? "بريس كتف بالبار" : "Barbell Overhead Press",
                muscleGroup: "Shoulders",
                sets: [
                  { weight: 50, reps: 8, completed: true },
                  { weight: 60, reps: 6, completed: true },
                  { weight: 65, reps: 5, completed: true },
                ]
              },
              {
                exerciseId: "demo-ex-tricep",
                exerciseName: isAr ? "ترايسبس بوش داون" : "Triceps Cable Pushdown",
                muscleGroup: "Arms",
                sets: [
                  { weight: 25, reps: 12, completed: true },
                  { weight: 30, reps: 10, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s2",
            name: isAr ? "تمرين سحب لظهر قوي" : "Pull Strength Day",
            routineName: isAr ? "تمرين سحب لظهر قوي" : "Pull Strength Day",
            date: subDays(now, 1).toISOString(),
            duration: 4200,
            completed: true,
            createdAt: subDays(now, 1).toISOString(),
            updatedAt: subDays(now, 1).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-row",
                exerciseName: isAr ? "سحب ظهر بالبار" : "Barbell Row",
                muscleGroup: "Back",
                sets: [
                  { weight: 70, reps: 10, completed: true },
                  { weight: 80, reps: 8, completed: true },
                  { weight: 85, reps: 8, completed: true },
                ]
              },
              {
                exerciseId: "demo-ex-bicep",
                exerciseName: isAr ? "بايسبس كيرل بالدمبل" : "Dumbbell Biceps Curl",
                muscleGroup: "Arms",
                sets: [
                  { weight: 16, reps: 12, completed: true },
                  { weight: 18, reps: 10, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s3",
            name: isAr ? "تمرين رجل مدمر" : "Legs Hypertrophy",
            routineName: isAr ? "تمرين رجل مدمر" : "Legs Hypertrophy",
            date: subDays(now, 3).toISOString(),
            duration: 4500,
            completed: true,
            createdAt: subDays(now, 3).toISOString(),
            updatedAt: subDays(now, 3).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-squat",
                exerciseName: isAr ? "اسكوات بالبار" : "Barbell Squat",
                muscleGroup: "Legs",
                sets: [
                  { weight: 110, reps: 8, completed: true },
                  { weight: 120, reps: 6, completed: true },
                  { weight: 130, reps: 5, completed: true },
                ]
              },
              {
                exerciseId: "demo-ex-abs",
                exerciseName: isAr ? "بلانك تمرين بطن" : "Core Plank Board",
                muscleGroup: "Core",
                sets: [
                  { weight: 0, reps: 60, completed: true },
                  { weight: 0, reps: 60, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s4",
            name: isAr ? "كارديو وبطن" : "Cardio & Abs Core",
            routineName: isAr ? "كارديو وبطن" : "Cardio & Abs Core",
            date: subDays(now, 4).toISOString(),
            duration: 2400,
            completed: true,
            createdAt: subDays(now, 4).toISOString(),
            updatedAt: subDays(now, 4).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-abs-2",
                exerciseName: isAr ? "رفع أرجل معلق" : "Hanging Leg Raise",
                muscleGroup: "Core",
                sets: [
                  { weight: 0, reps: 15, completed: true },
                  { weight: 0, reps: 12, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s5",
            name: isAr ? "صدر وبايسبس" : "Chest & Arms Blast",
            routineName: isAr ? "صدر وبايسبس" : "Chest & Arms Blast",
            date: subDays(now, 6).toISOString(),
            duration: 3800,
            completed: true,
            createdAt: subDays(now, 6).toISOString(),
            updatedAt: subDays(now, 6).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-bench-incline",
                exerciseName: isAr ? "تجميع بنش مائل دمبل" : "Incline Dumbbell Press",
                muscleGroup: "Chest",
                sets: [
                  { weight: 32, reps: 10, completed: true },
                  { weight: 36, reps: 8, completed: true },
                ]
              },
              {
                exerciseId: "demo-ex-bicep-2",
                exerciseName: isAr ? "بايسبس كيرل بالبار" : "Barbell Curl",
                muscleGroup: "Arms",
                sets: [
                  { weight: 35, reps: 10, completed: true },
                  { weight: 40, reps: 8, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s6",
            name: isAr ? "تمرين ظهر مجمع" : "Full Back Workout",
            routineName: isAr ? "تمرين ظهر مجمع" : "Full Back Workout",
            date: subDays(now, 8).toISOString(),
            duration: 4100,
            completed: true,
            createdAt: subDays(now, 8).toISOString(),
            updatedAt: subDays(now, 8).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-pullup",
                exerciseName: isAr ? "عقلة بوزن الجسم" : "Bodyweight Pullups",
                muscleGroup: "Back",
                sets: [
                  { weight: 0, reps: 12, completed: true },
                  { weight: 0, reps: 10, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s7",
            name: isAr ? "أكتاف ترايسبس" : "Shoulders & Triceps",
            routineName: isAr ? "أكتاف ترايسبس" : "Shoulders & Triceps",
            date: subDays(now, 11).toISOString(),
            duration: 3500,
            completed: true,
            createdAt: subDays(now, 11).toISOString(),
            updatedAt: subDays(now, 11).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-lateral",
                exerciseName: isAr ? "رفرفة كتف جانبي" : "Lateral Dumbbell Raise",
                muscleGroup: "Shoulders",
                sets: [
                  { weight: 12, reps: 15, completed: true },
                  { weight: 14, reps: 12, completed: true },
                ]
              }
            ]
          },
          {
            id: "demo-s8",
            name: isAr ? "تمرين أرجل شامل" : "Posterior Leg Day",
            routineName: isAr ? "تمرين أرجل شامل" : "Posterior Leg Day",
            date: subDays(now, 15).toISOString(),
            duration: 4800,
            completed: true,
            createdAt: subDays(now, 15).toISOString(),
            updatedAt: subDays(now, 15).toISOString(),
            exercises: [
              {
                exerciseId: "demo-ex-rdl",
                exerciseName: isAr ? "ديدليفت روماني للهامسترينغ" : "Romanian Deadlift",
                muscleGroup: "Legs",
                sets: [
                  { weight: 80, reps: 12, completed: true },
                  { weight: 100, reps: 10, completed: true },
                ]
              }
            ]
          }
        ];
        setSessionsList(mockSessions);

        const workoutTrend = mockVolumeData.map((_, idx) => ({ value: 3 + Math.floor(idx / 2) }));
        const volumeTrend = mockVolumeData.map((v) => ({ value: v.volume || 0 }));
        const durationTrend = mockVolumeData.map((_, idx) => ({ value: 120 + idx * 25 + Math.floor(Math.random() * 30) }));

        setWorkoutSparkline(workoutTrend);
        setVolumeSparkline(volumeTrend);
        setDurationSparkline(durationTrend);

        // Muscle Recovery Map
        setMuscleRecovery({
          Chest: { percent: 92, hoursLeft: 4.2 },
          Back: { percent: 45, hoursLeft: 26.5 },
          Legs: { percent: 12, hoursLeft: 42.1 },
          Shoulders: { percent: 78, hoursLeft: 10.5 },
          Arms: { percent: 100, hoursLeft: 0 },
          Core: { percent: 60, hoursLeft: 19.2 },
        });

        // Worked this week map
        setWorkedThisWeek({
          Chest: 100,
          Back: 100,
          Legs: 100,
          Shoulders: 100,
          Arms: 100,
          Core: 100,
        });

        // Top 1RMs e1rms
        setE1rms([
          { exerciseName: isAr ? "بنش بريس بالبار" : "Barbell Bench Press", e1rm: 118 },
          { exerciseName: isAr ? "اسكوات بالبار" : "Barbell Squat", e1rm: 151 },
          { exerciseName: isAr ? "سحب ظهر بالبار" : "Barbell Row", e1rm: 107 },
          { exerciseName: isAr ? "بريس كتف بالبار" : "Barbell Overhead Press", e1rm: 75 }
        ]);

        return;
      }

      const [
        streakData,
        statsData,
        prsData,
        volumeData,
        tonnageData,
        muscleData,
        densityData,
        setVolumeData,
        allSessions,
      ] = await Promise.all([
        getWorkoutStreak(),
        getTotalStats(),
        getPersonalRecords(),
        getWeeklyVolume(10),
        getWeeklyTonnage(10),
        getMuscleGroupStats(exercises),
        getWorkoutDensity(),
        getWeeklySetVolume(exercises),
        db.workoutSessions.where("completed").equals(1).toArray(),
      ]);

      setStreak(streakData);
      setTotalStats(statsData);
      setPersonalRecords(prsData);
      setWeeklyVolume(volumeData);
      setWeeklyTonnage(tonnageData);
      setMuscleGroupStats(muscleData);
      setWorkoutDensity(densityData);
      setWeeklySetVolume(setVolumeData);
      setSessionsList(allSessions);

      // Helper for week keys
      const getWKey = (d: Date) => {
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `W${weekNum}`;
      };

      // Generate sparklines trends directly from actual workout sessions
      const workoutTrend = volumeData.map((v) => {
        const count = allSessions.filter((s) => getWKey(new Date(s.date)) === v.week).length;
        return { value: count };
      });
      const volumeTrend = volumeData.map((v) => ({ value: v.volume || 0 }));
      const durationTrend = volumeData.map((v) => {
        const totalSecs = allSessions
          .filter((s) => getWKey(new Date(s.date)) === v.week)
          .reduce((acc, s) => acc + (s.duration || 0), 0);
        return { value: Math.round(totalSecs / 60) };
      });

      setWorkoutSparkline(workoutTrend.length > 0 ? workoutTrend : [{ value: 0 }, { value: 0 }, { value: 0 }]);
      setVolumeSparkline(volumeTrend.length > 0 ? volumeTrend : [{ value: 0 }, { value: 0 }, { value: 0 }]);
      setDurationSparkline(durationTrend.length > 0 ? durationTrend : [{ value: 0 }, { value: 0 }, { value: 0 }]);

      // Muscle Recovery & Workouts This Week calculation
      const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
      const recoveryMap: Record<string, { percent: number; hoursLeft: number }> = {};
      const weeklyWorkedMap: Record<string, number> = {};

      const nowTime = Date.now();
      const oneWeekAgo = nowTime - 7 * 24 * 3600000;

      for (const muscle of MUSCLE_GROUPS) {
        // Find latest session for this muscle category
        const relevantSessions = allSessions.filter((s) => {
          return s.exercises.some((ex) => {
            const def = exercises.find((e) => String(e.id) === String(ex.exerciseId));
            const cat = getCategory(ex) || (def ? getCategory(def) : "");
            return cat === muscle;
          });
        });

        const latestSession = relevantSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!latestSession) {
          recoveryMap[muscle] = { percent: 100, hoursLeft: 0 };
        } else {
          const hoursElapsed = (nowTime - new Date(latestSession.date).getTime()) / 3600000;
          const hoursLeft = Math.max(0, 48 - hoursElapsed);
          const percent = Math.min(100, Math.round((hoursElapsed / 48) * 100));
          recoveryMap[muscle] = { percent, hoursLeft: Math.round(hoursLeft * 10) / 10 };
        }

        // Check if worked this week
        const workedThisWeekSessions = relevantSessions.filter((s) => new Date(s.date).getTime() >= oneWeekAgo);
        weeklyWorkedMap[muscle] = workedThisWeekSessions.length > 0 ? 100 : 0;
      }

      setMuscleRecovery(recoveryMap);
      setWorkedThisWeek(weeklyWorkedMap);

      // Top 1RMs
      const calculated1RMs = await Promise.all(
        prsData.slice(0, 4).map(async (pr) => {
          const e1rmData = await getEstimated1RM(pr.exerciseId);
          const best = e1rmData.length > 0 ? Math.max(...e1rmData.map((d) => d.e1rm)) : 0;
          return {
            exerciseName: pr.exerciseName,
            e1rm: best,
          };
        }),
      );
      setE1rms(calculated1RMs.filter((item) => item.e1rm > 0));
    }

    loadData();
  }, [exercises, isDemoMode]);

  // Load Measurements and Photos
  useEffect(() => {
    loadMeasurementsAndPhotos();
  }, [isDemoMode]);

  async function loadMeasurementsAndPhotos() {
    if (isDemoMode) {
      const mockMeasurements = [
        { id: "demo-m-1", date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(), weight: 82.5, bodyFat: 16.5, waist: 88, chest: 104, arms: 38.5, createdAt: "", updatedAt: "" },
        { id: "demo-m-2", date: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), weight: 81.8, bodyFat: 15.9, waist: 87, chest: 104.5, arms: 38.6, createdAt: "", updatedAt: "" },
        { id: "demo-m-3", date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), weight: 80.9, bodyFat: 15.2, waist: 85.5, chest: 105, arms: 38.8, createdAt: "", updatedAt: "" },
        { id: "demo-m-4", date: new Date().toISOString(), weight: 80.2, bodyFat: 14.7, waist: 84.8, chest: 105.5, arms: 39.0, createdAt: "", updatedAt: "" }
      ];
      setMeasurements(mockMeasurements);

      const mockPhotos = [
        {
          id: "demo-photo-1",
          date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          type: "front" as const,
          imageBlob: new Blob(),
          url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: "demo-photo-2",
          date: new Date().toISOString(),
          type: "front" as const,
          imageBlob: new Blob(),
          url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop",
          createdAt: new Date().toISOString()
        }
      ];
      setPhotos(mockPhotos);
      setBeforePhotoId("demo-photo-1");
      setAfterPhotoId("demo-photo-2");
      return;
    }

    const [measurementsData, photosData] = await Promise.all([
      db.bodyMeasurements.orderBy("date").reverse().toArray(),
      db.progressPhotos.orderBy("date").reverse().toArray(),
    ]);

    setMeasurements(measurementsData);

    const photosWithUrls = photosData.map((photo) => ({
      ...photo,
      url: URL.createObjectURL(photo.imageBlob),
    }));
    setPhotos(photosWithUrls);

    if (photosWithUrls.length >= 2) {
      setBeforePhotoId(photosWithUrls[photosWithUrls.length - 1].id || "");
      setAfterPhotoId(photosWithUrls[0].id || "");
    }
  }

  // Goal Progress Calculator
  const getGoalProgress = (goal: WorkoutGoal) => {
    if (goal.type === "weekly_workouts") {
      const { start, end } = getStartAndEndOfWeek();
      return sessionsList.filter((s) => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      }).length;
    }
    if (goal.type === "monthly_volume") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      let vol = 0;
      sessionsList
        .filter((s) => {
          const d = new Date(s.date);
          return d >= start && d <= end;
        })
        .forEach((s) => {
          s.exercises.forEach((ex: any) => {
            ex.sets.forEach((set: any) => {
              if (set.completed) {
                vol += (Number(set.weight) || 0) * (Number(set.reps) || 0);
              }
            });
          });
        });
      return vol;
    }
    return 0;
  };

  // Submit new measurement
  const handleAddMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurementForm.weight) return;

    const measurement: BodyMeasurement = {
      id: uid(),
      date: new Date().toISOString(),
      weight: Number(measurementForm.weight),
      bodyFat: measurementForm.bodyFat ? Number(measurementForm.bodyFat) : undefined,
      waist: measurementForm.waist ? Number(measurementForm.waist) : undefined,
      chest: measurementForm.chest ? Number(measurementForm.chest) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.bodyMeasurements.add(measurement);
    setMeasurementForm({ weight: "", bodyFat: "", waist: "", chest: "" });
    setShowAddMeasurement(false);
    loadMeasurementsAndPhotos();
  };

  // Photo uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const photo: ProgressPhoto = {
      id: uid(),
      date: new Date().toISOString(),
      type: "front",
      imageBlob: file,
      createdAt: new Date().toISOString(),
    };

    await db.progressPhotos.add(photo);
    loadMeasurementsAndPhotos();
  };

  const deletePhoto = async (id: string) => {
    if (!confirm(isAr ? "متأكد إنك عايز تمسح الصورة دي؟" : "Are you sure you want to delete this photo?")) return;
    await db.progressPhotos.delete(id);
    loadMeasurementsAndPhotos();
  };

  // Goals load/save
  useEffect(() => {
    const stored = localStorage.getItem("pulse_workout_goals");
    if (stored) {
      try {
        setGoals(JSON.parse(stored));
      } catch (e) {
        setGoals(DEFAULT_GOALS);
      }
    } else {
      localStorage.setItem("pulse_workout_goals", JSON.stringify(DEFAULT_GOALS));
      setGoals(DEFAULT_GOALS);
    }
  }, []);

  const saveGoals = (newGoals: WorkoutGoal[]) => {
    setGoals(newGoals);
    localStorage.setItem("pulse_workout_goals", JSON.stringify(newGoals));
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTarget || isNaN(Number(goalTarget))) return;

    const newGoal: WorkoutGoal = {
      id: uid(),
      type: goalType,
      target: Number(goalTarget),
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);
    setShowGoalModal(false);
  };

  // Calendar Heatmap Strip Calculations
  const getWeeklyCalendarStrip = () => {
    const strip = [];
    const now = new Date();
    // Start from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isSessionLogged = sessionsList.some((s) => {
        const sd = new Date(s.date);
        return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      });
      strip.push({
        date: d,
        dateNum: d.getDate(),
        dayLabel: d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "narrow" }),
        active: isSessionLogged,
        isToday: i === 0,
      });
    }
    return strip;
  };

  const calendarStrip = getWeeklyCalendarStrip();

  // Selected comparison photos mapping
  const beforePhoto = photos.find((p) => p.id === beforePhotoId);
  const afterPhoto = photos.find((p) => p.id === afterPhotoId);

  return (
    <div className="space-y-6 pb-20 pt-2 animate-fade-in" dir={isAr ? "rtl" : "ltr"}>
      {/* ── 3D Analytics Hero Banner ── */}
      <div className="relative w-full h-32 md:h-40 rounded-2xl overflow-hidden border border-border/60 shadow-xl group">
        <img
          src={statsAnalyticsImg}
          alt="3D Fitness Analytics Illustration"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/90 via-bg-surface/60 to-transparent flex flex-col justify-center p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 border border-primary/30 px-2.5 py-0.5 rounded-md self-start mb-1 backdrop-blur-md">
            {isAr ? "تحليلات متقدمة 3D" : "3D ANALYTICS ENGINE"}
          </span>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-text-primary">
            {isAr ? "إحصائيات الأداء والتطور" : "Performance & Growth Stats"}
          </h1>
          <p className="text-xs text-text-muted font-bold mt-0.5 max-w-md">
            {isAr ? "تتبع الأحمال، حجم التمارين، وتوزيع الاستشفاء بدقة عالية" : "Track volume, personal records, and recovery balance in real-time"}
          </p>
        </div>
      </div>

      {/* ── Top Premium Viewport Sub-Tabs Navigation ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface/80 backdrop-blur-md rounded-2xl border border-border/50 overflow-x-auto no-scrollbar shadow-inner">
          {[
            { id: "overview", label: t.overview, icon: Activity },
            { id: "history", label: isAr ? "السجل ⏱️" : "History ⏱️", icon: Clock },
            { id: "exercises", label: t.exercises, icon: Dumbbell },
            { id: "measurements", label: t.measurements, icon: Scale },
            { id: "photos", label: t.photos, icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (typeof navigator !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                }}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 select-none",
                  isActive
                    ? "text-primary-text font-black"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-surface-hover/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSubTabPill"
                    className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 justify-between w-full sm:w-auto sm:justify-end flex-wrap">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full shadow-sm">
              ⚡ ANALYTICS PRO
            </span>
          </div>

          {/* Preview Demo Mode Toggle Switch */}
          <div className="flex items-center gap-2.5 p-1.5 px-3 bg-bg-surface/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm">
            <Sparkles size={14} className={cn("transition-colors", isDemoMode ? "text-primary animate-pulse" : "text-text-muted")} />
            <span className="text-xs font-black text-text-primary select-none">
              {isAr ? "وضع المعاينة التجريبي" : "Preview Demo Mode"}
            </span>
            <button
              id="demo-mode-toggle"
              onClick={() => {
                setDemoMode(!isDemoMode);
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  navigator.vibrate([15, 15]);
                }
              }}
              className={cn(
                "relative w-9 h-5 rounded-full transition-colors duration-300 outline-none cursor-pointer focus:ring-1 focus:ring-primary/40 flex items-center",
                isDemoMode ? "bg-primary" : "bg-neutral-800"
              )}
              aria-label="Toggle demo mode"
            >
              <motion.div
                layout
                className={cn(
                  "absolute w-4 h-4 rounded-full shadow-md",
                  isDemoMode ? "bg-bg-surface" : "bg-text-muted"
                )}
                initial={false}
                animate={{ x: isDemoMode ? 16 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── TAB 1: OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview-tab"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Consistency Heatmap */}
            <motion.div
              className="rounded-[--radius-card] glass-card p-5"
              variants={staggerItem}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">
                    {isAr ? "نشاط التدريب" : "Training Activity"}
                  </h2>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                    {isAr ? "الاستمرارية في آخر ١٢ أسبوع" : "Consistency over last 12 weeks"}
                  </p>
                </div>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <WorkoutHeatmap data={workoutDensity} isAr={isAr} />
            </motion.div>

            {/* Advanced Weekly Volume Tracking */}
            <motion.div
              className="rounded-2xl bg-bg-surface p-5 border border-border/50 relative z-10"
              variants={staggerItem}
            >
              <WeeklyVolumeTarget data={weeklySetVolume} isAr={isAr} />
            </motion.div>

            {/* ── Horizontally Scrollable KPI Sparkline Carousel ── */}
            <motion.div variants={staggerItem} className="relative group overflow-hidden">
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth" id="metric-carousel">
                {/* Workouts Slide */}
                <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                        {isAr ? "التمارين" : "Workouts Completed"}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold">
                        {t.compared3Months}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-black text-text-primary tabular-nums">
                        <AnimatedCounter value={totalStats.totalWorkouts} />
                      </span>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                        {isAr ? "تمرينات" : "Sessions"}
                      </span>
                    </div>
                  </div>
                  {/* Miniature Sparkline */}
                  <div className="h-16 w-full -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={workoutSparkline}>
                        <defs>
                           <linearGradient id="workoutGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#CCFF00" strokeWidth={1.5} fillOpacity={1} fill="url(#workoutGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Training Volume Slide */}
                <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                        {t.volume}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold">
                        {isAr ? "كجم توتال" : "Total Tonnage"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-black text-text-primary tabular-nums">
                        <AnimatedCounter
                          value={totalStats.totalVolume >= 1000 ? totalStats.totalVolume / 1000 : totalStats.totalVolume}
                          formatter={(v) => totalStats.totalVolume >= 1000 ? v.toFixed(1) : Math.round(v).toString()}
                        />
                      </span>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                        {totalStats.totalVolume >= 1000 ? t.ton : t.kg}
                      </span>
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="h-16 w-full -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volumeSparkline}>
                        <defs>
                           <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} fillOpacity={1} fill="url(#volGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Duration Slide */}
                <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">
                        {t.duration}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono font-bold">
                        {t.totalEffort}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl font-black text-text-primary tabular-nums">
                        <AnimatedCounter value={totalStats.totalDuration / 60} />
                      </span>
                      <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
                        {isAr ? "ساعة" : "hours"}
                      </span>
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="h-16 w-full -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={durationSparkline}>
                        <defs>
                           <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={1.5} fillOpacity={1} fill="url(#durGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Slider indicators matching the video's three-dot list */}
              <div className="flex justify-center gap-1.5 mt-3">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCarouselIndex(idx);
                      const el = document.getElementById("metric-carousel");
                      if (el) {
                        const width = el.clientWidth;
                        el.scrollTo({ left: width * idx, behavior: "smooth" });
                      }
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      carouselIndex === idx ? "w-4 bg-primary" : "w-1.5 bg-bg-surface-hover"
                    )}
                  />
                ))}
              </div>
            </motion.div>

            {/* ── Muscle Recovery Tracker Bento Widget ── */}
            <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {t.muscleRecoveryTitle} 🩺
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold">
                    {t.anyReadyToTrain}
                  </p>
                </div>
                <button
                  onClick={() => setIsRecoveryModalOpen(true)}
                  className="text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider"
                >
                  {t.viewAll}
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {Object.entries(muscleRecovery).map(([muscle, stats]) => {
                  const isFresh = stats.percent === 100;
                  const isSore = stats.percent < 40;

                  let colorClass = "bg-primary";
                  let textClass = "text-primary";
                  let borderClass = "border-primary/20";
                  if (isSore) {
                    colorClass = "bg-red-500";
                    textClass = "text-red-400";
                    borderClass = "border-red-500/20";
                  } else if (stats.percent < 100) {
                    colorClass = "bg-yellow-500";
                    textClass = "text-yellow-400";
                    borderClass = "border-yellow-500/20";
                  }

                  return (
                    <button
                      key={muscle}
                      onClick={() => setIsRecoveryModalOpen(true)}
                      className={cn(
                        "p-3 rounded-xl border bg-bg-surface-hover flex flex-col justify-between h-24 min-w-[110px] transition-all hover:bg-bg-elevated cursor-pointer shrink-0 text-right",
                        borderClass
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                          {getMuscleLabel(muscle)}
                        </span>
                        <span className={cn("text-xs font-mono font-black", textClass)}>
                          <AnimatedCounter value={stats.percent} />%
                        </span>
                      </div>

                      <div className="space-y-1 w-full">
                        <div className="h-1.5 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", colorClass)} style={{ width: `${stats.percent}%` }} />
                        </div>
                        <p className="text-[8px] text-text-muted font-bold uppercase tracking-wider font-mono truncate">
                          {isFresh ? t.readyToLift : t.hoursRemaining(stats.hoursLeft)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── "الأسبوع ده" (This Week) Anatomy & Calendar Streak ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {t.thisWeek} 📊
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold">
                    {t.focusWhereThisWeek}
                  </p>
                </div>

                {/* 3D-like muscular vector mapping of active muscles this week */}
                <div className="py-2 flex flex-col items-center bg-bg-surface/20 rounded-2xl border border-border">
                  <AnatomyModel
                    muscleLevels={workedThisWeek}
                    view="both"
                    highlightColor="red"
                    isAr={isAr}
                    onMuscleClick={(muscle) => setSelectedMuscle(muscle)}
                  />
                  <button
                    onClick={() => {
                      document.getElementById("radar-focus")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-2 text-[10px] font-black text-primary hover:text-primary-light uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{isAr ? "شاهد أين تركز هذا الأسبوع" : "See where you focused this week"}</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Calendar strip showing filled workout indicators */}
                <div className="flex justify-between bg-bg-surface p-2.5 rounded-xl border border-border mt-2">
                  {calendarStrip.map((day, idx) => {
                    const isSelected = selectedDate && 
                      selectedDate.getDate() === day.date.getDate() && 
                      selectedDate.getMonth() === day.date.getMonth() && 
                      selectedDate.getFullYear() === day.date.getFullYear();

                    const toggleDateSelection = (d: Date) => {
                      if (selectedDate && 
                          selectedDate.getDate() === d.getDate() && 
                          selectedDate.getMonth() === d.getMonth() && 
                          selectedDate.getFullYear() === d.getFullYear()) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(d);
                      }
                    };

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <span className="text-[9px] text-text-muted font-bold uppercase">
                          {day.dayLabel}
                        </span>
                        <button
                          onClick={() => toggleDateSelection(day.date)}
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all relative cursor-pointer outline-none",
                            isSelected
                              ? "ring-2 ring-primary bg-primary/20 border border-primary text-primary scale-115 font-black shadow-lg shadow-primary/20"
                              : day.active
                              ? "bg-primary border-primary text-primary-text shadow-md shadow-primary/20 scale-105 font-black hover:brightness-110"
                              : day.isToday
                              ? "bg-bg-surface-hover border border-border text-text-primary hover:bg-bg-elevated"
                              : "bg-bg-surface-hover text-text-muted border border-border hover:bg-bg-elevated hover:text-text-secondary"
                          )}
                        >
                          {day.dateNum}
                          {day.active && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-bg-surface rounded-full border border-primary" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* ── Suggested Goal Widget ── */}
              {goals.map((goal) => {
                if (goal.type !== "weekly_workouts") return null;
                const progress = getGoalProgress(goal);
                const percent = Math.min(Math.round((progress / goal.target) * 100), 100);
                // SVG circular parameters
                const radius = 32;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percent / 100) * circumference;

                return (
                  <motion.div key={goal.id} variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                        {t.suggestedGoal} 🏆
                      </h3>
                      <p className="text-xs text-text-secondary font-bold mt-2">
                        {t.workoutsPerWeek(goal.target)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between my-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r={radius}
                              stroke="#1E1E24"
                              strokeWidth="6"
                              fill="transparent"
                            />
                            <motion.circle
                              cx="40"
                              cy="40"
                              r={radius}
                              stroke="#CCFF00"
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: offset }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                            <span className="text-base text-text-primary font-mono"><AnimatedCounter value={percent} />%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted font-bold">
                            {isAr ? "تم إكمال" : "Completed"}
                          </p>
                          <p className="text-xl font-black text-text-primary font-mono">
                            <AnimatedCounter value={progress} /> / {goal.target}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab("exercises")}
                      >
                        {t.setGoal}
                      </Button>
                    </div>

                    <p className="text-[10px] text-text-muted font-semibold uppercase leading-relaxed">
                      {isAr
                        ? "استمر في التقدم لتحقيق رصيدك الأسبوعي وتثبيت روتين لياقتك!"
                        : "Keep moving to hit your weekly streak and solidifying your gym routine!"}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* ── SELECTED DAY PERFORMANCE BREAKDOWN ── */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="glass-card rounded-[--radius-card] p-5 border border-primary/30 bg-primary/5 space-y-4 shadow-lg">
                    {/* Header with Close */}
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <span className="text-[10px] text-primary font-extrabold uppercase tracking-widest block mb-0.5">
                            {isAr ? "تحليل أداء اليوم المختار" : "SELECTED DAY PERFORMANCE"}
                          </span>
                          <h4 className="text-base font-black text-text-primary">
                            {selectedDate.toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </h4>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-1.5 bg-bg-surface border border-border rounded-lg hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metrics Row */}
                    {(() => {
                      const daySessions = sessionsList.filter((s) => {
                        const sd = new Date(s.date);
                        return sd.getDate() === selectedDate.getDate() && sd.getMonth() === selectedDate.getMonth() && sd.getFullYear() === selectedDate.getFullYear();
                      });

                      const totalVol = daySessions.reduce((acc, session) => {
                        return acc + (session.exercises || []).reduce((eAcc: number, ex: any) => {
                          return eAcc + (ex.sets || []).reduce((sAcc: number, set: any) => sAcc + (set.weight || 0) * (set.reps || 0), 0);
                        }, 0);
                      }, 0);

                      const totalSecs = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
                      const totalMins = Math.round(totalSecs / 60);

                      if (daySessions.length === 0) {
                        return (
                          <div className="text-center py-6 text-text-muted">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs font-bold">
                              {isAr ? "لا توجد تمارين مسجلة في هذا اليوم." : "No workouts logged on this day."}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {/* Bento Metrics widgets */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-bg-surface/60 p-3 rounded-xl border border-border/30 text-center">
                              <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider mb-0.5">
                                {isAr ? "التمارين" : "Workouts"}
                              </span>
                              <span className="text-sm font-black text-text-primary font-mono">
                                <AnimatedCounter value={daySessions.length} />
                              </span>
                            </div>
                            <div className="bg-bg-surface/60 p-3 rounded-xl border border-border/30 text-center">
                              <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider mb-0.5">
                                {isAr ? "الحجم الكلي" : "Total Vol"}
                              </span>
                              <span className="text-sm font-black text-primary font-mono">
                                <AnimatedCounter value={totalVol} /> <span className="text-[9px] font-bold">{isAr ? "كجم" : "kg"}</span>
                              </span>
                            </div>
                            <div className="bg-bg-surface/60 p-3 rounded-xl border border-border/30 text-center">
                              <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider mb-0.5">
                                {isAr ? "الوقت" : "Duration"}
                              </span>
                              <span className="text-sm font-black text-text-primary font-mono">
                                <AnimatedCounter value={totalMins} /> <span className="text-[9px] font-bold">{isAr ? "دقائق" : "min"}</span>
                              </span>
                            </div>
                          </div>

                          {/* Exercises Details */}
                          <div className="space-y-2.5 pt-2 border-t border-border/30">
                            <span className="text-[10px] font-black text-text-primary uppercase tracking-wider block">
                              🏋️ {isAr ? "التمارين والمجموعات المنجزة:" : "Exercises & Completed Sets:"}
                            </span>
                            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                              {daySessions.map((session, sessionIdx) => (
                                <div key={sessionIdx} className="space-y-2 bg-bg-surface/30 p-2.5 rounded-xl border border-border/10">
                                  <div className="flex justify-between items-center text-[11px] font-extrabold text-primary uppercase tracking-wider">
                                    <span>{session.routineName || (isAr ? "حصة تدريبية" : "Workout Session")}</span>
                                    <span className="text-[10px] text-text-muted font-mono">
                                      {new Date(session.date).toLocaleTimeString(isAr ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                                    {(session.exercises || []).map((ex: any, exIdx: number) => (
                                      <div key={exIdx} className="bg-bg-surface-hover/50 border border-border/30 rounded-xl p-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <h5 className="text-xs font-black text-text-primary">{ex.exerciseName}</h5>
                                            <span className="text-[8px] font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                                              {getMuscleLabel(ex.muscleGroup)}
                                            </span>
                                          </div>
                                          <span className="text-[10px] font-bold font-mono text-text-muted">
                                            {ex.sets.length} {isAr ? "مجاميع" : "sets"}
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/10">
                                          {ex.sets.map((set: any, setIdx: number) => (
                                            <span
                                              key={setIdx}
                                              className="text-[9px] font-bold bg-bg-surface/80 border border-border/50 px-2 py-0.5 rounded-lg text-text-secondary tabular-nums"
                                            >
                                              {isAr ? `م${setIdx + 1}:` : `S${setIdx + 1}:`}{" "}
                                              <strong className="text-primary">{set.weight}</strong>
                                              {isAr ? " كجم" : "kg"}{" × "}
                                              <strong className="text-text-primary">{set.reps}</strong>
                                              {isAr ? " تكرار" : " reps"}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── This Month Focus Radar Chart ── */}
            <motion.div variants={staggerItem} id="radar-focus" className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {t.thisMonthFocus} 🎯
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold">
                    {t.whereFocusedMore}
                  </p>
                </div>
              </div>

              {muscleGroupStats.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={muscleGroupStats}>
                      <PolarGrid stroke="#27272A" />
                      <PolarAngleAxis
                        dataKey="muscle"
                        tick={{ fill: "#A1A1AA", fontSize: 10, textAnchor: "middle" }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={false} axisLine={false} />
                      <Radar
                        name="Volume"
                        dataKey="volume"
                        stroke="#CCFF00"
                        fill="#CCFF00"
                        fillOpacity={0.35}
                        animationDuration={1000}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1C1F",
                          border: "1px solid #27272A",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#F5F5F7" }}
                        formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Volume"]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <DataEmptyState
                  icon={Activity}
                  title={isAr ? "لا توجد بيانات تركيز" : "No Muscle Focus Data"}
                  description={isAr ? "سجل بعض التدريبات لتتمكن من رؤية مخطط تركيز العضلات ثلاثي الأبعاد." : "Log some workouts to see your interactive 3D muscle focus radar chart."}
                  actionLabel={isAr ? "ابدأ تمرينك الأول" : "Start First Workout"}
                  onAction={() => navigate({ to: "/" })}
                />
              )}
            </motion.div>

            {/* ── Exercise Log Trends (Bar Chart) ── */}
            <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {t.exerciseLog} 📈
                </h3>
              </div>

              {weeklyTonnage.length > 0 && weeklyTonnage.some((w) => w.tonnage > 0) ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTonnage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                      <XAxis
                        dataKey="week"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1A1AA", fontSize: 9 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#A1A1AA", fontSize: 10 }}
                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1C1F",
                          border: "1px solid #27272A",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#F5F5F7" }}
                        formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Tonnage"]}
                      />
                      <Bar dataKey="tonnage" fill="#CCFF00" radius={[4, 4, 0, 0]} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <DataEmptyState
                  icon={TrendingUp}
                  title={isAr ? "لا توجد اتجاهات للتمرين" : "No Trends Yet"}
                  description={isAr ? "سجل تدريباتك لتتبع كمية ومستوى تقدم الأحمال بمرور الوقت." : "Log your training sessions to track your volume load trends over time."}
                  actionLabel={isAr ? "سجل تمرينك الآن" : "Log a Workout"}
                  onAction={() => navigate({ to: "/" })}
                />
              )}
            </motion.div>

            {/* ── Personal Records Feed (PRs) ── */}
            <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                    {t.personalRecordsTitle} 🏆
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold">
                    {t.prsDesc}
                  </p>
                </div>
              </div>

              {personalRecords.length > 0 ? (
                <div className="space-y-3">
                  {personalRecords.slice(0, 5).map((pr, idx) => (
                    <button
                      key={String(pr.exerciseId)}
                      onClick={async () => {
                        if (selectedPrId === pr.exerciseId) {
                          setSelectedPrId(null);
                          return;
                        }
                        setSelectedPrId(pr.exerciseId);
                        const history = await getEstimated1RM(pr.exerciseId);
                        setPrHistory(history);
                      }}
                      className={cn(
                        "w-full text-left bg-bg-surface-hover/40 border border-border rounded-xl p-3 flex flex-col transition-all",
                        selectedPrId === pr.exerciseId ? "ring-2 ring-primary border-primary/30 bg-bg-surface-hover/80" : "hover:bg-bg-surface-hover/60"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-border overflow-hidden relative shrink-0 shadow-sm">
                            {getPrImageUrl(pr) ? (
                              <>
                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                                  <Dumbbell className="h-5 w-5 text-neutral-300 animate-pulse" />
                                </div>
                                <img
                                  src={getPrImageUrl(pr)!}
                                  alt={pr.exerciseName}
                                  className="w-full h-full object-contain p-1 relative z-10 transition-transform duration-300 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                <Trophy className={cn("h-5 w-5 transition-colors", selectedPrId === pr.exerciseId ? "text-primary animate-bounce" : "text-warning animate-pulse")} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-text-primary capitalize truncate">
                              {pr.exerciseName}
                            </p>
                            <p className="text-[10px] text-text-muted font-semibold font-mono">
                              {new Date(pr.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <p className="text-sm font-black text-warning tabular-nums whitespace-nowrap">
                            <AnimatedCounter value={pr.maxWeight} />
                            <span className="text-[10px] text-text-muted font-bold ml-0.5 uppercase tracking-tighter">kg</span>
                          </p>
                          <ChevronDown className={cn("h-4 w-4 text-text-muted/50 transition-transform", selectedPrId === pr.exerciseId && "rotate-180")} />
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPrId === pr.exerciseId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="w-full overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <PRProgressChart data={prHistory} isAr={isAr} />
                              <div className="mt-2 flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">
                                <span>{isAr ? "تطور القوة (1RM التقريبي)" : "Estimated 1RM Progression"}</span>
                                <span className="text-primary">
                                  <AnimatedCounter value={prHistory.length > 0 ? Math.round(prHistory[prHistory.length - 1].e1rm) : 0} /> kg
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              ) : (
                <DataEmptyState
                  icon={Trophy}
                  title={isAr ? "لا توجد أرقام قياسية" : "No Records Yet"}
                  description={isAr ? "سجل مجموعات التدريبات الخاصة بك لتسجيل أقوى رافعاتك الأسطورية هنا!" : "Start logging workout sets to see your legendary lifts and strength milestones!"}
                  actionLabel={isAr ? "حطم رقمك القياسي" : "Log a Set"}
                  onAction={() => navigate({ to: "/" })}
                />
              )}
            </motion.div>

            {/* ── Add Friends / Social Share widget matching video's cute character block ── */}
            <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border bg-gradient-to-r from-primary/10 to-transparent flex flex-col sm:flex-row items-center gap-5">
              <div className="relative flex shrink-0">
                <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center font-black text-white text-sm z-10 shadow-lg">
                  ⚡
                </div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black text-primary-text text-sm -ml-4 shadow-lg border-2 border-border">
                  👥
                </div>
              </div>
              <div className="flex-1 text-center sm:text-right">
                <h4 className="text-sm font-black text-text-primary">
                  {t.addFriendsTitle}
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  {t.addFriendsDesc}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate({ to: "/feed" })}
              >
                {t.addFriendsBtn}
                <Users className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ── TAB 2: EXERCISES TAB ── */}
        {activeTab === "exercises" && (
          <motion.div
            key="exercises-tab"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div variants={staggerItem}>
              <ExerciseProgressChart />
            </motion.div>

            {/* Top 1RM Progress list */}
            <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  Estimated 1RM Achievements
                </h3>
              </div>

              {e1rms.length > 0 ? (
                <div className="space-y-3">
                  {e1rms.map((pr) => (
                    <div
                      key={pr.exerciseName}
                      className="bg-bg-surface-hover border border-border rounded-xl p-3 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-text-primary capitalize">{pr.exerciseName}</span>
                      <span className="text-sm font-black text-primary font-mono"><AnimatedCounter value={pr.e1rm} /> kg</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted font-semibold">
                  Complete barbell sets to record estimated 1RM targets!
                </p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ── TAB 3: MEASUREMENTS TAB (Fully functional weight logger) ── */}
        {activeTab === "measurements" && (
          <motion.div
            key="measurements-tab"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Weight Goal Section */}
            <motion.div
              className="rounded-[--radius-card] glass-card p-5 border border-border"
              variants={staggerItem}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "هدف الوزن" : "Weight Goal"}
                </h2>
                <Target className="h-5 w-5 text-primary" />
              </div>
              
              {measurements.length >= 1 ? (
                <WeightGoalTracker 
                  current={measurements[0].weight || 0}
                  start={measurements[measurements.length - 1].weight || measurements[0].weight || 0}
                  target={isAr ? 75 : 75} // This should ideally come from user profile, but using 75 as a common placeholder
                  isAr={isAr}
                />
              ) : (
                <div className="text-center py-6">
                  <Scale className="h-10 w-10 text-text-muted/20 mx-auto mb-2" />
                  <p className="text-xs text-text-muted uppercase font-bold tracking-wider">
                    {isAr ? "سجل وزنك عشان نتابع الهدف" : "Log your weight to start tracking goals"}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Log weight Button */}
            <motion.div variants={staggerItem} className="flex justify-between items-center">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {isAr ? "سجل القياسات" : "Weight & Fat Log"}
              </h3>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowAddMeasurement(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t.addWeightLog}
              </Button>
            </motion.div>

            {/* Modal for new measurement */}
            {showAddMeasurement && (
              <div className="glass-card p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                  {isAr ? "ضيف قياسات جديدة" : "Add New Measurement"}
                </h4>
                <form onSubmit={handleAddMeasurementSubmit} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted font-bold block mb-1">{t.weightLabel}</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 78"
                      value={measurementForm.weight}
                      onChange={(e) => setMeasurementForm({ ...measurementForm, weight: e.target.value })}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold block mb-1">{t.fatLabel}</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={measurementForm.bodyFat}
                      onChange={(e) => setMeasurementForm({ ...measurementForm, bodyFat: e.target.value })}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold block mb-1">{t.waistLabel}</label>
                    <input
                      type="number"
                      placeholder="e.g. 82"
                      value={measurementForm.waist}
                      onChange={(e) => setMeasurementForm({ ...measurementForm, waist: e.target.value })}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted font-bold block mb-1">{t.chestLabel}</label>
                    <input
                      type="number"
                      placeholder="e.g. 102"
                      value={measurementForm.chest}
                      onChange={(e) => setMeasurementForm({ ...measurementForm, chest: e.target.value })}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    />
                  </div>
                  <div className="col-span-2 flex gap-2 justify-end pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddMeasurement(false)}
                    >
                      {t.cancelBtn}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      type="submit"
                    >
                      {t.saveBtn}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Weight Chart */}
            {measurements.length > 0 ? (
              <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
                <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">
                  {isAr ? "رسم بياني لوزنك" : "Weight Progression Chart"}
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={measurements.slice().reverse()}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="weightLogGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) => {
                          const date = new Date(str);
                          return isAr
                            ? `${date.getDate()} ${monthsAr[date.getMonth()]}`
                            : `${date.getDate()} ${monthsEn[date.getMonth()].substring(0, 3)}`;
                        }}
                        tick={{ fill: "#A1A1AA", fontSize: 9 }}
                      />
                      <YAxis domain={["auto", "auto"]} tick={{ fill: "#A1A1AA", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1C1C1F",
                          border: "1px solid #27272A",
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        labelStyle={{ color: "#F5F5F7" }}
                        formatter={(value) => [`${value} kg`, isAr ? "الوزن" : "Weight"]}
                      />
                      <Area type="monotone" dataKey="weight" stroke="#CCFF00" strokeWidth={2} fillOpacity={1} fill="url(#weightLogGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <DataEmptyState
                icon={Scale}
                title={isAr ? "لا توجد قياسات مسجلة" : "No Measurements Recorded"}
                description={isAr ? "ابدأ في تسجيل وزنك ونسبة الدهون لتوليد الرسوم البيانية للتطور البنيوي." : "Start logging your weight and body fat % to generate physical transformation charts!"}
                actionLabel={isAr ? "سجل وزنك الأول" : "Log First Weight"}
                onAction={() => setShowAddMeasurement(true)}
              />
            )}

            {/* Historic List */}
            {measurements.length > 0 && (
              <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-3">
                <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">
                  {isAr ? "قياساتك اللي فاتت" : "Logged Measurements"}
                </h4>
                <div className="space-y-2">
                  {measurements.map((m) => (
                    <div
                      key={m.id}
                      className="bg-bg-surface-hover border border-border rounded-xl p-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-xs font-black text-text-primary"><AnimatedCounter value={m.weight || 0} /> kg</span>
                        <div className="text-[10px] text-text-muted font-semibold font-mono mt-0.5">
                          {new Date(m.date).toLocaleDateString(isAr ? 'ar-EG' : undefined)}
                        </div>
                      </div>
                      <div className="flex gap-4 text-[10px] text-text-secondary font-semibold uppercase">
                        {m.bodyFat && <span>{isAr ? "دهون" : "Fat"}: <AnimatedCounter value={m.bodyFat || 0} />%</span>}
                        {m.waist && <span>{isAr ? "خصر" : "Waist"}: <AnimatedCounter value={m.waist || 0} />cm</span>}
                        {m.chest && <span>{isAr ? "صدر" : "Chest"}: <AnimatedCounter value={m.chest || 0} />cm</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── TAB 4: PHOTOS TAB (Gorgeous Before/After comparison slider) ── */}
        {activeTab === "photos" && (
          <motion.div
            key="photos-tab"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Upload widgets */}
            <motion.div variants={staggerItem} className="flex justify-between items-center">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {t.beforeAfterTitle}
              </h3>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-1.5" />
                {t.uploadPhotoBtn}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </motion.div>

            {/* Before/After Interactive Comparison slider */}
            {photos.length >= 2 ? (
              <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
                <div className="flex gap-4 mb-2">
                  <div className="flex-1">
                    <label className="text-[10px] block font-bold text-text-muted mb-1">
                      {isAr ? "صورة قبل" : "Before Photo"}
                    </label>
                    <select
                      value={beforePhotoId}
                      onChange={(e) => setBeforePhotoId(e.target.value)}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {new Date(p.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] block font-bold text-text-muted mb-1">
                      {isAr ? "صورة بعد" : "After Photo"}
                    </label>
                    <select
                      value={afterPhotoId}
                      onChange={(e) => setAfterPhotoId(e.target.value)}
                      className="w-full bg-bg-surface border border-border rounded-lg p-2 text-xs text-text-primary"
                    >
                      {photos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {new Date(p.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {beforePhoto && afterPhoto && (
                  <div className="relative w-full aspect-square sm:max-w-md mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl select-none">
                    {/* After Image (Background) */}
                    <img
                      src={afterPhoto.url}
                      alt="After progress"
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 right-3 bg-primary/90 text-primary-text text-[9px] font-black uppercase px-2 py-1 rounded-md z-10">
                      {isAr ? "بعد" : "AFTER"}
                    </div>

                    {/* Before Image (Clip Slider) */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={beforePhoto.url}
                        alt="Before progress"
                        className="absolute inset-y-0 left-0 w-full h-full object-cover"
                        style={{ width: "100%", maxWidth: "none" }}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-3 left-3 bg-bg-surface/90 text-text-primary text-[9px] font-black uppercase px-2 py-1 rounded-md z-10">
                        {isAr ? "قبل" : "BEFORE"}
                      </div>
                    </div>

                    {/* Interactive Slider Bar */}
                    <div
                      className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-text shadow-lg border-2 border-border">
                        <ChevronsLeftRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Invisible Range Input Overlay */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                  </div>
                )}
              </motion.div>
            ) : (
              <DataEmptyState
                icon={Camera}
                title={isAr ? "تحتاج صورتين للبدء" : "Upload 2 Photos to Compare"}
                description={isAr ? "ارفع صورتين على الأقل لمتابعة تطور جسمك ومقارنة فورمتك بالمنزلق التفاعلي." : "Please upload at least 2 progress photos to use the interactive before/after slider comparison."}
                actionLabel={isAr ? "ارفع صورتك الأولى" : "Upload Photo"}
                onAction={() => fileInputRef.current?.click()}
              />
            )}

            {/* Photo history grid */}
            {photos.length > 0 && (
              <motion.div variants={staggerItem} className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
                  {t.photoHistoryTitle}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="bg-bg-surface rounded-xl overflow-hidden border border-border relative group aspect-square flex flex-col"
                    >
                      <img
                        src={p.url}
                        alt="Progress snapshot"
                        className="w-full h-full object-cover flex-1"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deletePhoto(p.id!)}
                          className="bg-red-500/90 text-white p-1.5 rounded-lg hover:bg-red-600 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="bg-bg-surface-hover p-2 text-center text-[10px] font-bold text-text-secondary border-t border-border font-mono">
                        {new Date(p.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <motion.div variants={staggerItem}>
              <WorkoutHistoryList isAr={isAr} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IMMERSIVE FULL-BODY RECOVERY MODAL ── */}
      <AnimatePresence>
        {isRecoveryModalOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-surface/95 backdrop-blur-md p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg bg-bg-surface border border-border rounded-2xl p-6 shadow-2xl relative space-y-6"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <button
                onClick={() => setIsRecoveryModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-bg-surface-hover rounded-xl hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-right">
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5 animate-pulse" />
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    {t.muscleRecoveryTitle} 🩺
                  </h3>
                </div>
                <p className="text-xs text-text-muted font-semibold mt-1">
                  {t.avgRecovery}
                </p>
              </div>

              {/* High precision skeletal outline */}
              <div className="bg-bg-surface rounded-2xl p-4 border border-border shadow-inner flex justify-center">
                <AnatomyModel
                  muscleLevels={Object.entries(muscleRecovery).reduce((acc, [k, v]) => ({ ...acc, [k]: v.percent }), {})}
                  view="both"
                  highlightColor="green"
                  isAr={isAr}
                  onMuscleClick={(muscle) => setSelectedMuscle(muscle)}
                />
              </div>

              {/* Progress bars of muscles */}
              <div className="space-y-4">
                <h4 className="text-[10px] text-text-muted font-black uppercase tracking-widest text-right">
                  {t.muscleStatusLabel}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(muscleRecovery).map(([muscle, stats]) => {
                    const isFresh = stats.percent === 100;
                    let colorClass = "bg-primary";
                    if (stats.percent < 40) colorClass = "bg-red-500";
                    else if (stats.percent < 100) colorClass = "bg-yellow-500";

                    return (
                      <button
                        key={muscle}
                        onClick={() => setSelectedMuscle(muscle)}
                        className="bg-bg-surface-hover/40 p-3 rounded-xl border border-border flex flex-col justify-between hover:bg-bg-elevated/80 hover:border-primary/35 transition-all text-right cursor-pointer outline-none"
                      >
                        <div className="flex justify-between items-center w-full mb-1">
                          <span className="text-xs font-black text-text-primary">{getMuscleLabel(muscle)}</span>
                          <span className="text-[10px] text-text-muted font-bold font-mono"><AnimatedCounter value={stats.percent} />%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-surface rounded-full overflow-hidden mb-1">
                          <div className={cn("h-full rounded-full", colorClass)} style={{ width: `${stats.percent}%` }} />
                        </div>
                        <span className="text-[8px] text-text-muted font-bold uppercase font-mono">
                          {isFresh ? t.readyToLift : t.hoursRemaining(stats.hoursLeft)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── IMMERSIVE DETAILED MUSCLE WORKOUT HISTORY MODAL ── */}
      <AnimatePresence>
        {selectedMuscle && (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-[#04060a]/85 backdrop-blur-md p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg bg-[#0c0f17] border border-primary/20 rounded-[24px] p-6 shadow-[0_0_50px_rgba(204,255,0,0.15)] relative space-y-6 overflow-hidden group"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              {/* Tech Grid Background Accent */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.15] pointer-events-none" />
              <div className="absolute -left-16 -top-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <button
                onClick={() => setSelectedMuscle(null)}
                className="absolute top-4 right-4 p-2 bg-bg-surface-hover/80 rounded-xl hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all cursor-pointer z-20 border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-right relative z-10">
                <div className="flex items-center justify-end gap-2 text-primary">
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]">
                    {getMuscleLabel(selectedMuscle)} - {isAr ? "سجل التدريب" : "Workout History"}
                  </h3>
                  <Dumbbell className="w-5 h-5 text-primary filter drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]" />
                </div>
                <p className="text-xs text-text-muted font-bold mt-1">
                  {isAr 
                    ? `إليك تفاصيل أدائك لعضلات ${getMuscleLabel(selectedMuscle)}` 
                    : `Detailed summary of your performance on your ${selectedMuscle} muscles`}
                </p>
              </div>

              {/* Anatomy highlight for selected muscle - borderless and taller */}
              <div className="bg-[#080a10]/60 rounded-2xl p-4 border border-primary/10 flex justify-center h-[200px] relative overflow-hidden group transition-colors hover:border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <AnatomyModel
                  muscleLevels={{ [selectedMuscle]: 100 }}
                  view="both"
                  highlightColor="red"
                  isAr={isAr}
                  borderless={true}
                />
              </div>

              {/* Stats Row */}
              {(() => {
                const relevantExercises = sessionsList.flatMap(session => 
                  (session.exercises || []).map((ex: any) => ({
                    ...ex,
                    sessionDate: session.date,
                    routineName: session.routineName
                  }))
                ).filter((ex: any) => {
                  const def = exercises.find((e) => String(e.id) === String(ex.exerciseId));
                  const cat = getCategory(ex) || (def ? getCategory(def) : "");
                  return cat === selectedMuscle;
                });

                const totalMuscleSets = relevantExercises.reduce((acc, ex) => acc + (ex.sets || []).length, 0);
                const totalMuscleVolume = relevantExercises.reduce((acc, ex) => {
                  return acc + (ex.sets || []).reduce((sAcc: number, s: any) => sAcc + (s.weight || 0) * (s.reps || 0), 0);
                }, 0);
                const maxMuscleWeight = relevantExercises.length > 0 
                  ? Math.max(...relevantExercises.flatMap(ex => (ex.sets || []).map((s: any) => s.weight || 0))) 
                  : 0;

                return (
                  <div className="space-y-4 w-full relative z-10">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#080a10]/80 p-3 rounded-xl border border-white/5 flex flex-col justify-between text-center relative overflow-hidden group hover:border-primary/20 transition-all">
                        <span className="text-[9px] text-text-muted font-black block uppercase tracking-widest leading-none">
                          {isAr ? "إجمالي المجاميع" : "Total Sets"}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-text-primary font-mono italic tracking-tight mt-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                          <AnimatedCounter value={totalMuscleSets} />
                        </span>
                      </div>
                      <div className="bg-[#080a10]/80 p-3 rounded-xl border border-primary/15 flex flex-col justify-between text-center relative overflow-hidden group hover:border-primary/30 transition-all">
                        <span className="text-[9px] text-text-muted font-black block uppercase tracking-widest leading-none">
                          {isAr ? "إجمالي الحجم" : "Total Vol"}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-primary font-mono italic tracking-tight mt-1.5 drop-shadow-[0_0_8px_rgba(204,255,0,0.25)]">
                          <AnimatedCounter value={totalMuscleVolume} /><span className="text-[10px] font-bold not-italic ml-0.5">{isAr ? "كجم" : "kg"}</span>
                        </span>
                      </div>
                      <div className="bg-[#080a10]/80 p-3 rounded-xl border border-white/5 flex flex-col justify-between text-center relative overflow-hidden group hover:border-primary/20 transition-all">
                        <span className="text-[9px] text-text-muted font-black block uppercase tracking-widest leading-none">
                          {isAr ? "أقصى وزن" : "Max Weight"}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-text-primary font-mono italic tracking-tight mt-1.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                          <AnimatedCounter value={maxMuscleWeight} /><span className="text-[10px] font-bold not-italic ml-0.5">{isAr ? "كجم" : "kg"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] text-text-muted font-black uppercase tracking-widest text-right">
                        {isAr ? "التدريبات المسجلة" : "Logged Exercises"}
                      </h4>
                      {relevantExercises.length === 0 ? (
                        <div className="text-center py-8 text-text-muted border border-dashed border-primary/10 rounded-xl bg-[#080a10]/40 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141923_1px,transparent_1px),linear-gradient(to_bottom,#141923_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.05]" />
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-text-secondary animate-pulse" />
                          <p className="text-xs font-black uppercase tracking-wider text-text-muted">
                            {isAr ? "لم تقم بتمرين هذه العضلة في الآونة الأخيرة." : "No workout logged for this muscle group recently."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                          {relevantExercises.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()).map((ex: any, idx: number) => (
                            <div key={idx} className="bg-[#080a10]/50 border border-white/5 rounded-xl p-3.5 space-y-2 text-right hover:border-primary/20 transition-colors">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                                  {ex.routineName || (isAr ? "تمرين" : "Session")}
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-text-primary">{ex.exerciseName}</h5>
                                  <span className="text-[9px] font-bold font-mono text-text-muted">
                                    {new Date(ex.sessionDate).toLocaleDateString(isAr ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 justify-end">
                                {ex.sets.map((set: any, setIdx: number) => (
                                  <span
                                    key={setIdx}
                                    className="text-[9px] font-bold bg-[#0c0f17] border border-white/5 px-2 py-0.5 rounded-lg text-text-secondary font-mono"
                                  >
                                    {isAr ? `م${setIdx + 1}:` : `S${setIdx + 1}:`}{" "}
                                    <strong className="text-primary font-black text-[10px]">{set.weight}</strong>
                                    {isAr ? " كجم" : "kg"} ×{" "}
                                    <strong className="text-text-primary font-black text-[10px]">{set.reps}</strong>
                                    {isAr ? " تكرار" : " reps"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
