// OpenSloth — Seed data integrity tests
// E-C-2: seeded R&UoE question counts sum to 56 (8+8+8+6+6+10+10).
// E-C-1: Writing parts + prompts are seeded so the Writing paper renders.

import { describe, it, expect } from "vitest";
import { examParts, writingPrompts } from "./seed-data";

describe("seeded exam parts (E-C-2 counts)", () => {
  it("sums R&UoE question counts to 56", () => {
    const ruoe = examParts.filter((p) => p.paper === "R&UoE");
    const total = ruoe.reduce((sum, p) => sum + p.questionCount, 0);

    expect(ruoe).toHaveLength(7);
    expect(total).toBe(56);
  });

  it("keeps per-part counts 8+8+8+6+6+10+10 in order", () => {
    const counts = examParts
      .filter((p) => p.paper === "R&UoE")
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((p) => p.questionCount);

    expect(counts).toEqual([8, 8, 8, 6, 6, 10, 10]);
  });

  it("includes Writing parts with prompt counts 1 and 3 (E-C-1)", () => {
    const writing = examParts.filter((p) => p.paper === "Writing");

    expect(writing.map((p) => p.id).sort()).toEqual(["writing-part-1", "writing-part-2"]);
    expect(writing.find((p) => p.id === "writing-part-1")?.questionCount).toBe(1);
    expect(writing.find((p) => p.id === "writing-part-2")?.questionCount).toBe(3);
  });
});

describe("seeded writing prompts (E-C-1)", () => {
  it("provides at least one prompt per Writing part and attaches them", () => {
    const partIds = new Set(
      examParts.filter((p) => p.paper === "Writing").map((p) => p.id),
    );

    expect(writingPrompts.length).toBeGreaterThanOrEqual(4);
    for (const prompt of writingPrompts) {
      expect(partIds.has(prompt.examPartId)).toBe(true);
      expect(prompt.wordCountMin).toBeLessThan(prompt.wordCountMax);
      expect(prompt.rubric).toBeTruthy();
    }

    // Every Writing part must render from seeded data
    expect(new Set(writingPrompts.map((p) => p.examPartId))).toEqual(partIds);
  });
});
