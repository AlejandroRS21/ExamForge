const REGEN_INTERVAL_SECONDS = 30 * 60; // 30 minutes

export function calculateHeartRegen(
  lastRegen: Date | null | string,
  maxHearts: number,
  currentHearts: number
): { hearts: number; nextRegenInSeconds: number } {
  if (currentHearts >= maxHearts) {
    return { hearts: currentHearts, nextRegenInSeconds: 0 };
  }

  const now = Date.now();
  const lastRegenTime = lastRegen ? new Date(lastRegen).getTime() : now;
  const elapsedSeconds = Math.max(0, Math.floor((now - lastRegenTime) / 1000));

  const regenedCount = Math.floor(elapsedSeconds / REGEN_INTERVAL_SECONDS);
  const totalHearts = Math.min(maxHearts, currentHearts + regenedCount);

  if (totalHearts >= maxHearts) {
    return { hearts: maxHearts, nextRegenInSeconds: 0 };
  }

  const remainderSeconds = elapsedSeconds % REGEN_INTERVAL_SECONDS;
  const nextRegenInSeconds = REGEN_INTERVAL_SECONDS - remainderSeconds;

  return { hearts: totalHearts, nextRegenInSeconds };
}
