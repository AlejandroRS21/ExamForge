// OpenSloth — B2 Question Generation Tests (AI path + null-on-failure)

import { describe, it, expect, vi, beforeEach } from "vitest";

const generateJSON = vi.fn();

vi.mock("@/lib/ai/client", () => ({
  generateJSON: (...args: unknown[]) => generateJSON(...args),
  isAIConfigured: () => true,
}));

const VALID_Q = {
  type: "MC",
  prompt: "Choose the correct word.",
  options: ["a", "b", "c", "d"],
  correctAnswer: "b",
  difficulty: "B",
  skillsTested: ["vocab"],
  explanation: "Because b.",
};

describe("generateQuestionsForPartAndSave — AI path", () => {
  beforeEach(() => {
    generateJSON.mockReset();
  });

  it("generates and returns valid questions via shared client", async () => {
    generateJSON.mockResolvedValue(VALID_Q);
    const { generateQuestionsForPartAndSave } = await import("./generate-b2-questions");
    const result = await generateQuestionsForPartAndSave("ruoe-part-1", 2);
    expect(result.questions.length).toBe(2);
    expect(result.questions[0].correctAnswer).toBe("b");
    expect(generateJSON).toHaveBeenCalled();
  });

  it("returns empty when AI keeps returning null (retry exhausted)", async () => {
    generateJSON.mockResolvedValue(null);
    const { generateQuestionsForPartAndSave } = await import("./generate-b2-questions");
    const result = await generateQuestionsForPartAndSave("ruoe-part-1", 2);
    expect(result.created).toBe(0);
    expect(result.questions).toEqual([]);
  });

  it("skips questions with invalid structure", async () => {
    generateJSON.mockResolvedValue({ type: "MC", prompt: "x" }); // missing correctAnswer/difficulty
    const { generateQuestionsForPartAndSave } = await import("./generate-b2-questions");
    const result = await generateQuestionsForPartAndSave("ruoe-part-1", 1);
    expect(result.questions).toEqual([]);
  });

  it("returns empty for unknown part", async () => {
    const { generateQuestionsForPartAndSave } = await import("./generate-b2-questions");
    const result = await generateQuestionsForPartAndSave("nonexistent-part", 2);
    expect(result.created).toBe(0);
    expect(result.questions).toEqual([]);
    expect(generateJSON).not.toHaveBeenCalled();
  });
});
