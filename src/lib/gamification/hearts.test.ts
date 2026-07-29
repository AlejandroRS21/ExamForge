import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateHeartRegen } from "./hearts";

describe("calculateHeartRegen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current hearts and 0 nextRegenInSeconds when hearts are at or above maxHearts", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const result = calculateHeartRegen(new Date("2026-01-01T10:00:00Z"), 5, 5);
    expect(result).toEqual({ hearts: 5, nextRegenInSeconds: 0 });
  });

  it("calculates partial regen countdown when no new heart has regened yet", () => {
    const lastRegen = new Date("2026-01-01T12:00:00Z");
    // 10 minutes later = 600s elapsed
    const now = new Date("2026-01-01T12:10:00Z");
    vi.setSystemTime(now);

    const result = calculateHeartRegen(lastRegen, 5, 3);
    // 1800 - 600 = 1200 seconds remaining
    expect(result).toEqual({ hearts: 3, nextRegenInSeconds: 1200 });
  });

  it("regens 1 heart after 30 minutes", () => {
    const lastRegen = new Date("2026-01-01T12:00:00Z");
    // 35 minutes later = 2100s elapsed (1 heart regened, 300s into next)
    const now = new Date("2026-01-01T12:35:00Z");
    vi.setSystemTime(now);

    const result = calculateHeartRegen(lastRegen, 5, 2);
    // hearts = 2 + 1 = 3, remaining = 1800 - 300 = 1500
    expect(result).toEqual({ hearts: 3, nextRegenInSeconds: 1500 });
  });

  it("caps hearts at maxHearts and sets nextRegenInSeconds to 0", () => {
    const lastRegen = new Date("2026-01-01T12:00:00Z");
    // 3 hours later (180 minutes = 6 hearts regened)
    const now = new Date("2026-01-01T15:00:00Z");
    vi.setSystemTime(now);

    const result = calculateHeartRegen(lastRegen, 5, 2);
    expect(result).toEqual({ hearts: 5, nextRegenInSeconds: 0 });
  });

  it("handles null lastRegen by defaulting to current time", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const result = calculateHeartRegen(null, 5, 3);
    expect(result).toEqual({ hearts: 3, nextRegenInSeconds: 1800 });
  });
});
