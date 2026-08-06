import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Dumbbell, Clock, Activity, Heart } from 'lucide-react';
import { getWorkoutStreak, getTotalStats, db } from '@/db';
import { useRoutineStore } from '@/store/useRoutineStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useAchievementsStore } from '@/store/useAchievementsStore';
import { useSocialStore } from '@/store/useSocialStore';
import { useQuickLogStore } from '@/store/useQuickLogStore';
import { MuscleRecoveryHeatmap } from '@/components/stats/MuscleRecoveryHeatmap';
import { RestTimer } from '@/components/RestTimer';
import WarmupMobilityGenerator from '@/components/extras/WarmupMobilityGenerator';
import OneRepMaxCalculator from '@/components/extras/OneRepMaxCalculator';
import QuickLogModal from '@/components/extras/QuickLogModal';
import AchievementModal from '@/components/AchievementModal';
import { Button } from '@/components/ui/Button';
import { routineTemplates, buildTemplateRoutine } from '@/data/routineTemplates';
import { cn } from '@/utils/cn';
import { FeedPost } from '@/services/socialService';
import { useTranslation } from '@/i18n';

// New modular components
import StreakBannerCard from '@/components/home/StreakBannerCard';
import StatsTrioCards from '@/components/home/StatsTrioCards';
import StartWorkoutCta from '@/components/home/StartWorkoutCta';
import QuickRoutinesGrid from '@/components/home/QuickRoutinesGrid';
import AchievementsStrip from '@/components/home/AchievementsStrip';
import QuickToolsGrid from '@/components/home/QuickToolsGrid';
import CustomRoutinesSection from '@/components/home/CustomRoutinesSection';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function HomePage() {
  const navigate = useNavigate();
  const { t, isAr } = useTranslation();

  const [streak, setStreak] = useState(0);
  const [weekActiveDays, setWeekActiveDays] = useState<boolean[]>(Array(7).fill(false));
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<
    { id: string; name: string; date: string; exerciseCount: number }[]
  >([]);
  const [activityTab, setActivityTab] = useState<'local' | 'social'>('local');

  const routines = useRoutineStore((s) => s.routines);
  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);
  const saveRoutine = useRoutineStore((s) => s.saveRoutine);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const user = useAuthStore((s) => s.user);
  const exercises = useExerciseStore((s) => s.exercises);
  const loadExercises = useExerciseStore((s) => s.loadExercises);
  const { loadUnlocked, evaluateAchievements } = useAchievementsStore();
  const quickLogs = useQuickLogStore((s) => s.quickLogs);

  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isOneRepMaxOpen, setIsOneRepMaxOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  const { feed, loadFollowing, loadFeed, giveKudos, isLoading: isSocialLoading } = useSocialStore();

  useEffect(() => {
    loadRoutines();
    loadExercises();
    loadUnlocked();
    evaluateAchievements(user?.uid);
  }, [loadRoutines, loadExercises, loadUnlocked, evaluateAchievements, user?.uid]);

  useEffect(() => {
    if (exercises.length === 0) return;
    async function loadData() {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const [streakData, statsData, sessions, thisWeekSessions] = await Promise.all([
        getWorkoutStreak(),
        getTotalStats(),
        db.workoutSessions.orderBy('date').reverse().limit(3).toArray(),
        db.workoutSessions
          .where('completed')
          .equals(1)
          .filter((s) => new Date(s.date) >= startOfWeek)
          .toArray(),
      ]);

      const activeDays = Array(7).fill(false);
      thisWeekSessions.forEach((s) => {
        const idx = (new Date(s.date).getDay() + 6) % 7;
        if (idx >= 0 && idx < 7) activeDays[idx] = true;
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
    loadData();
  }, [exercises, quickLogs]);

  useEffect(() => {
    if (user && activityTab === 'social') {
      loadFollowing(user.uid).then(() => loadFeed());
    }
  }, [user, activityTab, loadFollowing, loadFeed]);

  const nextWorkout = useMemo(() => {
    if (routines.length > 0) {
      return {
        title: routines[0].name,
        subtitle: t('home.nextUp'),
        exercises: routines[0].exercises.map((ex) => String(ex.exerciseId)),
      };
    }
    const tpl = routineTemplates[0];
    if (tpl && exercises.length > 0) {
      const built = buildTemplateRoutine(tpl, exercises);
      return {
        title: tpl.name,
        subtitle: t('home.suggestedTemplate'),
        exercises: built.exercises.map((ex) => String(ex.exerciseId)),
      };
    }
    return {
      title: t('home.freeWorkout'),
      subtitle: t('home.startTracking'),
      exercises: [] as string[],
    };
  }, [routines, exercises, t]);

  const getPostExercises = (post: FeedPost) => {
    if (post.exercises && post.exercises.length > 0) return post.exercises;
    return [
      {
        exerciseId: 'bench-press',
        exerciseName: isAr ? 'ضغط بنش بالبار' : 'Barbell Bench Press',
        setsCount: 3,
        imageUrl:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Bench_Press/images/0.jpg',
      },
      {
        exerciseId: 'squat',
        exerciseName: isAr ? 'سكوات بالبار' : 'Barbell Squat',
        setsCount: 3,
        imageUrl:
          'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/exercises/Barbell_Squat/images/0.jpg',
      },
    ].slice(0, post.exercisesCount || 2);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <StreakBannerCard streak={streak} weekActiveDays={weekActiveDays} isAr={isAr} />
      <StatsTrioCards
        totalWorkouts={totalStats.totalWorkouts}
        totalVolume={totalStats.totalVolume}
        totalDuration={totalStats.totalDuration}
        isAr={isAr}
      />
      <StartWorkoutCta
        title={nextWorkout.title}
        subtitle={nextWorkout.subtitle}
        exerciseCount={nextWorkout.exercises.length}
        isAr={isAr}
        onStart={async () => {
          const sessionId = await startWorkout(nextWorkout.exercises);
          navigate({ to: `/workout/$sessionId`, params: { sessionId } });
        }}
        onAi={() => navigate({ to: '/wizard' })}
      />
      <QuickRoutinesGrid
        exercises={exercises}
        isAr={isAr}
        onStartTemplate={async (ids) => {
          const sid = await startWorkout(ids);
          navigate({ to: `/workout/$sessionId`, params: { sessionId: sid } });
        }}
      />
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3.5}>
        <MuscleRecoveryHeatmap isAr={isAr} />
      </motion.div>
      <AchievementsStrip isAr={isAr} onOpenModal={() => setIsAchievementsModalOpen(true)} />
      <QuickToolsGrid
        isAr={isAr}
        onOneRepMax={() => setIsOneRepMaxOpen(true)}
        onWarmup={() => setIsWarmupOpen(true)}
        onQuickLog={() => setIsQuickLogOpen(true)}
        onAiCoach={() => navigate({ to: '/wizard' })}
      />
      <CustomRoutinesSection
        routines={routines}
        isAr={isAr}
        onStartRoutine={async (ids) => {
          const sid = await startWorkout(ids);
          navigate({ to: `/workout/$sessionId`, params: { sessionId: sid } });
        }}
        onDelete={async (id) => deleteRoutine(id, user?.uid)}
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="space-y-3"
      >
        <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
          {t('home.templates')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {routineTemplates.slice(0, 4).map((tpl) => (
            <div
              key={tpl.name}
              className="glass-card rounded-[--radius-card] p-4 flex flex-col border border-border/60"
            >
              <h3 className="text-sm font-black text-text-primary uppercase">{tpl.name}</h3>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{tpl.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 h-8 text-[11px] font-bold uppercase tracking-wider"
                onClick={async () => {
                  if (exercises.length === 0) return;
                  const gen = buildTemplateRoutine(tpl, exercises);
                  const { uid } = await import('@/utils/id');
                  await saveRoutine(
                    {
                      id: uid(),
                      name: gen.name,
                      exercises: gen.exercises,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    } as any,
                    user?.uid,
                  );
                }}
              >
                {t('home.addToMyRoutines')}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={6}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
              {t('home.recentActivity')}
            </h2>
            {recentWorkouts.length > 0 && activityTab === 'local' && (
              <Link to="/stats" className="text-xs font-black text-primary uppercase">
                {t('home.viewAll')}
              </Link>
            )}
          </div>
          <div className="flex bg-bg-surface p-1 rounded-xl border border-border w-full">
            <button
              onClick={() => setActivityTab('local')}
              className={cn(
                'flex-1 py-2 text-xs font-black rounded-lg transition-all',
                activityTab === 'local'
                  ? 'bg-bg-surface-hover text-primary shadow-md'
                  : 'text-text-muted',
              )}
            >
              {t('home.myActivityTab')}
            </button>
            <button
              onClick={() => setActivityTab('social')}
              className={cn(
                'flex-1 py-2 text-xs font-black rounded-lg transition-all',
                activityTab === 'social'
                  ? 'bg-bg-surface-hover text-primary shadow-md'
                  : 'text-text-muted',
              )}
            >
              {t('home.socialFeedTab')}
            </button>
          </div>
        </div>

        {activityTab === 'local' ? (
          recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((w, idx) => (
                <motion.div
                  key={w.id}
                  className="glass-card flex items-center gap-3 rounded-[--radius-card] p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted shrink-0">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate uppercase">
                      {w.name}
                    </p>
                    <p className="text-xs text-text-muted font-bold">
                      {t('home.exercisesCount', { count: w.exerciseCount })} •{' '}
                      {new Date(w.date).toLocaleDateString(isAr ? 'ar-EG' : undefined, {
                        day: 'numeric',
                        month: 'short',
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
              <p className="text-sm font-bold text-text-muted">{t('home.noWorkoutsYet')}</p>
              <p className="text-xs text-text-muted text-center max-w-[200px] font-semibold">
                {t('home.startFirst')}
              </p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {isSocialLoading ? (
              <div className="text-xs text-text-muted text-center py-8 flex flex-col items-center gap-2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                <span>{t('home.loadingSocial')}</span>
              </div>
            ) : feed.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center gap-3 rounded-[--radius-card] border border-dashed border-border py-12 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated">
                  <Activity className="h-7 w-7 text-text-muted" />
                </div>
                <p className="text-sm font-bold text-text-muted">{t('home.noSocialFeed')}</p>
                <p className="text-xs text-text-muted max-w-[260px] leading-relaxed font-semibold">
                  {t('home.noSocialDesc')}
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate({ to: '/feed' })}>
                  {isAr ? 'روح شوف الناس 👥' : 'Go to Explore'}
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {feed.slice(0, 3).map((post) => (
                  <motion.div
                    key={'home-feed-' + post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-surface-hover rounded-2xl p-4 border border-border flex flex-col gap-4 shadow-xl"
                  >
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
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-bg-surface/60 rounded-xl p-4 border border-border">
                      <h4 className="font-black text-text-primary capitalize text-sm mb-3">
                        {post.workoutTitle}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 py-1 border-b border-border pb-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase text-text-muted font-bold">
                            {t('home.sets')}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Dumbbell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{post.exercisesCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase text-text-muted font-bold">
                            {t('home.volumeLabel')}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Activity className="w-3.5 h-3.5 text-warning shrink-0" />
                            <span>{post.totalVolume || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase text-text-muted font-bold">
                            {t('home.duration')}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-mono font-black">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{Math.floor((post.duration || 0) / 60)} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {getPostExercises(post).map((ex: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-bg-surface-hover/60 border border-border rounded-xl p-2"
                          >
                            <div className="w-10 h-10 rounded-lg bg-bg-surface flex items-center justify-center overflow-hidden mb-1 border border-border">
                              <img
                                src={ex.imageUrl}
                                alt={ex.exerciseName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[9px] font-black text-primary leading-tight">
                              {ex.setsCount} Sets
                            </span>
                            <span className="text-[8px] text-text-secondary font-bold truncate w-full text-center px-0.5 capitalize leading-tight mt-0.5">
                              {ex.exerciseName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/40 pt-2">
                      <button
                        onClick={() => giveKudos(post.id)}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors group"
                      >
                        <Heart className="w-4 h-4 group-hover:fill-primary text-primary" />
                        <span className="text-xs font-black font-mono">
                          {post.kudosCount} {t('home.kudos')}
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

      <motion.div
        className="grid grid-cols-2 gap-3 pb-8"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={7}
      >
        <Link
          to="/stats"
          className="glass-card flex flex-col items-center gap-3 rounded-[--radius-card] p-4 hover:bg-bg-elevated"
        >
          <TrendingUp className="h-6 w-6 text-success" />
          <span className="text-sm font-bold text-text-primary tracking-wide">
            {t('home.statistics')}
          </span>
        </Link>
        <Link
          to="/body"
          className="glass-card flex flex-col items-center gap-3 rounded-[--radius-card] p-4 hover:bg-bg-elevated"
        >
          <Target className="h-6 w-6 text-warning" />
          <span className="text-sm font-bold text-text-primary tracking-wide">
            {t('home.bodyMetrics')}
          </span>
        </Link>
      </motion.div>

      <RestTimer isOpen={isRestTimerOpen} onClose={() => setIsRestTimerOpen(false)} isAr={isAr} />
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
      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} isAr={isAr} />
      <AchievementModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
      />
    </div>
  );
}
