// OpenSloth — Root layout brand + language guard (B-L-1/B-L-2)
// Task 3.1: root <html lang="es">, OpenSloth brand (zero OpenSloth),
// Spanish metadata description and Spanish footer disclaimer.
// File-content checks follow the group.test.ts precedent (no renderer).

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

describe("root layout brand + language (B-L-1/B-L-2)", () => {
  const src = readFileSync(new URL("./layout.tsx", import.meta.url), "utf-8");

  it("declares lang=\"es\" on the root <html>", () => {
    expect(src).toContain('lang="es"');
    expect(src).not.toContain('lang="en"');
  });

  it("uses OpenSloth as the brand (source of truth)", () => {
    expect(src).toContain("OpenSloth");
    expect(src).not.toContain("ExamForge");
  });

  it("uses Spanish metadata description", () => {
    const description = src.match(/description:\s*\n?\s*"([^"]*)"/)?.[1] ?? "";
    expect(description).toMatch(/[áéíóúñ]/i);
    expect(description).not.toMatch(/Practice Cambridge/i);
  });

  it("uses a Spanish footer disclaimer (no English fragments)", () => {
    expect(src).not.toContain("is an independent practice platform");
    expect(src).toContain("no está afiliada a");
  });
});