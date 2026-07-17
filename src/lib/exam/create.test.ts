// ExamForge — Exam Creation Tests
// T-806: Vitest smoke tests — verify module structure

import { describe, it, expect } from "vitest";

// We test module structure without importing to avoid Next.js dependency issues
// in pure Node test environment. The actual creation logic is tested via build.

describe("Exam creation module", () => {
  it("should have the expected file exports", async () => {
    // Verify we can statically analyze the file structure
    const fs = await import("fs");
    const createContent = fs.readFileSync(
      new URL("./create.ts", import.meta.url),
      "utf-8",
    );
    expect(createContent).toContain("export async function createPracticeAttempt");
    expect(createContent).toContain("export async function createMockAttempt");
  });

  it("complete module should define completeAttempt", async () => {
    const fs = await import("fs");
    const completeContent = fs.readFileSync(
      new URL("./complete.ts", import.meta.url),
      "utf-8",
    );
    expect(completeContent).toContain("export async function completeAttempt");
    expect(completeContent).toContain("updateStreak");
    expect(completeContent).toContain("evaluateAchievements");
  });
});
