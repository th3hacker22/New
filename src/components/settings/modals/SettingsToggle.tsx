import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SettingsToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

/** Accessible iOS-style switch used inside the workout settings modal. */
export function SettingsToggle({ checked, onChange, label, description }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between bg-bg-surface-hover/40 p-3 rounded-xl border border-border">
      <div className="flex-1 pr-4">
        <p className="text-xs font-black text-text-primary uppercase tracking-wider">{label}</p>
        {description && (
          <p className="text-[10px] text-text-muted mt-0.5 leading-normal">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-primary' : 'bg-bg-surface border border-border',
        )}
      >
        <motion.div
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 22 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
      </button>
    </div>
  );
}
