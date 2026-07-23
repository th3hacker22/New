import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useExerciseStore } from "@/store/useExerciseStore";
import { getExerciseProgress, getEstimated1RM } from "@/db";
import {
  TrendingUp,
  Dumbbell,
  Calendar,
  Search,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  CalendarDays,
  Target,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ListFilter
} from "lucide-react";

type TimeRange = "1M" | "3M" | "6M" | "ALL";

export default function ExerciseProgressChart() {
  const { exercises, loadExercises } = useExerciseStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [progressData, setProgressData] = useState<
    { date: string; maxWeight: number; e1rm: number }[]
  >([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [showMaxWeight, setShowMaxWeight] = useState(true);
  const [showE1rm, setShowE1rm] = useState(true);
  
  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load exercises on mount if empty
  useEffect(() => {
    if (exercises.length === 0) {
      loadExercises();
    }
  }, [exercises, loadExercises]);

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  // Handle default selection
  useEffect(() => {
    if (sortedExercises.length > 0 && !selectedExerciseId) {
      // Find a popular exercise like bench press, squat or deadlift if possible
      const defaultEx = sortedExercises.find(
        (ex) =>
          ex.name.toLowerCase().includes("bench press") ||
          ex.name.toLowerCase().includes("squat") ||
          ex.name.toLowerCase().includes("deadlift")
      ) || sortedExercises[0];
      setSelectedExerciseId(defaultEx.id);
    }
  }, [sortedExercises, selectedExerciseId]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedExercise = useMemo(() => {
    return exercises.find((ex) => ex.id === selectedExerciseId);
  }, [exercises, selectedExerciseId]);

  // Load raw data
  useEffect(() => {
    async function loadData() {
      if (!selectedExerciseId) return;
      const maxWeightData = await getExerciseProgress(selectedExerciseId);
      const e1rmData = await getEstimated1RM(selectedExerciseId);

      const mergedMap = new Map<
        string,
        { date: string; maxWeight: number; e1rm: number }
      >();

      maxWeightData.forEach((d) => {
        mergedMap.set(d.date, {
          date: d.date,
          maxWeight: d.maxWeight,
          e1rm: 0,
        });
      });

      e1rmData.forEach((d) => {
        if (mergedMap.has(d.date)) {
          mergedMap.get(d.date)!.e1rm = d.e1rm;
        } else {
          mergedMap.set(d.date, { date: d.date, maxWeight: 0, e1rm: d.e1rm });
        }
      });

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      setProgressData(merged);
    }
    loadData();
  }, [selectedExerciseId]);

  // Filter progress data by time range
  const filteredProgressData = useMemo(() => {
    if (progressData.length === 0) return [];
    if (timeRange === "ALL") return progressData;

    const cutoff = new Date();
    if (timeRange === "1M") cutoff.setMonth(cutoff.getMonth() - 1);
    else if (timeRange === "3M") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (timeRange === "6M") cutoff.setMonth(cutoff.getMonth() - 6);

    return progressData.filter((d) => new Date(d.date) >= cutoff);
  }, [progressData, timeRange]);

  // Filter exercises for searchable dropdown
  const filteredExercisesForDropdown = useMemo(() => {
    if (!searchQuery.trim()) return sortedExercises;
    const q = searchQuery.toLowerCase();
    return sortedExercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q) ||
        ex.bodyPart.toLowerCase().includes(q)
    );
  }, [sortedExercises, searchQuery]);

  // Calculate Key Highlights
  const stats = useMemo(() => {
    if (filteredProgressData.length === 0) {
      return {
        peakWeight: 0,
        peakE1rm: 0,
        firstWeight: 0,
        lastWeight: 0,
        changePercent: 0,
        totalSessions: 0,
      };
    }

    const weights = filteredProgressData.map((d) => d.maxWeight).filter(w => w > 0);
    const e1rms = filteredProgressData.map((d) => d.e1rm).filter(e => e > 0);

    const peakWeight = weights.length > 0 ? Math.max(...weights) : 0;
    const peakE1rm = e1rms.length > 0 ? Math.max(...e1rms) : 0;

    // To calculate trend percent, find first and last valid weights in the visible range
    const firstWeight = weights.length > 0 ? weights[0] : 0;
    const lastWeight = weights.length > 0 ? weights[weights.length - 1] : 0;
    
    let changePercent = 0;
    if (firstWeight > 0) {
      changePercent = ((lastWeight - firstWeight) / firstWeight) * 100;
    }

    return {
      peakWeight,
      peakE1rm,
      firstWeight,
      lastWeight,
      changePercent,
      totalSessions: filteredProgressData.length,
    };
  }, [filteredProgressData]);

  // Dynamic calculated rep maxes (1RM down to 12RM) based on peak Est. 1RM
  const calculatedRepMaxes = useMemo(() => {
    const base1RM = stats.peakE1rm || stats.peakWeight || 0;
    if (base1RM === 0) return [];

    return [
      { reps: 1, percent: 100, weight: Math.round(base1RM) },
      { reps: 3, percent: 93, weight: Math.round(base1RM * 0.93) },
      { reps: 5, percent: 87, weight: Math.round(base1RM * 0.87) },
      { reps: 8, percent: 80, weight: Math.round(base1RM * 0.80) },
      { reps: 10, percent: 75, weight: Math.round(base1RM * 0.75) },
      { reps: 12, percent: 70, weight: Math.round(base1RM * 0.70) },
    ];
  }, [stats.peakE1rm, stats.peakWeight]);

  return (
    <div className="glass-card rounded-3xl p-6 border border-border/80 relative overflow-hidden flex flex-col gap-6">
      {/* Abstract background ambient glowing elements */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      {/* Header Block with Searchable Dropdown & Action Controls */}
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">
              Strength Analytics
            </h3>
          </div>
          <h2 className="text-lg font-black text-text-primary uppercase tracking-tight mt-1">
            Progress Insights
          </h2>
        </div>

        {/* Custom Searchable Dropdown Selector */}
        <div className="relative w-full sm:max-w-xs" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-bg-elevated/40 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-elevated/80 transition-all focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <div className="flex items-center gap-2 truncate">
              <Dumbbell className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">
                {selectedExercise ? selectedExercise.name : "Select Exercise"}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-text-muted transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-2xl border border-border bg-bg-elevated/95 p-3 shadow-2xl backdrop-blur-xl"
              >
                {/* Search Bar inside popover */}
                <div className="relative mb-2.5">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search exercise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg/50 py-2 pl-9 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    autoFocus
                  />
                </div>

                {/* Dropdown Options List */}
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {filteredExercisesForDropdown.length > 0 ? (
                    filteredExercisesForDropdown.map((ex) => {
                      const isSelected = ex.id === selectedExerciseId;
                      return (
                        <button
                          key={ex.id}
                          onClick={() => {
                            setSelectedExerciseId(ex.id);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                            isSelected
                              ? "bg-primary/15 text-primary"
                              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 truncate pr-2">
                            <span className="font-bold truncate">{ex.name}</span>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium font-mono">
                              {ex.muscleGroup} • {ex.equipment}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-text-muted">
                      No matching exercises found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chart Settings Box: Metric toggles and Time Range filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowE1rm(!showE1rm)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              showE1rm
                ? "bg-primary-muted border border-primary/30 text-primary"
                : "border border-border bg-bg-elevated/20 text-text-muted hover:text-text-primary"
            }`}
          >
            {showE1rm ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Est. 1RM</span>
          </button>

          <button
            onClick={() => setShowMaxWeight(!showMaxWeight)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              showMaxWeight
                ? "bg-secondary/10 border border-secondary/30 text-secondary"
                : "border border-border bg-bg-elevated/20 text-text-muted hover:text-text-primary"
            }`}
          >
            {showMaxWeight ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Max Weight</span>
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-bg/50 p-1 border border-border/40 max-w-fit">
          {(["1M", "3M", "6M", "ALL"] as TimeRange[]).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`relative rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition-all ${
                  isActive
                    ? "bg-bg-elevated text-primary shadow-sm ring-1 ring-border"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* Performance Highlights Dashboard */}
      {filteredProgressData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-bg-elevated/10 p-1.5 rounded-2xl border border-border/30">
          <div className="p-3">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Max weight
            </span>
            <span className="text-xl font-black font-mono text-text-primary mt-0.5 block">
              {stats.peakWeight}
              <span className="text-xs text-text-muted font-medium ml-1">kg</span>
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Estimated 1RM
            </span>
            <span className="text-xl font-black font-mono text-primary mt-0.5 block">
              {stats.peakE1rm}
              <span className="text-xs text-text-muted font-medium ml-1">kg</span>
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Logged Sessions
            </span>
            <span className="text-xl font-black font-mono text-text-primary mt-0.5 block">
              {stats.totalSessions}
              <span className="text-xs text-text-muted font-medium ml-1">workouts</span>
            </span>
          </div>

          <div className="p-3">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
              Period Trend
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {stats.changePercent >= 0 ? (
                <div className="flex items-center text-success font-black font-mono text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-0.5 shrink-0" />
                  +{stats.changePercent.toFixed(1)}%
                </div>
              ) : (
                <div className="flex items-center text-danger font-black font-mono text-sm">
                  <ArrowDownRight className="h-4 w-4 mr-0.5 shrink-0" />
                  {stats.changePercent.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Stage */}
      {filteredProgressData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-text-muted border border-dashed border-border/60 rounded-3xl p-6">
          <div className="rounded-2xl bg-bg-elevated/40 p-4 border border-border/50 mb-3 text-text-muted/60">
            <CalendarDays className="h-8 w-8" />
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-text-primary mb-1">
            No Workout Logs Found
          </div>
          <div className="text-[11px] text-text-muted text-center max-w-xs">
            Start a workout session and log completed sets for{" "}
            <span className="text-primary font-bold">
              {selectedExercise ? selectedExercise.name : "this exercise"}
            </span>{" "}
            to see your progress chart!
          </div>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredProgressData}
              margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="glowE1rm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="glowMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#1f1f23"
                vertical={false}
              />
              
              <XAxis
                dataKey="date"
                stroke="#52525b"
                fontSize={10}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                }}
              />
              
              <YAxis
                stroke="#52525b"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}kg`}
              />
              
              <RechartsTooltip
                cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.95)",
                  border: "1px solid rgba(63, 63, 70, 0.6)",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  padding: "12px",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length && label) {
                    const dateStr = new Date(String(label)).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    return (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border/40 pb-1">
                          {dateStr}
                        </p>
                        <div className="flex flex-col gap-1">
                          {payload.map((item: any) => (
                            <div key={item.name} className="flex items-center justify-between gap-6 text-xs">
                              <span className="flex items-center gap-1.5 font-semibold text-text-secondary">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.stroke }}
                                />
                                {item.name}:
                              </span>
                              <span className="font-mono font-bold text-text-primary">
                                {item.value} kg
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {showE1rm && (
                <Line
                  type="monotone"
                  name="Est. 1RM"
                  dataKey="e1rm"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-primary)", r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "#000", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              )}

              {showMaxWeight && (
                <Line
                  type="monotone"
                  name="Max Weight"
                  dataKey="maxWeight"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ fill: "#38bdf8", r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: "#38bdf8", stroke: "#000", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rep Max Matrix Widget */}
      {calculatedRepMaxes.length > 0 && (
        <div className="border-t border-border/40 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
              Estimated Rep Max Matrix (Calculated)
            </h4>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {calculatedRepMaxes.map((item) => (
              <div
                key={item.reps}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border bg-bg-elevated/20"
              >
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block font-sans">
                  {item.reps === 1 ? "1 Rep Max" : `${item.reps} Reps`}
                </span>
                <span className="text-sm font-black font-mono text-text-primary mt-1">
                  {item.weight}
                  <span className="text-[10px] text-text-muted ml-0.5">kg</span>
                </span>
                <span className="text-[9px] text-primary font-mono mt-0.5 font-bold">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-text-muted italic mt-3 flex items-start gap-1">
            <Info className="h-3 w-3 shrink-0 text-text-muted mt-0.5" />
            Theoretical capabilities calculated based on your absolute peak performance within the active view. Actual capacities may vary based on neurological fatigue, fiber ratio, and technique.
          </p>
        </div>
      )}
    </div>
  );
}

