// OpenSloth — Mute Utility Tests
// Node environment: mock localStorage manually

import { describe, it, expect, beforeEach } from "vitest";

// Minimal localStorage mock for Node
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  writable: true,
});

describe("mute", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("is not muted by default", async () => {
    const { isMuted } = await import("./mute");
    expect(isMuted()).toBe(false);
  });

  it("persists muted state", async () => {
    const { isMuted, setMuted } = await import("./mute");
    setMuted(true);
    expect(isMuted()).toBe(true);
  });

  it("persists unmuted state", async () => {
    const { isMuted, setMuted } = await import("./mute");
    setMuted(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
  });

  it("removing mute key clears it", async () => {
    const { setMuted } = await import("./mute");
    localStorageMock.setItem("opensloth.moments.muted", "1");
    setMuted(false);
    expect(localStorageMock.getItem("opensloth.moments.muted")).toBeNull();
  });
  it("reads legacy key if new key not set", async () => {
    const { isMuted } = await import("./mute");
    localStorageMock.setItem("examforge.moments.muted", "1");
    expect(isMuted()).toBe(true);
  });

  it("unmute clears the legacy key so a pre-rebrand muted user can unmute", async () => {
    const { isMuted, setMuted } = await import("./mute");
    localStorageMock.setItem("examforge.moments.muted", "1");
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
    expect(localStorageMock.getItem("examforge.moments.muted")).toBeNull();
  });

  it("muting migrates and drops the legacy key", async () => {
    const { setMuted } = await import("./mute");
    localStorageMock.setItem("examforge.moments.muted", "1");
    setMuted(true);
    expect(localStorageMock.getItem("opensloth.moments.muted")).toBe("1");
    expect(localStorageMock.getItem("examforge.moments.muted")).toBeNull();
  });
});
