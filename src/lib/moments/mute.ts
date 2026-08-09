// ExamForge — Moment Engine Mute Persistence
// SSR-safe localStorage wrapper for mute preference.

const KEY = "opensloth.moments.muted";
const LEGACY_KEY = "examforge.moments.muted";

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1" || localStorage.getItem(LEGACY_KEY) === "1";
}

export function setMuted(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(KEY, "1");
  } else {
    localStorage.removeItem(KEY);
  }
}
