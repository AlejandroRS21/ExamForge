// ExamForge — "Continue where you left off" CTA Tests
// Neuroinclusive UI adoption: pure formatter for the Dashboard resume CTA.
// Kept separate from the Prisma-backed lookup so it is testable without a DB.

import { describe, it, expect } from "vitest";
import { buildResumeCta } from "./resume-cta";

describe("buildResumeCta", () => {
  it("formats the subtitle with part label, description, and next question position", () => {
    const cta = buildResumeCta({
      attemptId: "attempt-1",
      partId: "ruoe-part-3",
      partLabel: "R&UoE Part 3",
      partDescription: "Word formation",
      answeredCount: 3,
      questionCount: 7,
    });

    expect(cta).toEqual({
      title: "Continue where you left off",
      subtitle: "R&UoE Part 3 — Word formation, question 4 of 7",
      resumeHref: "/exams/practice/ruoe-part-3",
      partId: "ruoe-part-3",
    });
  });

  it("omits the description segment when the part has none", () => {
    const cta = buildResumeCta({
      attemptId: "attempt-1",
      partId: "ruoe-part-3",
      partLabel: "R&UoE Part 3",
      partDescription: null,
      answeredCount: 0,
      questionCount: 5,
    });

    expect(cta.subtitle).toBe("R&UoE Part 3, question 1 of 5");
  });

  it("caps the reported question position at the total question count", () => {
    const cta = buildResumeCta({
      attemptId: "attempt-1",
      partId: "ruoe-part-3",
      partLabel: "R&UoE Part 3",
      partDescription: null,
      answeredCount: 9,
      questionCount: 5,
    });

    expect(cta.subtitle).toBe("R&UoE Part 3, question 5 of 5");
  });

  it("omits the question-count fragment for Writing parts (questionCount 0)", () => {
    const cta = buildResumeCta({
      attemptId: "attempt-1",
      partId: "writing-part-1",
      partLabel: "Writing Part 1",
      partDescription: "Essay",
      answeredCount: 0,
      questionCount: 0,
    });

    expect(cta.subtitle).toBe("Writing Part 1 — Essay");
    expect(cta.subtitle).not.toContain("of 0");
  });

  it("exposes partId directly so consumers don't need to parse resumeHref", () => {
    const cta = buildResumeCta({
      attemptId: "attempt-1",
      partId: "ruoe-part-3",
      partLabel: "R&UoE Part 3",
      partDescription: null,
      answeredCount: 0,
      questionCount: 5,
    });

    expect(cta.partId).toBe("ruoe-part-3");
  });
});
