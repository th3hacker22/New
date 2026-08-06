import { ModalShell } from './ModalShell';
import { SettingsToggle } from './SettingsToggle';
import { SegmentedControl } from './SegmentedControl';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/utils/cn';

interface WorkoutSettingsModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[10px] font-black uppercase text-text-muted tracking-wider">{children}</h4>
  );
}

export function WorkoutSettingsModal({ open, onClose, isAr }: WorkoutSettingsModalProps) {
  const s = useSettingsStore();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isAr ? 'إعدادات مؤقت الراحة والتمرين' : 'Rest Timer & Workout Setup'}
      maxWidth="md"
      scrollable
      footer={
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full text-xs font-black uppercase py-4"
        >
          {isAr ? 'تأكيد وحفظ الإعدادات' : 'Confirm Rest & Workout Settings'}
        </Button>
      }
    >
      <div className="space-y-4">
        <SubHeading>{isAr ? 'إعدادات مؤقت الراحة' : 'REST TIMER CONFIGURATION'}</SubHeading>

        <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
          <div>
            <p className="text-xs font-black text-text-primary uppercase tracking-wider">
              {isAr ? 'صوت الراحة' : 'Timer Cue Sound'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {isAr ? 'اختر النغمة المفضلة' : 'Choose the beep melody type'}
            </p>
          </div>
          <SegmentedControl
            value={s.timerSound}
            onChange={(v) => s.setTimerSound(v)}
            options={[
              { value: 'default', label: isAr ? 'افتراضي' : 'Default' },
              { value: 'custom', label: isAr ? 'مخصص' : 'Custom' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider">
            {isAr ? 'مستوى الصوت' : 'Timer Volume Level'}
          </p>
          <SegmentedControl
            size="sm"
            value={s.timerVolume}
            onChange={(v) => s.setTimerVolume(v)}
            options={[
              { value: 'low', label: isAr ? 'واطي' : 'Low' },
              { value: 'medium', label: isAr ? 'مظبوط' : 'Medium' },
              { value: 'high', label: isAr ? 'عالي' : 'High' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider">
            {isAr ? 'الاهتزاز' : 'Haptic Vibration'}
          </p>
          <SegmentedControl
            size="sm"
            value={s.timerVibration}
            onChange={(v) => s.setTimerVibration(v)}
            options={[
              { value: 'low', label: isAr ? 'واطي' : 'Low' },
              { value: 'medium', label: isAr ? 'مظبوط' : 'Medium' },
              { value: 'high', label: isAr ? 'عالي' : 'High' },
            ]}
          />
        </div>

        <div className="bg-bg-surface-hover/40 p-3 rounded-xl border border-border space-y-2">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider">
            {isAr ? 'الوقت الافتراضي للراحة' : 'Default Rest Time'}
          </p>
          <div className="grid grid-cols-4 gap-1">
            {[60, 90, 120, 180].map((sec) => (
              <button
                key={sec}
                onClick={() => s.setRestDuration(sec)}
                className={cn(
                  'py-2 rounded-lg text-xs font-bold border transition-all text-center',
                  s.restDuration === sec
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg-surface/60 text-text-muted hover:text-text-primary',
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <SubHeading>{isAr ? 'تفضيلات تجربة الجيم' : 'GYM EXPERIENCE PREFERENCES'}</SubHeading>

        <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider pr-4">
            {isAr ? 'تتبع RPE / RIR' : 'Track RPE / RIR'}
          </p>
          <SegmentedControl
            value={s.trackRpeRir}
            onChange={(v) => s.setTrackRpeRir(v)}
            options={[
              { value: 'RIR', label: 'RIR' },
              { value: 'RPE', label: 'RPE' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider pr-4">
            {isAr ? 'تقييم التمرين السابق' : 'Eval Previous Session'}
          </p>
          <SegmentedControl
            value={s.prevWorkoutEval}
            onChange={(v) => s.setPrevWorkoutEval(v)}
            options={[
              { value: 'any', label: isAr ? 'أي' : 'Any' },
              { value: 'same', label: isAr ? 'نفس' : 'Same' },
            ]}
          />
        </div>

        <SettingsToggle
          checked={s.keepScreenAwake}
          onChange={s.toggleKeepScreenAwake}
          label={isAr ? 'إبقاء الشاشة مستيقظة' : 'Keep Screen Awake'}
          description={
            isAr
              ? 'يمنع الشاشة من النوم أثناء التمارين'
              : 'Prevents display sleep during active sets'
          }
        />
        <SettingsToggle
          checked={s.showDetailedWorkout}
          onChange={s.toggleShowDetailedWorkout}
          label={isAr ? 'عرض تفاصيل التمرين' : 'Detailed Workout Info'}
          description={isAr ? 'توسيع معلومات إضافية' : 'Expand extra logs and historical graphs'}
        />
        <SettingsToggle
          checked={s.autoScrollSubsets}
          onChange={s.toggleAutoScrollSubsets}
          label={isAr ? 'تمرير تلقائي للمجموعات' : 'Auto Scroll Sets'}
          description={
            isAr
              ? 'الانتقال التلقائي للمجموعة التالية'
              : 'Highlight next subset fields after logging'
          }
        />
        <SettingsToggle
          checked={s.connectSpotify}
          onChange={s.toggleConnectSpotify}
          label={isAr ? 'ربط Spotify' : 'Connect Spotify'}
          description={
            isAr ? 'زر تشغيل Spotify في شاشة التمرين' : 'Show Spotify launcher in active logger'
          }
        />
        <SettingsToggle
          checked={s.connectYoutubeMusic}
          onChange={s.toggleConnectYoutubeMusic}
          label={isAr ? 'ربط YouTube Music' : 'Connect YouTube Music'}
          description={
            isAr ? 'عناصر تحكم يوتيوب ميوزك' : 'Show YouTube Music controls in logger header'
          }
        />
        <SettingsToggle
          checked={s.aiWorkoutRecs}
          onChange={s.toggleAiWorkoutRecs}
          label={isAr ? 'اقتراحات تمارين بالذكاء الاصطناعي' : 'AI Workout Suggestions'}
          description={
            isAr ? 'تمكين اقتراحات النموذج الذكي' : 'Enable intelligent coaching suggestions'
          }
        />
        <SettingsToggle
          checked={s.personalRecordNotif}
          onChange={s.togglePersonalRecordNotif}
          label={isAr ? 'تنبيهات الأرقام القياسية' : 'Personal Record Alerts'}
          description={isAr ? 'إشعار عند تحقيق رقم جديد' : 'Alert when completing a heavier load'}
        />
      </div>
    </ModalShell>
  );
}
