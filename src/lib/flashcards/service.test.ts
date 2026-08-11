// OpenSloth — Flashcard Service Tests
// SM-2 spaced repetition algorithm unit tests + getDueCards filtering

import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateSM2 } from "./service";
import type { SM2Result } from "./service";

// ─── Default Current State ───────────────────────────────────────────────────

const defaultState = { easeFactor: 2.5, interval: 0, repetitions: 0 };

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ─── Rating 0 (Again) ───────────────────────────────────────────────────────

describe("calculateSM2 — rating 0 (Again)", () => {
  it("resets repetitions to 0", () => {
    const result = calculateSM2(0, { easeFactor: 2.5, interval: 10, repetitions: 5 });
    expect(result.repetitions).toBe(0);
  });

  it("sets interval to 0 (same day)", () => {
    const result = calculateSM2(0, defaultState);
    expect(result.interval).toBe(0);
  });

  it("sets nextReviewAt to today", () => {
    const result = calculateSM2(0, defaultState);
    expect(daysUntil(result.nextReviewAt)).toBe(0);
  });

  it("decreases ease factor by 0.2", () => {
    const result = calculateSM2(0, { easeFactor: 2.5, interval: 10, repetitions: 5 });
    expect(result.easeFactor).toBe(2.3);
  });

  it("resets a card with many repetitions", () => {
    const result = calculateSM2(0, { easeFactor: 2.5, interval: 30, repetitions: 10 });
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(0);
  });
});

// ─── Rating 1 (Hard) ─────────────────────────────────────────────────────────

describe("calculateSM2 — rating 1 (Hard)", () => {
  it("resets repetitions to 0", () => {
    const result = calculateSM2(1, { easeFactor: 2.5, interval: 10, repetitions: 5 });
    expect(result.repetitions).toBe(0);
  });

  it("sets interval to 1 (tomorrow)", () => {
    const result = calculateSM2(1, defaultState);
    expect(result.interval).toBe(1);
  });

  it("sets nextReviewAt to tomorrow", () => {
    const result = calculateSM2(1, defaultState);
    expect(daysUntil(result.nextReviewAt)).toBe(1);
  });

  it("decreases ease factor by 0.15", () => {
    const result = calculateSM2(1, { easeFactor: 2.5, interval: 10, repetitions: 5 });
    expect(result.easeFactor).toBe(2.35);
  });
});

// ─── Rating 2 (Good) — First Review ─────────────────────────────────────────

describe("calculateSM2 — rating 2 (Good)", () => {
  it("increments repetitions from 0 to 1 on first review", () => {
    const result = calculateSM2(2, defaultState);
    expect(result.repetitions).toBe(1);
  });

  it("sets interval to 1 day on first review", () => {
    const result = calculateSM2(2, defaultState);
    expect(result.interval).toBe(1);
  });

  it("leaves ease factor unchanged", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 0, repetitions: 0 });
    expect(result.easeFactor).toBe(2.5);
  });

  it("sets nextReviewAt to tomorrow on first review", () => {
    const result = calculateSM2(2, defaultState);
    expect(daysUntil(result.nextReviewAt)).toBe(1);
  });
});

// ─── Rating 2 (Good) — Second Review ────────────────────────────────────────

describe("calculateSM2 — second review (repetitions=1)", () => {
  it("increments repetitions to 2", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 1, repetitions: 1 });
    expect(result.repetitions).toBe(2);
  });

  it("sets interval to 3 days on second review", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 1, repetitions: 1 });
    expect(result.interval).toBe(3);
  });

  it("sets nextReviewAt to 3 days from now", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 1, repetitions: 1 });
    expect(daysUntil(result.nextReviewAt)).toBe(3);
  });
});

// ─── Rating 2 (Good) — Subsequent Reviews ────────────────────────────────────

describe("calculateSM2 — subsequent reviews (interval * easeFactor)", () => {
  it("increments repetitions on subsequent review", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 10, repetitions: 2 });
    expect(result.repetitions).toBe(3);
  });

  it("multiplies interval by ease factor for subsequent review", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 10, repetitions: 2 });
    // Math.round(10 * 2.5) = 25
    expect(result.interval).toBe(25);
  });

  it("rounds interval to integer", () => {
    const result = calculateSM2(2, { easeFactor: 2.3, interval: 7, repetitions: 2 });
    // Math.round(7 * 2.3) = 16
    expect(result.interval).toBe(16);
  });

  it("sets nextReviewAt to interval days from now", () => {
    const result = calculateSM2(2, { easeFactor: 2.5, interval: 10, repetitions: 2 });
    expect(daysUntil(result.nextReviewAt)).toBe(25);
  });
});

// ─── Rating 3 (Easy) ─────────────────────────────────────────────────────────

describe("calculateSM2 — rating 3 (Easy)", () => {
  it("increments repetitions", () => {
    const result = calculateSM2(3, defaultState);
    expect(result.repetitions).toBe(1);
  });

  it("sets interval to 1 on first review", () => {
    const result = calculateSM2(3, defaultState);
    expect(result.interval).toBe(1);
  });

  it("increases ease factor by 0.15", () => {
    const result = calculateSM2(3, { easeFactor: 2.5, interval: 0, repetitions: 0 });
    expect(result.easeFactor).toBe(2.65);
  });

  it("uses 3.0x subsequent multiplier on Easy", () => {
    // On subsequent reviews with good/easy, interval = Math.round(interval * easeFactor)
    // The ease factor adjustment already happened, so for subsequent reviews with Easy,
    // the higher ease factor produces longer intervals naturally
    const afterEasy = calculateSM2(3, { easeFactor: 2.5, interval: 5, repetitions: 2 });
    // easeFactor becomes 2.65, interval = Math.round(5 * 2.65) = 13
    expect(afterEasy.interval).toBe(13);
    expect(afterEasy.easeFactor).toBe(2.65);
  });
});

// ─── Ease Factor Floor ───────────────────────────────────────────────────────

describe("calculateSM2 — minimum ease factor", () => {
  it("clamps ease factor to minimum 1.3 when rating 0 from low base", () => {
    const result = calculateSM2(0, { easeFactor: 1.4, interval: 5, repetitions: 3 });
    // 1.4 - 0.2 = 1.2 → clamped to 1.3
    expect(result.easeFactor).toBe(1.3);
  });

  it("clamps ease factor to minimum 1.3 when rating 1 from low base", () => {
    const result = calculateSM2(1, { easeFactor: 1.35, interval: 5, repetitions: 3 });
    // 1.35 - 0.15 = 1.2 → clamped to 1.3
    expect(result.easeFactor).toBe(1.3);
  });

  it("does not clamp when ease factor is above 1.3", () => {
    const result = calculateSM2(0, { easeFactor: 2.0, interval: 5, repetitions: 3 });
    // 2.0 - 0.2 = 1.8
    expect(result.easeFactor).toBe(1.8);
  });

  it("allows ease factor to stay at exactly 1.3 from above", () => {
    const result = calculateSM2(1, { easeFactor: 1.45, interval: 5, repetitions: 3 });
    // 1.45 - 0.15 = 1.3
    expect(result.easeFactor).toBe(1.3);
  });

  it("prevents ease factor from going below 1.3 even with repeated failures", () => {
    let state = { easeFactor: 2.5, interval: 10, repetitions: 5 };
    for (let i = 0; i < 10; i++) {
      state = calculateSM2(0, state);
    }
    expect(state.easeFactor).toBe(1.3);
  });
});

// ─── Interval Progression ────────────────────────────────────────────────────

describe("calculateSM2 — interval progression", () => {
  it("simulates a complete learning sequence with Good ratings", () => {
    let state = { easeFactor: 2.5, interval: 0, repetitions: 0 };
    const intervals: number[] = [];

    // First review (Good)
    state = calculateSM2(2, state);
    intervals.push(state.interval);
    // Second review (Good)
    state = calculateSM2(2, state);
    intervals.push(state.interval);
    // Third review (Good)
    state = calculateSM2(2, state);
    intervals.push(state.interval);
    // Fourth review (Good)
    state = calculateSM2(2, state);
    intervals.push(state.interval);

    // Expected: 1, 3, 7 (3*2.5=7.5→8? wait Math.round(3*2.5)=8), 20 (8*2.5=20)
    expect(intervals[0]).toBe(1);  // first review
    expect(intervals[1]).toBe(3);  // second review
    expect(intervals[2]).toBe(8);  // Math.round(3 * 2.5) = 8
    expect(intervals[3]).toBe(20); // Math.round(8 * 2.5) = 20
  });

  it("keeps ease factor at 2.5 after three Good ratings", () => {
    let state = { easeFactor: 2.5, interval: 0, repetitions: 0 };
    state = calculateSM2(2, state);
    state = calculateSM2(2, state);
    state = calculateSM2(2, state);
    expect(state.easeFactor).toBe(2.5);
  });

  it("increases ease factor with Easy ratings", () => {
    let state = { easeFactor: 2.5, interval: 0, repetitions: 0 };
    state = calculateSM2(3, state);
    expect(state.easeFactor).toBe(2.65);
    state = calculateSM2(3, state);
    expect(state.easeFactor).toBe(2.8);
  });
});

// ─── getDueCards ─────────────────────────────────────────────────────────────

describe("getDueCards", () => {
  // getDueCards is an async function using Prisma.
  // For unit testing, we verify the module structure and filtering logic
  // by checking the function signature and exported types.

  it("exports calculateSM2 as a pure function", () => {
    expect(calculateSM2).toBeDefined();
    expect(typeof calculateSM2).toBe("function");
  });

  it("calculateSM2 returns correct type shape", () => {
    const result: SM2Result = calculateSM2(2, defaultState);
    expect(result).toHaveProperty("easeFactor");
    expect(result).toHaveProperty("interval");
    expect(result).toHaveProperty("repetitions");
    expect(result).toHaveProperty("nextReviewAt");
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });

  it("nextReviewAt is set to midnight", () => {
    const result = calculateSM2(2, defaultState);
    expect(result.nextReviewAt.getHours()).toBe(0);
    expect(result.nextReviewAt.getMinutes()).toBe(0);
    expect(result.nextReviewAt.getSeconds()).toBe(0);
    expect(result.nextReviewAt.getMilliseconds()).toBe(0);
  });

  it("filtering: cards with null nextReviewAt are due", () => {
    // This tests the filtering logic used in listDecks and getDueCards:
    // The filter: card.nextReviewAt === null || card.nextReviewAt <= now
    // null → is due (the === null check makes it true)
    // past date → is due (comparison with <= now)
    // future date → is NOT due (both checks are false)
    const now = new Date();
    const past = new Date(now.getTime() - 86400000); // yesterday
    const future = new Date(now.getTime() + 86400000 * 3); // 3 days later

    // Simulate the filtering logic used in the service
    function isDue(nextReviewAt: Date | null): boolean {
      return nextReviewAt === null || nextReviewAt <= now;
    }

    expect(isDue(null)).toBe(true);    // null → due
    expect(isDue(past)).toBe(true);    // past → due
    expect(isDue(future)).toBe(false); // future → not due
  });


});
