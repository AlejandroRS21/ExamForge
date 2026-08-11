// OpenSloth — (app) route group structural guard (A-SH-1)
// Task 2.1: the four authenticated areas must live inside src/app/(app)/ —
// a route group that keeps their URLs unchanged — while landing (/page.tsx)
// and auth/ stay bare at the root. File-existence checks (no renderer).

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";

const group = (rel: string) => new URL(`./(app)/${rel}`, import.meta.url);
const root = (rel: string) => new URL(`./${rel}`, import.meta.url);

describe("(app) route group (A-SH-1)", () => {
  it("hosts exams, dashboard, learn and admin inside the group", () => {
    expect(existsSync(group("exams/page.tsx"))).toBe(true);
    expect(existsSync(group("dashboard/page.tsx"))).toBe(true);
    expect(existsSync(group("admin/page.tsx"))).toBe(true);
    expect(existsSync(group("learn/audio/[id]/page.tsx"))).toBe(true);
  });

  it("no longer keeps the moved areas at the root", () => {
    expect(existsSync(root("exams/page.tsx"))).toBe(false);
    expect(existsSync(root("dashboard/page.tsx"))).toBe(false);
    expect(existsSync(root("admin/layout.tsx"))).toBe(false);
    expect(existsSync(root("learn/layout.tsx"))).toBe(false);
  });

  it("keeps landing and auth bare at the root", () => {
    expect(existsSync(root("page.tsx"))).toBe(true);
    expect(existsSync(root("auth/login/page.tsx"))).toBe(true);
  });

  it("preserves the moved content (URLs unchanged, files intact)", () => {
    const exams = readFileSync(group("exams/page.tsx"), "utf-8");
    expect(exams).toContain("Centro de Exámenes");
  });

  it("fixes the cross-area writing-feedback import to the group path", () => {
    const panel = readFileSync(
      group("exams/practice/[partId]/writing-practice-panel.tsx"),
      "utf-8"
    );
    expect(panel).toContain(
      "@/app/(app)/exams/results/[attemptId]/writing-feedback"
    );
  });
});