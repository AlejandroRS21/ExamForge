import { describe, it, expect, vi } from "vitest";
import { middleware } from "./middleware";

// Mock auth-core module
vi.mock("@/lib/auth-core", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth-core";

function createMockRequest(urlStr: string): any {
  const url = new URL(urlStr);
  return {
    url: urlStr,
    nextUrl: url,
  };
}

describe("Middleware Role Checking", () => {
  it("redirects unauthenticated users trying to access /admin", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const req = createMockRequest("http://localhost:3000/admin");
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/auth/login");
  });

  it("redirects non-admin users attempting to access /admin", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: "usr_123",
        role: "USER",
      },
      expires: "2099-01-01",
    } as any);

    const req = createMockRequest("http://localhost:3000/admin");
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toContain("/dashboard");
  });

  it("allows ADMIN users to access /admin routes", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: "usr_admin",
        role: "ADMIN",
      },
      expires: "2099-01-01",
    } as any);

    const req = createMockRequest("http://localhost:3000/admin");
    const res = await middleware(req);

    expect(res?.status).not.toBe(307);
  });
});
