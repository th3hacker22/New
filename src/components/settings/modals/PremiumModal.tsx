import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { Button } from '@/components/ui/Button';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
  isPremium: boolean;
  onUpgrade: () => void;
  onRevoke: () => void;
}

const BENEFITS = [
  { en: '100% Cloud-to-Offline Instant Sync', ar: 'مزامنة سحابية غير محدودة وبدون إنترنت' },
  {
    en: 'Advanced Progress Charts & Volume Metrics',
    ar: 'رسوم بيانية متقدمة وإحصائيات الحجم والكتلة',
  },
  { en: 'Custom Exercise Templates & Builder Modules', ar: 'قوالب تمارين غير محدودة ومعدل مخصص' },
  {
    en: 'Integrated Gym Plate & Barbell Assistant',
    ar: 'حاسبة أوزان بار التمارين المتقدمة والذكية',
  },
  {
    en: 'FCM Reminders & PR Trigger Analytics',
    ar: 'إشعارات تذكير ذكية وتنبيهات الأرقام القياسية',
  },
];

export function PremiumModal({
  open,
  onClose,
  isAr,
  isPremium,
  onUpgrade,
  onRevoke,
}: PremiumModalProps) {
  return (
    <ModalShell open={open} onClose={onClose} title="ReLift Premium Lifetime">
      <div className="text-center space-y-2 mt-2">
        <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl mx-auto flex items-center justify-center text-primary shadow-[0_0_20px_rgba(204,255,0,0.25)]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-text-primary uppercase tracking-wider">
          ReLift Premium Lifetime
        </h3>
        <p className="text-xs text-text-secondary">
          {isAr
            ? 'وصول كامل وبدون حدود لكافة أدوات التدريب والذكاء الاصطناعي'
            : 'Unlimited access to all coaching tools and smart metrics'}
        </p>
      </div>

      <div className="space-y-2 bg-bg-surface-hover/60 p-4 rounded-xl border border-border">
        {BENEFITS.map((benefit, i) => (
          <div key={i} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px] text-text-primary font-medium">
              {isAr ? benefit.ar : benefit.en}
            </span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">
          {isAr ? 'دفع لمرة واحدة مدى الحياة' : 'ONE-TIME LIFETIME ACCESS'}
        </p>
        <div className="flex justify-center items-baseline gap-1 mt-1">
          <span className="text-3xl font-black text-text-primary">$19.99</span>
          <span className="text-xs text-text-muted line-through">$49.99</span>
        </div>
      </div>

      {isPremium ? (
        <Button
          onClick={onRevoke}
          variant="danger"
          className="w-full py-4 text-xs font-black uppercase tracking-wider h-auto"
        >
          {isAr ? 'إلغاء الترقية (التجربة)' : 'Revoke Lifetime Premium status'}
        </Button>
      ) : (
        <Button
          onClick={onUpgrade}
          variant="primary"
          className="w-full py-4 text-xs font-black uppercase tracking-wider h-auto"
        >
          {isAr ? 'الترقية الآن ووفر للأبد' : 'Upgrade & Unlock Lifetime'}
        </Button>
      )}
    </ModalShell>
  );
}
