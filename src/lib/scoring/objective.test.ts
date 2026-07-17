// ExamForge — Objective Scoring Tests
// T-806: Vitest smoke tests for critical scoring paths

import { describe, it, expect } from "vitest";
import { scoreAnswer } from "./objective";

describe("scoreAnswer", () => {
  describe("MC (Multiple Choice)", () => {
    it("returns true for exact match", () => {
      expect(scoreAnswer("MC", "threat", "threat")).toBe(true);
    });

    it("returns false for wrong answer", () => {
      expect(scoreAnswer("MC", "danger", "threat")).toBe(false);
    });

    it("is case-insensitive for MC", () => {
      expect(scoreAnswer("MC", "Threat", "threat")).toBe(true);
    });

    it("trims whitespace", () => {
      expect(scoreAnswer("MC", "  threat  ", "threat")).toBe(true);
    });
  });

  describe("CLOZE (Open Cloze)", () => {
    it("returns true for exact match", () => {
      expect(scoreAnswer("CLOZE", "of", "of")).toBe(true);
    });

    it("is case-insensitive for CLOZE", () => {
      expect(scoreAnswer("CLOZE", "Of", "of")).toBe(true);
    });

    it("returns true when answer is in acceptable array", () => {
      expect(scoreAnswer("CLOZE", "at", ["at", "in", "on"])).toBe(true);
    });
  });

  describe("WF (Word Formation)", () => {
    it("returns true for exact match", () => {
      expect(scoreAnswer("WF", "popularity", "popularity")).toBe(true);
    });

    it("is case-insensitive for WF", () => {
      expect(scoreAnswer("WF", "Popularity", "popularity")).toBe(true);
    });
  });

  describe("KT (Key Word Transformation)", () => {
    it("returns true when keyword is present in answer", () => {
      const correctAnswer = { keyword: "apologised", acceptable: ["apologised for"] };
      expect(scoreAnswer("KT", "She apologised for being late", correctAnswer)).toBe(true);
    });

    it("returns false when keyword is missing", () => {
      const correctAnswer = { keyword: "apologised", acceptable: ["apologised for"] };
      expect(scoreAnswer("KT", "She said sorry for being late", correctAnswer)).toBe(false);
    });
  });

  describe("GT (Gapped Text)", () => {
    it("returns true for exact ordered match", () => {
      expect(scoreAnswer("GT", ["A", "B", "C"], ["A", "B", "C"])).toBe(true);
    });

    it("returns false for wrong ordered match", () => {
      expect(scoreAnswer("GT", ["A", "C", "B"], ["A", "B", "C"])).toBe(false);
    });

    it("returns false for different lengths", () => {
      expect(scoreAnswer("GT", ["A", "B"], ["A", "B", "C"])).toBe(false);
    });
  });

  describe("MM (Multiple Matching)", () => {
    it("returns true when all answers match unordered", () => {
      expect(scoreAnswer("MM", ["B", "A"], ["A", "B"])).toBe(true);
    });

    it("returns false when some answers are wrong", () => {
      expect(scoreAnswer("MM", ["B", "C"], ["A", "B"])).toBe(false);
    });

    it("returns false for different lengths", () => {
      expect(scoreAnswer("MM", ["B"], ["A", "B"])).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles null/undefined givenAnswer gracefully", () => {
      expect(scoreAnswer("MC", null, "threat")).toBe(false);
      expect(scoreAnswer("MC", undefined, "threat")).toBe(false);
    });

    it("returns false for unknown question type", () => {
      expect(scoreAnswer("UNKNOWN", "test", "test")).toBe(false);
    });
  });
});
