import { ReactNode, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Dumbbell, Activity, User, Utensils, Globe, ArrowUp, Play, X, AlertTriangle, Settings, LogOut, LogIn } from "lucide-react";
import { ToastContainer } from "@/components/ui/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWorkoutStore } from "@/store/useWorkoutStore";
import { useAuthStore } from "@/store/useAuthStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ReLiftLogo from "@/components/ReLiftLogo";

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <Link
      to={to}
      onClick={triggerHaptic}
      className="group relative flex flex-1 flex-col items-center justify-center py-2 text-text-muted hover:text-text-primary transition-colors"
    >
      <motion.div
        whileTap={{ scale: 0.82 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex flex-col items-center"
      >
        {isActive && (
          <motion.div
            layoutId="activeNavTab"
            className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_12px_rgba(204,255,0,0.8)]"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon
          size={22}
          strokeWidth={isActive ? 2.8 : 2}
          className={cn("mt-1 transition-colors duration-200", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(204,255,0,0.4)]" : "text-text-muted")}
        />
        <span
          className={cn(
            "text-[10px] mt-1 font-bold tracking-wider text-center uppercase transition-colors duration-200",
            isActive ? "text-primary font-black" : "text-text-muted"
          )}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useSettingsStore();
  const { user } = useAuthStore();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAr = language === "ar";

  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
    setShowHeader(true);
    setShowProfileMenu(false);
    lastScrollY.current = 0;
  }, [location.pathname]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(currentScrollTop > 300);

    // Always show header at the very top
    if (currentScrollTop <= 10) {
      setShowHeader(true);
      lastScrollY.current = currentScrollTop;
      return;
    }

    // Only toggle header if scrolled past a small threshold to avoid micro-flickering
    if (Math.abs(currentScrollTop - lastScrollY.current) > 10) {
      if (currentScrollTop > lastScrollY.current && currentScrollTop > 80) {
        // Scrolling down -> hide header
        setShowHeader(false);
      } else {
        // Scrolling up -> show header
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollTop;
    }
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex justify-center bg-bg-surface min-h-screen">
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex flex-col h-[100dvh] w-full max-w-md bg-bg text-text-primary relative shadow-2xl border-x border-border overflow-hidden"
      >
        <ToastContainer />
        
        {/* Header with Title, Quick Actions, and Safe Area Top Padding */}
        <header
          className={cn(
            "absolute top-0 left-0 right-0 pt-[env(safe-area-inset-top)] bg-bg-surface/85 backdrop-blur-xl border-b border-border/50 z-40 transition-transform duration-300 ease-in-out shadow-sm",
            showHeader ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="h-14 flex items-center justify-between px-3.5">
            {/* Quick Language Toggle Button */}
            <button
              onClick={() => {
                setLanguage(language === "ar" ? "en" : "ar");
                if (typeof navigator !== "undefined" && navigator.vibrate) {
                  navigator.vibrate(12);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-surface-hover/90 hover:bg-bg-surface-hover border border-border/60 text-xs font-bold text-text-muted hover:text-text-primary transition-all active:scale-95 cursor-pointer shadow-inner"
              title={isAr ? "تغيير اللغة" : "Switch Language"}
            >
              <Globe size={13} className="text-primary" />
              <span className="uppercase text-[11px] tracking-wide font-extrabold">{language === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Center Brand / Logo */}
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <ReLiftLogo size={32} glow={true} className="group-hover:scale-105 transition-transform duration-200" />
                {activeWorkout && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-bg-surface"></span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black italic tracking-widest uppercase text-primary drop-shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                  ReLift
                </h1>
                <span className="text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md shadow-sm select-none">
                  PRO
                </span>
              </div>
            </Link>

            {/* Right Action: Live Session Shortcut or Profile Avatar */}
            <div className="flex items-center gap-2 relative">
              {activeWorkout ? (
                <Link
                  to="/workout/$sessionId"
                  params={{ sessionId: activeWorkout.id || "active" }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-black text-xs font-black shadow-[0_0_12px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  <Play size={11} fill="currentColor" />
                  <span className="text-[10px] uppercase tracking-wider">{isAr ? "مباشر" : "LIVE"}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      if (typeof navigator !== "undefined" && navigator.vibrate) {
                        navigator.vibrate(10);
                      }
                    }}
                    className={cn(
                      "p-1 rounded-full border bg-bg-surface-hover/80 hover:bg-bg-surface-hover transition-all active:scale-95 cursor-pointer flex items-center justify-center overflow-hidden shadow-inner w-8 h-8",
                      showProfileMenu ? "border-primary shadow-[0_0_8px_rgba(204,255,0,0.4)]" : "border-border/60 hover:border-primary/50"
                    )}
                    title={isAr ? "القائمة الشخصية" : "Profile Menu"}
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <User size={15} className="text-text-muted hover:text-text-primary" />
                    )}
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <>
                        {/* Transparent backdrop overlay */}
                        <div 
                          className="fixed inset-0 z-45 cursor-default" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProfileMenu(false);
                          }}
                        />

                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className={cn(
                            "absolute top-full mt-2.5 w-60 bg-bg-elevated border border-border/70 backdrop-blur-xl rounded-2xl shadow-2xl z-50 p-3 flex flex-col gap-1.5",
                            isAr ? "left-0" : "right-0"
                          )}
                        >
                          {/* User Info Card */}
                          <div className="flex items-center gap-3 p-2 border-b border-border/40 pb-3 mb-1">
                            <div className="relative">
                              {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || "User"} className="w-9 h-9 rounded-full object-cover border border-primary/20" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                  <User size={18} className="text-primary" />
                                </div>
                              )}
                              <span className="absolute -bottom-1 -right-1 bg-primary text-black text-[7px] font-black px-1 rounded border border-bg uppercase tracking-widest scale-90">
                                PRO
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-text-primary truncate text-left">
                                {user?.displayName || (isAr ? "لاعب ريليفت" : "Athlete")}
                              </p>
                              <p className="text-[10px] text-text-muted truncate text-left">
                                {user?.email || "guest@relift.fit"}
                              </p>
                            </div>
                          </div>

                          {/* Menu Options */}
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-surface-hover/80 active:scale-98 transition-all text-text-primary hover:text-primary cursor-pointer text-xs font-extrabold",
                              isAr ? "flex-row-reverse text-right" : "flex-row text-left"
                            )}
                          >
                            <User size={14} className="text-text-muted" />
                            <span>{isAr ? "الملف الشخصي" : "My Profile"}</span>
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setShowProfileMenu(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-surface-hover/80 active:scale-98 transition-all text-text-primary hover:text-primary cursor-pointer text-xs font-extrabold",
                              isAr ? "flex-row-reverse text-right" : "flex-row text-left"
                            )}
                          >
                            <Settings size={14} className="text-text-muted" />
                            <span>{isAr ? "الإعدادات العامة" : "General Settings"}</span>
                          </Link>


                          {/* Custom actions depending on Guest / Active session */}
                          <div className="border-t border-border/40 mt-1.5 pt-1.5">
                            {user && user.uid !== "guest-user" ? (
                              <button
                                onClick={() => {
                                  setShowProfileMenu(false);
                                  if (auth) {
                                    signOut(auth);
                                    if (typeof navigator !== "undefined" && navigator.vibrate) {
                                      navigator.vibrate(15);
                                    }
                                  }
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 active:scale-98 transition-all text-rose-500 hover:text-rose-400 cursor-pointer text-xs font-extrabold",
                                  isAr ? "flex-row-reverse text-right" : "flex-row text-left"
                                )}
                              >
                                <LogOut size={14} />
                                <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
                              </button>
                            ) : (
                              <Link
                                to="/auth"
                                onClick={() => setShowProfileMenu(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 active:scale-98 transition-all text-primary cursor-pointer text-xs font-black shadow-inner",
                                  isAr ? "flex-row-reverse text-right" : "flex-row text-left"
                                )}
                              >
                                <LogIn size={14} />
                                <span>{isAr ? "إنشاء حساب سحابي" : "Sign In / Register"}</span>
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </header>

        <main
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth no-scrollbar pt-[calc(3.5rem+env(safe-area-inset-top))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="px-4 py-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToTop}
              className={cn(
                "fixed right-4 z-50 p-2.5 rounded-full bg-primary text-black font-black shadow-[0_0_16px_rgba(204,255,0,0.3)] hover:scale-105 active:scale-95 transition-transform",
                location.pathname === "/builder" ? "bottom-32" : "bottom-24"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>



        {/* Bottom Nav with Safe Area Bottom Padding */}
        {/* Active Workout Banner above bottom nav */}
        <AnimatePresence>
          {activeWorkout && !location.pathname.startsWith("/workout") && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="shrink-0 w-full bg-bg-surface-hover/95 border-t border-border flex items-center justify-between px-5 py-3.5 backdrop-blur-md z-45"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-black text-text-primary tracking-wider">
                  {isAr ? "التمرين قيد التنفيذ" : "Workout in Progress"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Discard button */}
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-rose-500 hover:text-rose-400 transition-colors"
                >
                  <X size={14} strokeWidth={3} />
                  <span>{isAr ? "تجاهل" : "Discard"}</span>
                </button>

                {/* Resume button */}
                <Link
                  to="/workout/$sessionId"
                  params={{ sessionId: activeWorkout.id }}
                  className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary-light transition-colors"
                >
                  <Play size={12} fill="currentColor" strokeWidth={0} />
                  <span>{isAr ? "استئناف" : "Resume"}</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="shrink-0 w-full bg-bg-surface/90 backdrop-blur-xl border-t border-border/50 flex flex-col justify-end z-50">
          <div className="flex justify-between items-center h-[4.5rem]">
            <NavItem to="/" icon={Home} label={isAr ? "الرئيسية" : "Home"} />
            <NavItem to="/exercises" icon={Dumbbell} label={isAr ? "التمارين" : "Exercises"} />
            <NavItem to="/feed" icon={Globe} label={isAr ? "الناس" : "Feed"} />
            <NavItem to="/nutrition" icon={Utensils} label={isAr ? "أكلك" : "Nutrition"} />
            <NavItem to="/stats" icon={Activity} label={isAr ? "تطورك" : "Stats"} />
            <NavItem to="/profile" icon={User} label={isAr ? "بروفايلك" : "Profile"} />
          </div>
          <div className="h-[env(safe-area-inset-bottom)] bg-transparent w-full" />
        </nav>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-bg-elevated border border-border rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl text-center"
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <AlertTriangle size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-text-primary">
                    {isAr ? "هل أنت متأكد؟" : "Are you sure?"}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {isAr
                      ? "سيتم حذف جميع المجموعات والتمارين المسجلة في هذه الجلسة ولن تتمكن من استعادتها."
                      : "This will discard all logged sets and exercises in this live session. This action cannot be undone."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-transparent text-xs font-bold text-text-secondary hover:bg-bg-hover transition-all active:scale-95"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={() => {
                      cancelWorkout();
                      setShowCancelConfirm(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all active:scale-95"
                  >
                    {isAr ? "تجاهل وحذف" : "Discard"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
