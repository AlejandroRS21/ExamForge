// OpenSloth — Per-Part Skill Breakdown Table
// T-702: Skill breakdown with color-coded accuracy bars and weak-area highlight

"use client";

import type { PartBreakdown } from "@/lib/dashboard/stats";

interface PartBreakdownProps {
  data: PartBreakdown[];
  weakAreas: PartBreakdown[];
}

export function PartBreakdownTable({ data, weakAreas }: PartBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No skill data yet. Complete some exams to see your breakdown.
      </div>
    );
  }

  const weakIds = new Set(weakAreas.map((w) => w.partId));

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Part</th>
            <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Accuracy</th>
            <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Attempts</th>
            <th className="pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map((part) => {
            const isWeak = weakIds.has(part.partId);
            const accuracyColor =
              part.attempts === 0
                ? "bg-muted"
                : part.accuracy >= 80
                  ? "bg-success"
                  : part.accuracy >= 60
                    ? "bg-warning"
                    : "bg-error";

            return (
              <tr
                key={part.partId}
                className={`border-b last:border-b-0 ${isWeak ? "bg-error-surface" : ""}`}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{part.partLabel}</span>
                    {isWeak && (
                      <span className="inline-flex items-center rounded-full bg-error-surface px-2 py-0.5 text-xs font-medium text-error">
                        Needs practice
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${accuracyColor} transition-all`}
                        style={{
                          width: `${part.attempts > 0 ? Math.max(part.accuracy, 2) : 0}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isWeak
                          ? "text-error"
                          : part.attempts === 0
                            ? "text-muted-foreground"
                            : ""
                      }`}
                    >
                      {part.attempts > 0 ? `${Math.round(part.accuracy)}%` : "—"}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-sm text-muted-foreground">{part.attempts}</td>
                <td className="py-3 text-sm text-muted-foreground">
                  {part.attempts > 0 ? formatTime(part.avgTimeSeconds) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
