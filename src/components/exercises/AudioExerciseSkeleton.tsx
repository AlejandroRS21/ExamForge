// ExamForge — AudioExercise Skeleton Loading State
// Shown while audio exercise data is being fetched

export function AudioExerciseSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading exercise">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/60" />
      </div>

      {/* Audio player skeleton */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted" />
            <div className="flex justify-between">
              <div className="h-3 w-8 rounded bg-muted/60" />
              <div className="h-3 w-8 rounded bg-muted/60" />
            </div>
          </div>
          <div className="h-8 w-12 rounded-md bg-muted" />
        </div>
      </div>

      {/* Questions skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted/60" />
            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 rounded-lg border bg-muted/20" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading audio exercise...</span>
    </div>
  );
}
