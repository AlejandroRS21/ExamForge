// OpenSloth — Accuracy Over Time Line Chart
// T-702: Recharts line chart showing accuracy over time

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AccuracyPoint } from "@/lib/dashboard/stats";

interface AccuracyChartProps {
  data: AccuracyPoint[];
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Complete an exam to see your accuracy trend
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(val: unknown) => {
              const d = new Date(String(val));
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            domain={[0, 100] as [number, number]}
            tick={{ fontSize: 12 }}
            tickFormatter={(val: unknown) => `${Number(val)}%`}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--background))",
            }}
            formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, "Accuracy"]}
            labelFormatter={(label: unknown) => new Date(String(label)).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--primary))" } as any}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
