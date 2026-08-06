import { storage } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Play,
  Dumbbell,
  Target,
  Zap,
  Pin,
  Share2,
  Youtube,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  getExerciseName,
  getExerciseBodyPart,
  getExerciseEquipment,
  getExerciseTarget,
} from '@/types/exercise';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { getAlternativeExercises } from '@/services/exerciseService';
import { exerciseCatalogRepository, getExerciseHistory } from '@/db';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getMuscleIdsForExercise } from '@/utils/muscleMapper';
import AnatomyMap from '@/components/AnatomyMap';
import { cn } from '@/utils/cn';

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams({ from: '/exercises/$exerciseId' });
  const navigate = useNavigate();
  const { language } = useSettingsStore();
  const isAr = language === 'ar';
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const { exercises, loadExercises, isLoading } = useExerciseStore();
  const [showGif, setShowGif] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const fav = await exerciseCatalogRepository.isFavorite(exerciseId);
      setIsFavorite(!!fav);
    };
    checkFavorite();
  }, [exerciseId]);

  const toggleFavorite = async () => {
    if (isFavorite) {
      await exerciseCatalogRepository.removeFavorite(exerciseId);
    } else {
      await exerciseCatalogRepository.addFavorite(exerciseId);
    }
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (!exercise) return;
    const shareData = {
      title: exercise.name,
      text: `Check out this exercise: ${exercise.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        // Don't log if the user simply canceled the share
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(isAr ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleYoutubeSearch = () => {
    if (!exercise) return;
    const query = encodeURIComponent(`${exercise.name} exercise tutorial`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const [pinnedNote, setPinnedNote] = useState<string>(() => {
    return storage.getString(`pulse_pinned_note_${exerciseId}` as any, '') || '';
  });
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      const data = await getExerciseHistory(exerciseId);
      setHistoryData(data);
    }
    loadHistory();
  }, [exerciseId]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(pinnedNote);

  const handleSaveNote = () => {
    storage.set(`pulse_pinned_note_${exerciseId}` as any, noteInput as any);
    setPinnedNote(noteInput);
    setIsEditingNote(false);
  };

  // Load exercises if not loaded
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const exercise = exercises.find((e) => e.id === exerciseId);
  const alternatives = exercise ? getAlternativeExercises(exercises, exerciseId, 3) : [];

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          to="/exercises"
          className="inline-flex items-center gap-1 text-sm text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // ── Not Found ──
  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Dumbbell className="h-16 w-16 text-text-muted" />
        <p className="text-lg font-bold text-text-primary">Exercise Not Found</p>
        <Link
          to="/exercises"
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Exercises
        </Link>
      </div>
    );
  }

  // ── Handle Start Workout ──
  const handleStartWorkout = async () => {
    const sessionId = await startWorkout([exercise.id]);
    navigate({ to: '/workout/$sessionId', params: { sessionId } });
  };

  return (
    <div className="space-y-6">
      {/* ── Back Button ── */}
      <Link
        to="/exercises"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary uppercase tracking-wide"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* ── Exercise Visual (Image/GIF Toggle) ── */}
      <motion.div
        className="glass-card relative overflow-hidden rounded-[--radius-card]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative aspect-video overflow-hidden bg-white w-full">
          {/* Main Image/GIF */}
          <img
            src={showGif ? exercise.gifUrl : exercise.imageUrl}
            alt={exercise.name}
            className="image-overlay h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          {/* Fallback */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <Dumbbell className="h-20 w-20 text-text-muted/20" />
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowGif(!showGif)}
            className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-bg/90 px-4 py-2 text-xs font-semibold text-text-primary backdrop-blur-sm transition-colors hover:bg-bg border border-border/50"
          >
            {showGif ? (
              <>
                <span>View Image</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-primary text-primary" />
                <span>View Animation</span>
              </>
            )}
          </button>

          {/* Equipment Badge */}
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm capitalize border border-primary/20">
              {getExerciseEquipment(exercise, isAr)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Exercise Info & Action Buttons ── */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-primary capitalize tracking-tight">
              {getExerciseName(exercise, isAr)}
            </h1>
            <p className="mt-1 text-sm text-text-muted font-bold capitalize tracking-wide">
              {getExerciseBodyPart(exercise, isAr)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-90',
                isFavorite
                  ? 'bg-danger/10 border-danger/20 text-danger'
                  : 'bg-bg-surface border-border text-text-muted hover:text-text-primary',
              )}
            >
              <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
            </button>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-muted transition-all hover:text-text-primary active:scale-90"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* YouTube Search Button */}
        <button
          onClick={handleYoutubeSearch}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-black uppercase tracking-widest transition-all hover:bg-danger/20 active:scale-[0.98]"
        >
          <Youtube className="h-4 w-4" />
          {isAr ? 'شاهد على يوتيوب' : 'Watch on YouTube'}
        </button>
      </motion.div>

      {/* ── Tags ── */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 border border-border/50">
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-text-secondary capitalize">
            {getExerciseEquipment(exercise, isAr)}
          </span>
        </div>
        <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 border border-border/50">
          <Target className="h-4 w-4 text-success" />
          <span className="text-xs font-medium text-text-secondary capitalize">
            {getExerciseTarget(exercise, isAr)}
          </span>
        </div>
      </motion.div>

      {/* ── Pinned Notes ── */}
      <motion.div
        className="glass-card rounded-[--radius-card] p-4 border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-black text-text-primary uppercase tracking-wider">
            <Pin className="h-4 w-4 text-primary rotate-[15deg]" />
            Pinned Training Notes
          </h2>
          {!isEditingNote && pinnedNote && (
            <button
              onClick={() => {
                setNoteInput(pinnedNote);
                setIsEditingNote(true);
              }}
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              Edit Note
            </button>
          )}
        </div>

        {isEditingNote ? (
          <div className="space-y-3">
            <textarea
              className="w-full text-xs rounded-xl border border-border bg-bg-surface-hover px-3 py-2 text-text-primary outline-none focus:border-primary transition-all leading-relaxed"
              rows={3}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Keep chest high, focus on slow negative on the descent..."
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsEditingNote(false)}
                className="py-1 px-3 text-[10px] font-black uppercase h-auto"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveNote}
                className="py-1 px-3.5 text-[10px] font-black uppercase h-auto"
              >
                Save
              </Button>
            </div>
          </div>
        ) : pinnedNote ? (
          <p className="text-xs text-text-secondary leading-relaxed bg-bg-surface-hover/40 p-3 border border-border rounded-xl">
            {pinnedNote}
          </p>
        ) : (
          <div className="text-center py-4 bg-bg-surface-hover/10 border border-dashed border-border rounded-xl">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
              No pinned notes yet
            </p>
            <button
              onClick={() => setIsEditingNote(true)}
              className="text-xs font-black uppercase text-primary hover:underline"
            >
              + Create Note
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Muscles ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="flex items-center gap-2 text-base font-bold text-text-primary uppercase tracking-wider">
          <Zap className="h-5 w-5 text-warning" />
          Target Muscles
        </h2>
        <div className="glass-card rounded-[--radius-card] p-4 flex flex-col items-center">
          <div className="flex flex-col gap-2 w-full mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center">
              Primary Muscle
            </h3>
            <div className="flex justify-center">
              <span className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary-light capitalize border border-primary/20">
                {exercise.target}
              </span>
            </div>

            {exercise.secondaryMuscles.length > 0 && (
              <>
                <h3 className="mt-2 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">
                  Secondary Muscles
                </h3>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {exercise.secondaryMuscles.slice(0, 3).map((muscle) => (
                    <span
                      key={muscle}
                      className="rounded-full bg-bg-elevated px-2.5 py-1 text-[10px] font-medium text-text-secondary capitalize border border-border/50"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-full max-w-sm mt-4 p-4 rounded-xl bg-bg-elevated/50">
            <AnatomyMap
              readOnly
              highlightedMuscles={getMuscleIdsForExercise(
                exercise.targetEn || exercise.target || '',
                [],
              )}
              secondaryHighlightedMuscles={getMuscleIdsForExercise(
                '',
                exercise.secondaryMusclesEn || exercise.secondaryMuscles || [],
              )}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Instructions ── */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <h2 className="flex items-center gap-2 text-base font-bold text-text-primary uppercase tracking-wider">
          <Lightbulb className="h-5 w-5 text-warning" />
          Execution Guide
        </h2>
        <div className="space-y-3">
          {exercise.instructionSteps.map((step, index) => (
            <motion.div
              key={index}
              className="glass-card flex items-start gap-4 rounded-[--radius-card] p-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary border border-primary/20">
                {index + 1}
              </div>
              <p className="text-sm leading-relaxed text-text-secondary pt-0.5">{step}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Progress Chart ── */}
      {historyData.length >= 2 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-text-primary uppercase tracking-wider">
              <TrendingUp className="h-5 w-5 text-primary" />
              {isAr ? 'تحليل التقدم' : 'Progress Analytics'}
            </h2>
          </div>
          <div className="glass-card rounded-[--radius-card] p-5 border border-primary/10">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111',
                      border: '1px solid #333',
                      borderRadius: '12px',
                      fontSize: '10px',
                    }}
                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                    itemStyle={{ color: '#CCFF00', fontWeight: 'bold' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#CCFF00"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  {isAr ? 'أقصى وزن' : 'Max Weight'}
                </p>
                <p className="text-lg font-black text-text-primary">
                  {Math.max(...historyData.map((d) => d.maxWeight))}{' '}
                  <span className="text-[10px] opacity-50">kg</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  {isAr ? 'إجمالي الحجم' : 'Total Volume'}
                </p>
                <p className="text-lg font-black text-primary">
                  {historyData[historyData.length - 1].volume.toLocaleString()}{' '}
                  <span className="text-[10px] opacity-50">kg</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Alternative Exercises ── */}
      {alternatives.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">
            Similar Exercises
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2 pt-1">
            {alternatives.map((alt) => (
              <Link
                key={alt.id}
                to="/exercises/$exerciseId"
                params={{ exerciseId: alt.id }}
                className="flex-shrink-0 w-36"
              >
                <div className="glass-card rounded-[--radius-card] overflow-hidden transition-all duration-300 hover:ring-1 hover:ring-primary/30 active:scale-[0.97]">
                  <div className="aspect-square bg-white w-full">
                    <img
                      src={alt.imageUrl}
                      alt={alt.name}
                      className="image-overlay h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-text-primary line-clamp-2 capitalize">
                      {alt.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Start Workout Button ── */}
      <motion.div
        className="pb-8 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Button
          onClick={handleStartWorkout}
          variant="primary"
          className="w-full py-4 text-base tracking-wider uppercase"
        >
          <Play className="h-5 w-5 fill-current" />
          Start Workout
          <ChevronRight className="h-5 w-5 ml-auto opacity-50" />
        </Button>
      </motion.div>
    </div>
  );
}
