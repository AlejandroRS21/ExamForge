// OpenSloth — Moment Engine Bus Tests

import { describe, it, expect, vi, beforeEach } from "vitest";

// Each test gets a fresh module instance to avoid listener bleed-over
// We use vi.resetModules() + dynamic import for isolation.

describe("bus", () => {
  let subscribe: (fn: (e: any) => void) => () => void;
  let publish: (e: any) => void;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./bus");
    subscribe = mod.subscribe;
    publish = mod.publish;
  });

  it("delivers published event to subscriber", () => {
    const spy = vi.fn();
    subscribe(spy);
    const evt = { type: "EXAM_COMPLETE" as const, id: "1" };
    publish(evt);
    expect(spy).toHaveBeenCalledWith(evt);
  });

  it("delivers to multiple subscribers", () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribe(a);
    subscribe(b);
    publish({ type: "BADGE_UNLOCKED", id: "2" });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe stops delivery", () => {
    const spy = vi.fn();
    const unsub = subscribe(spy);
    unsub();
    publish({ type: "GOAL_ACHIEVED", id: "3" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("swallows listener errors without throwing", () => {
    subscribe(() => {
      throw new Error("boom");
    });
    expect(() => publish({ type: "STREAK_RESET", id: "4" })).not.toThrow();
  });
});
