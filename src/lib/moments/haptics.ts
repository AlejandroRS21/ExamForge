// OpenSloth — Moment Engine Haptic Cue
// Feature-detected navigator.vibrate. No deps.

import { isMuted } from "./mute";

export function vibrate(pattern: number[] = [30, 20, 30]): void {
  if (isMuted()) return;
  if (typeof navigator === "undefined") return;
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
