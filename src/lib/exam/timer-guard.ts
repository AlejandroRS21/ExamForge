// ExamForge — Calm Sloth Timer Guard (pure logic)
// Presentational helper for the practice-mode calm guard: it only decides
// WHEN the non-alarm reassurance should show. No timers, no side effects.

export const LOW_TIME_THRESHOLD_SECONDS = 300; // 5 minutes

/**
 * True once fewer than 5 minutes remain in a timed part.
 * Untimed parts (timeMinutes === 0) never trigger the calm guard.
 * Exact 5:00 left stays calm (non-alarm boundary).
 */
export function practiceTimeLow(elapsedSeconds: number, timeMinutes: number): boolean {
  if (timeMinutes <= 0 || elapsedSeconds < 0) return false;
  return timeMinutes * 60 - elapsedSeconds < LOW_TIME_THRESHOLD_SECONDS;
}

/** Formats a remaining-seconds count as whole minutes, rounding up. */
export function formatRemaining(remainingSeconds: number): string {
  const minutes = Math.max(0, Math.ceil(remainingSeconds / 60));
  return `${minutes} min`;
}