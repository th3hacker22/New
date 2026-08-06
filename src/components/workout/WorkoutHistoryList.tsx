import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart2,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Flame,
  Trophy,
} from 'lucide-react';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import QuickLogModal from '@/components/extras/QuickLogModal';

interface WorkoutHistoryListProps {
  isAr?: boolean;
}

type DateRangeFilter = 'all' | 'week' | 'month' | 'three_months' | 'year';

export default function WorkoutHistoryList({ isAr = false }: WorkoutHistoryListProps) {
  const { completedSessions, isLoadingCompleted, loadCompletedSessions, deleteCompletedSession } =
    useWorkoutStore();

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // Load completed sessions on mount
  useEffect(() => {
    loadCompletedSessions();
  }, [loadCompletedSessions]);

  // Expand the first workout by default if available
  useEffect(() => {
    if (completedSessions.length > 0) {
      setExpandedSessions((prev) => {
        if (Object.keys(prev).length === 0) {
          return { [completedSessions[0].id]: true };
        }
        return prev;
      });
    }
  }, [completedSessions]);

  // Date filter logic
  const dateRanges = useMemo(
    () => [
      { id: 'all', label: isAr ? 'الكل' : 'All Time' },
      { id: 'week', label: isAr ? 'هذا الأسبوع' : 'This Week' },
      { id: 'month', label: isAr ? 'آخر ٣٠ يوم' : 'Last 30 Days' },
      { id: 'three_months', label: isAr ? 'آخر ٩٠ يوم' : 'Last 90 Days' },
      { id: 'year', label: isAr ? 'هذا العام' : 'This Year' },
    ],
    [isAr],
  );

  // Filter completed sessions
  const filteredSessions = useMemo(() => {
    let result = [...completedSessions];

    // 1. Date Range Filtering
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    if (dateFilter === 'week') {
      result = result.filter((s) => new Date(s.date) >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      result = result.filter((s) => new Date(s.date) >= thirtyDaysAgo);
    } else if (dateFilter === 'three_months') {
      result = result.filter((s) => new Date(s.date) >= ninetyDaysAgo);
    } else if (dateFilter === 'year') {
      result = result.filter((s) => new Date(s.date) >= startOfYear);
    }

    // 2. Search query filtering (by workout name or exercise name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const exerciseMatch = s.exercises.some(
          (ex) =>
            ex.exerciseName.toLowerCase().includes(q) ||
            (ex.muscleGroup || '').toLowerCase().includes(q),
        );
        return nameMatch || exerciseMatch;
      });
    }

    return result;
  }, [completedSessions, dateFilter, searchQuery]);

  // Helper to compute stats for filtered history list
  const historyStats = useMemo(() => {
    const totalWorkouts = filteredSessions.length;
    let totalVolume = 0;
    let totalDuration = 0;

    filteredSessions.forEach((s) => {
      totalDuration += s.duration || 0;
      s.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        });
      });
    });

    return {
      totalWorkouts,
      totalVolume,
      totalDurationMins: Math.round(totalDuration / 60),
    };
  }, [filteredSessions]);

  // Format chronological volume progression chart data
  const chartData = useMemo(() => {
    return [...filteredSessions]
      .map((session) => {
        const volume = session.exercises.reduce((acc, ex) => {
          return (
            acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0), 0)
          );
        }, 0);
        const dateObj = new Date(session.date);
        const formattedDate = dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
          month: 'short',
          day: 'numeric',
        });
        return {
          date: formattedDate,
          rawDate: dateObj.getTime(),
          volume: volume,
          name: session.name,
        };
      })
      .sort((a, b) => a.rawDate - b.rawDate);
  }, [filteredSessions, isAr]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-surface border border-border/85 rounded-xl p-3 shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-0.5">
            {data.date}
          </p>
          <p className="text-xs font-black text-text-primary">{data.name}</p>
          <p className="text-xs font-bold text-primary mt-1">
            {isAr ? 'الحجم الإجمالي:' : 'Total Volume:'}{' '}
            <span className="font-mono font-black text-sm">{data.volume.toLocaleString()} kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const toggleExpand = (id: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id: string) => {
    await deleteCompletedSession(id);
    setConfirmDeleteId(null);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return isAr ? '٠ دقيقة' : '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return isAr ? `${secs} ثانية` : `${secs}s`;
    return isAr ? `${mins} دقيقة` : `${mins}m`;
  };

  return (
    <div className="space-y-5" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Search & Filter Panel ── */}
      <div className="flex flex-col gap-3.5 bg-bg-surface-hover/20 p-4 rounded-2xl border border-border/40">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr ? 'ابحث بالاسم أو التمرين أو العضلة...' : 'Search workouts or exercises...'
              }
              className="w-full text-xs font-black rounded-xl border border-border bg-bg-surface pl-9 pr-3 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
            />
            <Search
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60',
                isAr ? 'right-3' : 'left-3',
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary font-bold text-xs p-1',
                  isAr ? 'left-3' : 'right-3',
                )}
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Log Button */}
          <button
            onClick={() => setIsQuickLogOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider shadow-glow-primary active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>⚡</span>
            {isAr ? 'سجل تمرين سريع' : 'Quick Log Workout'}
          </button>
        </div>

        {/* Chronological Date Filter Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
            📅 {isAr ? 'فلترة حسب الفترة الزمنية:' : 'Filter By Date Range:'}
          </span>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {dateRanges.map((range) => {
              const isActive = dateFilter === range.id;
              return (
                <button
                  key={range.id}
                  onClick={() => setDateFilter(range.id as any)}
                  className={cn(
                    'relative text-[10px] font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 select-none',
                    isActive
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'bg-bg-surface border-border/50 text-text-muted hover:text-text-primary hover:border-border',
                  )}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── History Overview Statistics Banner ── */}
      <div className="grid grid-cols-3 gap-3 bg-bg-surface-hover/10 rounded-2xl p-4 border border-border/30">
        <div className="text-center p-1.5">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">
            🏃 {isAr ? 'الجلسات' : 'Sessions'}
          </p>
          <p className="text-base font-black text-primary tabular-nums">
            {historyStats.totalWorkouts}
          </p>
        </div>
        <div className="text-center p-1.5 border-x border-border/40">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">
            ⚖️ {isAr ? 'الوزن الكلي' : 'Total Volume'}
          </p>
          <p className="text-base font-black text-text-primary tabular-nums">
            {historyStats.totalVolume.toLocaleString()}{' '}
            <span className="text-[9px] text-text-muted">{isAr ? 'كجم' : 'kg'}</span>
          </p>
        </div>
        <div className="text-center p-1.5">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1">
            ⏱️ {isAr ? 'الوقت الكلي' : 'Total Time'}
          </p>
          <p className="text-base font-black text-text-primary tabular-nums">
            {historyStats.totalDurationMins}{' '}
            <span className="text-[9px] text-text-muted">{isAr ? 'دق' : 'min'}</span>
          </p>
        </div>
      </div>

      {/* ── Volume Progression Chart ── */}
      {filteredSessions.length > 0 && (
        <div className="bg-bg-surface-hover/5 border border-border/30 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
                {isAr ? 'تقدم حجم التدريب الكلي' : 'Total Training Volume'}
              </h3>
              <p className="text-[10px] text-text-muted font-bold">
                {isAr
                  ? 'مراقبة زيادة القوة والأوزان الإجمالية بمرور الوقت'
                  : 'Track overall strength load gains over time'}
              </p>
            </div>
            <span className="text-[9px] font-black bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-lg uppercase">
              ⚡ {isAr ? 'رسم بياني' : 'Progression'}
            </span>
          </div>

          <div className="h-48 w-full select-none" dir="ltr">
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#ffffff40"
                    fontSize={9}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={9}
                    fontWeight={900}
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#ffffff15', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--c-primary, #ccff00)"
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      stroke: '#111',
                      strokeWidth: 1.5,
                      fill: 'var(--c-primary, #ccff00)',
                    }}
                    activeDot={{
                      r: 5,
                      stroke: '#111',
                      strokeWidth: 2,
                      fill: 'var(--c-primary, #ccff00)',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 bg-bg-surface-hover/10 rounded-xl border border-border/20 p-4">
                <BarChart2 className="h-7 w-7 text-text-muted/40" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                  {isAr
                    ? 'تحتاج إلى جلستي تمرين على الأقل لعرض المخطط'
                    : 'At least 2 workouts needed for progression chart'}
                </p>
                <p className="text-[9px] text-text-muted/60 max-w-xs leading-normal">
                  {isAr
                    ? 'سجل تمرينين أو أكثر لرؤية منحنى تقدم قوتك وتطور حجم تدريبك!'
                    : 'Complete and log 2 or more sessions to plot your strength progression curves!'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable Chronological List ── */}
      <div className="space-y-3">
        {isLoadingCompleted ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs font-black text-text-muted animate-pulse">
              {isAr ? 'جاري تحميل سجل تمريناتك السابقة...' : 'Loading completed workout history...'}
            </p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-3.5">
            {filteredSessions.map((session, sIdx) => {
              const isExpanded = !!expandedSessions[session.id];
              const isConfirmingDelete = confirmDeleteId === session.id;

              // Calculate specific workout session statistics
              const sessionVolume = session.exercises.reduce((acc, ex) => {
                return (
                  acc +
                  ex.sets.reduce((setAcc, set) => setAcc + (set.weight || 0) * (set.reps || 0), 0)
                );
              }, 0);

              const completedSetsCount = session.exercises.reduce(
                (acc, ex) => acc + ex.sets.length,
                0,
              );

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(sIdx * 0.05, 0.4) }}
                  className={cn(
                    'rounded-2xl border bg-bg-surface/40 hover:bg-bg-surface-hover/20 transition-all overflow-hidden flex flex-col',
                    'content-visibility-auto [contain-intrinsic-size:0_80px]',
                    isExpanded
                      ? 'border-primary/20 shadow-lg shadow-primary/5'
                      : 'border-border/40',
                  )}
                >
                  {/* Card Header / Clickable Summary Row */}
                  <div
                    onClick={() => toggleExpand(session.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all',
                          isExpanded
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'bg-bg-surface-hover/85 border-border/40 text-text-muted',
                        )}
                      >
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-text-primary truncate uppercase tracking-wide">
                          {session.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(session.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-black text-text-muted block">
                          {isAr ? 'الحجم الإجمالي' : 'VOLUME'}
                        </span>
                        <span className="text-xs font-black text-primary font-mono">
                          {sessionVolume.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="text-text-muted p-1 hover:text-text-primary">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Workout Exercises Details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/30 bg-bg-surface-hover/10 overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {/* Mini Stats Grid */}
                          <div className="grid grid-cols-2 gap-2 text-center sm:hidden">
                            <div className="bg-bg-surface p-2 rounded-xl border border-border/30">
                              <span className="text-[9px] text-text-muted font-bold block">
                                {isAr ? 'الحجم الإجمالي' : 'Total Volume'}
                              </span>
                              <span className="text-xs font-black text-primary font-mono">
                                {sessionVolume.toLocaleString()} kg
                              </span>
                            </div>
                            <div className="bg-bg-surface p-2 rounded-xl border border-border/30">
                              <span className="text-[9px] text-text-muted font-bold block">
                                {isAr ? 'عدد التمارين' : 'Exercises'}
                              </span>
                              <span className="text-xs font-black text-text-primary font-mono">
                                {session.exercises.length}
                              </span>
                            </div>
                          </div>

                          {/* Exercises List */}
                          <div className="space-y-3">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">
                              🏋️{' '}
                              {isAr ? 'تفاصيل الأداء والمجموعات:' : 'Exercises & Completed Sets:'}
                            </span>

                            {session.exercises.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="bg-bg-surface/60 border border-border/40 rounded-xl p-3 space-y-2"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-black text-text-primary">
                                      {ex.exerciseName}
                                    </h5>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-bg-surface-hover border border-border/40 text-text-muted font-black uppercase tracking-wider inline-block mt-1">
                                      {ex.muscleGroup}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-text-muted font-bold">
                                    {ex.sets.length} {isAr ? 'مجاميع' : 'sets'}
                                  </span>
                                </div>

                                {/* Sets Grid */}
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/10">
                                  {ex.sets.map((set, setIdx) => (
                                    <span
                                      key={setIdx}
                                      className="text-[9px] font-bold bg-bg-surface/80 border border-border/50 px-2 py-0.5 rounded-lg text-text-secondary tabular-nums"
                                    >
                                      {isAr ? `م${setIdx + 1}:` : `S${setIdx + 1}:`}{' '}
                                      <strong className="text-primary">{set.weight}</strong>
                                      {isAr ? ' كجم' : 'kg'} ×{' '}
                                      <strong className="text-text-primary">{set.reps}</strong>
                                      {isAr ? ' تكرار' : ' reps'}
                                      {set.setType && set.setType !== 'normal' && (
                                        <span className="ml-1 text-[8px] opacity-60 uppercase text-amber-500 font-extrabold">
                                          {set.setType}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>

                                {ex.notes && (
                                  <div className="mt-1.5 p-2 rounded-lg bg-bg-surface-hover/40 text-[9px] text-text-muted italic border-l-2 border-primary/40">
                                    <strong>{isAr ? 'ملاحظة:' : 'Notes:'}</strong> {ex.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Session Management Area */}
                          <div className="flex items-center justify-between border-t border-border/30 pt-3">
                            <div className="text-[9px] text-text-muted font-semibold flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-primary" />
                              {isAr
                                ? 'تم الحفظ محلياً وبالمزامنة السحابية'
                                : 'Saved to local cache & synchronized with cloud'}
                            </div>

                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-2 animate-fade-in">
                                <span className="text-[9px] text-red-400 font-black uppercase tracking-wider">
                                  {isAr ? 'هل أنت متأكد؟' : 'Confirm delete?'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(session.id)}
                                  className="text-[9px] bg-red-500/10 hover:bg-red-500 hover:text-black font-black uppercase text-red-400 py-1 px-2 rounded-lg"
                                >
                                  {isAr ? 'نعم، احذف' : 'Yes, Delete'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[9px] font-black uppercase text-text-muted py-1 px-2 rounded-lg"
                                >
                                  {isAr ? 'إلغاء' : 'Cancel'}
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(session.id)}
                                className="text-text-muted hover:text-red-400 p-1.5 rounded-lg bg-bg-surface-hover/60 hover:bg-red-500/10 transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                <Trash2 size={11} />
                                {isAr ? 'حذف الجلسة' : 'Delete Log'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 bg-bg-surface-hover/10 rounded-2xl border border-border/30 p-6">
            <div className="w-12 h-12 rounded-full bg-bg-surface-hover flex items-center justify-center mx-auto text-text-muted/40">
              <Calendar size={22} />
            </div>
            <h5 className="text-xs font-black text-text-muted uppercase tracking-wider">
              {isAr ? 'لا توجد تدريبات مطابقة' : 'No Workouts Found'}
            </h5>
            <p className="text-[10px] text-text-muted/60 font-semibold max-w-xs mx-auto leading-normal">
              {isAr
                ? 'لم نجد أي جلسة تمرين مطابقة لفلاتر البحث أو التاريخ الحالية. جرّب تغيير الفلترة!'
                : 'No completed workouts match your current search query or date filter range. Try broadening your criteria!'}
            </p>
          </div>
        )}
      </div>

      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} isAr={isAr} />
    </div>
  );
}
