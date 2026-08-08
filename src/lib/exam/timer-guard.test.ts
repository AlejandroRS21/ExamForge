// ExamForge — Calm Sloth Timer Guard: pure logic tests
// Spec: "Calm timer warning" — when remaining time drops below 5 minutes,
// the guard must trigger (presentational aside is rendered by the client).

import { describe, it, expect } from "vitest";
import { practiceTimeLow, formatRemaining } from "./timer-guard";

describe("practiceTimeLow", () => {
  it("is false at the start of a full-length part", () => {
    expect(practiceTimeLow(0, 15)).toBe(false);
  });

  it("is false while more than 5 minutes remain", () => {
    expect(practiceTimeLow(9 * 60, 15)).toBe(false); // 6 min left
  });

  it("is true once remaining time drops below 5 minutes", () => {
    expect(practiceTimeLow(10 * 60 + 1, 15)).toBe(true); // 4:59 left
  });

  it("boundary: exactly 5 minutes remaining is not low yet (non-alarm)", () => {
    expect(practiceTimeLow(10 * 60, 15)).toBe(false); // exact 300s left
  });

  it("never triggers on an untimed part (timeMinutes 0)", () => {
    expect(practiceTimeLow(60, 0)).toBe(false);
  });
});

describe("formatRemaining", () => {
  it("formats whole remaining minutes", () => {
    expect(formatRemaining(300)).toBe("5 min");
  });

  it("rounds partial minutes up so the note never says 0 min while time remains", () => {
    expect(formatRemaining(299)).toBe("5 min");
    expect(formatRemaining(1)).toBe("1 min");
  });

  it("never produces negative minutes", () => {
    expect(formatRemaining(-10)).toBe("0 min");
  });
});