// OpenSloth — NotebookLM sources route tests
// GET /api/notebooklm/sources?notebookId=X → sources + count (notebookId optional)

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { auth } from "@/lib/auth";
import { MCPClient } from "@/lib/notebooklm/mcp-client";

const { listSources } = vi.hoisted(() => ({ listSources: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/notebooklm/mcp-client", () => ({
  MCPClient: vi.fn().mockImplementation(function () {
    return { listSources };
  }),
}));

describe("API /api/notebooklm/sources", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
    } as any);
    listSources.mockResolvedValue([
      { id: "s1", type: "URL", url: "https://example.com/a" },
      { id: "s2", type: "TEXT", title: "Notes" },
    ]);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const req = new NextRequest("http://localhost:3000/api/notebooklm/sources?notebookId=nb-1");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin roles", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1", role: "EDITOR" } } as any);
    const req = new NextRequest("http://localhost:3000/api/notebooklm/sources?notebookId=nb-1");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns sources and count for a selected notebook", async () => {
    const req = new NextRequest("http://localhost:3000/api/notebooklm/sources?notebookId=nb-1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sources).toHaveLength(2);
    expect(body.count).toBe(2);
    expect(listSources).toHaveBeenCalledWith("nb-1");
  });

  it("handles missing notebookId as empty list with count 0 (not an error)", async () => {
    const req = new NextRequest("http://localhost:3000/api/notebooklm/sources");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sources).toEqual([]);
    expect(body.count).toBe(0);
    expect(listSources).not.toHaveBeenCalled();
  });

  it("returns 500 when fetching sources fails hard", async () => {
    listSources.mockRejectedValueOnce(new Error("boom"));
    const req = new NextRequest("http://localhost:3000/api/notebooklm/sources?notebookId=nb-1");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});