// OpenSloth — Haptics Tests
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

describe("vibrate", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  it("calls navigator.vibrate when not muted", async () => {
    const vibrateSpy = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { vibrate: vibrateSpy },
      writable: true,
      configurable: true,
    });
    const { vibrate } = await import("./haptics");
    vibrate();
    expect(vibrateSpy).toHaveBeenCalledWith([30, 20, 30]);
  });

  it("does not vibrate when muted", async () => {
    localStorageMock.setItem("opensloth.moments.muted", "1");
    const vibrateSpy = vi.fn();
    Object.defineProperty(globalThis, "navigator", {
      value: { vibrate: vibrateSpy },
      writable: true,
      configurable: true,
    });
    const { vibrate } = await import("./haptics");
    vibrate();
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it("does not throw when vibrate is unsupported", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });
    const { vibrate } = await import("./haptics");
    expect(() => vibrate()).not.toThrow();
  });
});
