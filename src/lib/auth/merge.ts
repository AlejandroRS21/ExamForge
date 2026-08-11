// OpenSloth — Anonymous-to-Authenticated Progress Migration
// When a user registers after trying the platform anonymously,
// all their progress (answers, attempts, streaks, achievements, skill profiles)
// is migrated from anonymousSessionId to their new userId.

import prisma from "@/lib/prisma";

/**
 * Merge anonymous session data into a user account.
 *
 * @param anonymousSessionId - The anonymous cookie value
 * @param userId - The authenticated user's ID
 *
 * Transfer order matters to avoid FK conflicts:
 * 1. ExamAttempt (other entities depend on it)
 * 2. Answer, WritingSubmission (depend on attempt)
 * 3. SkillProfile
 * 4. DailyStreak
 * 5. Achievement
 * 6. ChallengeParticipation
 */
export async function mergeAnonymousData(
  anonymousSessionId: string,
  userId: string,
): Promise<{ attemptsMigrated: number; answersMigrated: number }> {
  let attemptsMigrated = 0;
  let answersMigrated = 0;

  await prisma.$transaction(async (tx) => {
    // 1. Migrate ExamAttempt records
    const attempts = await tx.examAttempt.findMany({
      where: { anonymousSessionId },
      select: { id: true },
    });

    if (attempts.length > 0) {
      const attemptIds = attempts.map((a) => a.id);
      attemptsMigrated = attempts.length;

      await tx.examAttempt.updateMany({
        where: { anonymousSessionId },
        data: {
          userId,
          anonymousSessionId: null,
        },
      });

      // 2. Count migrated answers
      answersMigrated = await tx.answer.count({
        where: { attemptId: { in: attemptIds } },
      });
    }

    // 3. Migrate SkillProfile — don't overwrite existing profiles
    const anonProfiles = await tx.skillProfile.findMany({
      where: { userId: anonymousSessionId },
    });

    for (const profile of anonProfiles) {
      const existingProfile = await tx.skillProfile.findUnique({
        where: {
          userId_partId: { userId, partId: profile.partId },
        },
      });

      if (existingProfile) {
        // Merge stats: weighted average
        const totalAttempts =
          existingProfile.attemptsCount + profile.attemptsCount;
        const mergedAccuracy =
          totalAttempts > 0
            ? (existingProfile.accuracy * existingProfile.attemptsCount +
                profile.accuracy * profile.attemptsCount) /
              totalAttempts
            : 0;
        const mergedAvgTime =
          totalAttempts > 0
            ? (existingProfile.avgTimeSeconds * existingProfile.attemptsCount +
                profile.avgTimeSeconds * profile.attemptsCount) /
              totalAttempts
            : 0;

        await tx.skillProfile.update({
          where: { id: existingProfile.id },
          data: {
            attemptsCount: totalAttempts,
            accuracy: mergedAccuracy,
            avgTimeSeconds: mergedAvgTime,
            lastAttemptAt: profile.lastAttemptAt ?? existingProfile.lastAttemptAt,
          },
        });

        // Delete the anonymous profile
        await tx.skillProfile.delete({
          where: { id: profile.id },
        });
      } else {
        // Re-assign to real user
        await tx.skillProfile.update({
          where: { id: profile.id },
          data: { userId },
        });
      }
    }

    // 4. Migrate DailyStreak — keep the longest streak
    const anonStreak = await tx.dailyStreak.findUnique({
      where: { userId: anonymousSessionId },
    });

    if (anonStreak) {
      const userStreak = await tx.dailyStreak.findUnique({
        where: { userId },
      });

      if (userStreak) {
        // Merge: keep longer streak, more recent date
        await tx.dailyStreak.update({
          where: { id: userStreak.id },
          data: {
            currentStreak: Math.max(
              userStreak.currentStreak,
              anonStreak.currentStreak,
            ),
            longestStreak: Math.max(
              userStreak.longestStreak,
              anonStreak.longestStreak,
            ),
            lastActiveDate:
              anonStreak.lastActiveDate > userStreak.lastActiveDate
                ? anonStreak.lastActiveDate
                : userStreak.lastActiveDate,
          },
        });

        await tx.dailyStreak.delete({
          where: { id: anonStreak.id },
        });
      } else {
        await tx.dailyStreak.update({
          where: { id: anonStreak.id },
          data: { userId },
        });
      }
    }

    // 5. Migrate Achievement records
    const anonAchievements = await tx.achievement.findMany({
      where: { userId: anonymousSessionId },
    });

    for (const ach of anonAchievements) {
      const existingAch = await tx.achievement.findUnique({
        where: {
          userId_type: { userId, type: ach.type },
        },
      });

      if (!existingAch) {
        await tx.achievement.update({
          where: { id: ach.id },
          data: { userId },
        });
      } else {
        // Keep the earlier unlock
        if (ach.unlockedAt < existingAch.unlockedAt) {
          await tx.achievement.update({
            where: { id: existingAch.id },
            data: { unlockedAt: ach.unlockedAt },
          });
        }
        await tx.achievement.delete({
          where: { id: ach.id },
        });
      }
    }

    // 6. Migrate ChallengeParticipation
    const anonChallenges = await tx.challengeParticipation.findMany({
      where: { userId: anonymousSessionId },
    });

    for (const entry of anonChallenges) {
      await tx.challengeParticipation.update({
        where: { id: entry.id },
        data: { userId },
      });
    }
  });

  return { attemptsMigrated, answersMigrated };
}
