// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMicroFeedback } from "./useMicroFeedback";
import * as soundFx from "@/lib/audio/sound-fx";

vi.mock("@/lib/audio/sound-fx", () => ({
  playCorrect: vi.fn(),
  playIncorrect: vi.fn(),
  playCombo: vi.fn(),
  playHeartLost: vi.fn(),
  isMuted: vi.fn().mockReturnValue(false),
  setMuted: vi.fn(),
}));

describe("useMicroFeedback", () => {
  let vibrateMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vibrateMock = vi.fn();
    vi.stubGlobal("navigator", { vibrate: vibrateMock });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes feedback functions and mute state", () => {
    const { result } = renderHook(() => useMicroFeedback());

    expect(result.current.muted).toBe(false);

    act(() => {
      result.current.triggerCorrect();
    });
    expect(soundFx.playCorrect).toBeCalled();
    expect(vibrateMock).toBeCalledWith([30, 50, 30]);

    act(() => {
      result.current.triggerIncorrect();
    });
    expect(soundFx.playIncorrect).toBeCalled();
    expect(vibrateMock).toBeCalledWith([100, 50, 100]);

    act(() => {
      result.current.triggerCombo(3);
    });
    expect(soundFx.playCombo).toBeCalledWith(3);
    expect(vibrateMock).toBeCalledWith([40, 40, 40]);
  });

  it("toggles mute state via hook", () => {
    const { result } = renderHook(() => useMicroFeedback());

    act(() => {
      result.current.toggleMute();
    });
    expect(soundFx.setMuted).toBeCalledWith(true);
  });
});
