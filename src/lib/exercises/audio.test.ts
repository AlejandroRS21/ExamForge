// ExamForge — Audio Exercise Scoring Tests
// Tests for scoreAnswers() and related pure logic in the audio exercise service

import { describe, it, expect } from "vitest";
import { scoreAnswers } from "./audio";
import type { AudioQuestions } from "./audio";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mcQuestion = {
  id: "q1",
  type: "MC" as const,
  question: "What is the capital of France?",
  options: ["London", "Paris", "Berlin", "Madrid"],
  correctAnswer: "Paris",
};

const tfQuestion = {
  id: "q2",
  type: "TF" as const,
  question: "The Earth revolves around the Sun.",
  options: ["True", "False"],
  correctAnswer: "True",
};

const mcQuestion2 = {
  id: "q3",
  type: "MC" as const,
  question: "Which is the largest ocean?",
  options: ["Atlantic", "Indian", "Arctic", "Pacific"],
  correctAnswer: "Pacific",
};

const questions: AudioQuestions = {
  items: [mcQuestion, tfQuestion, mcQuestion2],
};

// ─── Score Normal Behavior ────────────────────────────────────────────────────

describe("scoreAnswers", () => {
  it("returns perfect score when all answers are correct", () => {
    const result = scoreAnswers(questions, {
      q1: "Paris",
      q2: "True",
      q3: "Pacific",
    });

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(3);
    expect(result.score).toBe(100);
    expect(result.details.every((d) => d.correct)).toBe(true);
  });

  it("returns zero score when all answers are incorrect", () => {
    const result = scoreAnswers(questions, {
      q1: "London",
      q2: "False",
      q3: "Atlantic",
    });

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(0);
    expect(result.score).toBe(0);
    expect(result.details.every((d) => !d.correct)).toBe(true);
  });

  it("calculates partial credit correctly (2/3 correct)", () => {
    const result = scoreAnswers(questions, {
      q1: "Paris",
      q2: "True",
      q3: "Atlantic", // wrong
    });

    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(2);
    expect(result.score).toBe(67); // Math.round(2/3 * 100) = 67
  });

  it("calculates partial credit for 1/3 correct", () => {
    const result = scoreAnswers(questions, {
      q1: "Paris",
      q2: "False", // wrong
      q3: "Atlantic", // wrong
    });

    expect(result.correctAnswers).toBe(1);
    expect(result.score).toBe(33); // Math.round(1/3 * 100) = 33
  });

  it("provides per-question detail with correct answer", () => {
    const result = scoreAnswers(questions, {
      q1: "Paris",
      q2: "False", // wrong
      q3: "Pacific",
    });

    expect(result.details).toHaveLength(3);
    expect(result.details[0]).toEqual({
      questionId: "q1",
      correct: true,
      correctAnswer: "Paris",
    });
    expect(result.details[1]).toEqual({
      questionId: "q2",
      correct: false,
      correctAnswer: "True",
    });
    expect(result.details[2]).toEqual({
      questionId: "q3",
      correct: true,
      correctAnswer: "Pacific",
    });
  });
});

// ─── MC Answer Matching ──────────────────────────────────────────────────────

describe("MC answer matching", () => {
  it("matches exact answer", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "Paris" });
    expect(result.correctAnswers).toBe(1);
  });

  it("is case-insensitive", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "paris" });
    expect(result.correctAnswers).toBe(1);
  });

  it("handles mixed case matching", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "PARIS" });
    expect(result.correctAnswers).toBe(1);
  });

  it("rejects wrong answer", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "London" });
    expect(result.correctAnswers).toBe(0);
  });

  it("trims whitespace from student answer", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "  Paris  " });
    expect(result.correctAnswers).toBe(1);
  });
});

// ─── TF Answer Matching ──────────────────────────────────────────────────────

describe("TF answer matching", () => {
  it("matches True correctly", () => {
    const result = scoreAnswers({ items: [tfQuestion] }, { q2: "True" });
    expect(result.correctAnswers).toBe(1);
  });

  it("matches False for a true statement (incorrect)", () => {
    const result = scoreAnswers({ items: [tfQuestion] }, { q2: "False" });
    expect(result.correctAnswers).toBe(0);
  });

  it("is case-insensitive for TF", () => {
    const result = scoreAnswers({ items: [tfQuestion] }, { q2: "true" });
    expect(result.correctAnswers).toBe(1);
  });

  it("handles leading/trailing whitespace for TF", () => {
    const result = scoreAnswers({ items: [tfQuestion] }, { q2: "  True  " });
    expect(result.correctAnswers).toBe(1);
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("handles null questions gracefully", () => {
    const result = scoreAnswers(null, {});
    expect(result.totalQuestions).toBe(0);
    expect(result.correctAnswers).toBe(0);
    expect(result.score).toBe(0);
    expect(result.details).toEqual([]);
  });

  it("handles empty items array", () => {
    const result = scoreAnswers({ items: [] }, {});
    expect(result.totalQuestions).toBe(0);
    expect(result.correctAnswers).toBe(0);
    expect(result.score).toBe(0);
  });

  it("handles empty student answers", () => {
    const result = scoreAnswers(questions, {});
    expect(result.correctAnswers).toBe(0);
    expect(result.score).toBe(0);
  });

  it("handles missing question IDs in student answers", () => {
    const result = scoreAnswers(questions, { q1: "Paris" });
    // Only q1 is answered, q2 and q3 have empty strings after trim
    expect(result.correctAnswers).toBe(1);
    expect(result.score).toBe(33);
  });

  it("ignores extra keys in student answers not corresponding to questions", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "Paris", extra_key: "value" });
    expect(result.correctAnswers).toBe(1);
    expect(result.totalQuestions).toBe(1);
  });

  it("handles single question set", () => {
    const singleQ: AudioQuestions = { items: [mcQuestion] };
    const result = scoreAnswers(singleQ, { q1: "Paris" });
    expect(result.score).toBe(100);
  });

  it("sets exerciseId to empty string from scoreAnswers (set by caller)", () => {
    const result = scoreAnswers({ items: [mcQuestion] }, { q1: "Paris" });
    expect(result.exerciseId).toBe("");
  });
});
