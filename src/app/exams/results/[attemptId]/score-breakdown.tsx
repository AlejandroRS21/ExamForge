// ExamForge — Per-Part Score Breakdown Component

"use client";

interface PartStat {
  partId: string;
  label: string;
  partNumber: number;
  paper: string;
  questionCount: number;
  correctCount: number;
  percentage: number;
}

interface ScoreBreakdownProps {
  partStats: PartStat[];
}

export function ScoreBreakdown({ partStats }: ScoreBreakdownProps) {
  if (partStats.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Part</th>
            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Questions</th>
            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Correct</th>
            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Bar</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {partStats.map((stat, i) => {
            const barColor =
              stat.percentage >= 80
                ? "bg-success"
                : stat.percentage >= 60
                  ? "bg-warning"
                  : "bg-error";

            return (
              <tr key={stat.partId} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                <td className="px-4 py-3 font-medium">{stat.label}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{stat.questionCount}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {stat.correctCount}
                </td>
                <td className="px-4 py-3 text-center font-semibold">{stat.percentage}%</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2 w-24">
                    <div className="h-2 rounded-full bg-muted flex-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {stat.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
