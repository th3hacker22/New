import React from "react";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home, Dumbbell, User, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

// Sub-views for the HashRouter demo/switcher
function HomeSection() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
        <Home size={36} />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-text-primary uppercase italic">Home Section</h1>
      <p className="text-text-muted max-w-sm mx-auto text-sm leading-relaxed">
        Welcome to your RELIFT dashboard. Track your daily readiness, active workout plans, and quick stats.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <div className="p-4 rounded-2xl bg-bg-surface border border-border/60 shadow-lg text-left w-48">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Streak</span>
          <span className="text-2xl font-black text-primary">5 Days 🔥</span>
        </div>
        <div className="p-4 rounded-2xl bg-bg-surface border border-border/60 shadow-lg text-left w-48">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Workouts</span>
          <span className="text-2xl font-black text-text-primary">24 Completed</span>
        </div>
      </div>
    </div>
  );
}

function WorkoutLoggerSection() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
        <Dumbbell size={36} />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-text-primary uppercase italic">Workout Logger</h1>
      <p className="text-text-muted max-w-sm mx-auto text-sm leading-relaxed">
        Build routines, log active sets, weights, and reps in real-time with our advanced barbell tracking engine.
      </p>
      <div className="pt-6">
        <button 
          onClick={() => alert("Starting quick workout session!")}
          className="px-6 py-3 rounded-2xl bg-primary text-bg-base font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Zap size={16} /> Start Active Session
        </button>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
        <User size={36} />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-text-primary uppercase italic">Profile Section</h1>
      <p className="text-text-muted max-w-sm mx-auto text-sm leading-relaxed">
        Manage your athlete identity, body metrics, PR badges, subscription status, and app settings.
      </p>
      <div className="pt-4 max-w-xs mx-auto bg-bg-surface p-4 rounded-2xl border border-border/60 text-left space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-text-muted">Athlete Name</span>
          <span className="text-text-primary">Guest Athlete</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-text-muted">Membership</span>
          <span className="text-primary uppercase tracking-widest">PRO</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-text-muted">Weight</span>
          <span className="text-text-primary">78.5 kg</span>
        </div>
      </div>
    </div>
  );
}

function NavContent() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/logger", label: "Workout Logger", icon: Dumbbell },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex flex-col h-[520px] max-w-md mx-auto bg-bg-card rounded-[2.5xl] border border-border/80 shadow-2xl overflow-hidden relative">
      {/* Top Header */}
      <div className="px-6 py-4 bg-bg-surface/80 backdrop-blur border-b border-border/60 flex items-center justify-between">
        <span className="text-sm font-black italic tracking-widest uppercase text-primary">RELIFT NAV</span>
        <span className="text-[10px] font-bold text-text-muted bg-bg-base px-2.5 py-1 rounded-full border border-border">HashRouter Active</span>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <Routes>
          <Route path="/" element={<HomeSection />} />
          <Route path="/logger" element={<WorkoutLoggerSection />} />
          <Route path="/profile" element={<ProfileSection />} />
        </Routes>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur border-t border-border/80 px-4 py-2 flex items-center justify-around z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-1 flex-col items-center justify-center py-2 text-text-muted hover:text-text-primary transition-colors group"
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                whileHover={{ y: -2 }}
                className="flex flex-col items-center"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTab"
                    className="absolute -top-2 w-10 h-1 bg-primary rounded-full shadow-[0_0_12px_rgba(204,255,0,0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.8 : 2}
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]" : "text-text-muted group-hover:text-text-primary"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] mt-1.5 font-bold tracking-wider uppercase transition-colors duration-200",
                    isActive ? "text-primary font-black" : "text-text-muted group-hover:text-text-primary"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function BottomNav() {
  return (
    <HashRouter>
      <div className="w-full py-6 px-4 flex items-center justify-center">
        <NavContent />
      </div>
    </HashRouter>
  );
}
