import { describe, expect, it, vi } from "vitest";
import { GET, getLeagueFromXp } from "./route";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

describe("Weekly Leaderboard API", () => {
  it("calculates league tiers correctly from XP", () => {
    expect(getLeagueFromXp(50)).toBe("Bronze");
    expect(getLeagueFromXp(150)).toBe("Silver");
    expect(getLeagueFromXp(600)).toBe("Gold");
    expect(getLeagueFromXp(1200)).toBe("Diamond");
  });

  it("returns 401 when unauthorized", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns sorted rankings and user league", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "u2", role: "USER" },
    } as any);

    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: "u1", name: "Alice", weeklyXp: 1200 },
      { id: "u2", name: "Bob", weeklyXp: 600 },
    ] as any);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.league).toBe("Gold");
    expect(data.userRank).toBe(2);
    expect(data.weeklyXp).toBe(600);
    expect(data.rankings).toHaveLength(2);
    expect(data.rankings[0].name).toBe("Alice");
  });
});
