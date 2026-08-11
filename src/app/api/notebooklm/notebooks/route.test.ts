// OpenSloth — NotebookLM notebooks route tests
// GET /api/notebooklm/notebooks → notebook list + auth health status

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { auth } from "@/lib/auth";
import { MCPClient } from "@/lib/notebooklm/mcp-client";

const { listNotebooks, checkAuth } = vi.hoisted(() => ({
  listNotebooks: vi.fn(),
  checkAuth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/notebooklm/mcp-client", () => ({
  MCPClient: vi.fn().mockImplementation(
    function () {
      return {
        listNotebooks,
        checkAuth,
        usingMock: false,
      };
    },
  ),
}));

describe("API /api/notebooklm/notebooks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
    } as any);
    listNotebooks.mockResolvedValue([
      { id: "nb-1", title: "B2 First Prep" },
      { id: "nb-2", title: "Grammar Bank" },
    ]);
    checkAuth.mockResolvedValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 for non-admin roles", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1", role: "USER" } } as any);
    const res = await GET();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("returns notebooks list for admins", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notebooks).toHaveLength(2);
    expect(body.notebooks[0].id).toBe("nb-1");
  });

  it("includes auth health with configured + fallback flags", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.authHealth).toEqual({ configured: true, fallback: false });
  });

  it("reports configured=false when the auth health check throws", async () => {
    checkAuth.mockRejectedValueOnce(new Error("nlm not reachable"));
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.notebooks).toHaveLength(2);
    expect(body.authHealth).toEqual({ configured: false, fallback: false });
  });

  it("returns 500 when listing notebooks fails hard", async () => {
    listNotebooks.mockRejectedValueOnce(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});