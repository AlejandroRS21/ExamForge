// ExamForge — Paper-Level Breakdown Tests
// Neuroinclusive UI adoption: Dashboard "Progress by paper" bar chart groups
// the existing per-part breakdown by `paper` (not by individual part).

import { describe, it, expect } from "vitest";
import { aggregateByPaper, PAPER_WEAK_THRESHOLD } from "./paper-breakdown";
import type { PartBreakdown } from "./stats";

function part(overrides: Partial<PartBreakdown>): PartBreakdown {
  return {
    partId: "p1",
    partLabel: "Part 1",
    paper: "R&UoE",
    partNumber: 1,
    accuracy: 0,
    attempts: 0,
    avgTimeSeconds: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    ...overrides,
  };
}

describe("aggregateByPaper", () => {
  it("groups parts by their real `paper` field and averages accuracy across attempted parts", () => {
    const data: PartBreakdown[] = [
      part({ partId: "ruoe-1", paper: "R&UoE", accuracy: 80, attempts: 3 }),
      part({ partId: "ruoe-2", paper: "R&UoE", accuracy: 60, attempts: 2 }),
      part({ partId: "writing-1", paper: "Writing", accuracy: 40, attempts: 1 }),
    ];

    const result = aggregateByPaper(data);

    expect(result).toEqual([
      { paper: "R&UoE", accuracy: 70, attempts: 5, isWeak: false },
      { paper: "Writing", accuracy: 40, attempts: 1, isWeak: true },
    ]);
  });

  it("excludes parts with zero attempts from the average but keeps the paper visible with accuracy 0", () => {
    const data: PartBreakdown[] = [
      part({ partId: "ruoe-1", paper: "R&UoE", accuracy: 0, attempts: 0 }),
      part({ partId: "ruoe-2", paper: "R&UoE", accuracy: 0, attempts: 0 }),
    ];

    const result = aggregateByPaper(data);

    expect(result).toEqual([{ paper: "R&UoE", accuracy: 0, attempts: 0, isWeak: false }]);
  });

  it("never fabricates papers that do not exist in the input (e.g. Listening/Speaking when unseeded)", () => {
    const data: PartBreakdown[] = [part({ paper: "R&UoE" })];

    const result = aggregateByPaper(data);

    expect(result.map((p) => p.paper)).toEqual(["R&UoE"]);
  });

  it("returns an empty array for empty input", () => {
    expect(aggregateByPaper([])).toEqual([]);
  });

  it("marks a paper weak only when its average accuracy is below the documented threshold", () => {
    const atThreshold: PartBreakdown[] = [
      part({ paper: "Writing", accuracy: PAPER_WEAK_THRESHOLD, attempts: 1 }),
    ];
    const belowThreshold: PartBreakdown[] = [
      part({ paper: "Writing", accuracy: PAPER_WEAK_THRESHOLD - 0.1, attempts: 1 }),
    ];

    expect(aggregateByPaper(atThreshold)[0].isWeak).toBe(false);
    expect(aggregateByPaper(belowThreshold)[0].isWeak).toBe(true);
  });
});
