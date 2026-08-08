// ExamForge — Moment Engine Copy
// Static fallback copy + fetchCopy with 900ms abort and /api/moments/copy.

import type { MomentEventType } from "./types";

export const STATIC_COPY: Record<MomentEventType, string[]> = {
  EXAM_COMPLETE: [
    "Exam complete. Well done.",
    "You finished it. Every attempt counts.",
    "Done. That took focus.",
    "Completed. Your effort adds up.",
  ],
  BADGE_UNLOCKED: [
    "New badge unlocked!",
    "Achievement earned.",
    "You reached a milestone.",
    "Badge added to your collection.",
  ],
  STREAK_MILESTONE: [
    "Streak milestone reached!",
    "Consistency is paying off.",
    "Another streak milestone.",
    "Keep showing up.",
  ],
  GOAL_ACHIEVED: [
    "Goal reached!",
    "You hit your target.",
    "Goal complete.",
    "Target achieved — set the next one.",
  ],
  STREAK_RESET: [
    "Fresh start today.",
    "New streak begins now.",
    "One session, back on track.",
    "Reset. Ready when you are.",
  ],
};

function randomFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Blame/guilt/shame blocklist — shared by the static-copy test and the
// server route, so a NotebookLM response can't bypass the same check.
const BLAME_VOCAB = [
  /\bfailed?\b/i,
  /\bfailure\b/i,
  /\blost?\b/i,
  /\bbroke\b/i,
  /\bgave up\b/i,
  /\bshame\b/i,
  /\bshould have\b/i,
  /\bcome on\b/i,
  /\bespabila\b/i,
  /\bguilt\b/i,
  /\bblame\b/i,
  /\byou let\b/i,
  /\bdisappoint\b/i,
];

export function containsBlameLanguage(text: string): boolean {
  return BLAME_VOCAB.some((pattern) => pattern.test(text));
}

/**
 * Fetch reinforcement copy from the API with a 900ms abort.
 * Falls back to a random static string on any failure.
 */
export async function fetchCopy(
  type: MomentEventType,
  signal?: AbortSignal,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 900);
  // Chain the caller's signal so they can also abort
  signal?.addEventListener("abort", () => controller.abort());

  try {
    const res = await fetch("/api/moments/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: type }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return randomFrom(STATIC_COPY[type]);
    const data = await res.json();
    if (typeof data?.copy === "string" && data.copy.trim()) {
      return data.copy.trim();
    }
    return randomFrom(STATIC_COPY[type]);
  } catch {
    clearTimeout(timeout);
    return randomFrom(STATIC_COPY[type]);
  }
}
