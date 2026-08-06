import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Dumbbell, Scale, Camera, Clock, Sparkles, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/utils/cn';
import { uid } from '@/utils/id';
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
  workoutRepository,
  bodyRepository,
  type BodyMeasurement,
  type ProgressPhoto,
} from '@/db';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useTranslation } from '@/i18n';
import statsAnalyticsImg from '@/assets/images/stats_analytics_illustration_new_1784773571138.jpg';

// Refactored tabs
import OverviewTab from '@/components/stats/tabs/OverviewTab';
import ExercisesTab from '@/components/stats/tabs/ExercisesTab';
import MeasurementsTab from '@/components/stats/tabs/MeasurementsTab';
import PhotosTab from '@/components/stats/tabs/PhotosTab';
import HistoryTab from '@/components/stats/tabs/HistoryTab';

export default function StatsPage() {
  const navigate = useNavigate();
  const { exercises, loadExercises } = useExerciseStore();
  const { t: tI18n, isAr } = useTranslation();
  const { isDemoMode, setDemoMode } = useWorkoutStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'exercises' | 'measurements' | 'photos' | 'history'
  >('overview');
  const [streak, setStreak] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalDuration: 0,
  });
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<{ week: string; volume: number }[]>([]);
  const [weeklyTonnage, setWeeklyTonnage] = useState<{ week: string; tonnage: number }[]>([]);
  const [muscleGroupStats, setMuscleGroupStats] = useState<{ muscle: string; volume: number }[]>(
    [],
  );
  const [e1rms, setE1rms] = useState<{ exerciseName: string; e1rm: number }[]>([]);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [muscleRecovery, setMuscleRecovery] = useState<
    Record<string, { percent: number; hoursLeft: number }>
  >({});
  const [workedThisWeek, setWorkedThisWeek] = useState<Record<string, number>>({});
  const [workoutDensity, setWorkoutDensity] = useState<{ date: string; count: number }[]>([]);
  const [weeklySetVolume, setWeeklySetVolume] = useState<{ muscle: string; sets: number }[]>([]);
  const [workoutSparkline, setWorkoutSparkline] = useState<{ value: number }[]>([]);
  const [volumeSparkline, setVolumeSparkline] = useState<{ value: number }[]>([]);
  const [durationSparkline, setDurationSparkline] = useState<{ value: number }[]>([]);

  // Measurements
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<(ProgressPhoto & { url: string })[]>([]);
  const [sliderPos, setSliderPos] = useState(50);
  const [beforePhotoId, setBeforePhotoId] = useState<string>('');
  const [afterPhotoId, setAfterPhotoId] = useState<string>('');

  const t = {
    overview: tI18n('stats.overview'),
    exercises: tI18n('stats.exercises'),
    measurements: tI18n('stats.measurements'),
    photos: tI18n('stats.photos'),
  };

  const getCategory = (ex: any): string => {
    const mGroup = (ex.muscleGroup || '').toLowerCase();
    const target = (ex.target || '').toLowerCase();
    const exName = (ex.exerciseName || '').toLowerCase();
    const combined = mGroup + ' ' + target + ' ' + exName;
    if (combined.includes('chest') || combined.includes('pectoral') || combined.includes('bench'))
      return 'Chest';
    if (
      combined.includes('back') ||
      combined.includes('lat') ||
      combined.includes('trap') ||
      combined.includes('row') ||
      combined.includes('pullup')
    )
      return 'Back';
    if (
      combined.includes('quad') ||
      combined.includes('ham') ||
      combined.includes('glute') ||
      combined.includes('leg') ||
      combined.includes('squat') ||
      combined.includes('calf')
    )
      return 'Legs';
    if (combined.includes('delt') || combined.includes('shoulder') || combined.includes('press'))
      return 'Shoulders';
    if (
      combined.includes('biceps') ||
      combined.includes('triceps') ||
      combined.includes('arm') ||
      combined.includes('curl')
    )
      return 'Arms';
    if (
      combined.includes('abs') ||
      combined.includes('core') ||
      combined.includes('oblique') ||
      combined.includes('crunch')
    )
      return 'Core';
    return '';
  };

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    async function loadData() {
      if (isDemoMode) {
        setStreak(12);
        setTotalStats({ totalWorkouts: 34, totalVolume: 128500, totalDuration: 112200 });
        setPersonalRecords([
          {
            exerciseId: 'demo-bench',
            exerciseName: isAr ? 'بنش بريس بالبار' : 'Barbell Bench Press',
            maxWeight: 100,
            date: new Date().toISOString(),
          },
          {
            exerciseId: 'demo-squat',
            exerciseName: isAr ? 'اسكوات بالبار' : 'Barbell Squat',
            maxWeight: 130,
            date: new Date().toISOString(),
          },
        ]);
        const mockVol = Array.from({ length: 8 }, (_, i) => ({
          week: `W${i + 1}`,
          volume: 18000 + i * 1500,
        }));
        setWeeklyVolume(mockVol);
        setWeeklyTonnage(mockVol.map((v) => ({ week: v.week, tonnage: v.volume })));
        setMuscleGroupStats([
          { muscle: 'Chest', volume: 28400 },
          { muscle: 'Back', volume: 24500 },
          { muscle: 'Legs', volume: 32100 },
        ]);
        setWeeklySetVolume([
          { muscle: 'Chest', sets: 18 },
          { muscle: 'Back', sets: 15 },
        ]);
        setWorkoutDensity(
          Array.from({ length: 84 }, (_, i) => ({
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            count: i % 3 === 0 ? 1 : 0,
          })),
        );
        const now = new Date();
        setSessionsList([
          {
            id: 'demo',
            name: 'Push Day',
            date: now.toISOString(),
            duration: 3600,
            exercises: [
              {
                exerciseId: 'bench',
                exerciseName: 'Bench',
                muscleGroup: 'Chest',
                sets: [{ weight: 80, reps: 10, completed: true }],
              },
            ],
          },
        ]);
        setWorkoutSparkline(mockVol.map(() => ({ value: 3 })));
        setVolumeSparkline(mockVol.map((v) => ({ value: v.volume })));
        setDurationSparkline(mockVol.map((_, i) => ({ value: 120 + i * 20 })));
        setMuscleRecovery({
          Chest: { percent: 92, hoursLeft: 4.2 },
          Back: { percent: 45, hoursLeft: 26.5 },
          Legs: { percent: 12, hoursLeft: 42.1 },
          Shoulders: { percent: 78, hoursLeft: 10.5 },
          Arms: { percent: 100, hoursLeft: 0 },
          Core: { percent: 60, hoursLeft: 19.2 },
        });
        setWorkedThisWeek({
          Chest: 100,
          Back: 100,
          Legs: 100,
          Shoulders: 100,
          Arms: 100,
          Core: 100,
        });
        setE1rms([
          { exerciseName: 'Bench Press', e1rm: 118 },
          { exerciseName: 'Squat', e1rm: 151 },
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
        workoutRepository.completedSessions(),
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

      const calcTrend = (data: any[], mapper: (week: string) => number) =>
        data.map((v) => ({ value: mapper(v.week) }));
      setWorkoutSparkline(
        calcTrend(
          volumeData,
          (week) =>
            allSessions.filter((s: any) => {
              const d = new Date(s.date);
              const start = new Date(d.getFullYear(), 0, 1);
              const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
              return `W${Math.ceil((days + start.getDay() + 1) / 7)}` === week;
            }).length,
        ),
      );
      setVolumeSparkline(volumeData.map((v) => ({ value: v.volume || 0 })));
      setDurationSparkline(
        volumeData.map((v) => {
          const total = allSessions
            .filter((s: any) => {
              const d = new Date(s.date);
              const start = new Date(d.getFullYear(), 0, 1);
              const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
              return `W${Math.ceil((days + start.getDay() + 1) / 7)}` === v.week;
            })
            .reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
          return { value: Math.round(total / 60) };
        }),
      );

      const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const recoveryMap: Record<string, { percent: number; hoursLeft: number }> = {};
      const weeklyWorked: Record<string, number> = {};
      const nowTime = Date.now();
      const oneWeekAgo = nowTime - 7 * 24 * 3600000;
      for (const muscle of MUSCLE_GROUPS) {
        const relevant = allSessions.filter((s: any) =>
          s.exercises.some((ex: any) => {
            const def = exercises.find((e) => String(e.id) === String(ex.exerciseId));
            const cat = getCategory(ex) || (def ? getCategory(def) : '');
            return cat === muscle;
          }),
        );
        const latest = relevant.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];
        if (!latest) recoveryMap[muscle] = { percent: 100, hoursLeft: 0 };
        else {
          const elapsed = (nowTime - new Date(latest.date).getTime()) / 3600000;
          const left = Math.max(0, 48 - elapsed);
          recoveryMap[muscle] = {
            percent: Math.min(100, Math.round((elapsed / 48) * 100)),
            hoursLeft: Math.round(left * 10) / 10,
          };
        }
        weeklyWorked[muscle] =
          relevant.filter((s: any) => new Date(s.date).getTime() >= oneWeekAgo).length > 0
            ? 100
            : 0;
      }
      setMuscleRecovery(recoveryMap);
      setWorkedThisWeek(weeklyWorked);

      const calc1rms = await Promise.all(
        prsData.slice(0, 4).map(async (pr: any) => {
          const data = await getEstimated1RM(pr.exerciseId);
          const best = data.length > 0 ? Math.max(...data.map((d) => d.e1rm)) : 0;
          return { exerciseName: pr.exerciseName, e1rm: best };
        }),
      );
      setE1rms(calc1rms.filter((x) => x.e1rm > 0));
    }
    loadData();
  }, [exercises, isDemoMode, isAr]);

  useEffect(() => {
    loadMeasurementsAndPhotos();
  }, [isDemoMode]);

  async function loadMeasurementsAndPhotos() {
    if (isDemoMode) {
      const mockM = [
        {
          id: 'm1',
          date: new Date().toISOString(),
          weight: 80.2,
          bodyFat: 14.7,
          waist: 84.8,
          chest: 105.5,
          createdAt: '',
          updatedAt: '',
        },
      ];
      setMeasurements(mockM as any);
      const mockP = [
        {
          id: 'p1',
          date: new Date().toISOString(),
          type: 'front' as const,
          imageBlob: new Blob(),
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
          createdAt: '',
        },
      ];
      setPhotos(mockP as any);
      setBeforePhotoId('p1');
      setAfterPhotoId('p1');
      return;
    }
    const [mData, pData] = await Promise.all([
      bodyRepository.listMeasurements(),
      bodyRepository.listPhotos(),
    ]);
    setMeasurements(mData);
    const withUrls = pData.map((p) => ({ ...p, url: URL.createObjectURL(p.imageBlob) }));
    setPhotos(withUrls);
    if (withUrls.length >= 2) {
      setBeforePhotoId(withUrls[withUrls.length - 1].id || '');
      setAfterPhotoId(withUrls[0].id || '');
    }
  }

  async function handleAddMeasurement(m: BodyMeasurement) {
    await bodyRepository.addMeasurement(m);
    loadMeasurementsAndPhotos();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { uid } = await import('@/utils/id');
    const photo: ProgressPhoto = {
      id: uid(),
      date: new Date().toISOString(),
      type: 'front',
      imageBlob: file,
      createdAt: new Date().toISOString(),
    };
    await bodyRepository.addPhoto(photo);
    loadMeasurementsAndPhotos();
  }

  async function deletePhoto(id: string) {
    if (!confirm(tI18n('stats.delete_photo_confirm'))) return;
    await bodyRepository.removePhoto(id);
    loadMeasurementsAndPhotos();
  }

  return (
    <div className="space-y-6 pb-20 pt-2 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="relative w-full h-32 md:h-40 rounded-2xl overflow-hidden border border-border/60 shadow-xl group">
        <img
          src={statsAnalyticsImg}
          alt="Analytics"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/90 via-bg-surface/60 to-transparent flex flex-col justify-center p-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 border border-primary/30 px-2.5 py-0.5 rounded-md self-start mb-1 backdrop-blur-md">
            {tI18n('stats.advanced3d')}
          </span>
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-text-primary">
            {tI18n('stats.performanceTitle')}
          </h1>
          <p className="text-xs text-text-muted font-bold mt-0.5 max-w-md">
            {tI18n('stats.performanceDesc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-bg-surface/80 backdrop-blur-md rounded-2xl border border-border/50 overflow-x-auto no-scrollbar shadow-inner">
          {[
            { id: 'overview', label: t.overview, icon: Activity },
            { id: 'history', label: tI18n('stats.history') + ' ⏱️', icon: Clock },
            { id: 'exercises', label: t.exercises, icon: Dumbbell },
            { id: 'measurements', label: t.measurements, icon: Scale },
            { id: 'photos', label: t.photos, icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                }}
                className={cn(
                  'relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 select-none',
                  isActive
                    ? 'text-primary-text font-black'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-surface-hover/50',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSubTabPill"
                    className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
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
        <div className="flex items-center gap-2.5 p-1.5 px-3 bg-bg-surface/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm">
          <Sparkles
            size={14}
            className={cn(
              'transition-colors',
              isDemoMode ? 'text-primary animate-pulse' : 'text-text-muted',
            )}
          />
          <span className="text-xs font-black text-text-primary select-none">
            {tI18n('stats.demoMode')}
          </span>
          <button
            id="demo-mode-toggle"
            onClick={() => {
              setDemoMode(!isDemoMode);
              if (typeof navigator !== 'undefined' && navigator.vibrate)
                navigator.vibrate([15, 15]);
            }}
            className={cn(
              'relative w-9 h-5 rounded-full transition-colors duration-300 outline-none cursor-pointer focus:ring-1 focus:ring-primary/40 flex items-center',
              isDemoMode ? 'bg-primary' : 'bg-neutral-800',
            )}
            aria-label="Toggle demo mode"
          >
            <motion.div
              layout
              className={cn(
                'absolute w-4 h-4 rounded-full shadow-md',
                isDemoMode ? 'bg-bg-surface' : 'bg-text-muted',
              )}
              initial={false}
              animate={{ x: isDemoMode ? 16 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <OverviewTab
              streak={streak}
              totalStats={totalStats}
              personalRecords={personalRecords}
              weeklyVolume={weeklyVolume}
              weeklyTonnage={weeklyTonnage}
              muscleGroupStats={muscleGroupStats}
              workoutDensity={workoutDensity}
              weeklySetVolume={weeklySetVolume}
              e1rms={e1rms}
              sessionsList={sessionsList}
              muscleRecovery={muscleRecovery}
              workedThisWeek={workedThisWeek}
              workoutSparkline={workoutSparkline}
              volumeSparkline={volumeSparkline}
              durationSparkline={durationSparkline}
              isAr={isAr}
              onNavigateFeed={() => navigate({ to: '/feed' })}
              onNavigateHome={() => navigate({ to: '/' })}
            />
          </motion.div>
        )}
        {activeTab === 'exercises' && (
          <motion.div
            key="exercises-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ExercisesTab e1rms={e1rms} />
          </motion.div>
        )}
        {activeTab === 'measurements' && (
          <motion.div
            key="measurements-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MeasurementsTab
              measurements={measurements}
              isAr={isAr}
              onAdd={handleAddMeasurement}
              showAdd={showAddMeasurement}
              onShowAdd={setShowAddMeasurement}
            />
          </motion.div>
        )}
        {activeTab === 'photos' && (
          <motion.div
            key="photos-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PhotosTab
              photos={photos}
              beforePhotoId={beforePhotoId}
              afterPhotoId={afterPhotoId}
              sliderPos={sliderPos}
              isAr={isAr}
              onBeforeChange={setBeforePhotoId}
              onAfterChange={setAfterPhotoId}
              onSliderChange={setSliderPos}
              onUpload={handlePhotoUpload}
              onDelete={deletePhoto}
            />
          </motion.div>
        )}
        {activeTab === 'history' && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HistoryTab isAr={isAr} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
