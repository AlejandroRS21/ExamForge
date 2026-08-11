// OpenSloth — NotebookLM pending review queue route tests
// GET /api/notebooklm/pending → completed drafts awaiting admin approval

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { auth } from "@/lib/auth";
import { listPendingContent } from "@/lib/notebooklm/generate";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/notebooklm/generate", () => ({
  listPendingContent: vi.fn(),
}));

describe("API /api/notebooklm/pending", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "ADMIN" },
    } as any);
    vi.mocked(listPendingContent).mockResolvedValue([
      {
        id: "g1",
        contentType: "QUIZ",
        status: "COMPLETED",
        createdAt: new Date("2026-08-01T10:00:00Z"),
        createdBy: { id: "u1", name: "Admin", email: "admin@opensloth.dev" },
      },
    ] as any);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin roles", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } } as any);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns completed drafts awaiting review for admins", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("g1");
    expect(body[0].contentType).toBe("QUIZ");
    expect(listPendingContent).toHaveBeenCalled();
  });

  it("returns 500 when the queue query fails hard", async () => {
    vi.mocked(listPendingContent).mockRejectedValueOnce(new Error("db down"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});