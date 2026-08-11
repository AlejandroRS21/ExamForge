// OpenSloth — Question Type Kicker Labels Tests
// Neuroinclusive UI adoption: ExamPractice's "PromptKicker" (e.g. "WORD
// FORMATION") is derived from the real `question.type` code, not fabricated.

import { describe, it, expect } from "vitest";
import { getQuestionTypeLabel } from "./question-type-labels";

describe("getQuestionTypeLabel", () => {
  it("maps every real QuestionType code to its uppercase human label", () => {
    expect(getQuestionTypeLabel("MC")).toBe("MULTIPLE CHOICE");
    expect(getQuestionTypeLabel("CLOZE")).toBe("OPEN CLOZE");
    expect(getQuestionTypeLabel("WF")).toBe("WORD FORMATION");
    expect(getQuestionTypeLabel("KT")).toBe("KEY WORD TRANSFORMATION");
    expect(getQuestionTypeLabel("GT")).toBe("GAPPED TEXT");
    expect(getQuestionTypeLabel("MM")).toBe("MULTIPLE MATCHING");
  });

  it("falls back to the raw type code for unknown/future types instead of fabricating a label", () => {
    expect(getQuestionTypeLabel("UNKNOWN_TYPE")).toBe("UNKNOWN_TYPE");
  });
});
