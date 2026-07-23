import { motion } from "framer-motion";
import { Globe, User } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import ReLiftLogo from "@/components/ReLiftLogo";

export default function AppSkeletonLoader() {
  const { language } = useSettingsStore();
  const isAr = language === "ar";

  // Quick helper for simple skeletons
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse rounded bg-bg-surface-hover/85 ${className}`} />
  );

  return (
    <div className="flex justify-center bg-bg-surface min-h-screen">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex flex-col h-[100dvh] w-full max-w-md bg-bg text-text-primary relative border-x border-border overflow-hidden"
      >
        {/* ── Fake Header (Matching Layout.tsx exactly) ── */}
        <header className="pt-[env(safe-area-inset-top)] bg-bg-surface/85 backdrop-blur-xl border-b border-border/50 z-40 shadow-sm shrink-0">
          <div className="h-14 flex items-center justify-between px-3.5">
            {/* Left action placeholder (switch language) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface-hover/90 border border-border/60 text-xs text-text-muted select-none">
              <Globe size={13} className="text-primary/40 animate-pulse" />
              <span className="uppercase text-[11px] tracking-wide font-extrabold text-text-muted/40 animate-pulse">
                {isAr ? "EN" : "عربي"}
              </span>
            </div>

            {/* Center Brand/Logo */}
            <div className="flex items-center gap-2 select-none">
              <ReLiftLogo size={32} glow={false} className="opacity-40" />
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-black italic tracking-widest uppercase text-primary/40 drop-shadow-[0_0_8px_rgba(204,255,0,0.15)] animate-pulse">
                  ReLift
                </h1>
                <span className="text-[9px] font-black uppercase tracking-wider bg-primary/5 text-primary/30 border border-primary/10 px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              </div>
            </div>

            {/* Right Action: Profile Avatar Shape */}
            <div className="p-1 rounded-full border border-border/60 bg-bg-surface-hover/80 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-bg-surface-hover/90 flex items-center justify-center">
                <User size={14} className="text-text-muted/40" />
              </div>
            </div>
          </div>
        </header>

        {/* ── Fake Scroll Area ── */}
        <main className="flex-1 overflow-y-auto pt-2 px-4 pb-12 space-y-6 no-scrollbar">
          
          {/* Greeting Area Skeleton */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Quick Actions Grid (grid-cols-2 matches HomePage layout) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-2.5 sm:gap-3 rounded-[--radius-card] p-3 border border-border/40 bg-bg-surface/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover/70 animate-pulse">
                  <div className="w-4.5 h-4.5 rounded bg-bg-surface-hover/90" />
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-3 w-18" />
                </div>
              </div>
            ))}
          </div>

          {/* Large Card: Recovery Heatmap / Dashboard Core Widget */}
          <div className="glass-card p-5 border border-border/40 bg-bg-surface/30 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2 w-48" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            {/* Simulated Muscle Heatmap or Graph bars */}
            <div className="h-36 rounded-xl bg-bg-surface-hover/50 flex items-center justify-center gap-3 px-4 relative overflow-hidden">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-2 h-full py-4">
                  <div 
                    className="w-full bg-bg-surface-hover/80 rounded-lg animate-pulse" 
                    style={{ height: `${20 + idx * 15}%` }} 
                  />
                  <Skeleton className="h-2 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Card: Performance Stats / Log Tracker */}
          <div className="glass-card p-4 border border-border/30 bg-bg-surface/20 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>

            {/* List Row Skeletons */}
            <div className="space-y-2.5">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-bg-surface-hover/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-surface-hover/60 animate-pulse" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-14" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* ── Fake Bottom Navigation (Matching Layout.tsx exactly) ── */}
        <nav className="shrink-0 w-full bg-bg-surface-hover backdrop-blur-md border-t border-border flex flex-col justify-end z-50">
          <div className="flex justify-between items-center h-[4.5rem]">
            {[
              { label: isAr ? "الرئيسية" : "Home" },
              { label: isAr ? "التمارين" : "Exercises" },
              { label: isAr ? "الناس" : "Feed" },
              { label: isAr ? "أكلك" : "Nutrition" },
              { label: isAr ? "تطورك" : "Stats" },
              { label: isAr ? "بروفايلك" : "Profile" }
            ].map((tab, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-center py-2 text-text-muted/40 select-none"
              >
                {/* Simulated Icon Circle */}
                <div className="w-5 h-5 rounded-full bg-bg-surface-hover/80 animate-pulse mb-1" />
                {/* Simulated Label Text */}
                <span className="text-[10px] font-bold tracking-wider uppercase text-text-muted/30 animate-pulse text-center truncate px-1">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-[env(safe-area-inset-bottom)] bg-transparent w-full" />
        </nav>

      </div>
    </div>
  );
}
