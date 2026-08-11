// OpenSloth — Practice helpers (pure) — used by practice-client and the
// Writing practice panel. Kept pure so the client-side finish/writing logic
// is unit-testable without a renderer (no integration libs installed).

import { describe, it, expect } from "vitest";
import { summarizePracticeResult, buildWritingFeedbackSubmission } from "./practice";

describe("summarizePracticeResult", () => {
  it("maps a full server finish payload into display numbers", () => {
    const summary = summarizePracticeResult({
      attemptId: "attempt-1",
      correctCount: 3,
      questionCount: 5,
      answerCount: 5,
      totalScore: 60,
      isPartial: false,
    });

    expect(summary.correctCount).toBe(3);
    expect(summary.questionCount).toBe(5);
    expect(summary.answerCount).toBe(5);
    expect(summary.totalScore).toBe(60);
    expect(summary.isPartial).toBe(false);
  });

  it("keeps totalScore null for a partial attempt (SE-05)", () => {
    const summary = summarizePracticeResult({
      correctCount: 1,
      questionCount: 5,
      answerCount: 1,
      totalScore: null,
      isPartial: true,
    });

    expect(summary.totalScore).toBeNull();
    expect(summary.isPartial).toBe(true);
    expect(summary.answerCount).toBe(1);
  });

  it("degrades gracefully for a malformed/empty payload", () => {
    const summary = summarizePracticeResult(undefined);

    expect(summary.correctCount).toBe(0);
    expect(summary.questionCount).toBe(0);
    expect(summary.totalScore).toBeNull();
    expect(summary.isPartial).toBe(false);
  });
});

describe("buildWritingFeedbackSubmission", () => {
  const prompt = {
    id: "prompt-1",
    prompt: "Write an essay about travel.",
    wordCountMin: 140,
    wordCountMax: 190,
  };

  it("computes word count from content and passes through evaluation data", () => {
    const submission = buildWritingFeedbackSubmission({
      submissionId: "sub-1",
      prompt,
      content: "one two three",
      scores: { content: 4 },
      feedback: { overall: "Bien" },
    });

    expect(submission.id).toBe("sub-1");
    expect(submission.wordCount).toBe(3);
    expect(submission.writingPrompt).toEqual(prompt);
    expect(submission.scores).toEqual({ content: 4 });
    expect(submission.feedback).toEqual({ overall: "Bien" });
  });

  it("reports zero words for empty content", () => {
    const submission = buildWritingFeedbackSubmission({
      submissionId: "sub-2",
      prompt,
      content: "   ",
      scores: null,
      feedback: null,
    });

    expect(submission.wordCount).toBe(0);
    expect(submission.content).toBe("   ");
  });
});
