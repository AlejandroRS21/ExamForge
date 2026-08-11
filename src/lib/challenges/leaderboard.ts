// OpenSloth — Weekly Leaderboard
// CH-01: Weekly rankings based on total correct answers across all attempts that week
// Ties get same rank with skip (1, 2, 2, 4)

import prisma from "@/lib/prisma";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number;
  attemptCount: number;
}

/**
 * Get the start and end of the current week (Monday 00:00 UTC → Sunday 23:59 UTC).
 */
export function getCurrentWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sunday, 1=Monday, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + mondayOffset,
    0, 0, 0,
  ));

  const end = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + mondayOffset + 6,
    23, 59, 59, 999,
  ));

  return { start, end };
}

/**
 * Get the ISO week identifier string (e.g., "2026-W29").
 */
export function getWeekId(): string {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset));

  // Calculate week number
  const temp = new Date(Date.UTC(monday.getUTCFullYear(), 0, 4));
  const weekNum = Math.ceil(((monday.getTime() - temp.getTime()) / 86400000 + temp.getUTCDay() + 1) / 7);

  return `${monday.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Get the weekly leaderboard.
 * Rankings based on total correct answers this week.
 * Ties share the same rank with skip (1, 2, 2, 4).
 */
export async function getLeaderboard(limit = 20): Promise<{
  weekId: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
}> {
  const { start, end } = getCurrentWeekBounds();
  const weekId = getWeekId();

  // Get all completed attempts this week for registered users
  const attempts = await prisma.examAttempt.findMany({
    where: {
      userId: { not: null },
      status: "COMPLETED",
      completedAt: { gte: start, lte: end },
    },
    select: {
      userId: true,
      correctCount: true,
      questionCount: true,
    },
  });

  if (attempts.length === 0) {
    return { weekId, entries: [], totalParticipants: 0 };
  }

  // Aggregate per user
  const userMap = new Map<string, { totalCorrect: number; totalQuestions: number; attemptCount: number }>();

  for (const a of attempts) {
    if (!a.userId) continue;
    const existing = userMap.get(a.userId) ?? {
      totalCorrect: 0,
      totalQuestions: 0,
      attemptCount: 0,
    };
    existing.totalCorrect += a.correctCount;
    existing.totalQuestions += a.questionCount;
    existing.attemptCount++;
    userMap.set(a.userId, existing);
  }

  // Sort by total correct descending
  const sorted = Array.from(userMap.entries())
    .sort(([, a], [, b]) => b.totalCorrect - a.totalCorrect)
    .slice(0, limit);

  // Get user names
  const userIds = sorted.map(([id]) => id);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });
  const userMapDetails = new Map(users.map((u) => [u.id, u]));

  // Build entries with tied ranks
  const entries: LeaderboardEntry[] = [];
  let rank = 0;
  let prevCorrect = -1;
  let skipCount = 0;

  for (const [userId, data] of sorted) {
    const userDetails = userMapDetails.get(userId);
    if (data.totalCorrect !== prevCorrect) {
      rank += skipCount + 1;
      skipCount = 0;
    } else {
      skipCount++;
    }
    prevCorrect = data.totalCorrect;

    entries.push({
      rank,
      userId,
      name: userDetails?.name ?? "Anonymous",
      image: userDetails?.image ?? null,
      totalCorrect: data.totalCorrect,
      totalQuestions: data.totalQuestions,
      accuracy: data.totalQuestions > 0 ? Math.round((data.totalCorrect / data.totalQuestions) * 100) : 0,
      attemptCount: data.attemptCount,
    });
  }

  return {
    weekId,
    entries,
    totalParticipants: userMap.size,
  };
}

/**
 * Get a user's rank for the current week.
 */
export async function getUserRank(userId: string): Promise<{ rank: number; totalParticipants: number } | null> {
  const { start, end } = getCurrentWeekBounds();

  const userTotal = await prisma.examAttempt.aggregate({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: start, lte: end },
    },
    _sum: { correctCount: true },
  });

  const totalCorrect = userTotal._sum.correctCount ?? 0;
  if (totalCorrect === 0) return null;

  // Count users who have more correct answers this week
  const allUsers = await prisma.examAttempt.groupBy({
    by: ["userId"],
    where: {
      userId: { not: null },
      status: "COMPLETED",
      completedAt: { gte: start, lte: end },
    },
    _sum: { correctCount: true },
  });

  const rank =
    allUsers.filter((u) => (u._sum.correctCount ?? 0) > totalCorrect).length + 1;

  return { rank, totalParticipants: allUsers.length };
}
