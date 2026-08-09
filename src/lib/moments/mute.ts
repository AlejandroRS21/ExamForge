// OpenSloth — Moment Engine Mute Persistence
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
    // Migrate: drop the legacy key so both paths agree going forward.
    localStorage.removeItem(LEGACY_KEY);
  } else {
    localStorage.removeItem(KEY);
    // A pre-rebrand muted user must be able to unmute: clear the legacy key too.
    localStorage.removeItem(LEGACY_KEY);
  }
}
