import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Scale,
  Info,
  Dumbbell,
  Globe,
  Beaker,
  Sun,
  Shield,
  Gift,
  User,
  RotateCcw,
  RefreshCw,
  Trophy,
  HelpCircle,
  QrCode,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import BarPlateCalculator from '@/components/extras/BarPlateCalculator';
import FeatureSuggestions from '@/components/extras/FeatureSuggestions';
import SupportAndBot from '@/components/extras/SupportAndBot';
import { SettingsRow, SettingsSection, ValueBadge } from '@/components/settings/SettingsRow';
import { PremiumPromoCard } from '@/components/settings/PremiumPromoCard';
import { PushToast, type PushToastState } from '@/components/settings/PushToast';
import { PremiumModal } from '@/components/settings/modals/PremiumModal';
import { UnitsModal } from '@/components/settings/modals/UnitsModal';
import { WorkoutSettingsModal } from '@/components/settings/modals/WorkoutSettingsModal';
import { ChoiceModal } from '@/components/settings/modals/ChoiceModal';
import { QrShareModal } from '@/components/settings/modals/QrShareModal';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' as const },
  }),
};

const WEEKDAYS = [
  { value: 'saturday', en: 'Saturday', ar: 'السبت' },
  { value: 'sunday', en: 'Sunday', ar: 'الحد' },
  { value: 'monday', en: 'Monday', ar: 'الاثنين' },
  { value: 'tuesday', en: 'Tuesday', ar: 'الثلاثاء' },
  { value: 'wednesday', en: 'Wednesday', ar: 'الأربعاء' },
  { value: 'thursday', en: 'Thursday', ar: 'الخميس' },
  { value: 'friday', en: 'Friday', ar: 'الجمعة' },
] as const;

export default function SettingsPage() {
  const { t, isAr } = useTranslation();
  const settings = useSettingsStore();

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [weekDayOpen, setWeekDayOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const [toast, setToast] = useState<PushToastState>({ title: '', body: '', open: false });

  const ping = (title: string, body: string) => {
    if (settings.soundEnabled) {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.warn('Audio context failed', e);
      }
    }
    setToast({ title, body, open: true });
    setTimeout(() => setToast((p) => ({ ...p, open: false })), 4500);
  };

  const weekOptions = WEEKDAYS.map((d) => ({
    value: d.value,
    label: isAr ? d.ar : d.en,
  }));

  const themeOptions = [
    { value: 'light' as const, label: isAr ? 'المظهر الفاتح' : 'Light Theme' },
    { value: 'dark' as const, label: isAr ? 'المظهر الداكن' : 'Dark Theme' },
    { value: 'system' as const, label: isAr ? 'النظام' : 'System Default' },
  ];

  const langOptions = [
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  return (
    <div className="space-y-6 pb-24 relative select-none">
      <PushToast toast={toast} onClose={() => setToast((p) => ({ ...p, open: false }))} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary uppercase tracking-wide"
        >
          <ArrowLeft className={cn('h-4 w-4', isAr && 'rotate-180')} />
          {t('settings.back')}
        </Link>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
          {settings.isPremium ? 'Premium Active' : 'Free Tier'}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-xl font-black text-text-primary uppercase tracking-wider">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-xs text-text-secondary">{t('settings.subtitle')}</p>
      </motion.div>

      <PremiumPromoCard
        isPremium={settings.isPremium}
        isAr={isAr}
        discountLabel={t('settings.discountBadge')}
        offerTitle={t('settings.lifetimeOffer')}
        offerSub={t('settings.discountSub')}
        activeTitle={t('settings.premiumActive')}
        activeSub={t('settings.premiumActiveSub')}
        onClick={() => setPremiumOpen(true)}
      />

      {/* Account */}
      <SettingsSection title={t('settings.account')}>
        <SettingsRow
          icon={<Shield className="h-5 w-5 text-primary" />}
          title={t('settings.subscription')}
          subtitle={
            settings.isPremium ? 'Active Lifetime Premium Plan 👑' : t('settings.subscriptionSub')
          }
          isAr={isAr}
          onClick={() => setPremiumOpen(true)}
        />
        <SettingsRow
          icon={<Gift className="h-5 w-5 text-warning" />}
          title={t('settings.giftFriend')}
          subtitle={t('settings.giftFriendSub')}
          isAr={isAr}
          onClick={() =>
            ping(
              '🎁 Gift Activated',
              isAr ? 'تمت مشاركة ١٤ يوم بريميوم!' : 'You shared 14 days of Premium. Link copied!',
            )
          }
        />
        <Link to="/profile" className="block">
          <SettingsRow
            icon={<User className="h-5 w-5 text-sky-400" />}
            title={t('settings.profile')}
            subtitle={t('settings.profileSub')}
            isAr={isAr}
          />
        </Link>
        <SettingsRow
          icon={<RotateCcw className="h-5 w-5 text-text-secondary" />}
          title={t('settings.restorePurchases')}
          subtitle={t('settings.restorePurchasesSub')}
          isAr={isAr}
          onClick={() => ping('🔄 Restoring Purchases', 'Premium benefits re-validated.')}
        />
        <SettingsRow
          icon={<RefreshCw className="h-5 w-5 text-emerald-400" />}
          title={t('settings.syncData')}
          subtitle={t('settings.syncDataSub')}
          isAr={isAr}
          onClick={() => ping('☁️ Cloud Sync', 'Templates and logs synchronized.')}
        />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title={t('settings.preferences')}>
        <SettingsRow
          icon={<Scale className="h-5 w-5 text-emerald-400" />}
          title={t('settings.units')}
          subtitle={t('settings.unitsSub')}
          trailing={
            <ValueBadge>
              {settings.weightUnit}/{settings.distanceUnit}/{settings.measurementUnit}
            </ValueBadge>
          }
          isAr={isAr}
          onClick={() => setUnitsOpen(true)}
        />
        <SettingsRow
          icon={<Info className="h-5 w-5 text-purple-400" />}
          title={t('settings.firstDay')}
          subtitle={t('settings.firstDaySub')}
          trailing={<ValueBadge>{settings.firstDayOfWeek}</ValueBadge>}
          isAr={isAr}
          onClick={() => setWeekDayOpen(true)}
        />
        <SettingsRow
          icon={<Dumbbell className="h-5 w-5 text-primary" />}
          title={t('settings.workoutSettings')}
          subtitle={t('settings.workoutSettingsSub')}
          isAr={isAr}
          onClick={() => setWorkoutOpen(true)}
        />
        <SettingsRow
          icon={<Lock className="h-5 w-5 text-text-secondary" />}
          title={t('settings.privacy')}
          subtitle={t('settings.privacySub')}
          isAr={isAr}
          onClick={() => ping('🔒 Security Audit', isAr ? 'ملفك خاص.' : 'Profile set to private.')}
        />
        <SettingsRow
          icon={<TrendingUp className="h-5 w-5 text-indigo-400" />}
          title={t('settings.charts')}
          subtitle={t('settings.chartsSub')}
          isAr={isAr}
          onClick={() => ping('📈 Chart Settings', 'Volume-over-Time selected.')}
        />
        <SettingsRow
          icon={<Sun className="h-5 w-5 text-yellow-400" />}
          title={t('settings.theme')}
          subtitle={t('settings.themeSub')}
          trailing={<ValueBadge>{settings.theme}</ValueBadge>}
          isAr={isAr}
          onClick={() => setThemeOpen(true)}
        />
        <SettingsRow
          icon={<Globe className="h-5 w-5 text-sky-400" />}
          title={t('settings.language')}
          subtitle={t('settings.languageSub')}
          trailing={
            <ValueBadge>{settings.language === 'ar' ? 'العربية' : settings.language}</ValueBadge>
          }
          isAr={isAr}
          onClick={() => setLangOpen(true)}
        />
        <SettingsRow
          icon={<Beaker className="h-5 w-5 text-amber-500" />}
          title={t('settings.experimental')}
          subtitle={t('settings.experimentalSub')}
          isAr={isAr}
          onClick={() => ping('🧪 Beta Mode', 'Experimental tools enabled.')}
        />
      </SettingsSection>

      {/* Core Tools */}
      <SettingsSection title={t('settings.tools')} className="pt-4 border-t border-border">
        <SettingsRow
          icon={<Dumbbell className="h-5 w-5 text-primary" />}
          title={t('settings.barCalc')}
          subtitle={t('settings.barCalcSub')}
          isAr={isAr}
          onClick={() => setCalcOpen(true)}
        />
        <SettingsRow
          icon={<Trophy className="h-5 w-5 text-yellow-400" />}
          title={t('settings.suggestions')}
          subtitle={t('settings.suggestionsSub')}
          isAr={isAr}
          onClick={() => setSuggestionsOpen(true)}
        />
        <SettingsRow
          icon={<HelpCircle className="h-5 w-5 text-sky-400" />}
          title={t('settings.aiSupport')}
          subtitle={t('settings.aiSupportSub')}
          isAr={isAr}
          onClick={() => setSupportOpen(true)}
        />
        <SettingsRow
          icon={<QrCode className="h-5 w-5 text-purple-400" />}
          title={t('settings.shareQr')}
          subtitle={t('settings.shareQrSub')}
          isAr={isAr}
          onClick={() => setQrOpen(true)}
        />
      </SettingsSection>

      <motion.p
        className="text-center text-[10px] font-mono text-text-muted pt-8 uppercase tracking-widest opacity-80"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
      >
        ReLift v1.574 • {t('settings.crafted')}
      </motion.p>

      {/* Modals */}
      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        isAr={isAr}
        isPremium={settings.isPremium}
        onUpgrade={() => {
          settings.setPremium(true);
          setPremiumOpen(false);
          ping(
            '👑 Welcome to ReLift Premium',
            isAr ? 'كل الميزات مفتوحة!' : 'All premium items unlocked.',
          );
        }}
        onRevoke={() => {
          settings.setPremium(false);
          ping('👑 Premium Cancelled', 'Mock premium revoked.');
        }}
      />
      <UnitsModal open={unitsOpen} onClose={() => setUnitsOpen(false)} isAr={isAr} />
      <WorkoutSettingsModal open={workoutOpen} onClose={() => setWorkoutOpen(false)} isAr={isAr} />
      <ChoiceModal
        open={weekDayOpen}
        onClose={() => setWeekDayOpen(false)}
        title={isAr ? 'أول يوم من الأسبوع' : 'First day of week'}
        options={weekOptions}
        value={settings.firstDayOfWeek}
        onSelect={(v) => settings.setFirstDayOfWeek(v)}
      />
      <ChoiceModal
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        title={isAr ? 'سمة التطبيق' : 'Choose App Theme'}
        options={themeOptions}
        value={settings.theme}
        onSelect={(v) => settings.setTheme(v)}
      />
      <ChoiceModal
        open={langOpen}
        onClose={() => setLangOpen(false)}
        title={isAr ? 'اللغة' : 'Interface Language'}
        options={langOptions}
        value={settings.language}
        onSelect={(v) => settings.setLanguage(v)}
        keepOpen={false}
      />
      <QrShareModal open={qrOpen} onClose={() => setQrOpen(false)} isAr={isAr} />

      <BarPlateCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
      <FeatureSuggestions isOpen={suggestionsOpen} onClose={() => setSuggestionsOpen(false)} />
      <SupportAndBot isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  );
}
