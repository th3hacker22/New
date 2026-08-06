import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PremiumPromoCardProps {
  isPremium: boolean;
  isAr: boolean;
  discountLabel: string;
  offerTitle: string;
  offerSub: string;
  activeTitle: string;
  activeSub: string;
  onClick: () => void;
}

export function PremiumPromoCard({
  isPremium,
  isAr,
  discountLabel,
  offerTitle,
  offerSub,
  activeTitle,
  activeSub,
  onClick,
}: PremiumPromoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 border cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300',
        isPremium
          ? 'bg-gradient-to-br from-bg-surface to-bg-surface-hover border-primary/30 shadow-[0_4px_20px_rgba(204,255,0,0.1)]'
          : 'bg-gradient-to-br from-bg-surface via-bg-surface to-bg-surface-hover border-border shadow-xl',
      )}
    >
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex-1 space-y-1 text-right sm:text-right">
          <span className="inline-block bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-sm">
            {discountLabel}
          </span>
          <h2 className="text-base font-black text-text-primary leading-tight">
            {isPremium ? activeTitle : offerTitle}
          </h2>
          <p className="text-xs text-text-secondary leading-normal max-w-[240px] font-medium">
            {isPremium ? activeSub : offerSub}
          </p>
        </div>
        <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
          {isPremium ? (
            <div className="bg-primary/20 border border-primary/40 rounded-2xl p-3 text-primary animate-pulse shadow-[0_0_15px_rgba(204,255,0,0.2)]">
              <Sparkles className="w-8 h-8" />
            </div>
          ) : (
            <motion.div
              animate={{ rotate: [0, -10, 0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <svg
                className="w-14 h-14 text-primary"
                viewBox="0 0 100 100"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10,40 L60,10 L90,40 L40,70 Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <circle cx="25" cy="45" r="5" fill="black" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M48,28 L54,34 M58,38 L64,44 M45,45 L55,35"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text
                  x="45"
                  y="45"
                  fill="currentColor"
                  fontSize="12"
                  fontWeight="black"
                  transform="rotate(-30, 45, 45)"
                >
                  %%%
                </text>
              </svg>
            </motion.div>
          )}
        </div>
      </div>
      <span className="sr-only">{isAr ? 'ترقية' : 'Upgrade'}</span>
    </motion.div>
  );
}
