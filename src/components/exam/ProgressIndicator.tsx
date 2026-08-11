// OpenSloth — Progress Indicator Component
// Shows questions completed / total + time remaining visual bar

"use client";

import { cn } from "@/lib/utils/cn";

interface ProgressIndicatorProps {
  answeredCount: number;
  totalQuestions: number;
  remainingSeconds?: number;
  totalSeconds?: number;
  compact?: boolean;
}

export function ProgressIndicator({
  answeredCount,
  totalQuestions,
  remainingSeconds,
  totalSeconds,
  compact = false,
}: ProgressIndicatorProps) {
  const questionProgress = totalQuestions > 0 ? answeredCount / totalQuestions : 0;
  const questionPercent = Math.round(questionProgress * 100);

  const timeProgress =
    remainingSeconds !== undefined && totalSeconds && totalSeconds > 0
      ? remainingSeconds / totalSeconds
      : null;
  const timePercent = timeProgress !== null ? Math.round((1 - timeProgress) * 100) : null;

  const isTimeLow = timeProgress !== null && timeProgress < 0.1;

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{answeredCount}</span>
          <span className="mx-0.5">/</span>
          <span>{totalQuestions}</span>
        </span>

        {timePercent !== null && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isTimeLow ? "bg-destructive" : "bg-primary",
                )}
                style={{ width: `${Math.min(timePercent, 100)}%` }}
              />
            </div>
            <span className={cn("text-xs tabular-nums", isTimeLow && "text-destructive font-medium")}>
              {timePercent}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Questions progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Questions</span>
          <span className="text-muted-foreground tabular-nums">
            {answeredCount} / {totalQuestions}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${questionPercent}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{questionPercent}% complete</span>
      </div>

      {/* Time progress */}
      {timePercent !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Time Elapsed</span>
            <span
              className={cn(
                "tabular-nums",
                isTimeLow ? "text-destructive font-semibold" : "text-muted-foreground",
              )}
            >
              {timePercent}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isTimeLow ? "bg-destructive" : "bg-primary/60",
              )}
              style={{ width: `${Math.min(timePercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
