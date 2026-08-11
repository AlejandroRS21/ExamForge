// OpenSloth — Brand sweep guard (B-L-1): zero "ExamForge" references.
// Task 3.2/3.4: package.json name = opensloth; scripted ExamForge→OpenSloth
// sweep across src/ + prisma/. File-content checks, no renderer.
//
// Legacy exceptions (lowercase, load-bearing migration identifiers — kept by
// design, asserted explicitly so nobody "cleans" them by accident):
//   - "examforge.moments.muted"  (src/lib/moments/mute.ts + mute.test.ts)
//   - "examforge_anon"           (src/lib/auth/anonymous.ts cookie name)

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

const srcRoot = join(dirname(new URL(import.meta.url).pathname), "..");
const repoRoot = join(srcRoot, "..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const EXEMPT_FILES = new Set([
  join(srcRoot, "lib/moments/mute.ts"),
  join(srcRoot, "lib/moments/mute.test.ts"),
  join(srcRoot, "lib/auth/anonymous.ts"),
  // Guards that document the forbidden/legacy identifiers mention them.
  join(srcRoot, "app/brand-guard.test.ts"),
  join(srcRoot, "app/layout.test.ts"),
]);

describe("brand sweep (B-L-1 zero ExamForge)", () => {
  it("names the package opensloth", () => {
    const pkg = readFileSync(join(repoRoot, "package.json"), "utf-8");
    expect(JSON.parse(pkg).name).toBe("opensloth");
  });

  it("finds no 'ExamForge' anywhere in src/, package.json or prisma/", () => {
    const needles = [
      join(repoRoot, "package.json"),
      join(repoRoot, "prisma/schema.prisma"),
      ...walk(join(repoRoot, "prisma")),
      ...walk(srcRoot),
    ];
    const offenders: string[] = [];
    for (const file of needles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("ExamForge") && !EXEMPT_FILES.has(file)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps only the documented legacy lowercase 'examforge' identifiers", () => {
    const needles = [
      join(repoRoot, "package.json"),
      join(repoRoot, "prisma/schema.prisma"),
      ...walk(join(repoRoot, "prisma")),
      ...walk(srcRoot),
    ];
    const offenders: string[] = [];
    for (const file of needles) {
      const content = readFileSync(file, "utf-8");
      if (/examforge/i.test(content) && !EXEMPT_FILES.has(file)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps the legacy migration identifiers intact", () => {
    const mute = readFileSync(join(srcRoot, "lib/moments/mute.ts"), "utf-8");
    expect(mute).toContain('"examforge.moments.muted"');
    const anon = readFileSync(join(srcRoot, "lib/auth/anonymous.ts"), "utf-8");
    expect(anon).toContain('"examforge_anon"');
  });
});