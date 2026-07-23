import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface PRHistoryEntry {
  date: string;
  weight: number;
  reps: number;
  e1rm: number;
}

interface PRProgressChartProps {
  data: PRHistoryEntry[];
  isAr?: boolean;
}

export function PRProgressChart({ data, isAr }: PRProgressChartProps) {
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
        weight: entry.weight,
        e1rm: Math.round(entry.e1rm)
      }));
  }, [data, isAr]);

  if (data.length === 0) return null;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorE1RM" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#A1A1AA", fontSize: 10 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#A1A1AA", fontSize: 10 }} 
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C1F",
              border: "1px solid #27272A",
              borderRadius: 8,
              fontSize: 12,
            }}
            itemStyle={{ color: "#CCFF00" }}
          />
          <Area
            type="monotone"
            dataKey="e1rm"
            stroke="#CCFF00"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorE1RM)"
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#A1A1AA"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
