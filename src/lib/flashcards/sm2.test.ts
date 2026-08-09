// ExamForge — SM-2 Spaced Repetition Unit Tests (design-contract module)
// Contract (design.md Interfaces/Contracts):
//   SM2Rating = "AGAIN" | "HARD" | "GOOD" | "EASY"   (values 1, 2, 3, 5)
//   SM2ReviewResult = { cardId, rating, newEaseFactor, newInterval,
//                       newRepetitions, nextReviewAt }
// Rules pinned here:
//   AGAIN(1) → repetitions 0, interval 0 (same day), ease −0.20, floor 1.3
//   HARD(2)  → repetitions +1, interval max(1, round(prev × 1.2)), ease −0.15
//   GOOD(3)  → repetitions +1, interval 1 → 3 → round(prev × easeFactor), ease ±0
//   EASY(5)  → repetitions +1, interval max(1, round(prev × 3.0)), ease +0.15

import { describe, it, expect } from "vitest";
import {
  reviewCardSM2,
  sm2RatingToNumeric,
  DEFAULT_EASE_FACTOR,
  type SM2CardState,
} from "./sm2";

const defaultState: SM2CardState = {
  id: "card-1",
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

describe("reviewCardSM2 — AGAIN (1)", () => {
  it("returns a complete SM2ReviewResult mirroring cardId and rating", () => {
    const result = reviewCardSM2(defaultState, "AGAIN");
    expect(result.cardId).toBe("card-1");
    expect(result.rating).toBe("AGAIN");
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });

  it("resets repetitions to 0", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 10, repetitions: 5 },
      "AGAIN",
    );
    expect(result.newRepetitions).toBe(0);
  });

  it("sets interval to 0 (review again today)", () => {
    const result = reviewCardSM2(defaultState, "AGAIN");
    expect(result.newInterval).toBe(0);
  });

  it("sets nextReviewAt to today at midnight", () => {
    const result = reviewCardSM2(defaultState, "AGAIN");
    expect(daysUntil(result.nextReviewAt)).toBe(0);
    expect(result.nextReviewAt.getHours()).toBe(0);
    expect(result.nextReviewAt.getMinutes()).toBe(0);
    expect(result.nextReviewAt.getSeconds()).toBe(0);
  });

  it("decreases ease factor by 0.2", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 10, repetitions: 5 },
      "AGAIN",
    );
    expect(result.newEaseFactor).toBe(2.3);
  });

  it("clamps ease factor to the 1.3 floor", () => {
    const result = reviewCardSM2(
      { ...defaultState, easeFactor: 1.4, interval: 10, repetitions: 3 },
      "AGAIN",
    );
    expect(result.newEaseFactor).toBe(1.3);
  });
});

describe("reviewCardSM2 — HARD (2)", () => {
  it("schedules first review tomorrow (interval 1)", () => {
    const result = reviewCardSM2(defaultState, "HARD");
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(1);
    expect(daysUntil(result.nextReviewAt)).toBe(1);
  });

  it("multiplies an existing interval by 1.2 and rounds", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 10, repetitions: 5 },
      "HARD",
    );
    // Math.round(10 * 1.2) = 12
    expect(result.newInterval).toBe(12);
    expect(result.newRepetitions).toBe(6);
  });

  it("never schedules below 1 day", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 1, repetitions: 2 },
      "HARD",
    );
    // Math.round(1 * 1.2) = 1
    expect(result.newInterval).toBe(1);
  });

  it("decreases ease factor by 0.15", () => {
    const result = reviewCardSM2(defaultState, "HARD");
    expect(result.newEaseFactor).toBe(2.35);
  });

  it("clamps ease factor to the 1.3 floor", () => {
    const result = reviewCardSM2(
      { ...defaultState, easeFactor: 1.35, interval: 5, repetitions: 3 },
      "HARD",
    );
    expect(result.newEaseFactor).toBe(1.3);
  });
});

describe("reviewCardSM2 — GOOD (3)", () => {
  it("sets interval 1 day and repetitions 1 on first review", () => {
    const result = reviewCardSM2(defaultState, "GOOD");
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(1);
    expect(daysUntil(result.nextReviewAt)).toBe(1);
  });

  it("sets interval 3 days on second review", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 1, repetitions: 1 },
      "GOOD",
    );
    expect(result.newInterval).toBe(3);
    expect(result.newRepetitions).toBe(2);
  });

  it("multiplies interval by ease factor on subsequent reviews", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 10, repetitions: 2 },
      "GOOD",
    );
    // Math.round(10 * 2.5) = 25
    expect(result.newInterval).toBe(25);
    expect(result.newRepetitions).toBe(3);
  });

  it("leaves the ease factor unchanged", () => {
    const result = reviewCardSM2(defaultState, "GOOD");
    expect(result.newEaseFactor).toBe(2.5);
  });
});

describe("reviewCardSM2 — EASY (5)", () => {
  it("schedules first review tomorrow and bumps ease +0.15", () => {
    const result = reviewCardSM2(defaultState, "EASY");
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(1);
    expect(result.newEaseFactor).toBe(2.65);
    expect(daysUntil(result.nextReviewAt)).toBe(1);
  });

  it("multiplies an existing interval by 3.0", () => {
    const result = reviewCardSM2(
      { ...defaultState, interval: 5, repetitions: 2 },
      "EASY",
    );
    // Math.round(5 * 3.0) = 15
    expect(result.newInterval).toBe(15);
    expect(result.newRepetitions).toBe(3);
    expect(result.newEaseFactor).toBe(2.65);
  });
});

describe("reviewCardSM2 — scheduling invariants", () => {
  it("is deterministic with an injected reference date", () => {
    const now = new Date("2026-08-09T15:30:00.000Z");
    const result = reviewCardSM2(
      { ...defaultState, interval: 5, repetitions: 2 },
      "GOOD",
      now,
    );
    // nextReviewAt = local midnight of `now` + round(5 * 2.5) = 13 days
    const expected = new Date(now.getTime());
    expected.setHours(0, 0, 0, 0);
    expected.setDate(expected.getDate() + 13);
    expect(result.nextReviewAt.getTime()).toBe(expected.getTime());
  });

  it("only ever increases interval across pass ratings", () => {
    let state = { ...defaultState };
    const intervals: number[] = [];
    for (const rating of ["HARD", "GOOD", "GOOD", "EASY"] as const) {
      const result = reviewCardSM2(state, rating);
      state = {
        ...state,
        easeFactor: result.newEaseFactor,
        interval: result.newInterval,
        repetitions: result.newRepetitions,
      };
      intervals.push(state.interval);
    }
    expect(intervals[0]).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });
});

describe("sm2RatingToNumeric", () => {
  it("maps string ratings to the legacy numeric API (0-3)", () => {
    expect(sm2RatingToNumeric("AGAIN")).toBe(0);
    expect(sm2RatingToNumeric("HARD")).toBe(1);
    expect(sm2RatingToNumeric("GOOD")).toBe(2);
    expect(sm2RatingToNumeric("EASY")).toBe(3);
  });
});

describe("DEFAULT_EASE_FACTOR", () => {
  it("is 2.5 as per the SM-2 standard", () => {
    expect(DEFAULT_EASE_FACTOR).toBe(2.5);
  });
});