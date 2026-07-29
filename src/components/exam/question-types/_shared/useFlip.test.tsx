// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFlip } from "./useFlip";

describe("useFlip hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("skips animation when prefers-reduced-motion is true", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useFlip());
    expect(result.current.isReducedMotion()).toBe(true);

    const dummyEl = document.createElement("div");
    const elementsMap = new Map([["key1", dummyEl]]);
    
    // Should not throw or modify transform when reduced motion is true
    result.current.play(elementsMap);
    expect(dummyEl.style.transform).toBe("");
  });

  it("allows registration of DOM elements", () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useFlip());
    const dummyEl = document.createElement("div");
    
    expect(() => result.current.register("key1", dummyEl)).not.toThrow();
  });
});
