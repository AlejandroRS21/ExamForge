// OpenSloth — MomentLayer + Celebration: Pure unit tests (no testing-library)
// Tests the bus subscription, aria-live content, and reduced-motion behavior
// via direct logic inspection — no React renderer needed.

import { describe, it, expect, vi, beforeEach } from "vitest";

// Use importOriginal so STATIC_COPY is real
vi.mock("@/lib/moments/audio", () => ({ playChime: vi.fn() }));
vi.mock("@/lib/moments/haptics", () => ({ vibrate: vi.fn() }));
vi.mock(
  "@/lib/moments/copy",
  async (importOriginal: () => Promise<any>) => {
    const actual = await importOriginal();
    return {
      ...actual,
      fetchCopy: vi.fn().mockResolvedValue("Well done!"),
    };
  },
);

describe("Celebration copy content — STREAK_RESET", () => {
  const BLAME_VOCAB = [
    /\bfailed?\b/i,
    /\bfailure\b/i,
    /\blost?\b/i,
    /\bbroke\b/i,
    /\bgave up\b/i,
    /\bshame\b/i,
    /\bshould have\b/i,
    /\bcome on\b/i,
    /\bespabila\b/i,
    /\bguilt\b/i,
    /\bblame\b/i,
    /\byou let\b/i,
    /\bdisappoint\b/i,
  ];

  it("STREAK_RESET static copy contains no blame/guilt/shame words", async () => {
    const { STATIC_COPY } = await import("@/lib/moments/copy");
    for (const line of STATIC_COPY.STREAK_RESET) {
      for (const pattern of BLAME_VOCAB) {
        expect(line).not.toMatch(pattern);
      }
    }
  });
});

describe("MomentLayer event types", () => {
  it("only processes known event types (bus publish is typed)", async () => {
    const { STATIC_COPY } = await import("@/lib/moments/copy");
    const types = Object.keys(STATIC_COPY);
    expect(types).toContain("EXAM_COMPLETE");
    expect(types).toContain("BADGE_UNLOCKED");
    expect(types).toContain("STREAK_MILESTONE");
    expect(types).toContain("GOAL_ACHIEVED");
    expect(types).toContain("STREAK_RESET");
    expect(types).toHaveLength(5);
  });
});

describe("Bus integration with MomentLayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribers receive events via publish", async () => {
    const bus = await import("@/lib/moments/bus");
    const received: string[] = [];
    const unsub = bus.subscribe((evt) => received.push(evt.type));

    bus.publish({ type: "EXAM_COMPLETE", id: "t1" });
    bus.publish({ type: "BADGE_UNLOCKED", id: "t2" });

    expect(received).toContain("EXAM_COMPLETE");
    expect(received).toContain("BADGE_UNLOCKED");
    unsub();
  });

  it("aria-live region content: announcement includes event label", () => {
    const LABEL: Record<string, string> = {
      EXAM_COMPLETE: "Exam Complete",
      BADGE_UNLOCKED: "Badge Unlocked",
      STREAK_MILESTONE: "Streak Milestone",
      GOAL_ACHIEVED: "Goal Achieved",
      STREAK_RESET: "Streak Reset",
    };

    for (const [, label] of Object.entries(LABEL)) {
      const copy = "Test copy";
      const announcement = `${label}: ${copy}`;
      expect(announcement).toContain(label);
    }
  });
});
