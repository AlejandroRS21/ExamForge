// OpenSloth — /api/moments/copy Route Tests

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/moments/copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/moments/copy", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    // Default: authenticated session
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue({ user: { id: "user-1" } }),
    }));
  });

  it("returns 204 when MOMENTS_COPY_NOTEBOOK_ID is not set", async () => {
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "");
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "EXAM_COMPLETE" }));
    expect(res.status).toBe(204);
  });

  it("returns 204 on queryNotebook timeout", async () => {
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "nb-test-123");
    vi.doMock("@/lib/notebooklm/mcp-client", () => ({
      MCPClient: class {
        queryNotebook() {
          // Never resolves — simulates timeout
          return new Promise(() => {});
        }
      },
      MCPClientError: class extends Error {},
    }));
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "BADGE_UNLOCKED" }));
    expect(res.status).toBe(204);
  }, 2000);

  it("returns 204 on MCPClientError", async () => {
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "nb-test-123");
    vi.doMock("@/lib/notebooklm/mcp-client", () => {
      class MCPClientError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "MCPClientError";
        }
      }
      return {
        MCPClient: class {
          queryNotebook() {
            return Promise.reject(new MCPClientError("auth expired"));
          }
        },
        MCPClientError,
      };
    });
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "STREAK_RESET" }));
    expect(res.status).toBe(204);
  });

  it("returns 204 for invalid eventType", async () => {
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "nb-test-123");
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "LOGIN" }));
    expect(res.status).toBe(204);
  });

  it("returns copy on successful query", async () => {
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "nb-test-123");
    vi.doMock("@/lib/notebooklm/mcp-client", () => ({
      MCPClient: class {
        queryNotebook() {
          return Promise.resolve("You did it!");
        }
      },
      MCPClientError: class extends Error {},
    }));
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "GOAL_ACHIEVED" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.copy).toBe("You did it!");
  });

  it("returns 204 when unauthenticated", async () => {
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));
    vi.stubEnv("MOMENTS_COPY_NOTEBOOK_ID", "nb-test-123");
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ eventType: "EXAM_COMPLETE" }));
    expect(res.status).toBe(204);
  });
});
