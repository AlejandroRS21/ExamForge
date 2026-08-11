// OpenSloth — Achievement System
// Auto-unlock 6 badges based on attempt completion criteria.
// T-703: Auto-unlock 6 badges on criteria

import prisma from "@/lib/prisma";
import type { AchievementType } from "@/generated/prisma/client";

export type BadgeDefinition = {
  type: AchievementType;
  label: string;
  description: string;
  icon: string;
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "FIRST_STEPS",
    label: "First Steps",
    description: "Complete your first exam",
    icon: "🎯",
  },
  {
    type: "PERFECT_PART",
    label: "Perfect Part",
    description: "Score 100% on any single part",
    icon: "💯",
  },
  {
    type: "THE_80_CLUB",
    label: "The 80% Club",
    description: "Achieve 80%+ accuracy on a full mock exam",
    icon: "🏆",
  },
  {
    type: "DEDICATED",
    label: "Dedicated",
    description: "Maintain a 7-day streak",
    icon: "🔥",
  },
  {
    type: "STREAK_MASTER",
    label: "Streak Master",
    description: "Maintain a 30-day streak",
    icon: "⚡",
  },
  {
    type: "SPEED_DEMON",
    label: "Speed Demon",
    description: "Complete a mock exam with 10+ minutes remaining",
    icon: "💨",
  },
];

/**
 * Get all unlocked achievements for a user.
 */
export async function getUserAchievements(userId: string) {
  const achievements = await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
  });

  const unlockedSet = new Set(achievements.map((a) => a.type));

  return {
    unlocked: achievements,
    locked: BADGE_DEFINITIONS.filter((b) => !unlockedSet.has(b.type)),
    all: BADGE_DEFINITIONS.map((badge) => ({
      ...badge,
      unlockedAt: achievements.find((a) => a.type === badge.type)?.unlockedAt ?? null,
    })),
  };
}

/**
 * Evaluate and award achievements after an attempt is completed.
 * Returns the newly unlocked achievements (empty array if none).
 */
export async function evaluateAchievements(
  userId: string,
  attemptId: string,
): Promise<BadgeDefinition[]> {
  const newlyUnlocked: BadgeDefinition[] = [];

  // Get current unlocked types
  const existing = await prisma.achievement.findMany({
    where: { userId },
    select: { type: true },
  });
  const existingSet = new Set(existing.map((a) => a.type));

  // Load attempt details
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: {
      type: true,
      correctCount: true,
      questionCount: true,
      totalScore: true,
      timeSpentSeconds: true,
      status: true,
      partId: true,
    },
  });

  if (!attempt || attempt.status !== "COMPLETED") return [];

  // Load streak info
  const streak = await prisma.dailyStreak.findUnique({
    where: { userId },
  });

  // Helper to award a badge if not already unlocked
  const awardIf = async (type: AchievementType, badge: BadgeDefinition) => {
    if (existingSet.has(type)) return;
    await prisma.achievement.create({
      data: { userId, type },
    });
    newlyUnlocked.push(badge);
  };

  // FIRST_STEPS: Complete first exam (any)
  if (!existingSet.has("FIRST_STEPS")) {
    const attemptCount = await prisma.examAttempt.count({
      where: { userId, status: "COMPLETED" },
    });
    if (attemptCount >= 1) {
      await awardIf("FIRST_STEPS", BADGE_DEFINITIONS[0]);
    }
  }

  // PERFECT_PART: 100% on any single part
  if (!existingSet.has("PERFECT_PART")) {
    // Check if this attempt was a part practice with 100%
    if (attempt.partId && attempt.questionCount > 0 && attempt.correctCount === attempt.questionCount) {
      await awardIf("PERFECT_PART", BADGE_DEFINITIONS[1]);
    } else if (!attempt.partId) {
      // Also check per-part accuracy via answers
      const answers = await prisma.answer.findMany({
        where: { attemptId, isCorrect: { not: null } },
        include: {
          question: { select: { examPartId: true } },
        },
      });

      // Group by exam part
      const partCorrect: Record<string, { correct: number; total: number }> = {};
      for (const ans of answers) {
        const pid = ans.question.examPartId;
        if (!partCorrect[pid]) partCorrect[pid] = { correct: 0, total: 0 };
        partCorrect[pid].total++;
        if (ans.isCorrect) partCorrect[pid].correct++;
      }

      for (const pid of Object.keys(partCorrect)) {
        const pc = partCorrect[pid];
        if (pc.total > 0 && pc.correct === pc.total) {
          await awardIf("PERFECT_PART", BADGE_DEFINITIONS[1]);
          break;
        }
      }
    }
  }

  // THE_80_CLUB: 80%+ on a full mock
  if (!existingSet.has("THE_80_CLUB")) {
    if (
      attempt.type === "MOCK" &&
      attempt.totalScore !== null &&
      attempt.totalScore >= 80
    ) {
      await awardIf("THE_80_CLUB", BADGE_DEFINITIONS[2]);
    }
  }

  // DEDICATED: 7-day streak
  if (!existingSet.has("DEDICATED")) {
    if (streak && streak.currentStreak >= 7) {
      await awardIf("DEDICATED", BADGE_DEFINITIONS[3]);
    }
  }

  // STREAK_MASTER: 30-day streak
  if (!existingSet.has("STREAK_MASTER")) {
    if (streak && streak.currentStreak >= 30) {
      await awardIf("STREAK_MASTER", BADGE_DEFINITIONS[4]);
    }
  }

  // SPEED_DEMON: Complete mock with 10+ minutes remaining
  if (!existingSet.has("SPEED_DEMON")) {
    if (attempt.type === "MOCK" && attempt.timeSpentSeconds) {
      const partTime = await prisma.examPart.findFirst({
        where: { id: attempt.partId ?? undefined },
        select: { timeMinutes: true },
      });
      // Full mock time is 75 min for R&UoE + 80 for Writing = 155 min
      const totalTimeMinutes = attempt.partId
        ? (partTime?.timeMinutes ?? 75)
        : 155;
      const remainingMinutes = totalTimeMinutes - Math.floor(attempt.timeSpentSeconds / 60);
      if (remainingMinutes >= 10) {
        await awardIf("SPEED_DEMON", BADGE_DEFINITIONS[5]);
      }
    }
  }

  return newlyUnlocked;
}
