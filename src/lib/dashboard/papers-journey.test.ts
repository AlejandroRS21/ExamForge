// ExamForge — Papers Journey Tests
// Neuroinclusive UI adoption: "Readiness Journey" Dashboard mockup shows a
// horizontal node per real exam paper. This app's data model only has 2 real
// papers ("R&UoE", "Writing" — see prisma/schema.prisma ExamPart.paper), so
// this builder must never fabricate Listening/Speaking nodes.

import { describe, it, expect } from "vitest";
import { buildPapersJourney } from "./papers-journey";
import type { PaperAccuracy } from "./paper-breakdown";

function paper(overrides: Partial<PaperAccuracy>): PaperAccuracy {
  return {
    paper: "R&UoE",
    accuracy: 0,
    attempts: 0,
    isWeak: false,
    ...overrides,
  };
}

describe("buildPapersJourney", () => {
  it("builds a node per paper with real accuracy when both papers have data", () => {
    const breakdown: PaperAccuracy[] = [
      paper({ paper: "R&UoE", accuracy: 78, attempts: 5, isWeak: false }),
      paper({ paper: "Writing", accuracy: 45, attempts: 2, isWeak: true }),
    ];

    const result = buildPapersJourney(breakdown, null);

    expect(result).toEqual([
      { paper: "R&UoE", label: "Reading & Use of English", accuracy: 78, isCurrent: false },
      { paper: "Writing", label: "Writing", accuracy: 45, isCurrent: false },
    ]);
  });

  it("returns null accuracy (em-dash case) for a paper with zero attempts", () => {
    const breakdown: PaperAccuracy[] = [paper({ paper: "Writing", accuracy: 0, attempts: 0, isWeak: false })];

    const result = buildPapersJourney(breakdown, null);

    expect(result).toEqual([
      { paper: "Writing", label: "Writing", accuracy: null, isCurrent: false },
    ]);
  });

  it("marks the node matching currentPaper as isCurrent and leaves the other false", () => {
    const breakdown: PaperAccuracy[] = [
      paper({ paper: "R&UoE", accuracy: 70, attempts: 3 }),
      paper({ paper: "Writing", accuracy: 50, attempts: 1 }),
    ];

    const result = buildPapersJourney(breakdown, "Writing");

    expect(result.find((n) => n.paper === "R&UoE")?.isCurrent).toBe(false);
    expect(result.find((n) => n.paper === "Writing")?.isCurrent).toBe(true);
  });

  it("marks no node as current when currentPaper is null (no resume CTA)", () => {
    const breakdown: PaperAccuracy[] = [
      paper({ paper: "R&UoE", accuracy: 70, attempts: 3 }),
      paper({ paper: "Writing", accuracy: 50, attempts: 1 }),
    ];

    const result = buildPapersJourney(breakdown, null);

    expect(result.every((n) => n.isCurrent === false)).toBe(true);
  });

  it("never fabricates a node for a paper absent from the breakdown", () => {
    const breakdown: PaperAccuracy[] = [paper({ paper: "R&UoE", accuracy: 70, attempts: 3 })];

    const result = buildPapersJourney(breakdown, null);

    expect(result.map((n) => n.paper)).toEqual(["R&UoE"]);
  });
});
