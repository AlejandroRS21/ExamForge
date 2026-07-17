// ExamForge — Results Summary Component
// Shows the overall score summary with Cambridge Scale estimate

"use client";

import { getScaleGrade } from "@/lib/scoring";

interface ResultsSummaryProps {
  totalScore: number | null;
  cambridgeScaleScore: number | null;
  correctCount: number;
  questionCount: number;
  isPartial: boolean;
  answeredCount: number;
  status: string;
}

export function ResultsSummary({
  totalScore,
  cambridgeScaleScore,
  correctCount,
  questionCount,
  isPartial,
  answeredCount,
  status,
}: ResultsSummaryProps) {
  // SE-05: Partial attempts
  if (isPartial) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-6 text-center">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
          Incomplete Attempt
        </h2>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Complete all parts to see your score.
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
          You answered {answeredCount} of {questionCount} questions.
          {status === "TIMED_OUT"
            ? " The exam was auto-submitted when time ran out."
            : ""}
        </p>
      </div>
    );
  }

  if (totalScore === null) {
    return (
      <div className="rounded-xl border border-muted bg-card p-6 text-center">
        <p className="text-muted-foreground">No score data available for this attempt.</p>
      </div>
    );
  }

  const grade = cambridgeScaleScore !== null ? getScaleGrade(cambridgeScaleScore) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Raw Score */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</p>
        <p className="text-3xl font-bold">{Math.round(totalScore)}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {correctCount} / {questionCount} correct
        </p>
      </div>

      {/* Cambridge Scale */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Cambridge Scale
        </p>
        <p className="text-3xl font-bold">{cambridgeScaleScore ?? "—"}</p>
        {cambridgeScaleScore && (
          <p className="text-xs text-muted-foreground mt-1">
            B2 First range: 120–190
          </p>
        )}
      </div>

      {/* Grade */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Grade</p>
        <p className="text-3xl font-bold">{grade ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {grade === "A"
            ? "Exceptional (180+)"
            : grade === "B"
              ? "Good (173–179)"
              : grade === "C"
                ? "Pass (160–172)"
                : grade === "B1"
                  ? "Below B2 (140–159)"
                  : "Below passing"}
        </p>
      </div>
    </div>
  );
}
