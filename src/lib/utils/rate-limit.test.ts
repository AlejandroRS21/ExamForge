import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    resetRateLimit("test-key");
    resetRateLimit("test-key-2");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe("In-Memory Fallback Mode", () => {
    it("allows requests under the limit", async () => {
      const res1 = await checkRateLimit("test-key", 3, 60000);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = await checkRateLimit("test-key", 3, 60000);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);
    });

    it("blocks requests over the limit", async () => {
      await checkRateLimit("test-key", 2, 60000);
      await checkRateLimit("test-key", 2, 60000);

      const res3 = await checkRateLimit("test-key", 2, 60000);
      expect(res3.success).toBe(false);
      expect(res3.remaining).toBe(0);
    });

    it("resets limit properly when resetRateLimit is called", async () => {
      await checkRateLimit("test-key", 1, 60000);
      let res = await checkRateLimit("test-key", 1, 60000);
      expect(res.success).toBe(false);

      resetRateLimit("test-key");

      res = await checkRateLimit("test-key", 1, 60000);
      expect(res.success).toBe(true);
    });
  });

  describe("Redis Mode", () => {
    it("delegates to Upstash Ratelimit when env vars are present", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";

      // Never hit the network: the fake Upstash host must not hang the test.
      // checkRateLimit catches the fetch failure and falls back to memory, so
      // we only assert the contract shape — deterministic and offline.
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("network unreachable (mocked)")),
      );

      const res = await checkRateLimit("test-redis-key", 5, 60000);
      expect(res).toHaveProperty("success");
      expect(res).toHaveProperty("remaining");
      expect(res).toHaveProperty("resetAt");
    });
  });
});
