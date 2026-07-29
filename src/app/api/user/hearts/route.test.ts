import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("API /api/user/hearts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /api/user/hearts", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const req = new NextRequest("http://localhost:3000/api/user/hearts");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns current heart state for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-123" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-123",
        hearts: 3,
        maxHearts: 5,
        lastHeartRegen: new Date(Date.now() - 600 * 1000), // 10 mins ago
      } as any);

      const req = new NextRequest("http://localhost:3000/api/user/hearts");
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        hearts: 3,
        maxHearts: 5,
        nextRegenInSeconds: 1200,
      });
    });
  });

  describe("POST /api/user/hearts (consume)", () => {
    it("returns 401 when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const req = new NextRequest("http://localhost:3000/api/user/hearts", {
        method: "POST",
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
    });

    it("deducts 1 heart when user has hearts", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-123" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-123",
        hearts: 4,
        maxHearts: 5,
        lastHeartRegen: new Date(),
      } as any);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({
        id: "user-123",
        hearts: 3,
        maxHearts: 5,
        lastHeartRegen: expect.any(Date),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/user/hearts", {
        method: "POST",
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.hearts).toBe(3);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          hearts: 3,
        }),
      });
    });

    it("rejects with 400 when user has 0 hearts", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        user: { id: "user-123" },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "user-123",
        hearts: 0,
        maxHearts: 5,
        lastHeartRegen: new Date(),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/user/hearts", {
        method: "POST",
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("No hearts remaining");
    });
  });
});
