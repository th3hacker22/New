import { cn } from '@/utils/cn';

interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

/** Compact pill-style group for choosing among 2–3 short options. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 bg-bg-surface p-1 rounded-lg border border-border">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md font-black uppercase transition-colors',
            size === 'sm' ? 'px-2 py-1 text-[9px]' : 'px-3 py-1 text-[10px]',
            value === option.value
              ? 'bg-primary text-primary-text'
              : 'text-text-muted hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
