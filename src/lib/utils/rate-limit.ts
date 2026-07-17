// ExamForge — In-memory rate limiter
// Production: swap for Upstash Redis
// Limits: 5 login attempts per 15 min per IP

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp ms
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Identifier (e.g., IP address)
 * @param limit - Max attempts (default: 5)
 * @param windowMs - Time window in ms (default: 15 min)
 * @returns Whether the request is allowed and remaining count
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a key (e.g., after successful login).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
