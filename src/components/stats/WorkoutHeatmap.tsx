import { useMemo } from "react";
import { cn } from "@/utils/cn";

interface HeatmapProps {
  data: { date: string; count: number }[];
  isAr?: boolean;
}

export function WorkoutHeatmap({ data, isAr }: HeatmapProps) {
  const days = isAr ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Last 12 weeks
  const weeks = useMemo(() => {
    const today = new Date();
    const result = [];
    
    // Go back to the Sunday of 12 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 84); // 12 weeks
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday
    
    for (let w = 0; w < 12; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (w * 7) + d);
        const dateStr = date.toISOString().split("T")[0];
        const entry = data.find(d => d.date === dateStr);
        weekDays.push({
          date: dateStr,
          count: entry?.count || 0,
        });
      }
      result.push(weekDays);
    }
    return result;
  }, [data]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 pr-2 pt-6">
          {[0, 2, 4, 6].map(i => (
            <span key={i} className="text-[8px] text-text-muted font-bold h-2.5 flex items-center">
              {days[i].substring(0, 3)}
            </span>
          ))}
        </div>

        {/* The Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {wi % 4 === 0 && (
                <div className="h-4 text-[8px] text-text-muted font-bold truncate">
                  {new Date(week[0].date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short' })}
                </div>
              )}
              {wi % 4 !== 0 && <div className="h-4" />}
              {week.map((day, di) => {
                const level = day.count === 0 ? 0 : Math.min(day.count, 4);
                return (
                  <div
                    key={di}
                    className={cn(
                      "w-2.5 h-2.5 rounded-[2px] transition-colors duration-500",
                      level === 0 && "bg-bg-elevated/50",
                      level === 1 && "bg-primary/20",
                      level === 2 && "bg-primary/40",
                      level === 3 && "bg-primary/70",
                      level >= 4 && "bg-primary"
                    )}
                    title={`${day.date}: ${day.count} workouts`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 pr-2">
        <span className="text-[8px] text-text-muted font-medium uppercase tracking-wider">{isAr ? "أقل" : "Less"}</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div 
            key={l} 
            className={cn(
              "w-2 h-2 rounded-[1px]",
              l === 0 && "bg-bg-elevated/50",
              l === 1 && "bg-primary/20",
              l === 2 && "bg-primary/40",
              l === 3 && "bg-primary/70",
              l === 4 && "bg-primary"
            )}
          />
        ))}
        <span className="text-[8px] text-text-muted font-medium uppercase tracking-wider">{isAr ? "أكثر" : "More"}</span>
      </div>
    </div>
  );
}
