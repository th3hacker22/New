import { Check } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { cn } from '@/utils/cn';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

interface ChoiceModalProps<T extends string> {
  open: boolean;
  onClose: () => void;
  title: string;
  options: ChoiceOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  /** When true, the modal stays open after selecting (caller closes). */
  keepOpen?: boolean;
}

/** Reusable single-choice list modal used for units, theme, first day, language. */
export function ChoiceModal<T extends string>({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
  keepOpen,
}: ChoiceModalProps<T>) {
  return (
    <ModalShell open={open} onClose={onClose} title={title}>
      <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                if (!keepOpen) onClose();
              }}
              className={cn(
                'w-full py-3 px-4 rounded-xl flex items-center justify-between transition-colors text-left',
                selected
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-primary hover:bg-bg-surface-hover/60',
              )}
            >
              <span className="text-xs font-black uppercase tracking-wider">{option.label}</span>
              {selected && <Check className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}
