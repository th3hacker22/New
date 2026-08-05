import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from "recharts";
import { Trophy, Flame, Dumbbell, TrendingUp, Calendar, Activity, Users, X, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataEmptyState } from "@/components/ui/DataEmptyState";
import { WorkoutHeatmap } from "@/components/stats/WorkoutHeatmap";
import { WeeklyVolumeTarget } from "@/components/stats/WeeklyVolumeTarget";
import AnatomyModel from "@/components/stats/AnatomyModel";
import { PRProgressChart } from "@/components/stats/PRProgressChart";
import { AnimatedCounter } from "@/components/stats/AnimatedCounter";
import { cn } from "@/utils/cn";
import { getEstimated1RM } from "@/db";

interface Props {
  streak: number;
  totalStats: { totalWorkouts: number; totalVolume: number; totalDuration: number };
  personalRecords: any[];
  weeklyVolume: { week: string; volume: number }[];
  weeklyTonnage: { week: string; tonnage: number }[];
  muscleGroupStats: { muscle: string; volume: number }[];
  workoutDensity: { date: string; count: number }[];
  weeklySetVolume: { muscle: string; sets: number }[];
  e1rms: { exerciseName: string; e1rm: number }[];
  sessionsList: any[];
  muscleRecovery: Record<string, { percent: number; hoursLeft: number }>;
  workedThisWeek: Record<string, number>;
  workoutSparkline: { value: number }[];
  volumeSparkline: { value: number }[];
  durationSparkline: { value: number }[];
  isAr: boolean;
  onNavigateFeed: () => void;
  onNavigateHome: () => void;
}

export default function OverviewTab({
  totalStats, personalRecords, weeklyVolume, weeklyTonnage, muscleGroupStats,
  workoutDensity, weeklySetVolume, e1rms, sessionsList, muscleRecovery, workedThisWeek,
  workoutSparkline, volumeSparkline, durationSparkline, isAr, onNavigateFeed, onNavigateHome
}: Props) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPrId, setSelectedPrId] = useState<string | number | null>(null);
  const [prHistory, setPrHistory] = useState<any[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const t = {
    overview: isAr ? "نظرة سريعة" : "Overview",
    muscleRecoveryTitle: isAr ? "استشفاء العضلات" : "Muscle Recovery",
    anyReadyToTrain: isAr ? "شوف إيه العضلات اللي جاهزة تتفرم" : "See which muscles are ready to train",
    viewAll: isAr ? "شوف كله" : "View All",
    readyToLift: isAr ? "جاهزة للدمار" : "READY TO LIFT",
    hoursRemaining: (h: number) => isAr ? `متبقي ${h} ساعة` : `${h}h remaining`,
    thisWeek: isAr ? "هذا الأسبوع" : "This Week",
    focusWhereThisWeek: isAr ? "تعرّف على عضلات تمرينك" : "See where you focused your workouts this week",
    thisMonthFocus: isAr ? "الشهر ده" : "This Month",
    whereFocusedMore: isAr ? "شوف ركزت على إيه أكتر" : "See where you focused more",
    exerciseLog: isAr ? "سجل التمارين" : "Exercise Log",
    personalRecordsTitle: isAr ? "أرقامك القياسية" : "Personal Records",
    prsDesc: isAr ? "شوف أعلى أوزان شلتها وتطورك" : "Track your strongest lifts over time",
    addFriendsTitle: isAr ? "شجع صحابك واتشجعوا!" : "Double your gains, double the fun!",
    addFriendsDesc: isAr ? "شير فورمتك مع أصحابك وادعموا بعض في الجيم." : "Inspire friends with your fitness journey and support each other.",
    addFriendsBtn: isAr ? "ضيف أصحابك" : "Add Friends",
    avgRecovery: isAr ? "متوسط استشفاء العضلات حسب تمرينات آخر ٧ أيام" : "Average recovery for all muscles based on training over the last 7 days",
    volume: isAr ? "التوتال (حجم التمرين)" : "Training Volume",
    duration: isAr ? "الوقت" : "Duration",
    compared3Months: isAr ? "مقارنة بآخر ٣ شهور" : "Compared to last 3 months",
    totalEffort: isAr ? "الوقت الكلي للتمرين" : "Total effort time logged",
  };

  const getMuscleLabel = (muscle: string) => {
    if (!isAr) return muscle;
    const map: Record<string, string> = { Chest: "الصدر", Back: "الظهر", Legs: "الأرجل", Shoulders: "الأكتاف", Arms: "الذراعين", Core: "البطن" };
    return map[muscle] || muscle;
  };

  const getWeeklyCalendarStrip = () => {
    const strip = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isSessionLogged = sessionsList.some((s) => { const sd = new Date(s.date); return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear(); });
      strip.push({ date: d, dateNum: d.getDate(), dayLabel: d.toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "narrow" }), active: isSessionLogged, isToday: i === 0 });
    }
    return strip;
  };
  const calendarStrip = getWeeklyCalendarStrip();

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <div className="rounded-[--radius-card] glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-base font-bold text-text-primary uppercase tracking-wider">{isAr ? "نشاط التدريب" : "Training Activity"}</h2><p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{isAr ? "الاستمرارية في آخر ١٢ أسبوع" : "Consistency over last 12 weeks"}</p></div>
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <WorkoutHeatmap data={workoutDensity} isAr={isAr} />
      </div>

      <div className="rounded-2xl bg-bg-surface p-5 border border-border/50 relative z-10">
        <WeeklyVolumeTarget data={weeklySetVolume} isAr={isAr} />
      </div>

      {/* KPI Carousel */}
      <div className="relative group overflow-hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth" id="metric-carousel-overview">
          <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
            <div><div className="flex justify-between items-start"><span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{isAr ? "التمارين" : "Workouts Completed"}</span><span className="text-[9px] text-text-muted font-mono font-bold">{t.compared3Months}</span></div><div className="flex items-baseline gap-1.5 mt-2"><span className="text-3xl font-black text-text-primary tabular-nums"><AnimatedCounter value={totalStats.totalWorkouts} /></span><span className="text-xs text-text-muted font-bold uppercase tracking-wider">{isAr ? "تمرينات" : "Sessions"}</span></div></div>
            <div className="h-16 w-full -mx-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={workoutSparkline}><defs><linearGradient id="workoutGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#CCFF00" stopOpacity={0.2}/><stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#CCFF00" strokeWidth={1.5} fillOpacity={1} fill="url(#workoutGrad)" /></AreaChart></ResponsiveContainer></div>
          </div>
          <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
            <div><div className="flex justify-between items-start"><span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.volume}</span><span className="text-[9px] text-text-muted font-mono font-bold">{isAr ? "كجم توتال" : "Total Tonnage"}</span></div><div className="flex items-baseline gap-1.5 mt-2"><span className="text-3xl font-black text-text-primary tabular-nums"><AnimatedCounter value={totalStats.totalVolume >= 1000 ? totalStats.totalVolume / 1000 : totalStats.totalVolume} formatter={(v: number) => totalStats.totalVolume >= 1000 ? v.toFixed(1) : Math.round(v).toString()} /></span><span className="text-xs text-text-muted font-bold uppercase tracking-wider">{totalStats.totalVolume >= 1000 ? (isAr ? "طن" : "Ton") : (isAr ? "كجم" : "Kg")}</span></div></div>
            <div className="h-16 w-full -mx-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={volumeSparkline}><defs><linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={1.5} fillOpacity={1} fill="url(#volGrad)" /></AreaChart></ResponsiveContainer></div>
          </div>
          <div className="w-full shrink-0 snap-start snap-always bg-gradient-to-b from-bg-surface to-bg-surface-hover border border-border rounded-[--radius-card] p-5 relative overflow-hidden flex flex-col justify-between h-44">
            <div><div className="flex justify-between items-start"><span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t.duration}</span><span className="text-[9px] text-text-muted font-mono font-bold">{t.totalEffort}</span></div><div className="flex items-baseline gap-1.5 mt-2"><span className="text-3xl font-black text-text-primary tabular-nums"><AnimatedCounter value={totalStats.totalDuration / 60} /></span><span className="text-xs text-text-muted font-bold uppercase tracking-wider">{isAr ? "ساعة" : "hours"}</span></div></div>
            <div className="h-16 w-full -mx-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={durationSparkline}><defs><linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/><stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={1.5} fillOpacity={1} fill="url(#durGrad)" /></AreaChart></ResponsiveContainer></div>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          {[0,1,2].map((idx) => (
            <button key={idx} onClick={() => { setCarouselIndex(idx); const el = document.getElementById("metric-carousel-overview"); if (el) el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" }); }} className={cn("h-1.5 rounded-full transition-all duration-300", carouselIndex === idx ? "w-4 bg-primary" : "w-1.5 bg-bg-surface-hover")} />
          ))}
        </div>
      </div>

      {/* Muscle Recovery */}
      <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
        <div className="flex items-center justify-between"><div><h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.muscleRecoveryTitle} 🩺</h3><p className="text-[10px] text-text-muted font-bold">{t.anyReadyToTrain}</p></div><button onClick={() => setIsRecoveryModalOpen(true)} className="text-xs font-black text-primary uppercase tracking-wider">{t.viewAll}</button></div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {Object.entries(muscleRecovery).map(([muscle, stats]) => {
            const isFresh = stats.percent === 100;
            const isSore = stats.percent < 40;
            let colorClass = "bg-primary"; let textClass = "text-primary"; let borderClass = "border-primary/20";
            if (isSore) { colorClass = "bg-red-500"; textClass = "text-red-400"; borderClass = "border-red-500/20"; }
            else if (stats.percent < 100) { colorClass = "bg-yellow-500"; textClass = "text-yellow-400"; borderClass = "border-yellow-500/20"; }
            return (
              <button key={muscle} onClick={() => setIsRecoveryModalOpen(true)} className={cn("p-3 rounded-xl border bg-bg-surface-hover flex flex-col justify-between h-24 min-w-[110px] transition-all hover:bg-bg-elevated cursor-pointer shrink-0 text-right", borderClass)}>
                <div className="flex justify-between items-start w-full"><span className="text-xs font-black text-text-primary uppercase tracking-wider">{getMuscleLabel(muscle)}</span><span className={cn("text-xs font-mono font-black", textClass)}><AnimatedCounter value={stats.percent} />%</span></div>
                <div className="space-y-1 w-full"><div className="h-1.5 w-full bg-bg-surface-hover rounded-full overflow-hidden"><div className={cn("h-full rounded-full", colorClass)} style={{ width: `${stats.percent}%` }} /></div><p className="text-[8px] text-text-muted font-bold uppercase tracking-wider font-mono truncate">{isFresh ? t.readyToLift : t.hoursRemaining(stats.hoursLeft)}</p></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* This Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4 flex flex-col justify-between">
          <div><h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.thisWeek} 📊</h3><p className="text-[10px] text-text-muted font-bold">{t.focusWhereThisWeek}</p></div>
          <div className="py-2 flex flex-col items-center bg-bg-surface/20 rounded-2xl border border-border"><AnatomyModel muscleLevels={workedThisWeek} view="both" highlightColor="red" isAr={isAr} onMuscleClick={(m) => setSelectedMuscle(m)} /></div>
          <div className="flex justify-between bg-bg-surface p-2.5 rounded-xl border border-border mt-2">
            {calendarStrip.map((day, idx) => {
              const isSelected = selectedDate && selectedDate.getDate() === day.date.getDate() && selectedDate.getMonth() === day.date.getMonth();
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] text-text-muted font-bold uppercase">{day.dayLabel}</span>
                  <button onClick={() => setSelectedDate(isSelected ? null : day.date)} className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all relative cursor-pointer outline-none", isSelected ? "ring-2 ring-primary bg-primary/20 border border-primary text-primary scale-115 shadow-lg shadow-primary/20" : day.active ? "bg-primary border-primary text-primary-text shadow-md shadow-primary/20 scale-105 font-black" : day.isToday ? "bg-bg-surface-hover border border-border text-text-primary" : "bg-bg-surface-hover text-text-muted border border-border")} >{day.dateNum}{day.active && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-bg-surface rounded-full border border-primary" />}</button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card rounded-[--radius-card] p-5 border border-border">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.thisMonthFocus} 🎯</h3>
          <p className="text-[10px] text-text-muted font-bold">{t.whereFocusedMore}</p>
          {muscleGroupStats.length > 0 ? (
            <div className="h-64 flex items-center justify-center mt-4"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="75%" data={muscleGroupStats}><PolarGrid stroke="#27272A" /><PolarAngleAxis dataKey="muscle" tick={{ fill: "#A1A1AA", fontSize: 10, textAnchor: "middle" }} /><PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={false} axisLine={false} /><Radar name="Volume" dataKey="volume" stroke="#CCFF00" fill="#CCFF00" fillOpacity={0.35} /></RadarChart></ResponsiveContainer></div>
          ) : <div className="h-32 flex items-center justify-center text-xs text-text-muted">No data yet</div>}
        </div>
      </div>

      {/* Exercise Log Trends */}
      <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.exerciseLog} 📈</h3>
        {weeklyTonnage.length > 0 && weeklyTonnage.some((w) => w.tonnage > 0) ? (
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyTonnage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#A1A1AA", fontSize: 9 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#A1A1AA", fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: "#1C1C1F", border: "1px solid #27272A", borderRadius: 8, fontSize: 12 }} /><Bar dataKey="tonnage" fill="#CCFF00" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        ) : <DataEmptyState icon={TrendingUp} title={isAr ? "لا توجد اتجاهات" : "No Trends Yet"} description="Log workouts to see trends." actionLabel={isAr ? "سجل تمرينك" : "Log a Workout"} onAction={onNavigateHome} />}
      </div>

      {/* PRs */}
      <div className="glass-card rounded-[--radius-card] p-5 border border-border space-y-4">
        <div><h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{t.personalRecordsTitle} 🏆</h3><p className="text-[10px] text-text-muted font-bold">{t.prsDesc}</p></div>
        {personalRecords.length > 0 ? (
          <div className="space-y-3">
            {personalRecords.slice(0,5).map((pr) => (
              <button key={String(pr.exerciseId)} onClick={async () => { if (selectedPrId === pr.exerciseId) { setSelectedPrId(null); return; } setSelectedPrId(pr.exerciseId); const hist = await getEstimated1RM(pr.exerciseId); setPrHistory(hist); }} className={cn("w-full text-left bg-bg-surface-hover/40 border border-border rounded-xl p-3 flex flex-col transition-all", selectedPrId === pr.exerciseId ? "ring-2 ring-primary border-primary/30 bg-bg-surface-hover/80" : "hover:bg-bg-surface-hover/60")}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-border overflow-hidden relative shrink-0 shadow-sm"><Trophy className={cn("h-5 w-5", selectedPrId === pr.exerciseId ? "text-primary animate-bounce" : "text-warning animate-pulse")} /></div><div className="min-w-0"><p className="text-xs font-black text-text-primary capitalize truncate">{pr.exerciseName}</p><p className="text-[10px] text-text-muted font-semibold font-mono">{new Date(pr.date).toLocaleDateString()}</p></div></div>
                  <div className="text-right flex items-center gap-2"><p className="text-sm font-black text-warning tabular-nums whitespace-nowrap"><AnimatedCounter value={pr.maxWeight} /><span className="text-[10px] text-text-muted font-bold ml-0.5 uppercase">kg</span></p><ChevronDown className={cn("h-4 w-4 text-text-muted/50 transition-transform", selectedPrId === pr.exerciseId && "rotate-180")} /></div>
                </div>
                {selectedPrId === pr.exerciseId && <div className="mt-4 pt-4 border-t border-border/50"><PRProgressChart data={prHistory} isAr={isAr} /></div>}
              </button>
            ))}
          </div>
        ) : <DataEmptyState icon={Trophy} title={isAr ? "لا توجد أرقام قياسية" : "No Records Yet"} description="Start logging workout sets!" actionLabel={isAr ? "حطم رقمك القياسي" : "Log a Set"} onAction={onNavigateHome} />}
      </div>

      <div className="glass-card rounded-[--radius-card] p-5 border border-border bg-gradient-to-r from-primary/10 to-transparent flex flex-col sm:flex-row items-center gap-5">
        <div className="relative flex shrink-0"><div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center font-black text-white text-sm z-10 shadow-lg">⚡</div><div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black text-primary-text text-sm -ml-4 shadow-lg border-2 border-border">👥</div></div>
        <div className="flex-1 text-center sm:text-right"><h4 className="text-sm font-black text-text-primary">{t.addFriendsTitle}</h4><p className="text-xs text-text-secondary mt-1">{t.addFriendsDesc}</p></div>
        <Button variant="primary" onClick={onNavigateFeed}>{t.addFriendsBtn}<Users className="w-4 h-4 ml-1.5" /></Button>
      </div>

      {/* Simple Modals for Recovery & Selected Date/Muscle simplified */}
      {selectedDate && (
        <div className="glass-card rounded-[--radius-card] p-5 border border-primary/30 bg-primary/5">
          <div className="flex justify-between items-center mb-3"><h4 className="text-sm font-black">{selectedDate.toLocaleDateString()}</h4><button onClick={() => setSelectedDate(null)} className="p-1 bg-bg-surface border border-border rounded-lg"><X className="w-4 h-4" /></button></div>
          <p className="text-xs text-text-muted">{sessionsList.filter((s) => new Date(s.date).toDateString() === selectedDate.toDateString()).length} workouts on this day</p>
        </div>
      )}
      {selectedMuscle && (
        <div className="glass-card rounded-[--radius-card] p-5 border border-border">
          <div className="flex justify-between items-center mb-3"><h4 className="text-sm font-black">{getMuscleLabel(selectedMuscle)} - History</h4><button onClick={() => setSelectedMuscle(null)} className="p-1 bg-bg-surface border border-border rounded-lg"><X className="w-4 h-4" /></button></div>
          <AnatomyModel muscleLevels={{ [selectedMuscle]: 100 }} view="both" highlightColor="red" isAr={isAr} borderless />
        </div>
      )}

      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-bg-surface/95 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-bg-surface border border-border rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setIsRecoveryModalOpen(false)} className="absolute top-4 right-4 p-2 bg-bg-surface-hover rounded-xl"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-black uppercase">{t.muscleRecoveryTitle}</h3>
            <AnatomyModel muscleLevels={Object.entries(muscleRecovery).reduce((acc, [k,v]) => ({ ...acc, [k]: v.percent }), {})} view="both" highlightColor="green" isAr={isAr} />
          </div>
        </div>
      )}
    </div>
  );
}
