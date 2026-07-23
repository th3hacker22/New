import { useState, useRef, useEffect } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Moon,
  Timer,
  Bell,
  Scale,
  Info,
  ChevronRight,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Dumbbell,
  Trophy,
  HelpCircle,
  QrCode,
  Globe,
  Sparkles,
  X,
  Shield,
  Gift,
  User,
  RotateCcw,
  RefreshCw,
  Lock,
  TrendingUp,
  Beaker,
  Download,
  Upload,
  Check,
  Zap,
  ExternalLink,
  ChevronDown,
  Heart
} from "lucide-react";
import { useSettingsStore, Theme } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import BarPlateCalculator from "@/components/extras/BarPlateCalculator";
import FeatureSuggestions from "@/components/extras/FeatureSuggestions";
import SupportAndBot from "@/components/extras/SupportAndBot";

// Language Translation Mapping
const translations = {
  en: {
    back: "Back",
    settings: "Settings",
    customize: "Customize your ReLift experience",
    
    // Promo Banner
    lifetimeOffer: "Lifetime Offer",
    discountPercent: "LIFETIME DISCOUNT ACTIVE",
    discountSub: "Upgrade now & save forever. Single payment, lifetime training logs.",
    upgradeBtn: "Upgrade Now",
    premiumActive: "Premium Lifetime Member 👑",
    premiumActiveSub: "Thank you for supporting ReLift! All features unlocked.",
    
    // Account Section
    account: "Account",
    pulseSub: "ReLift Subscription",
    pulseSubSub: "View, change or cancel your subscription",
    giftFriend: "Give a Friend 14 Days Premium",
    giftFriendSub: "Share the grind with your workout circle",
    profile: "Personal Profile",
    profileSub: "Manage personal details and credentials",
    restorePurchases: "Restore Purchases",
    restorePurchasesSub: "Re-link your Apple/Google Play purchases",
    syncData: "Sync Workout Data",
    syncDataSub: "Push & pull local training data with ReLift cloud",

    // Integrations Section
    integrations: "Integrations",
    strava: "Strava Connection",
    healthConnect: "Health Connect",
    googleFit: "Google Fit",
    samsungHealth: "Samsung Health",
    notConnected: "Not Connected",
    connected: "Connected ⚡",
    learnMore: "Learn More",
    importData: "Import Data",
    importDataSub: "Import previous sessions from CSV or JSON files",
    exportData: "Export Data",
    exportDataSub: "Download your training history as CSV/JSON",

    // Preferences Section
    preferences: "Preferences",
    units: "Units",
    unitsSub: "Weight, distance and measurements",
    privacyControls: "Privacy Controls",
    privacyControlsSub: "Manage profile visibility and social status sharing",
    pushNotifications: "Push Notifications",
    pushNotificationsSub: "Workout reminders, PR alerts & social triggers",
    firstDay: "First Day of the Week",
    firstDaySub: "Adjust calendar rendering offset",
    workoutSettings: "Workout Settings",
    workoutSettingsSub: "Manage timers, audio, vibration, RPE/RIR",
    chartSettings: "Chart Settings",
    chartSettingsSub: "Personalize metrics and performance graph limits",
    theme: "App Theme",
    themeSub: "Light, dark or match system default",
    language: "App Language",
    languageSub: "Choose interface language preference",
    experimental: "Experimental Beta Features",
    experimentalSub: "Be the first to try next-gen gym tools",

    // ReLift Core Section
    more: "ReLift Gym Core Tools",
    barCalc: "Bar & Plate Calculator 🏋️",
    barCalcSub: "Calculate plate configurations for standard barbell loads",
    suggestions: "Feature Suggestions & Voting 🗳️",
    suggestionsSub: "Vote on incoming features or propose new modules",
    aiSupport: "AI Support & Bug Reporter 🤖",
    aiSupportSub: "Chat with our AI Coach or report technical layout issues",
    shareCode: "Share App & QR Code 📲",
    shareCodeSub: "Show QR code to quickly share your training profile",

    about: "About",
    version: "ReLift v1.574",
    crafted: "Crafted with ⚡ for the Fitness Community"
  },
  ar: {
    back: "رجوع",
    settings: "الإعدادات",
    customize: "ظبط الأبلكيشن على مزاجك",
    
    // Promo Banner
    lifetimeOffer: "عرض مدى الحياة",
    discountPercent: "لديك خصم مدى الحياة",
    discountSub: "قم بالترقية الآن ووفر للأبد. دفعة واحدة للوصول اللانهائي.",
    upgradeBtn: "الترقية الآن",
    premiumActive: "عضوية مدى الحياة الممتازة 👑",
    premiumActiveSub: "شكراً لثقتك فينا! كل الميزات معاك.",
    
    // Account Section
    account: "الحساب",
    pulseSub: "اشتراكك في ري‌ليفت",
    pulseSubSub: "شوف أو عدل اشتراكك",
    giftFriend: "امنح صديقًا 14 يومًا من البريميوم",
    giftFriendSub: "شارك متعة التمرين مع أصدقائك المقربين",
    profile: "الملف الشخصي",
    profileSub: "إدارة تفاصيل الحساب وكلمة المرور",
    restorePurchases: "استعادة المشتريات",
    restorePurchasesSub: "استعد اشتراكاتك السابقة عبر المتجر",
    syncData: "مزامنة بيانات التمرين",
    syncDataSub: "مزامنة سجل تمارينك فورياً مع السحابة الآمنة",

    // Integrations Section
    integrations: "التكاملات",
    strava: "تطبيق Strava",
    healthConnect: "تطبيق Health Connect",
    googleFit: "جوجل فيت (Google Fit)",
    samsungHealth: "سامسونج هيلث (Samsung Health)",
    notConnected: "غير متصل",
    connected: "متصل ⚡",
    learnMore: "تعرف على المزيد",
    importData: "استيراد البيانات",
    importDataSub: "استورد تمارينك السابقة من ملفات خارجية",
    exportData: "تصدير البيانات",
    exportDataSub: "حمّل كامل سجل تمارينك بصيغة CSV أو JSON",

    // Preferences Section
    preferences: "تفضيلاتك",
    units: "الوحدات",
    unitsSub: "تعديل وحدات الوزن والمسافة والقياسات",
    privacyControls: "ضوابط الخصوصية",
    privacyControlsSub: "إدارة من يمكنه رؤية ملفك وتمارينك",
    pushNotifications: "إشعارات الدفع",
    pushNotificationsSub: "إشعارات التذكير، الأرقام القياسية والتفاعل",
    firstDay: "أول يوم من الأسبوع",
    firstDaySub: "تعديل يوم البداية في التقويم الأسبوعي",
    workoutSettings: "إعدادات التمرين",
    workoutSettingsSub: "تخصيص المؤقت، الأصوات، الاهتزاز، RPE/RIR",
    chartSettings: "إعدادات الرسم البياني",
    chartSettingsSub: "تخصيص محاور التقدم ومقاييس الأداء البيانية",
    theme: "سمة التطبيق",
    themeSub: "تغيير المظهر بين الداكن، الفاتح أو النظام",
    language: "اللغة",
    languageSub: "اختر لغتك المفضلة لواجهة التطبيق",
    experimental: "الميزات التجريبية (بيتا)",
    experimentalSub: "كن أول من يختبر ميزات صالة الألعاب الجديدة",

    // ReLift Core Section
    more: "أدوات ومساعدة",
    barCalc: "حاسبة البار والأقراص 🏋️",
    barCalcSub: "حساب توزيع الأقراص الحديدية لوزن البار المحدد",
    suggestions: "اقتراحات الميزات والتصويت 🗳️",
    suggestionsSub: "صوّت على الميزات القادمة أو اقترح أفكاراً جديدة",
    aiSupport: "الدعم بالذكاء الاصطناعي والإبلاغ 🤖",
    aiSupportSub: "تحدث مع مدربنا الذكي أو أبلغ عن مشاكل واجهة التطبيق",
    shareCode: "مشاركة التطبيق ورمز QR 📲",
    shareCodeSub: "اعرض رمز الاستجابة السريعة لمشاركة ملفك فورياً",

    about: "حول التطبيق",
    version: "نسخة ReLift v1.574",
    crafted: "صُنع بكل حب ⚡ لمجتمع اللياقة البدنية والكمال"
  }
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" }
  })
};

export default function SettingsPage() {
  const settings = useSettingsStore();
  const lang = (settings.language === "ar" ? "ar" : "en") as "ar" | "en";
  const isAr = lang === "ar";
  const t = translations[lang];

  // UI Modals / Interactivity States
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const [weekDayModalOpen, setWeekDayModalOpen] = useState(false);
  const [workoutSettingsOpen, setWorkoutSettingsOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  
  const [calcOpen, setCalcOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);


  // Notification Toast Overlay Simulation
  const [testToast, setTestToast] = useState<{ title: string; body: string; open: boolean }>({
    title: "",
    body: "",
    open: false
  });

  const playPingSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  const triggerMockPush = (title: string, body: string) => {
    playPingSound();
    setTestToast({ title, body, open: true });
    setTimeout(() => {
      setTestToast((prev) => ({ ...prev, open: false }));
    }, 4500);
  };

  return (
    <div className="space-y-6 pb-24 relative select-none">
      
      {/* ── Simulated FCM Push Toast overlay ── */}
      <AnimatePresence>
        {testToast.open && (
          <motion.div
            className="fixed top-4 left-4 right-4 z-[200] max-w-sm mx-auto p-4 rounded-xl border border-primary/20 bg-black/95 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex gap-3 items-start cursor-pointer hover:bg-black"
            initial={{ opacity: 0, y: -80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 200 }}
            onClick={() => setTestToast((prev) => ({ ...prev, open: false }))}
          >
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-primary shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-black text-text-primary uppercase tracking-wider">
                  {testToast.title}
                </span>
                <span className="text-[9px] text-text-muted font-bold uppercase shrink-0">now</span>
              </div>
              <p className="text-[11px] text-text-primary leading-relaxed font-semibold">
                {testToast.body}
              </p>
              <div className="mt-2 flex gap-1.5 items-center text-[9px] font-black uppercase text-primary tracking-wider hover:underline">
                Swipe to View ➔
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back Navigation Header ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary uppercase tracking-wide"
        >
          <ArrowLeft className={cn("h-4 w-4", isAr && "rotate-180")} />
          {t.back}
        </Link>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
          {settings.isPremium ? "Premium Active" : "Free Tier"}
        </span>
      </div>

      {/* ── Page Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-xl font-black text-text-primary uppercase tracking-wider">
          {t.settings}
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          {t.customize}
        </p>
      </motion.div>

      {/* ── Premium Lifetime Promo Card (عرض مدى الحياة) ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        onClick={() => setPremiumModalOpen(true)}
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 border cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300",
          settings.isPremium 
            ? "bg-gradient-to-br from-bg-surface to-bg-surface-hover border-primary/30 shadow-[0_4px_20px_rgba(204,255,0,0.1)]"
            : "bg-gradient-to-br from-bg-surface via-bg-surface to-bg-surface-hover border-border shadow-xl"
        )}
      >
        {/* Glow accent */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex-1 space-y-1 text-right sm:text-right">
            <span className="inline-block bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-sm">
              {t.discountPercent}
            </span>
            <h2 className="text-base font-black text-text-primary leading-tight">
              {settings.isPremium ? t.premiumActive : t.lifetimeOffer}
            </h2>
            <p className="text-xs text-text-secondary leading-normal max-w-[240px] font-medium">
              {settings.isPremium ? t.premiumActiveSub : t.discountSub}
            </p>
          </div>

          {/* Tag Icon */}
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            {settings.isPremium ? (
              <div className="bg-primary/20 border border-primary/40 rounded-2xl p-3 text-primary animate-pulse shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>
            ) : (
              <motion.div
                animate={{ rotate: [0, -10, 0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative cursor-pointer"
              >
                {/* Simulated %%% ticket tag from image */}
                <svg className="w-14 h-14 text-primary" viewBox="0 0 100 100" fill="none">
                  <path d="M10,40 L60,10 L90,40 L40,70 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                  <circle cx="25" cy="45" r="5" fill="black" stroke="currentColor" strokeWidth="3" />
                  <path d="M48,28 L54,34 M58,38 L64,44 M45,45 L55,35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <text x="45" y="45" fill="currentColor" fontSize="12" fontWeight="black" transform="rotate(-30, 45, 45)">%%%</text>
                </svg>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── SECTION: ACCOUNT (الحساب) ── */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">
          {t.account}
        </h3>
        
        <div className="space-y-2">
          {/* ReLift Subscription */}
          <div
            onClick={() => setPremiumModalOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.pulseSub}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {settings.isPremium ? "Active Lifetime Premium Plan 👑" : t.pulseSubSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Refer a Friend */}
          <div
            onClick={() => triggerMockPush("🎁 Gift Activated", "You shared 14 days of Premium. A link has been copied to your clipboard!")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Gift className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.giftFriend}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.giftFriendSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Profile link */}
          <Link to="/profile" className="block">
            <div className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
                <User className="h-5 w-5 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                  {t.profile}
                </p>
                <p className="text-[10px] text-text-muted truncate">
                  {t.profileSub}
                </p>
              </div>
              <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
            </div>
          </Link>

          {/* Restore purchases */}
          <div
            onClick={() => triggerMockPush("🔄 Restoring Purchases", "Restored successfully. Premium benefits have been re-validated.")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <RotateCcw className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.restorePurchases}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.restorePurchasesSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Sync workout data */}
          <div
            onClick={() => triggerMockPush("☁️ Cloud Sync Active", "Successfully synchronized 14 workout templates and logs with the central database.")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.syncData}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.syncDataSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>
        </div>
      </div>


      {/* ── SECTION: PREFERENCES (التفضيلات) ── */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">
          {t.preferences}
        </h3>
        
        <div className="space-y-2">
          {/* Units */}
          <div
            onClick={() => setUnitsModalOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Scale className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                  {t.units}
                </p>
                <span className="text-[10px] font-mono font-bold bg-bg-surface-hover text-text-secondary px-2 py-0.5 rounded-md">
                  {settings.weightUnit}/{settings.distanceUnit}/{settings.measurementUnit}
                </span>
              </div>
              <p className="text-[10px] text-text-muted truncate">
                {t.unitsSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* First day of the week */}
          <div
            onClick={() => setWeekDayModalOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Info className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                  {t.firstDay}
                </p>
                <span className="text-[10px] font-bold bg-bg-surface-hover text-primary px-2 py-0.5 rounded-md uppercase">
                  {settings.firstDayOfWeek}
                </span>
              </div>
              <p className="text-[10px] text-text-muted truncate">
                {t.firstDaySub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Workout Settings */}
          <div
            onClick={() => setWorkoutSettingsOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.workoutSettings}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.workoutSettingsSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Privacy Controls */}
          <div
            onClick={() => triggerMockPush("🔒 Security Audit", "Your profile is set to PRIVATE. Social feed comments are anonymized.")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Lock className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.privacyControls}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.privacyControlsSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Chart Settings */}
          <div
            onClick={() => triggerMockPush("📈 Chart Layout Settings", "Volume-over-Time selected. Secondary Y-axis configured to Bodyweight.")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.chartSettings}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.chartSettingsSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Theme setting */}
          <div
            onClick={() => setThemeModalOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Sun className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                  {t.theme}
                </p>
                <span className="text-[10px] font-bold bg-bg-surface-hover text-primary px-2 py-0.5 rounded-md uppercase">
                  {settings.theme}
                </span>
              </div>
              <p className="text-[10px] text-text-muted truncate">
                {t.themeSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Language preference setting */}
          <div
            onClick={() => setLangModalOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Globe className="h-5 w-5 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-center">
                <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                  {t.language}
                </p>
                <span className="text-[10px] font-bold bg-bg-surface-hover text-primary px-2 py-0.5 rounded-md uppercase">
                  {settings.language === "ar" ? "العربية" : "English"}
                </span>
              </div>
              <p className="text-[10px] text-text-muted truncate">
                {t.languageSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Experimental Features */}
          <div
            onClick={() => triggerMockPush("🧪 Beta Mode Activated", "Welcome to experimental mode. Smart camera workout detection enabled.")}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Beaker className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.experimental}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.experimentalSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>
        </div>
      </div>

      {/* ── SECTION: RELIFT CORE UTILITIES (أدوات ReLift Gym) ── */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">
          {t.more}
        </h3>
        
        <div className="space-y-2">
          {/* Plate Calculator */}
          <div
            onClick={() => setCalcOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.barCalc}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.barCalcSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* Feature Suggestions */}
          <div
            onClick={() => setSuggestionsOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1 min-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.suggestions}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.suggestionsSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* AI Support */}
          <div
            onClick={() => setSupportOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <HelpCircle className="h-5 w-5 text-sky-400" />
            </div>
            <div className="flex-1 min-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.aiSupport}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.aiSupportSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>

          {/* QR Code Share */}
          <div
            onClick={() => setQrOpen(true)}
            className="glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
              <QrCode className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1 min-0">
              <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
                {t.shareCode}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {t.shareCodeSub}
              </p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-text-muted shrink-0", isAr && "rotate-180")} />
          </div>
        </div>
      </div>

      {/* ── App Version ── */}
      <motion.p
        className="text-center text-[10px] font-mono text-text-muted pt-8 uppercase tracking-widest opacity-80"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        {t.version} • {t.crafted}
      </motion.p>

      {/* ── MODAL: PREMIUM UPGRADE (عرض مدى الحياة) ── */}
      <AnimatePresence>
        {premiumModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPremiumModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-md bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl space-y-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              {/* Close button */}
              <button
                onClick={() => setPremiumModalOpen(false)}
                className="absolute top-4 right-4 bg-bg-surface-hover hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary p-2 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 mt-2">
                <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl mx-auto flex items-center justify-center text-primary shadow-[0_0_20px_rgba(204,255,0,0.25)]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-wider">
                  ReLift Premium Lifetime
                </h3>
                <p className="text-xs text-text-secondary">
                  {isAr ? "وصول كامل وبدون حدود لكافة أدوات التدريب والذكاء الاصطناعي" : "Unlimited access to all coaching tools and smart metrics"}
                </p>
              </div>

              {/* Premium benefits list */}
              <div className="space-y-2 bg-bg-surface-hover/60 p-4 rounded-xl border border-border">
                {[
                  { en: "100% Cloud-to-Offline Instant Sync", ar: "مزامنة سحابية غير محدودة وبدون إنترنت" },
                  { en: "Advanced Progress Charts & Volume Metrics", ar: "رسوم بيانية متقدمة وإحصائيات الحجم والكتلة" },
                  { en: "Custom Exercise Templates & Builder Modules", ar: "قوالب تمارين غير محدودة ومعدل مخصص" },
                  { en: "Integrated Gym Plate & Barbell Assistant", ar: "حاسبة أوزان بار التمارين المتقدمة والذكية" },
                  { en: "FCM Reminders & PR Trigger Analytics", ar: "إشعارات تذكير ذكية وتنبيهات الأرقام القياسية" }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] text-text-primary font-medium">
                      {isAr ? benefit.ar : benefit.en}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing section */}
              <div className="text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                  {isAr ? "دفع لمرة واحدة مدى الحياة" : "ONE-TIME LIFETIME ACCESS"}
                </p>
                <div className="flex justify-center items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-text-primary">$19.99</span>
                  <span className="text-xs text-text-muted line-through">$49.99</span>
                </div>
              </div>

              {/* Purchase button */}
              {settings.isPremium ? (
                <Button
                  onClick={() => {
                    settings.setPremium(false);
                    triggerMockPush("👑 Premium Cancelled", "Your mock premium status has been revoked.");
                  }}
                  variant="danger"
                  className="w-full py-4 text-xs font-black uppercase tracking-wider h-auto"
                >
                  {isAr ? "إلغاء الترقية (التجربة)" : "Revoke Lifetime Premium status"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    settings.setPremium(true);
                    setPremiumModalOpen(false);
                    triggerMockPush("👑 Welcome to ReLift Premium", "Your account is now lifetime premium! All premium items unlocked.");
                  }}
                  variant="primary"
                  className="w-full py-4 text-xs font-black uppercase tracking-wider h-auto"
                >
                  {isAr ? "الترقية الآن ووفر للأبد" : "Upgrade & Unlock Lifetime"}
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: UNITS CONFIG (الوحدات) ── */}
      <AnimatePresence>
        {unitsModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUnitsModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-sm bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl space-y-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "تعديل الوحدات" : "Select Preferences"}
                </h3>
                <button onClick={() => setUnitsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Unit: Weight (الوزن) */}
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  {isAr ? "الوزن" : "Weight"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "kg" as const, labelEn: "Kilograms (kg)", labelAr: "كيلوغرام (كغ)" },
                    { val: "lbs" as const, labelEn: "Pounds (lbs)", labelAr: "جنيه (رطل)" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => settings.setWeightUnit(item.val)}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold border transition-all text-center",
                        settings.weightUnit === item.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-bg-surface-hover/40 text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit: Distance (المسافة) */}
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  {isAr ? "المسافة" : "Distance"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "km" as const, labelEn: "Kilometers (km)", labelAr: "كيلومتر (كم)" },
                    { val: "miles" as const, labelEn: "Miles (mi)", labelAr: "ميل (ميل)" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => settings.setDistanceUnit(item.val)}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold border transition-all text-center",
                        settings.distanceUnit === item.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-bg-surface-hover/40 text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit: Measurements (القياسات) */}
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  {isAr ? "القياسات" : "Measurements"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "cm" as const, labelEn: "Centimeters (cm)", labelAr: "سنتيمتر (سم)" },
                    { val: "inches" as const, labelEn: "Inches (in)", labelAr: "بوصة (بوصة)" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => settings.setMeasurementUnit(item.val)}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold border transition-all text-center",
                        settings.measurementUnit === item.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-bg-surface-hover/40 text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {isAr ? item.labelAr : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setUnitsModalOpen(false)} variant="primary" className="w-full text-xs font-black uppercase py-3">
                {isAr ? "حفظ" : "Save Changes"}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: FIRST DAY OF THE WEEK (أول يوم من الأسبوع) ── */}
      <AnimatePresence>
        {weekDayModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWeekDayModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-sm bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl space-y-4"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "أول يوم من الأسبوع" : "First day of week"}
                </h3>
                <button onClick={() => setWeekDayModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {[
                  { val: "saturday", en: "Saturday", ar: "السبت" },
                  { val: "sunday", en: "Sunday", ar: "الحد" },
                  { val: "monday", en: "Monday", ar: "الاثنين" },
                  { val: "tuesday", en: "Tuesday", ar: "الثلاثاء" },
                  { val: "wednesday", en: "Wednesday", ar: "الأربعاء" },
                  { val: "thursday", en: "Thursday", ar: "الخميس" },
                  { val: "friday", en: "Friday", ar: "الجمعة" }
                ].map((item) => {
                  const isSelected = settings.firstDayOfWeek === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => {
                        settings.setFirstDayOfWeek(item.val);
                        setWeekDayModalOpen(false);
                      }}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl flex items-center justify-between transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-bg-surface-hover/60"
                      )}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">
                        {isAr ? item.ar : item.en}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: WORKOUT SETTINGS (إعدادات التمرين) ── */}
      <AnimatePresence>
        {workoutSettingsOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWorkoutSettingsOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-md h-[85dvh] sm:h-auto bg-bg-surface border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              {/* Sticky modal header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-border shrink-0">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "إعدادات مؤقت الراحة والتمرين" : "Rest Timer & Workout Setup"}
                </h3>
                <button onClick={() => setWorkoutSettingsOpen(false)} className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-bg-surface-hover transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable inputs wrapper */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* ── Rest Timer Header and Sound ── */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                    {isAr ? "إعدادات مؤقت الراحة" : "REST TIMER CONFIGURATION"}
                  </h4>

                  {/* Sound Type Selection */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "صوت الراحة" : "Timer Cue Sound"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {isAr ? "اختر النغمة المفضلة" : "Choose the beep melody type"}
                      </p>
                    </div>
                    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                      {[
                        { val: "default", label: isAr ? "افتراضي" : "Default" },
                        { val: "custom", label: isAr ? "مخصص" : "Custom" }
                      ].map((option) => (
                        <button
                          key={option.val}
                          onClick={() => settings.setTimerSound(option.val as any)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-black uppercase transition-colors",
                            settings.timerSound === option.val
                              ? "bg-primary text-primary-text"
                              : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Level */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "حدد مستوى الصوت للمؤقت" : "Timer Volume Level"}
                      </p>
                    </div>
                    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                      {[
                        { val: "low", label: isAr ? "واطي" : "Low" },
                        { val: "medium", label: isAr ? "مظبوط" : "Medium" },
                        { val: "high", label: isAr ? "عالي" : "High" }
                      ].map((vol) => (
                        <button
                          key={vol.val}
                          onClick={() => settings.setTimerVolume(vol.val as any)}
                          className={cn(
                            "px-2 py-1 rounded-md text-[9px] font-black uppercase transition-colors",
                            settings.timerVolume === vol.val
                              ? "bg-primary text-primary-text"
                              : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          {vol.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vibration Level */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "اهتزاز" : "Haptic Vibration"}
                      </p>
                    </div>
                    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                      {[
                        { val: "low", label: isAr ? "واطي" : "Low" },
                        { val: "medium", label: isAr ? "مظبوط" : "Medium" },
                        { val: "high", label: isAr ? "عالي" : "High" }
                      ].map((vib) => (
                        <button
                          key={vib.val}
                          onClick={() => settings.setTimerVibration(vib.val as any)}
                          className={cn(
                            "px-2 py-1 rounded-md text-[9px] font-black uppercase transition-colors",
                            settings.timerVibration === vib.val
                              ? "bg-primary text-primary-text"
                              : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          {vib.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default Rest Time Selector */}
                  <div className="bg-bg-surface-hover/40 p-3 rounded-xl border border-border space-y-2">
                    <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                      {isAr ? "الوقت الافتراضي للراحة" : "Default Rest Time"}
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {[60, 90, 120, 180].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => settings.setRestDuration(sec)}
                          className={cn(
                            "py-2 rounded-lg text-xs font-bold border transition-all text-center",
                            settings.restDuration === sec
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-bg-surface/60 text-text-muted hover:text-text-primary"
                          )}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Preferences Sub-Section ── */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="text-[10px] font-black uppercase text-text-muted tracking-wider">
                    {isAr ? "تفضيلاتك" : "GYM EXPERIENCE PREFERENCES"}
                  </h4>

                  {/* Track RPE or RIR */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "تتبع RPE أو RIR" : "Track RPE / RIR"}
                      </p>
                    </div>
                    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                      {["RIR", "RPE"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => settings.setTrackRpeRir(mode as any)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-black uppercase transition-colors",
                            settings.trackRpeRir === mode
                              ? "bg-primary text-primary-text"
                              : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evaluate previous workout */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div>
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "قيم التمرين السابق" : "Eval Previous Session"}
                      </p>
                    </div>
                    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
                      {[
                        { val: "any", label: isAr ? "أي تمرين" : "Any Session" },
                        { val: "same", label: isAr ? "نفس التمرين" : "Same Session" }
                      ].map((mode) => (
                        <button
                          key={mode.val}
                          onClick={() => settings.setPrevWorkoutEval(mode.val as any)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[10px] font-black uppercase transition-colors",
                            settings.prevWorkoutEval === mode.val
                              ? "bg-primary text-primary-text"
                              : "text-text-muted hover:text-text-primary"
                          )}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Keep screen awake toggle */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "البقاء مستيقظًا" : "Keep Screen Awake"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "يمنع الشاشة من النوم أثناء التمارين" : "Prevents mobile display sleep timers during active sets"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleKeepScreenAwake}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.keepScreenAwake ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.keepScreenAwake ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* Detailed Workout toggle */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "تفاصيل أكتر في التمرينة" : "Detailed Workout Info"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "تبديل لتوسيع أو طي معلومات التمرين الإضافية" : "Expand extra logs & historical graphs inside active sheets"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleShowDetailedWorkout}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.showDetailedWorkout ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.showDetailedWorkout ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* Auto scroll subsets toggle */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "التمرير التلقائي للمجموعات" : "Auto Scroll Sets"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "الانتقال التلقائي إلى المجموعة التالية بعد إكمال مجموعة" : "Highlight next subset entry fields automatically upon logging"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleAutoScrollSubsets}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.autoScrollSubsets ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.autoScrollSubsets ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* Connect Spotify */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "اتصل بـ Spotify" : "Connect Spotify"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "عرض زر لفتح Spotify في شاشة تسجيل التمرين" : "Show direct Spotify launcher tab in active logger"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleConnectSpotify}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.connectSpotify ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.connectSpotify ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* Connect YouTube Music */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "الاتصال بـ YouTube Music" : "Connect YouTube Music"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "إظهار زر لفتح YouTube Music على شاشة تسجيل التمرين" : "Show direct YouTube Music controls in logger header"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleConnectYoutubeMusic}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.connectYoutubeMusic ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.connectYoutubeMusic ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* AI Recommendations */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "اقتراحات التمارين بالذكاء الاصطناعي" : "AI Workout Suggestions"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "قم بتمكين زر الذكاء الاصطناعي لاقتراح التمارين لتدريبك" : "Enable intelligent coaching model suggestion algorithms"}
                      </p>
                    </div>
                    <button
                      onClick={settings.toggleAiWorkoutRecs}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.aiWorkoutRecs ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.aiWorkoutRecs ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                  {/* Personal Record Notification */}
                  <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
                    <div className="flex-1 pr-4">
                      <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                        {isAr ? "إشعار رقم قياسي شخصي" : "Personal Record Alerts"}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-normal">
                        {isAr ? "تلقي إشعارات عند تحقيق رقم قياسي جديد أثناء التمرين" : "Trigger congratulatory alert cues when completing heavier loads"}
                      </p>
                    </div>
                    <button
                      onClick={settings.togglePersonalRecordNotif}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
                        settings.personalRecordNotif ? "bg-primary" : "bg-bg-surface border border-border"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
                        animate={{ x: settings.personalRecordNotif ? 22 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      />
                    </button>
                  </div>

                </div>
              </div>

              {/* Sticky bottom modal footer button */}
              <div className="p-6 border-t border-border shrink-0">
                <Button onClick={() => setWorkoutSettingsOpen(false)} variant="primary" className="w-full text-xs font-black uppercase py-4">
                  {isAr ? "تأكيد وحفظ الإعدادات" : "Confirm Rest & Workout Settings"}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: THEME SELECTION (السمة) ── */}
      <AnimatePresence>
        {themeModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setThemeModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-sm bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl space-y-4"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "سمة التطبيق" : "Choose App Theme"}
                </h3>
                <button onClick={() => setThemeModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { value: "light" as Theme, labelEn: "Light Theme", labelAr: "المظهر الفاتح", icon: Sun },
                  { value: "dark" as Theme, labelEn: "Dark Theme", labelAr: "المظهر الداكن", icon: Moon },
                  { value: "system" as Theme, labelEn: "System Default", labelAr: "الافتراضي للنظام", icon: Monitor },
                ].map((option) => {
                  const isSelected = settings.theme === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        settings.setTheme(option.value);
                        setThemeModalOpen(false);
                      }}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl flex items-center justify-between transition-colors border",
                        isSelected 
                          ? "bg-primary/10 border-primary/30 text-primary" 
                          : "border-border bg-bg-surface/40 text-text-primary hover:bg-bg-surface-hover/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          {isAr ? option.labelAr : option.labelEn}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: LANGUAGE SELECTION (اللغة) ── */}
      <AnimatePresence>
        {langModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLangModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-sm bg-bg-surface border border-border p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl space-y-4"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "اللغة" : "Interface Language"}
                </h3>
                <button onClick={() => setLangModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { value: "ar", label: "العربية (Arabic)" },
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" }
                ].map((option) => {
                  const isSelected = settings.language === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        settings.setLanguage(option.value);
                        setLangModalOpen(false);
                      }}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl flex items-center justify-between transition-colors border",
                        isSelected 
                          ? "bg-primary/10 border-primary/30 text-primary" 
                          : "border-border bg-bg-surface/40 text-text-primary hover:bg-bg-surface-hover/60"
                      )}
                    >
                      <span className="text-xs font-black uppercase tracking-wider">
                        {option.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PRESERVED EXTRA UTILITIES MODALS ── */}
      <BarPlateCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      <FeatureSuggestions isOpen={suggestionsOpen} onClose={() => setSuggestionsOpen(false)} />
      <SupportAndBot isOpen={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* QR Code Share Modal */}
      <AnimatePresence>
        {qrOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQrOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-surface p-6 shadow-2xl text-center space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center border-b border-border pb-3 text-right">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "الـ QR بتاعك" : "ReLift QR Share"}
                </h3>
                <button onClick={() => setQrOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl inline-block mx-auto border-4 border-primary">
                <svg className="w-40 h-40 text-black mx-auto" viewBox="0 0 100 100">
                  <path d="M0,0h30v30h-30z M10,10h10v10h-10z M0,70h30v30h-30z M10,80h10v10h-10z M70,0h30v30h-30z M80,10h10v10h-10z M40,10h10v10h-10z M50,40h10v10h-10z M30,50h10v10h-10z M60,60h10v10h-10z M80,80h20v20h-20z M40,80h15v15h-15z M70,50h10v20h-10z M50,70h10v10h-10z" fill="currentColor" />
                  <rect x="42" y="42" width="16" height="16" fill="#CCFF00" rx="3" />
                  <path d="M47,46h6v8h-6z" fill="#000" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-black text-text-primary uppercase tracking-wider">
                  {isAr ? "ارفع بياناتك" : "ReLift Profile Sync"}
                </p>
                <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-wide leading-relaxed">
                  {isAr 
                    ? "دع أصدقائك يمسحون هذا الرمز لعرض سجل تمارينك ومستويات تقدمك في صالة الألعاب فورياً." 
                    : "Let your workout circle scan this QR to check out your weekly volume accomplishments and body progress stats."}
                </p>
              </div>

              <Button onClick={() => setQrOpen(false)} variant="primary" className="w-full text-xs font-black uppercase py-3">
                {isAr ? "حسناً" : "Done"}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
