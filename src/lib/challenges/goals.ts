// OpenSloth — Personal Goals System
// C2 (CH-04/CH-05): Users set goals, evaluated on attempt completion
// Goal types: ACCURACY (target %), STREAK (target consecutive days)

import prisma from "@/lib/prisma";
import type { GoalType } from "@/generated/prisma/client";

export type GoalData = {
  id: string;
  userId: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date | null;
  achieved: boolean;
  achievedAt: Date | null;
};

export type GoalInput = {
  type: GoalType;
  targetValue: number;
  endDate?: string;
};

/**
 * Get all goals for a user.
 */
export async function getAllUserGoals(userId: string): Promise<GoalData[]> {
  return prisma.goal.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

/**
 * Set a new goal for the user.
 * Replaces any existing goal of the same type.
 */
export async function setGoal(
  userId: string,
  input: GoalInput,
): Promise<GoalData> {
  // Delete existing goal of same type
  await prisma.goal.deleteMany({
    where: { userId, type: input.type },
  });

  const goal = await prisma.goal.create({
    data: {
      userId,
      type: input.type,
      targetValue: input.targetValue,
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });

  return goal;
}

/**
 * Delete a goal.
 */
export async function deleteGoal(goalId: string): Promise<void> {
  await prisma.goal.delete({ where: { id: goalId } });
}

/**
 * Evaluate the user's active goal(s) after an attempt is completed.
 * Returns any newly achieved goals.
 */
export async function evaluateGoals(
  userId: string,
  attemptId: string,
): Promise<GoalData[]> {
  const newlyAchieved: GoalData[] = [];

  const goals = await prisma.goal.findMany({
    where: { userId, achieved: false },
  });

  if (goals.length === 0) return [];

  for (const goal of goals) {
    let shouldAchieve = false;
    let currentValue = goal.currentValue;

    switch (goal.type) {
      case "ACCURACY": {
        // Check the user's overall average accuracy across all completed attempts
        const attempts = await prisma.examAttempt.findMany({
          where: {
            userId,
            status: "COMPLETED",
            totalScore: { not: null },
          },
          select: { totalScore: true },
        });

        if (attempts.length > 0) {
          const avgAccuracy =
            attempts.reduce((sum, a) => sum + (a.totalScore ?? 0), 0) /
            attempts.length;
          currentValue = Math.round(avgAccuracy);
          if (avgAccuracy >= goal.targetValue) {
            shouldAchieve = true;
          }
        }
        break;
      }

      case "STREAK": {
        const streak = await prisma.dailyStreak.findUnique({
          where: { userId },
        });
        if (streak) {
          currentValue = streak.currentStreak;
          if (streak.currentStreak >= goal.targetValue) {
            shouldAchieve = true;
          }
        }
        break;
      }
    }

    if (shouldAchieve) {
      const updated = await prisma.goal.update({
        where: { id: goal.id },
        data: { achieved: true, achievedAt: new Date(), currentValue },
      });
      newlyAchieved.push(updated);
    } else if (currentValue !== goal.currentValue) {
      // Update current value for progress tracking even if not achieved yet
      await prisma.goal.update({
        where: { id: goal.id },
        data: { currentValue },
      });
    }
  }

  return newlyAchieved;
}
