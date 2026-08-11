// OpenSloth — Platform-structure dedupe guard (P-T-1/2/3 + A-SH-1).
// Task 4.6 + PR#4 structure: proves exactly ONE AudioPlayer, ONE admin
// question-generate flow, ONE checkIsCorrect, no orphaned MockExamClient
// props, no hardcoded primary/background hexes outside the token files, no
// stale ruoe-part-* literal CTA links, dashboard count derived from seed
// (E-C-2), and the /learn area shows no duplicated global-chrome links
// (A-SH-1). File-content checks only, no renderer — mirrors brand-guard.ts.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

const srcRoot = join(dirname(new URL(import.meta.url).pathname), "..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

// Test files must be skipped: this guard's needles are the forbidden strings.
const nonTestFiles = walk(srcRoot).filter((f) => !/\.(test|spec)\.(ts|tsx)$/.test(f));

// ─── P-T-1: single shared implementations ────────────────────────────────────

describe("P-T-1 dedupe — one AudioPlayer, one generate flow, one checkIsCorrect", () => {
  it("has exactly one AudioPlayer.tsx, at components/exercises/ (learn/ stub deleted)", () => {
    const players = nonTestFiles.filter((f) => /AudioPlayer\.tsx$/.test(f));
    expect(players).toHaveLength(1);
    expect(players[0]).toContain("components/exercises/AudioPlayer.tsx");
    expect(readFileSync(join(srcRoot, "components/exercises/AudioPlayer.tsx"), "utf8")).toContain(
      "export function AudioPlayer",
    );
  });

  it("has exactly one admin question-generate flow: generate-b2 (generic deleted)", () => {
    const flowLibs = nonTestFiles.filter((f) => /lib\/admin\/generate(-b2-questions)?\.ts$/.test(f));
    const flowRoutes = nonTestFiles.filter(
      (f) => /api\/admin\/(questions\/generate-b2|generate)\/route\.ts$/.test(f),
    );
    // Generic flow fully gone.
    expect(flowLibs).toHaveLength(1);
    expect(flowLibs[0]).toContain("generate-b2-questions.ts");
    expect(flowRoutes).toHaveLength(1);
    expect(flowRoutes[0]).toContain("questions/generate-b2/route.ts");
    expect(
      nonTestFiles.some((f) => f.includes("admin/questions/generate/generate-form.tsx")),
    ).toBe(false);
    expect(
      nonTestFiles.some((f) => f.includes("admin/questions/generate/page.tsx")),
    ).toBe(false);
    // Surviving surfaces point at the B2 flow only.
    const surfaces = nonTestFiles.filter((f) =>
      /(admin\/layout|admin\/page|admin\/questions\/page|admin\/questions\/questions-table)\.tsx$/.test(f),
    );
    for (const file of surfaces) {
      const content = readFileSync(file, "utf8");
      expect(content).toContain("/admin/questions/generate-b2");
      expect(content).not.toMatch(/\/admin\/questions\/generate["']/);
    }
  });

  it("has exactly one checkIsCorrect definition, in lib/scoring/objective.ts", () => {
    const defs = nonTestFiles.filter((f) => {
      const content = readFileSync(f, "utf8");
      return /function checkIsCorrect|const checkIsCorrect|export.*checkIsCorrect/.test(content);
    });
    expect(defs).toHaveLength(1);
    expect(defs[0]).toContain("lib/scoring/objective.ts");
  });

  it("MockExamClient has no orphaned allParts / currentPartId props (P-T-1)", () => {
    const client = readFileSync(
      join(srcRoot, "app/(app)/exams/mock/[attemptId]/mock-client.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(srcRoot, "app/(app)/exams/mock/[attemptId]/page.tsx"),
      "utf8",
    );
    expect(client).not.toContain("allParts");
    expect(client).not.toContain("currentPartId");
    expect(page).not.toContain("allParts=");
    expect(page).not.toContain("currentPartId=");
  });
});

// ─── P-T-2: token-driven design — no primary/background hexes outside tokens ──

describe("P-T-2 tokens — no hardcoded primary/background hexes outside token files", () => {
  it("keeps #FF6B35 / #FAF6F0 only inside globals.css / design-tokens.ts comments", () => {
    const offenders: string[] = [];
    for (const file of nonTestFiles) {
      const content = readFileSync(file, "utf8");
      if (content.includes("#FF6B35") || content.includes("#FAF6F0")) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

// ─── P-T-3 + E-C-2: part ids resolved from DB, counts derived from seed ──────

describe("P-T-3 / E-C-2 — derived part ids and counts, no stale literals", () => {
  it("dashboard derives the R&UoE count from seeded parts (no '52 Preguntas')", () => {
    const dash = readFileSync(join(srcRoot, "app/(app)/dashboard/page.tsx"), "utf8");
    expect(dash).not.toContain("52 Preguntas");
    expect(dash).toContain("paper: \"R&UoE\"");
    expect(dash).toMatch(/reduce\(/);
    expect(dash).toContain("questionCount");
  });

  it("dashboard CTA fallback resolves the first R&UoE part from DB (no ruoe-part-* literal)", () => {
    const dash = readFileSync(join(srcRoot, "app/(app)/dashboard/page.tsx"), "utf8");
    expect(dash).not.toContain("practice/ruoe-part");
    expect(dash).toMatch(/orderBy:\s*\{\s*sortOrder:\s*\"asc\"\s*\}/);
  });

  it("landing CTA resolves the first R&UoE part from DB (no ruoe-part-* literal)", () => {
    const landing = readFileSync(join(srcRoot, "app/page.tsx"), "utf8");
    expect(landing).not.toContain("practice/ruoe-part");
    expect(landing).toMatch(/orderBy:\s*\{\s*sortOrder:\s*\"asc\"\s*\}/);
  });
});

// ─── A-SH-1: no duplicated per-area chrome in /learn ─────────────────────────

describe("A-SH-1 — /learn shows no duplicated global-chrome links", () => {
  it("LearnHeader is slim: no nav links or brand link, keeps only MuteToggle", () => {
    const header = readFileSync(join(srcRoot, "components/learn/LearnHeader.tsx"), "utf8");
    expect(header).not.toMatch(/<nav/);
    expect(header).not.toMatch(/href=\"/);
    expect(header).toContain("MuteToggle");
  });

  it("learn layout still renders the slim header so MuteToggle stays reachable", () => {
    const layout = readFileSync(join(srcRoot, "app/(app)/learn/layout.tsx"), "utf8");
    expect(layout).toContain("LearnHeader");
  });
});