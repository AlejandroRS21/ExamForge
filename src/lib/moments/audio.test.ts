// ExamForge — Audio Chime Tests
// Node environment with mocked globals

import { describe, it, expect, vi, beforeEach } from "vitest";

// Setup localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
  configurable: true,
});

describe("playChime", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
    // Reset window to clean state
    (globalThis as any).window = { localStorage: localStorageMock };
  });

  it("is a noop when muted", async () => {
    localStorageMock.setItem("opensloth.moments.muted", "1");
    const AudioContextSpy = vi.fn();
    (globalThis as any).window.AudioContext = AudioContextSpy;

    const { playChime } = await import("./audio");
    playChime("EXAM_COMPLETE");

    expect(AudioContextSpy).not.toHaveBeenCalled();
  });

  it("does not throw when AudioContext is unavailable", async () => {
    (globalThis as any).window.AudioContext = undefined;
    (globalThis as any).window.webkitAudioContext = undefined;
    const { playChime } = await import("./audio");
    expect(() => playChime("BADGE_UNLOCKED")).not.toThrow();
  });
});
