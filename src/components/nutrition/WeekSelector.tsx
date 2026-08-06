import { format, subDays, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface WeekSelectorProps {
  currentDate: Date;
  labels: { today: string };
  onChange: (d: Date) => void;
}

export function WeekSelector({ currentDate, labels, onChange }: WeekSelectorProps) {
  const days: Date[] = [];
  for (let i = 5; i >= 0; i--) days.push(subDays(new Date(), i));
  days.push(addDays(new Date(), 1));

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-bg-elevated/20 p-3 border border-border/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-text-muted font-bold uppercase tracking-wide">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{format(currentDate, 'EEEE, MMMM dd')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(subDays(currentDate, 1))}
            className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onChange(new Date())}
            className="rounded-lg px-2 py-1 text-xs font-bold bg-primary-dim/30 text-primary hover:bg-primary-dim/50"
          >
            {labels.today}
          </button>
          <button
            onClick={() => onChange(addDays(currentDate, 1))}
            className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const selected = isSameDay(day, currentDate);
          const today = isSameDay(day, new Date());
          return (
            <button
              key={idx}
              onClick={() => onChange(day)}
              className={`flex flex-col items-center rounded-xl py-2 px-1 transition-all border ${
                selected
                  ? 'bg-gradient-to-br from-primary to-primary-hover text-bg shadow-md scale-105 border-transparent'
                  : 'bg-bg hover:bg-bg-elevated/40 border-border/30'
              }`}
            >
              <span
                className={`text-[10px] font-black uppercase ${selected ? 'text-bg' : 'text-text-muted'}`}
              >
                {format(day, 'eee')}
              </span>
              <span className="text-base font-black leading-none mt-1">{format(day, 'd')}</span>
              {today && !selected && <span className="h-1 w-1 rounded-full bg-primary mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
