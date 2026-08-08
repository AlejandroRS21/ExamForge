// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  playCorrect,
  playIncorrect,
  playCombo,
  playHeartLost,
  isMuted,
  setMuted,
  _resetAudioContext,
} from "./sound-fx";

describe("sound-fx", () => {
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
    setMuted(false);
    _resetAudioContext();

    mockOscillator = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      currentTime: 0,
      state: "running",
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockImplementation(() => mockOscillator),
      createGain: vi.fn().mockImplementation(() => mockGain),
      destination: {},
    };

    function MockAudioContextConstructor(this: any) {
      return mockAudioContext;
    }

    vi.stubGlobal("AudioContext", MockAudioContextConstructor);
    vi.stubGlobal("window", { AudioContext: MockAudioContextConstructor });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("manages muted state", () => {
    expect(isMuted()).toBe(false);
    setMuted(true);
    expect(isMuted()).toBe(true);
    setMuted(false);
    expect(isMuted()).toBe(false);
  });

  it("plays correct sound when not muted", () => {
    playCorrect();
    expect(mockAudioContext.createOscillator).toBeCalled();
    expect(mockOscillator.start).toBeCalled();
  });

  it("plays incorrect sound when not muted", () => {
    playIncorrect();
    expect(mockAudioContext.createOscillator).toBeCalled();
    expect(mockOscillator.start).toBeCalled();
  });

  it("plays combo sound when not muted", () => {
    playCombo(3);
    expect(mockAudioContext.createOscillator).toBeCalled();
    expect(mockOscillator.start).toBeCalled();
  });

  it("plays heart lost sound when not muted", () => {
    playHeartLost();
    expect(mockAudioContext.createOscillator).toBeCalled();
    expect(mockOscillator.start).toBeCalled();
  });

  it("does not play sounds when muted", () => {
    setMuted(true);
    playCorrect();
    playIncorrect();
    playCombo(5);
    playHeartLost();
    expect(mockAudioContext.createOscillator).not.toBeCalled();
  });

  it("does not throw when AudioContext is unavailable", () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("window", {});
    expect(() => playCorrect()).not.toThrow();
    expect(() => playIncorrect()).not.toThrow();
    expect(() => playCombo(2)).not.toThrow();
    expect(() => playHeartLost()).not.toThrow();
  });
});
