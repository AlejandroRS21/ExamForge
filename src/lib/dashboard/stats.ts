// ExamForge — Dashboard Statistics
// Fetches and computes dashboard data for the authenticated user.
// T-701: Dashboard — accuracy%, total attempts, streak count, avg time per question
// T-702: Analytics — accuracy over time, per-part breakdown, weak-area highlight

import prisma from "@/lib/prisma";
import { getStreakInfo } from "@/lib/challenges/streak";
import { getUserAchievements } from "@/lib/challenges/achievements";

export interface DashboardStats {
  totalAttempts: number;
  completedAttempts: number;
  overallAccuracy: number | null;
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  avgTimePerQuestion: number | null;
  totalCorrect: number;
  totalQuestions: number;
  recentAttempts: RecentAttempt[];
  accuracyHistory: AccuracyPoint[];
  partBreakdown: PartBreakdown[];
  weakAreas: PartBreakdown[];
}

export interface RecentAttempt {
  id: string;
  type: string;
  status: string;
  totalScore: number | null;
  correctCount: number;
  questionCount: number;
  completedAt: Date | null;
  partLabel: string | null;
}

export interface AccuracyPoint {
  date: string;
  accuracy: number;
  attemptId: string;
}

export interface PartBreakdown {
  partId: string;
  partLabel: string;
  paper: string;
  partNumber: number;
  accuracy: number;
  attempts: number;
  avgTimeSeconds: number;
  totalCorrect: number;
  totalQuestions: number;
}

/**
 * Get all dashboard stats for a user in a single query batch.
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [
    completedAttempts,
    allAttempts,
    streakInfo,
    recentAttempts,
    accuracyHistory,
    skillProfiles,
    partData,
  ] = await Promise.all([
    // Count completed attempts
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      select: {
        id: true,
        correctCount: true,
        questionCount: true,
        totalScore: true,
        timeSpentSeconds: true,
      },
    }),

    // All attempts (for totals)
    prisma.examAttempt.findMany({
      where: { userId },
      select: { id: true },
    }),

    // Streak
    getStreakInfo(userId),

    // Recent 5 completed attempts
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        type: true,
        status: true,
        totalScore: true,
        correctCount: true,
        questionCount: true,
        completedAt: true,
        examPart: { select: { label: true } },
      },
    }),

    // Accuracy history (last 30 completed attempts)
    prisma.examAttempt.findMany({
      where: { userId, status: "COMPLETED", totalScore: { not: null } },
      orderBy: { completedAt: "asc" },
      take: 30,
      select: {
        id: true,
        totalScore: true,
        completedAt: true,
      },
    }),

    // Skill profiles
    prisma.skillProfile.findMany({
      where: { userId },
      include: {
        examPart: { select: { id: true, label: true, paper: true, partNumber: true } },
      },
    }),

    // All exam parts (for complete breakdown)
    prisma.examPart.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, label: true, paper: true, partNumber: true },
    }),
  ]);

  // Compute aggregate stats
  const totalCorrect = completedAttempts.reduce((sum, a) => sum + a.correctCount, 0);
  const totalQuestions = completedAttempts.reduce((sum, a) => sum + a.questionCount, 0);
  const totalTime = completedAttempts.reduce((sum, a) => sum + (a.timeSpentSeconds ?? 0), 0);
  const totalScoreSum = completedAttempts.reduce((sum, a) => sum + (a.totalScore ?? 0), 0);

  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : null;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : null;

  // Build accuracy history points
  const accuracyHistoryPoints: AccuracyPoint[] = accuracyHistory
    .filter((a): a is typeof a & { totalScore: number; completedAt: Date } => a.totalScore !== null && a.completedAt !== null)
    .map((a) => ({
      date: a.completedAt.toISOString().split("T")[0],
      accuracy: a.totalScore!,
      attemptId: a.id,
    }));

  // Build per-part breakdown from skill profiles
  const partBreakdown: PartBreakdown[] = partData.map((part) => {
    const profile = skillProfiles.find((sp) => sp.partId === part.id);
    return {
      partId: part.id,
      partLabel: part.label,
      paper: part.paper,
      partNumber: part.partNumber,
      accuracy: profile ? profile.accuracy : 0,
      attempts: profile?.attemptsCount ?? 0,
      avgTimeSeconds: profile ? Math.round(profile.avgTimeSeconds) : 0,
      totalCorrect: 0,
      totalQuestions: 0,
    };
  });

  // Identify weak areas (accuracy < 60% with at least 1 attempt)
  const weakAreas = partBreakdown
    .filter((p) => p.attempts > 0 && p.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    totalAttempts: allAttempts.length,
    completedAttempts: completedAttempts.length,
    overallAccuracy: overallAccuracy !== null ? Math.round(overallAccuracy * 10) / 10 : null,
    streak: {
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
    },
    avgTimePerQuestion,
    totalCorrect,
    totalQuestions,
    recentAttempts: recentAttempts.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      totalScore: a.totalScore,
      correctCount: a.correctCount,
      questionCount: a.questionCount,
      completedAt: a.completedAt,
      partLabel: a.examPart?.label ?? null,
    })),
    accuracyHistory: accuracyHistoryPoints,
    partBreakdown,
    weakAreas,
  };
}
