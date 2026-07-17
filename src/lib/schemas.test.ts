// ExamForge — Zod Schema Validation Tests
// Tests that all new NotebookLM-related schemas accept valid input and reject invalid input

import { describe, it, expect } from "vitest";
import {
  generateContentSchema,
  reviewContentSchema,
  audioSubmitSchema,
  flashcardReviewSchema,
} from "./schemas";

// ─── generateContentSchema ──────────────────────────────────────────────────

describe("generateContentSchema", () => {
  it("accepts valid URL + QUIZ payload", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "URL",
      sourceData: "https://example.com/article",
      contentType: "QUIZ",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid TEXT + AUDIO payload", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "TEXT",
      sourceData: "A long text source for generating audio content...",
      contentType: "AUDIO",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid YOUTUBE + FLASHCARDS payload", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "YOUTUBE",
      sourceData: "https://youtube.com/watch?v=abc123",
      contentType: "FLASHCARDS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sourceType", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "INVALID",
      sourceData: "some data",
      contentType: "QUIZ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid contentType", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "URL",
      sourceData: "https://example.com",
      contentType: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty sourceData", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "TEXT",
      sourceData: "",
      contentType: "QUIZ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing sourceData", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "URL",
      contentType: "QUIZ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = generateContentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null sourceData", () => {
    const result = generateContentSchema.safeParse({
      sourceType: "URL",
      sourceData: null,
      contentType: "QUIZ",
    });
    expect(result.success).toBe(false);
  });
});

// ─── reviewContentSchema ────────────────────────────────────────────────────

describe("reviewContentSchema", () => {
  it("accepts APPROVE action without reason", () => {
    const result = reviewContentSchema.safeParse({
      action: "APPROVE",
    });
    expect(result.success).toBe(true);
  });

  it("accepts REJECT action with reason", () => {
    const result = reviewContentSchema.safeParse({
      action: "REJECT",
      reason: "Content quality is too low",
    });
    expect(result.success).toBe(true);
  });

  it("accepts REJECT action without reason", () => {
    const result = reviewContentSchema.safeParse({
      action: "REJECT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action", () => {
    const result = reviewContentSchema.safeParse({
      action: "PUBLISH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty action", () => {
    const result = reviewContentSchema.safeParse({
      action: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects number as action", () => {
    const result = reviewContentSchema.safeParse({
      action: 123,
    });
    expect(result.success).toBe(false);
  });
});

// ─── audioSubmitSchema ───────────────────────────────────────────────────────

describe("audioSubmitSchema", () => {
  it("accepts valid answers record", () => {
    const result = audioSubmitSchema.safeParse({
      answers: {
        q1: "Paris",
        q2: "True",
        q3: "Pacific",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty answers record", () => {
    const result = audioSubmitSchema.safeParse({
      answers: {},
    });
    expect(result.success).toBe(true);
  });

  it("accepts single answer", () => {
    const result = audioSubmitSchema.safeParse({
      answers: { q1: "Paris" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing answers field", () => {
    const result = audioSubmitSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects null answers", () => {
    const result = audioSubmitSchema.safeParse({
      answers: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-object answers", () => {
    const result = audioSubmitSchema.safeParse({
      answers: "not-an-object",
    });
    expect(result.success).toBe(false);
  });

  it("rejects array as answers", () => {
    const result = audioSubmitSchema.safeParse({
      answers: ["a", "b"],
    });
    expect(result.success).toBe(false);
  });
});

// ─── flashcardReviewSchema ───────────────────────────────────────────────────

describe("flashcardReviewSchema", () => {
  it("accepts valid card rating (rating 0)", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid card rating (rating 2)", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid card rating (rating 3)", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 0", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 3", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: 4,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: 2.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty cardId", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "",
      rating: 3,
    });
    // empty string should fail min(1) validation
    expect(result.success).toBe(false);
  });

  it("rejects missing cardId", () => {
    const result = flashcardReviewSchema.safeParse({
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing rating", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects string rating", () => {
    const result = flashcardReviewSchema.safeParse({
      cardId: "clx123abc",
      rating: "good",
    });
    expect(result.success).toBe(false);
  });
});

// ─── ZodError structure ─────────────────────────────────────────────────────

describe("ZodError shape on invalid input", () => {
  it("generateContentSchema produces ZodError with issues array", () => {
    const result = generateContentSchema.safeParse({});
    if (!result.success) {
      expect(result.error.issues).toBeDefined();
      expect(Array.isArray(result.error.issues)).toBe(true);
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.issues[0]).toHaveProperty("message");
      expect(result.error.issues[0]).toHaveProperty("path");
    }
  });

  it("reviewContentSchema produces error with specific field path", () => {
    const result = reviewContentSchema.safeParse({});
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("action");
    }
  });

  it("audioSubmitSchema produces error pointing to answers", () => {
    const result = audioSubmitSchema.safeParse({});
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("answers");
    }
  });

  it("flashcardReviewSchema produces errors for both missing fields", () => {
    const result = flashcardReviewSchema.safeParse({});
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("cardId");
      expect(paths).toContain("rating");
    }
  });
});
