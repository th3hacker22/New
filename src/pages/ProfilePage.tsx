import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Scale,
  ChevronRight,
  Dumbbell,
  Flame,
  Camera,
  Upload,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { getWorkoutStreak, getTotalStats, workoutRepository, bodyRepository } from '@/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocialStore } from '@/store/useSocialStore';
import { signOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { auth, getStorageInstance } from '@/lib/firebase';
import { storage as appStorage } from '@/lib/storage';
import { pushToCloud } from '@/lib/syncEngine';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { ACHIEVEMENTS } from '@/data/achievements';
import AchievementBadge from '@/components/AchievementBadge';
import ChallengesSection from '@/components/ChallengesSection';
import {
  Trophy,
  Swords,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { Button } from '@/components/ui/Button';
import { uid } from '@/utils/id';
import { cn } from '@/utils/cn';

// Cyberpunk themed illustrations for profile & metrics
import profileBgImg from '@/assets/images/profile_bg_new_1784774520340.jpg';
import workoutMetricImg from '@/assets/images/workout_metric_new_1784774532871.jpg';
import streakMetricImg from '@/assets/images/streak_metric_new_1784774546452.jpg';
import weightMetricImg from '@/assets/images/weight_metric_new_1784774560429.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function ProfilePage() {
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const ramadanMode = useSettingsStore((s) => s.ramadanMode);
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';
  const { user, isGuest } = useAuthStore();
  const { following, loadFollowing, follow, unfollow } = useSocialStore();
  const [syncing, setSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { unlockedList, loadUnlocked } = useAchievementsStore();

  const [activeTabSection, setActiveTabSection] = useState<'achievements' | 'challenges'>(
    'achievements',
  );
  const [achCategory, setAchCategory] = useState<
    'all' | 'milestones' | 'streaks' | 'volume' | 'lifestyle' | 'records' | 'social'
  >('all');
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [achProgressMap, setAchProgressMap] = useState<Record<string, number>>({});

  const [avatarEmoji, setAvatarEmoji] = useState(() => {
    try {
      return appStorage.getString('profile_avatar', '🏋️‍♂️') || '🏋️‍♂️';
    } catch {
      return '🏋️‍♂️';
    }
  });

  const emojis = ['🏋️‍♂️', '🏋️‍♀️', '💪', '🏃‍♂️', '🏃‍♀️', '🤸‍♂️', '🤸‍♀️', '🦁', '⚡', '🔥'];

  useEffect(() => {
    async function loadData() {
      const [streakData, statsData, measurements] = await Promise.all([
        getWorkoutStreak(),
        getTotalStats(),
        bodyRepository.latestMeasurement(),
      ]);

      setStreak(streakData);
      setTotalWorkouts(statsData.totalWorkouts);
      setLatestWeight(measurements?.weight ?? null);

      loadUnlocked();
      if (user) {
        loadFollowing(user.uid);
      }

      // Calculate progress percentages for all achievements
      const pMap: Record<string, number> = {};
      for (const ach of ACHIEVEMENTS) {
        if (ach.getProgress) {
          try {
            pMap[ach.id] = await ach.getProgress();
          } catch {
            pMap[ach.id] = 0;
          }
        }
      }
      setAchProgressMap(pMap);
    }
    loadData();
  }, [loadUnlocked, user, loadFollowing]);

  const handleCycleAvatar = () => {
    if (user?.photoURL) {
      fileInputRef.current?.click();
      return;
    }
    const currentIndex = emojis.indexOf(avatarEmoji);
    const nextIndex = (currentIndex + 1) % emojis.length;
    const nextEmoji = emojis[nextIndex];
    setAvatarEmoji(nextEmoji);
    appStorage.set('profile_avatar', nextEmoji);
    useToastStore
      .getState()
      .addToast(
        'success',
        isAr ? 'غيرنا الصورة الرمزية بنجاح! 😎' : 'Avatar changed successfully! 😎',
      );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isGuest) return;

    setIsUploading(true);
    try {
      const firebaseStorage = await getStorageInstance();
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storageRef = ref(firebaseStorage, `profiles/${user.uid}/avatar_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateProfile(user as FirebaseUser, { photoURL });

      // Force refresh user in store
      useAuthStore.getState().setUser({ ...(user as FirebaseUser), photoURL });

      // Update public profile
      const { socialService } = await import('@/services/socialService');
      await socialService.updatePublicProfile(
        user.uid,
        user.displayName || 'Unknown Athlete',
        photoURL,
      );

      useToastStore
        .getState()
        .addToast('success', isAr ? 'تم تحديث صورتك الشخصية! ✨' : 'Profile photo updated! ✨');
    } catch (error) {
      console.error('Upload failed:', error);
      useToastStore
        .getState()
        .addToast(
          'error',
          isAr ? 'فشل رفع الصورة. حاول تاني' : 'Failed to upload photo. Try again.',
        );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFreezeStreak = async () => {
    const confirmMsg = isAr
      ? 'عايز تجمد الستريك للنهاردة؟ ده هيضيف حصة وهمية عشان يحمي الاستمرارية بتاعتك من غير ما يأثر على أرقام وحجم تمرينك.'
      : 'Freeze your streak for today? This adds a dummy session to protect your streak without adding to your volume.';

    if (confirm(confirmMsg)) {
      const dbDate = new Date().toISOString();
      await workoutRepository.add({
        id: uid(),
        name: isAr ? 'تجميد الستريك ❄️' : 'Streak Freeze ❄️',
        date: dbDate,
        duration: 0,
        exercises: [],
        completed: true,
        isFreeze: true,
        createdAt: dbDate,
        updatedAt: dbDate,
      });
      useToastStore
        .getState()
        .addToast(
          'success',
          isAr ? 'تم تجميد الستريك للنهاردة! ❄️' : 'Streak frozen for today! ❄️',
        );
      const streakData = await getWorkoutStreak();
      setStreak(streakData);
    }
  };

  const menuItems = [
    {
      icon: Scale,
      label: isAr ? 'وزن وقياسات جسمك ⚖️' : 'Body Metrics',
      description: latestWeight
        ? isAr
          ? `${latestWeight} كجم`
          : `${latestWeight} kg`
        : isAr
          ? 'سجل وزنك ومقاساتك'
          : 'Log your measurements',
      color: 'text-primary',
      href: '/body',
    },
    {
      icon: Camera,
      label: isAr ? 'صور التطور والمقارنة 📸' : 'Progress Photos',
      description: isAr ? 'تابع تغيير شكل جسمك' : 'Track your transformation',
      color: 'text-warning',
      href: '/body',
    },
    {
      icon: Settings,
      label: isAr ? 'إعدادات الأبلكيشن ⚙️' : 'Settings',
      description: ramadanMode
        ? isAr
          ? 'وضع رمضان شغال 🌙'
          : 'Ramadan Mode Active 🌙'
        : isAr
          ? 'ظبط الأبلكيشن على مزاجك'
          : 'Customize application',
      color: 'text-text-secondary',
      href: '/settings',
    },
  ];

  // Game level based on completed workouts
  const getLevelInfo = (workouts: number) => {
    const level = Math.floor(workouts / 5) + 1;
    const xp = workouts % 5;
    const progress = (xp / 5) * 100;

    let title = isAr ? 'عضو جديد 🔥' : 'New Member 🔥';
    if (level >= 3 && level <= 5) title = isAr ? 'مواظب الصالة 💪' : 'Gym Regular 💪';
    else if (level >= 6 && level <= 10) title = isAr ? 'وحش التمرين 🦁' : 'Workout Beast 🦁';
    else if (level >= 11 && level <= 20) title = isAr ? 'فورمة الساحل 🏝️' : 'Shredded Form 🏝️';
    else if (level >= 21 && level <= 50) title = isAr ? 'كابتن حقيقي 🎖️' : 'True Captain 🎖️';
    else if (level > 50) title = isAr ? 'أسطورة الجيم 👑' : 'Gym Legend 👑';

    return { level, progress, xp, nextLevelXp: 5, title };
  };

  const levelInfo = getLevelInfo(totalWorkouts);

  const getLocalizedAchievement = (id: string, enTitle: string, enDesc: string) => {
    if (!isAr) return { title: enTitle, desc: enDesc };
    const map: Record<string, { title: string; desc: string }> = {
      first_workout: {
        title: 'أول خطوة 🏋️‍♂️',
        desc: 'سجلت أول تمرينة في رحلة الفورمة.',
      },
      '3_day_streak': {
        title: 'جامد وعافر 🔥',
        desc: 'سجلت ٣ أيام تمرين ورا بعض.',
      },
      '7_day_streak': {
        title: 'محدش يقدر يوقفك ⚡',
        desc: 'حققت ستريك ٧ أيام متواصلة.',
      },
      '10k_tonnage': {
        title: 'وحش الأوزان 💪',
        desc: 'شلت ١٠,٠٠٠ كجم توتال في أسبوع واحد.',
      },
      '100_workouts': {
        title: 'البطل المحترف 👑',
        desc: 'قفلت ١٠٠ تمرينة، مبروك اللقب!',
      },
      night_owl: {
        title: 'خفاش الجيم 🦉',
        desc: 'اتمرنت في نص الليل (من ١٢ لـ ٤ الفجر).',
      },
      early_bird: {
        title: 'وحش الصبح بدري 🌅',
        desc: 'صحيت وفجرت طاقة من ٤ لـ ٨ الصبح.',
      },
    };
    return map[id] || { title: enTitle, desc: enDesc };
  };

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Page Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-text-primary uppercase tracking-wider">
          {isAr ? 'بروفايلك يا بطل 👤' : 'Profile'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {isAr ? 'تابع أرقامك، قوتك، وتطور فورمتك من هنا' : 'Manage your info and track progress'}
        </p>
      </motion.div>

      {/* ── Profile Card ── */}
      <motion.div
        className="glass-card relative overflow-hidden rounded-[--radius-card] p-6 border border-primary/25 bg-[#0c0f17] shadow-[0_0_25px_rgba(204,255,0,0.08)] group"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        {/* Abstract Cyber Fitness Illustration Background */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <img
            src={profileBgImg}
            alt="Profile Illustration Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right scale-110 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f17] via-transparent to-[#0c0f17]/30" />
        </div>

        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={handleCycleAvatar}
              disabled={isUploading}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface-hover shrink-0 text-3xl border border-border/40 shadow-xl hover:border-primary/40 active:scale-95 transition-all relative group overflow-hidden',
                isUploading && 'opacity-50 cursor-wait',
              )}
              title={isAr ? 'اضغط لتغيير الصورة الشخصية' : 'Click to change profile photo'}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarEmoji
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            {ramadanMode && (
              <motion.div
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-xs border-2 border-bg-surface"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                🌙
              </motion.div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-text-primary truncate">
                {user?.displayName ||
                  user?.email?.split('@')[0] ||
                  (isAr ? 'وحش ري‌ليفت ⚡' : 'ReLift User ⚡')}
              </h2>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  {isAr ? 'المتابعين' : 'FOLLOWERS'}
                </span>
                <span className="text-sm font-black text-text-primary">0</span>
              </div>
              <div className="h-6 w-px bg-border/40" />
              <div className="flex flex-col">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  {isAr ? 'تتابع' : 'FOLLOWING'}
                </span>
                <span className="text-sm font-black text-text-primary">{following.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-5 border-t border-border/30 pt-4 relative z-10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-primary flex items-center gap-2">
              <span className="bg-primary/20 px-2.5 py-0.5 rounded-md text-[10px] text-primary border border-primary/20">
                {isAr ? `مستوى ${levelInfo.level}` : `LVL ${levelInfo.level}`}
              </span>
              <span className="text-text-primary text-[12px] font-semibold">{levelInfo.title}</span>
            </span>
            <span className="text-text-muted text-[10px] font-mono">
              {levelInfo.xp} / {levelInfo.nextLevelXp} {isAr ? 'لتطوير المستوى' : 'to next level'}
            </span>
          </div>
          <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden border border-border/10">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-lime-400"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 relative z-10">
          {!isGuest && user ? (
            <>
              <Button
                onClick={async () => {
                  setSyncing(true);
                  await pushToCloud(user.uid);
                  setSyncing(false);
                }}
                disabled={syncing}
                variant="outline"
                className="flex-1 py-2.5 text-sm"
              >
                {syncing
                  ? isAr
                    ? 'بالمزامنة...'
                    : 'Syncing...'
                  : isAr
                    ? 'ارفع أرقامك ☁️'
                    : 'Sync Now'}
              </Button>
              <Button
                onClick={() => {
                  if (auth) signOut(auth);
                }}
                variant="danger"
                className="flex-1 py-2.5 text-sm"
              >
                {isAr ? 'تسجيل خروج 🚶‍♂️' : 'Logout'}
              </Button>
            </>
          ) : (
            <Link to="/auth" className="w-full">
              <Button variant="primary" className="w-full h-10">
                {isAr ? 'دخول / حساب جديد 👋' : 'Login / Signup'}
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Stats Summary ── */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        {/* Workouts Stat Card */}
        <div className="glass-card relative overflow-hidden flex flex-col items-center justify-between gap-1 rounded-[--radius-card] p-3 text-center bg-[#0c0f17] border border-primary/15 group min-h-[110px]">
          {/* Backdrop Illustration */}
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none">
            <img
              src={workoutMetricImg}
              alt="Workouts Stat Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-110 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1 w-full h-full justify-between">
            <Dumbbell className="h-5 w-5 text-primary filter drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" />
            <p className="text-xl sm:text-2xl font-black text-text-primary italic tracking-tight">
              {totalWorkouts}
            </p>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-wider">
              {isAr ? 'التمارين' : 'Workouts'}
            </p>
          </div>
        </div>

        {/* Streak Stat Card */}
        <div className="glass-card relative overflow-hidden flex flex-col items-center justify-between gap-1 rounded-[--radius-card] p-3 text-center bg-[#0c0f17] border border-warning/20 group min-h-[110px]">
          {/* Backdrop Illustration */}
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none">
            <img
              src={streakMetricImg}
              alt="Streak Stat Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-110 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1 w-full h-full justify-between">
            <Flame className="h-5 w-5 text-warning filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <p className="text-xl sm:text-2xl font-black text-text-primary italic tracking-tight">
              {streak}
            </p>
            <div className="flex flex-col items-center w-full">
              <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1 leading-none">
                {isAr ? 'الستريك' : 'Streak'}
              </p>
              <button
                onClick={handleFreezeStreak}
                className="text-[8px] sm:text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/25 px-2 py-0.5 rounded-full hover:bg-sky-500/20 active:scale-95 transition-all uppercase tracking-wider font-bold relative z-20"
              >
                {isAr ? 'تجميد ❄️' : 'Freeze'}
              </button>
            </div>
          </div>
        </div>

        {/* Weight Stat Card */}
        <div className="glass-card relative overflow-hidden flex flex-col items-center justify-between gap-1 rounded-[--radius-card] p-3 text-center bg-[#0c0f17] border border-success/20 group min-h-[110px]">
          {/* Backdrop Illustration */}
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none">
            <img
              src={weightMetricImg}
              alt="Weight Stat Background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-110 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1 w-full h-full justify-between">
            <Scale className="h-5 w-5 text-success filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <p className="text-xl sm:text-2xl font-black text-text-primary italic tracking-tight">
              {latestWeight ?? '—'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-text-muted font-bold uppercase tracking-wider">
              {latestWeight ? (isAr ? 'كجم' : 'KG') : isAr ? 'سجل وزنك' : 'Weight'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Achievements & Challenges Section ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1.5}
        className="space-y-4 pt-2"
      >
        {/* Toggle Section Tabs */}
        <div className="flex p-1 bg-bg-surface rounded-2xl border border-border/60 shadow-inner">
          <button
            onClick={() => setActiveTabSection('achievements')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none',
              activeTabSection === 'achievements'
                ? 'bg-primary text-primary-text shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            <Trophy className="w-4 h-4 stroke-[2.2]" />
            <span>{isAr ? 'الإنجازات والبطولات 🏆' : 'Achievements'}</span>
          </button>
          <button
            onClick={() => setActiveTabSection('challenges')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none',
              activeTabSection === 'challenges'
                ? 'bg-primary text-primary-text shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            <Swords className="w-4 h-4 stroke-[2.2]" />
            <span>{isAr ? 'التحديات الرياضية ⚔️' : 'Fitness Quests'}</span>
          </button>
        </div>

        {/* SECTION 1: ACHIEVEMENTS */}
        {activeTabSection === 'achievements' ? (
          <div className="space-y-4">
            {/* Summary & Category Chips */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-bg-surface/80 p-3.5 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase text-text-primary">
                    {isAr ? 'نسبة إنجاز الأوسمة' : 'Unlocked Badges'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                    {unlockedList.length} / {ACHIEVEMENTS.length} {isAr ? 'مفتوح' : 'Unlocked'}
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'milestones', label: isAr ? 'محطات 🎯' : 'Milestones' },
                  { id: 'streaks', label: isAr ? 'استمرارية 🔥' : 'Streaks' },
                  { id: 'volume', label: isAr ? 'أوزان 🏋️‍♂️' : 'Volume' },
                  { id: 'lifestyle', label: isAr ? 'أوقات ⏱️' : 'Lifestyle' },
                  { id: 'records', label: isAr ? 'أرقام قياسية 🏆' : 'Records' },
                  { id: 'social', label: isAr ? 'مجتمع 🥗' : 'Social' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAchCategory(cat.id as any)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 select-none',
                      achCategory === cat.id
                        ? 'bg-bg-surface-hover text-primary border border-primary/40 shadow-sm'
                        : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border/40',
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements Grid */}
            {(() => {
              const filteredList = ACHIEVEMENTS.filter((ach) =>
                achCategory === 'all' ? true : ach.category === achCategory,
              ).sort((a, b) => {
                const unlockedA = unlockedList.some((u) => u.achievementId === a.id);
                const unlockedB = unlockedList.some((u) => u.achievementId === b.id);
                if (unlockedA && !unlockedB) return -1;
                if (!unlockedA && unlockedB) return 1;
                const progA = achProgressMap[a.id] || 0;
                const progB = achProgressMap[b.id] || 0;
                return progB - progA;
              });

              const displayedList = showAllAchievements ? filteredList : filteredList.slice(0, 6);

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {displayedList.map((ach) => {
                      const unlocked = unlockedList.find((u) => u.achievementId === ach.id);
                      const title = isAr ? ach.titleAr : ach.title;
                      const description = isAr ? ach.descriptionAr : ach.description;
                      const progressPct = achProgressMap[ach.id];

                      return (
                        <AchievementBadge
                          key={ach.id}
                          title={title}
                          description={description}
                          iconName={ach.iconName}
                          isUnlocked={!!unlocked}
                          unlockedAt={unlocked?.unlockedAt}
                          category={ach.category}
                          xp={ach.xp}
                          progressPercent={progressPct}
                        />
                      );
                    })}
                  </div>

                  {filteredList.length > 6 && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAllAchievements(!showAllAchievements)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-bg-surface hover:bg-bg-surface-hover border border-primary/30 text-xs font-black text-primary shadow-sm hover:shadow-glow-primary transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span>
                        {showAllAchievements
                          ? isAr
                            ? 'إخفاء باقي الأوسمة ⬆️'
                            : 'Collapse Badges ⬆️'
                          : isAr
                            ? `عرض كامل الأوسمة والميداليات (${filteredList.length}) 🏆`
                            : `Show All Badges (${filteredList.length}) 🏆`}
                      </span>
                      {showAllAchievements ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </motion.button>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* SECTION 2: CHALLENGES */
          <ChallengesSection />
        )}
      </motion.div>

      {/* ── Menu Items ── */}
      <motion.div
        className="space-y-2 pb-6"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.href} className="block">
              <div className="glass-card flex w-full items-center gap-4 rounded-[--radius-card] p-4 transition-all duration-200 hover:ring-1 hover:ring-primary/20 active:scale-[0.98]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm font-medium text-text-primary truncate uppercase tracking-wider">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-text-muted truncate">{item.description}</p>
                  )}
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-text-muted shrink-0 ${isAr ? 'rotate-180' : ''}`}
                />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* ── Ramadan Banner ── */}
      {ramadanMode && (
        <motion.div
          className="glass-card rounded-[--radius-card] p-4 border border-warning/20 bg-warning/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-warning uppercase tracking-wider truncate">
                {isAr ? 'رمضان كريم يا بطل! 🌙' : 'Ramadan Mubarak!'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {isAr ? 'حافظ على قوتك وفورمتك في الشهر الكريم' : 'Stay fit during the holy month'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── App Version ── */}
      <motion.p
        className="text-center text-xs text-text-muted pb-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        ReLift v1.0.0
      </motion.p>
    </div>
  );
}
