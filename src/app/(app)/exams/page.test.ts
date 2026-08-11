// OpenSloth — exams page count-copy guard
// E-C-2: the full-mock card must derive its question count from seeded parts
// (56), never a hardcoded literal. File-content check (no renderer installed).

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("exams page count copy (E-C-2)", () => {
  const src = readFileSync(new URL("./page.tsx", import.meta.url), "utf-8");

  it("derives the total question count instead of hardcoding 52", () => {
    expect(src).not.toContain("52 preguntas oficiales");
    expect(src).not.toContain("52 Preguntas Totales");
    expect(src).toContain("totalRuoeQuestions");
  });
});