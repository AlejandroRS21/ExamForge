// ExamForge — Question Generation Pipeline Tests (AI path + mock fallback)

import { describe, it, expect, vi, beforeEach } from "vitest";

const generateJSON = vi.fn();
const isAIConfigured = vi.fn();
const createQuestion = vi.fn();
const findUnique = vi.fn();

vi.mock("@/lib/ai/client", () => ({
  generateJSON: (...args: unknown[]) => generateJSON(...args),
  isAIConfigured: () => isAIConfigured(),
}));

vi.mock("@/lib/admin/questions", () => ({
  createQuestion: (...args: unknown[]) => createQuestion(...args),
}));

vi.mock("@/lib/prisma", () => {
  const proxy = { examPart: { findUnique: (...a: unknown[]) => findUnique(...a) } };
  return { default: proxy, prisma: proxy };
});

const EXAM_PART = { id: "part-1", label: "R&UoE Part 1", partNumber: 1, paper: "RUOE" };

describe("generateQuestions", () => {
  beforeEach(() => {
    generateJSON.mockReset();
    isAIConfigured.mockReset();
    createQuestion.mockReset();
    findUnique.mockReset();
    findUnique.mockResolvedValue(EXAM_PART);
    createQuestion.mockImplementation(async (input: { type: string; prompt: unknown }) => ({
      id: "q-" + Math.random().toString(36).slice(2, 8),
      type: input.type,
      prompt: input.prompt,
    }));
  });

  it("AI path: uses shared client when configured", async () => {
    isAIConfigured.mockReturnValue(true);
    generateJSON.mockResolvedValue({
      prompt: { text: "AI question" },
      options: ["a", "b"],
      correctAnswer: "a",
      explanation: "AI explanation",
      difficulty: "B",
      skillsTested: ["grammar"],
    });
    const { generateQuestions } = await import("./generate");
    const result = await generateQuestions({ examPartId: "part-1", count: 2 });
    expect(result.generated).toBe(2);
    expect(result.errors).toEqual([]);
    expect(result.source).toBe("ai");
    expect(generateJSON).toHaveBeenCalled();
  });

  it("fallback path: uses mock generators when AI not configured", async () => {
    isAIConfigured.mockReturnValue(false);
    const { generateQuestions } = await import("./generate");
    const result = await generateQuestions({ examPartId: "part-1", count: 3 });
    expect(result.generated).toBe(3);
    expect(result.source).toBe("mock");
    expect(generateJSON).not.toHaveBeenCalled();
  });

  it("fallback path: uses mocks when AI configured but returns null", async () => {
    isAIConfigured.mockReturnValue(true);
    generateJSON.mockResolvedValue(null);
    const { generateQuestions } = await import("./generate");
    const result = await generateQuestions({ examPartId: "part-1", count: 2 });
    expect(result.generated).toBe(2);
    expect(result.source).toBe("mock");
    expect(generateJSON).toHaveBeenCalled();
  });

  it("returns error when exam part not found", async () => {
    findUnique.mockResolvedValue(null);
    const { generateQuestions } = await import("./generate");
    const result = await generateQuestions({ examPartId: "missing", count: 1 });
    expect(result.generated).toBe(0);
    expect(result.errors).toContain("ExamPart not found");
    expect(result.source).toBe("mock");
  });

  it("saves generated questions as DRAFT status", async () => {
    isAIConfigured.mockReturnValue(false);
    const { generateQuestions } = await import("./generate");
    await generateQuestions({ examPartId: "part-1", count: 1 });
    expect(createQuestion).toHaveBeenCalledWith(
      expect.objectContaining({ status: "DRAFT", aiGenerated: true }),
    );
  });
});
