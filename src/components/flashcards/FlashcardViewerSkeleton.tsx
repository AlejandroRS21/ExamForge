// ExamForge — FlashcardViewer Skeleton Loading State
// Shown while cards are being fetched

export function FlashcardViewerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading flashcards">
      {/* Progress skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted/60" />
      </div>

      {/* Progress bar skeleton */}
      <div className="h-1.5 w-full rounded-full bg-muted" />

      {/* Card skeleton */}
      <div className="relative min-h-[280px] w-full rounded-xl border bg-card p-8">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>
      </div>

      {/* Rating buttons skeleton */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted" />
        ))}
      </div>

      <span className="sr-only">Loading flashcard deck...</span>
    </div>
  );
}
