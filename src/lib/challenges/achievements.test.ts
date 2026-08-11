// OpenSloth — Achievement System Tests
// T-806: Vitest tests for achievement definitions

import { describe, it, expect } from "vitest";
import { BADGE_DEFINITIONS } from "./achievements";

describe("BADGE_DEFINITIONS", () => {
  it("has exactly 6 badges", () => {
    expect(BADGE_DEFINITIONS).toHaveLength(6);
  });

  it("all badges have required fields", () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.type).toBeTruthy();
      expect(badge.label).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
    }
  });

  it("includes all required achievement types", () => {
    const types = BADGE_DEFINITIONS.map((b) => b.type);
    expect(types).toContain("FIRST_STEPS");
    expect(types).toContain("PERFECT_PART");
    expect(types).toContain("THE_80_CLUB");
    expect(types).toContain("DEDICATED");
    expect(types).toContain("STREAK_MASTER");
    expect(types).toContain("SPEED_DEMON");
  });

  it("has unique types", () => {
    const types = BADGE_DEFINITIONS.map((b) => b.type);
    expect(new Set(types).size).toBe(types.length);
  });
});
