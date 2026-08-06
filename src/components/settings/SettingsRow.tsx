import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  isAr?: boolean;
  onClick?: () => void;
  to?: string;
}

/**
 * A single tappable settings row with an icon, title, subtitle, and an optional
 * trailing value/chevron. Works as either a button or a link via `to`.
 */
export function SettingsRow({ icon, title, subtitle, trailing, isAr, onClick }: SettingsRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card flex items-center gap-4 rounded-xl p-4 transition-all hover:ring-1 hover:ring-primary/20',
        onClick && 'active:scale-[0.99] cursor-pointer',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-hover border border-border">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <p className="text-xs font-black text-text-primary uppercase tracking-wider truncate">
            {title}
          </p>
          {trailing}
        </div>
        {subtitle && <p className="text-[10px] text-text-muted truncate">{subtitle}</p>}
      </div>
      {onClick && (
        <ChevronRight className={cn('h-4 w-4 text-text-muted shrink-0', isAr && 'rotate-180')} />
      )}
    </div>
  );
}

export function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function ValueBadge({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-bold bg-bg-surface-hover text-primary px-2 py-0.5 rounded-md uppercase">
      {children}
    </span>
  );
}
