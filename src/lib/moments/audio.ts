// OpenSloth — Moment Engine Audio Chime
// Synthesized tones via Web Audio API. No assets, no deps.

import { isMuted } from "./mute";
import type { MomentEventType } from "./types";

const FREQ: Record<MomentEventType, number> = {
  EXAM_COMPLETE: 880,
  BADGE_UNLOCKED: 988,
  STREAK_MILESTONE: 1046,
  GOAL_ACHIEVED: 784,
  STREAK_RESET: 523,
};

let ctx: AudioContext | null = null;

export function playChime(type: MomentEventType): void {
  if (isMuted()) return;
  if (typeof window === "undefined") return;
  try {
    ctx ??= new (window.AudioContext ?? (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = FREQ[type];
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // AudioContext may be unavailable (e.g. automated tests) — fail silently
  }
}
