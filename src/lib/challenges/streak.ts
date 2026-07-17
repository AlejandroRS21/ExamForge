// ExamForge — DailyStreak Management
// Updates consecutive day streaks based on UTC dates.
// T-705: DailyStreak update on exam complete

import prisma from "@/lib/prisma";

/**
 * Get the current UTC date as a YYYY-MM-DD string for streak comparison.
 */
export function getTodayUTC(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Get or create the DailyStreak record for a user.
 */
export async function getStreak(userId: string) {
  let streak = await prisma.dailyStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    streak = await prisma.dailyStreak.create({
      data: { userId },
    });
  }

  return streak;
}

/**
 * Update the streak after a completed attempt.
 * Rules:
 * - If today matches lastActiveDate → same day, no increment
 * - If yesterday matches lastActiveDate → increment streak
 * - Otherwise → streak resets to 1
 * - UTC-based date comparison
 */
export async function updateStreak(userId: string) {
  const streak = await getStreak(userId);
  const today = getTodayUTC();

  const lastActiveDate = streak.lastActiveDate;
  const lastDateStr = `${lastActiveDate.getUTCFullYear()}-${String(lastActiveDate.getUTCMonth() + 1).padStart(2, "0")}-${String(lastActiveDate.getUTCDate()).padStart(2, "0")}`;

  // Same day — no change
  if (lastDateStr === today) {
    return streak;
  }

  // Calculate yesterday's date in UTC
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;

  const isConsecutive = lastDateStr === yesterdayStr;
  const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
  const newLongest = Math.max(streak.longestStreak, newStreak);

  return prisma.dailyStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: new Date(),
    },
  });
}

/**
 * Get streak info for dashboard display.
 */
export async function getStreakInfo(userId: string) {
  const streak = await getStreak(userId);
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate,
  };
}
