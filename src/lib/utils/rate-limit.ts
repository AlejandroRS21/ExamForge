// ExamForge — Distributed & In-Memory Rate Limiter
// Uses Upstash Redis when UPSTASH_REDIS_REST_URL is configured.
// Fallback: In-memory Map (dev/test/fallback).

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp ms
}

const memoryStore = new Map<string, RateLimitEntry>();

// Periodic cleanup — evict expired entries on each access
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupMemory(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of memoryStore) {
    if (now >= entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

// Lazy initialization of Upstash Redis ratelimiter cache
let ratelimitCache: Map<string, Ratelimit> = new Map();

function getUpstashRatelimit(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${limit}:${windowMs}`;
  if (!ratelimitCache.has(cacheKey)) {
    const redis = new Redis({ url, token });
    const windowSec = Math.ceil(windowMs / 1000);
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      analytics: false,
    });
    ratelimitCache.set(cacheKey, ratelimit);
  }
  return ratelimitCache.get(cacheKey)!;
}

/**
 * Check rate limit for a given key.
 *
 * @param key - Identifier (e.g., IP address)
 * @param limit - Max attempts (default: 5)
 * @param windowMs - Time window in ms (default: 15 min)
 * @returns Whether the request is allowed and remaining count
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000,
): Promise<RateLimitResult> {
  const upstashRatelimit = getUpstashRatelimit(limit, windowMs);
  if (upstashRatelimit) {
    try {
      const res = await upstashRatelimit.limit(key);
      return {
        success: res.success,
        remaining: res.remaining,
        resetAt: res.reset,
      };
    } catch {
      // If network/Redis error occurs, fall back to memory
    }
  }

  cleanupMemory();

  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
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
export async function resetRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000,
): Promise<void> {
  memoryStore.delete(key);
  const upstashRatelimit = getUpstashRatelimit(limit, windowMs);
  if (upstashRatelimit) {
    try {
      // Use the official API so @upstash/ratelimit's prefixed keys are cleared.
      await upstashRatelimit.resetUsedTokens(key);
    } catch {
      // Ignore network errors on reset fallback
    }
  }
}
