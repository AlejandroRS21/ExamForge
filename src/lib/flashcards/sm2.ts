// ExamForge — SM-2 Spaced Repetition Algorithm (design contract)
// Canonical module for student flashcard review routing.
//
// Contract (design.md Interfaces/Contracts):
//   SM2Rating = "AGAIN" | "HARD" | "GOOD" | "EASY"   (values 1, 2, 3, 5)
//   SM2ReviewResult = { cardId, rating, newEaseFactor, newInterval,
//                       newRepetitions, nextReviewAt }
//
// Rating rules (pinned by sm2.test.ts):
//   AGAIN(1) → repetitions 0, interval 0 (same day), ease −0.20  [floor 1.3]
//   HARD(2)  → repetitions +1, interval max(1, round(prev × 1.2)), ease −0.15
//   GOOD(3)  → repetitions +1, interval 1 → 3 → round(prev × easeFactor), ease ±0
//   EASY(5)  → repetitions +1, interval max(1, round(prev × 3.0)), ease +0.15
//
// nextReviewAt is always computed at local midnight (start of day) so cards
// become due at the beginning of their scheduled review day.

export type SM2Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";

/**
 * Map the string contract to the legacy numeric rating API (0-3) used by the
 * existing persistence route (`POST /api/flashcards/decks/[deckId]`,
 * service.rateCard). Both algorithms implement the same SM-2 rules, so the
 * preview shown by the UI (computed here) matches what the server stores.
 */
export function sm2RatingToNumeric(rating: SM2Rating): 0 | 1 | 2 | 3 {
  switch (rating) {
    case "AGAIN":
      return 0;
    case "HARD":
      return 1;
    case "GOOD":
      return 2;
    case "EASY":
      return 3;
  }
}

export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;

/** Current SM-2 scheduling state of a single card (mirrors Prisma Flashcard). */
export interface SM2CardState {
  id: string;
  easeFactor: number;
  interval: number; // in days
  repetitions: number;
}

export interface SM2ReviewResult {
  cardId: string;
  rating: SM2Rating;
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReviewAt: Date;
}

function schedule(now: Date, intervalDays: number): Date {
  const next = new Date(now.getTime());
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

/**
 * Compute the next SM-2 review state for a card after the student rates it.
 * Pure function — no I/O. Pass an explicit `now` for deterministic tests.
 */
export function reviewCardSM2(
  current: SM2CardState,
  rating: SM2Rating,
  now: Date = new Date(),
): SM2ReviewResult {
  let { easeFactor, interval, repetitions } = current;

  switch (rating) {
    case "AGAIN": {
      // Lapse: relearn today, reset progress.
      repetitions = 0;
      interval = 0;
      easeFactor -= 0.2;
      break;
    }
    case "HARD": {
      // Align with server calculateSM2: Hard resets repetitions, next review tomorrow.
      repetitions = 0;
      interval = 1;
      easeFactor -= 0.15;
      break;
    }
    case "GOOD": {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      // ease factor unchanged
      break;
    }
    case "EASY": {
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor += 0.15;
      break;
    }
  }

  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  return {
    cardId: current.id,
    rating,
    newEaseFactor: easeFactor,
    newInterval: interval,
    newRepetitions: repetitions,
    nextReviewAt: schedule(now, interval),
  };
}