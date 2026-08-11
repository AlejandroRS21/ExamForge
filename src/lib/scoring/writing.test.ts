// OpenSloth — Writing Evaluation Tests (AI path + heuristic fallback)

import { describe, it, expect, vi, beforeEach } from "vitest";

const generateJSON = vi.fn();

vi.mock("@/lib/ai/client", () => ({
  generateJSON: (...args: unknown[]) => generateJSON(...args),
  isAIConfigured: () => true,
}));

const SAMPLE = "This is a reasonable essay. It has several sentences and some structure.\n\nA second paragraph adds more detail and shows organisation.";

describe("evaluateWritingWithClaude — AI path", () => {
  beforeEach(() => {
    generateJSON.mockReset();
  });

  it("uses AI scores and feedback when AI returns valid JSON", async () => {
    generateJSON.mockResolvedValue({
      content: 4,
      communicativeAchievement: 3,
      organisation: 5,
      language: 4,
      content_feedback: "Good content.",
      overall_feedback: "Solid work.",
    });
    const { evaluateWritingWithClaude } = await import("./writing");
    const result = await evaluateWritingWithClaude(SAMPLE, 140, 190, "Write an essay.");
    expect(result.scores).toEqual({
      content: 4,
      communicativeAchievement: 3,
      organisation: 5,
      language: 4,
    });
    expect(result.totalScore).toBe(16);
    expect(result.feedback.content).toBe("Good content.");
    expect(result.feedback.overall).toBe("Solid work.");
  });

  it("clamps out-of-range AI scores to 0-5", async () => {
    generateJSON.mockResolvedValue({
      content: 9,
      communicativeAchievement: -2,
      organisation: 3,
      language: 4,
    });
    const { evaluateWritingWithClaude } = await import("./writing");
    const result = await evaluateWritingWithClaude(SAMPLE, 140, 190, "Write an essay.");
    expect(result.scores.content).toBe(5);
    expect(result.scores.communicativeAchievement).toBe(0);
  });

  it("returns empty evaluation for empty content without calling AI", async () => {
    const { evaluateWritingWithClaude } = await import("./writing");
    const result = await evaluateWritingWithClaude("   ", 140, 190, "Write an essay.");
    expect(result.totalScore).toBe(0);
    expect(generateJSON).not.toHaveBeenCalled();
  });
});

describe("evaluateWritingWithClaude — heuristic fallback", () => {
  beforeEach(() => {
    generateJSON.mockReset();
  });

  it("falls back to heuristic when AI returns null", async () => {
    generateJSON.mockResolvedValue(null);
    const { evaluateWritingWithClaude } = await import("./writing");
    const result = await evaluateWritingWithClaude(SAMPLE, 140, 190, "Write an essay.");
    // Heuristic still produces a valid rubric result.
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(20);
    expect(result.scores).toHaveProperty("content");
  });

  it("falls back when AI returns invalid structure (missing score field)", async () => {
    generateJSON.mockResolvedValue({ content: 4, organisation: 3 });
    const { evaluateWritingWithClaude } = await import("./writing");
    const result = await evaluateWritingWithClaude(SAMPLE, 140, 190, "Write an essay.");
    expect(typeof result.averageScore).toBe("number");
  });
});
