import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function getLeagueFromXp(xp: number): "Bronze" | "Silver" | "Gold" | "Diamond" {
  if (xp >= 1000) return "Diamond";
  if (xp >= 500) return "Gold";
  if (xp >= 100) return "Silver";
  return "Bronze";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { weeklyXp: "desc" },
    select: { id: true, name: true, weeklyXp: true },
  });

  const currentUser = users.find((u) => u.id === session.user.id);
  const userWeeklyXp = currentUser?.weeklyXp ?? 0;
  const userRankIndex = users.findIndex((u) => u.id === session.user.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 11;

  const rankings = users.map((u, index) => ({
    userId: u.id,
    name: u.name || "Usuario Anónimo",
    weeklyXp: u.weeklyXp,
    rank: index + 1,
  }));

  return NextResponse.json({
    league: getLeagueFromXp(userWeeklyXp),
    userRank,
    weeklyXp: userWeeklyXp,
    rankings,
  });
}
