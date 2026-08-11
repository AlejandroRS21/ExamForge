// OpenSloth — Copy Utility Tests

import { describe, it, expect, vi, beforeEach } from "vitest";
import { STATIC_COPY, fetchCopy, containsBlameLanguage } from "./copy";

describe("STATIC_COPY", () => {
  it("STREAK_RESET copy contains no blame/guilt/shame words", () => {
    for (const line of STATIC_COPY.STREAK_RESET) {
      expect(containsBlameLanguage(line)).toBe(false);
    }
  });

  it("all event types have at least one copy entry", () => {
    for (const [type, entries] of Object.entries(STATIC_COPY)) {
      expect(entries.length, `${type} has no entries`).toBeGreaterThan(0);
    }
  });
});

describe("containsBlameLanguage", () => {
  it("flags blame/guilt/shame phrasing", () => {
    expect(containsBlameLanguage("You failed to keep your streak")).toBe(true);
    expect(containsBlameLanguage("You should have practiced yesterday")).toBe(true);
    expect(containsBlameLanguage("Espabila and get back to studying")).toBe(true);
  });

  it("does not flag neutral phrasing", () => {
    expect(containsBlameLanguage("Fresh start today.")).toBe(false);
    expect(containsBlameLanguage("New streak begins now.")).toBe(false);
  });
});

describe("fetchCopy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns static fallback on network error", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("network")));
    const result = await fetchCopy("EXAM_COMPLETE");
    expect(STATIC_COPY.EXAM_COMPLETE).toContain(result);
    vi.unstubAllGlobals();
  });

  it("returns static fallback on non-ok response", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({ ok: false, json: async () => ({}) } as Response),
    );
    const result = await fetchCopy("STREAK_RESET");
    expect(STATIC_COPY.STREAK_RESET).toContain(result);
    vi.unstubAllGlobals();
  });

  it("returns copy from successful response", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: true,
        json: async () => ({ copy: "Great job!" }),
      } as Response),
    );
    const result = await fetchCopy("BADGE_UNLOCKED");
    expect(result).toBe("Great job!");
    vi.unstubAllGlobals();
  });

  it("falls back to static on 200 with empty body (no copy field)", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response),
    );
    const result = await fetchCopy("GOAL_ACHIEVED");
    expect(STATIC_COPY.GOAL_ACHIEVED).toContain(result);
    vi.unstubAllGlobals();
  });

  it("falls back to static on real 204 (no body — catch path)", async () => {
    vi.stubGlobal(
      "fetch",
      () =>
        Promise.resolve(
          new Response(null, { status: 204 }),
        ) as unknown as ReturnType<typeof fetch>,
    );
    const result = await fetchCopy("GOAL_ACHIEVED");
    expect(STATIC_COPY.GOAL_ACHIEVED).toContain(result);
    vi.unstubAllGlobals();
  });
});
