// OpenSloth — Streak Management Tests
// T-806: Vitest tests for streak logic

import { describe, it, expect } from "vitest";
import { getTodayUTC } from "./streak";

describe("streak utils", () => {
  describe("getTodayUTC", () => {
    it("returns a YYYY-MM-DD string", () => {
      const result = getTodayUTC();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("matches the current UTC date", () => {
      const now = new Date();
      const expected = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
      expect(getTodayUTC()).toBe(expected);
    });
  });
});
