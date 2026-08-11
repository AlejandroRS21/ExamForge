// OpenSloth — Exam Completion & Auto-Submit
// EE-04: Mock mode SHALL auto-submit when timer reaches 0:00
// SE-05: Partial answers (unfinished exam) SHALL NOT be scored
// CH-02: Achievements SHALL be awarded automatically when criteria are met

import prisma from "@/lib/prisma";
import { scoreAnswer } from "@/lib/scoring/objective";
import { estimateCambridgeScale, evaluateWriting } from "@/lib/scoring";
import { updateStreak } from "@/lib/challenges/streak";
import { evaluateAchievements } from "@/lib/challenges/achievements";
import { evaluateGoals } from "@/lib/challenges/goals";
import type { AttemptStatus } from "@/generated/prisma/client";

export interface NewGoal {
  id: string;
  type: string;
  targetValue: number;
  currentValue: number;
}

export interface CompleteResult {
  attemptId: string;
  status: AttemptStatus;
  isPartial: boolean;
  questionCount: number;
  answerCount: number;
  correctCount: number;
  totalScore: number | null;
  cambridgeScaleScore: number | null;
  newAchievements?: Array<{ type: string; label: string; description: string; icon: string }>;
  newGoals?: NewGoal[];
}

/**
 * Finalize an exam attempt.
 * - Scores objective questions
 * - Evaluates writing submissions
 * - Computes raw score
 * - Sets status to COMPLETED or TIMED_OUT
 * - Returns result summary
 */
export async function completeAttempt(
  attemptId: string,
  status: AttemptStatus = "COMPLETED",
): Promise<CompleteResult> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: {
            select: { id: true, type: true, correctAnswer: true },
          },
        },
      },
      writingSubmissions: {
        include: {
          writingPrompt: {
            select: { id: true, wordCountMin: true, wordCountMax: true },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  // Score each answer
  let correctCount = 0;
  const scoredAnswers: { id: string; isCorrect: boolean }[] = [];

  for (const answer of attempt.answers) {
    const isCorrect = scoreAnswer(
      answer.question.type,
      answer.givenAnswer,
      answer.question.correctAnswer,
    );
    scoredAnswers.push({ id: answer.id, isCorrect });
    if (isCorrect) correctCount++;
  }

  // Bulk update answers with correctness
  const chunkSize = 50;
  for (let i = 0; i < scoredAnswers.length; i += chunkSize) {
    const chunk = scoredAnswers.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((sa) =>
        prisma.answer.update({
          where: { id: sa.id },
          data: { isCorrect: sa.isCorrect },
        }),
      ),
    );
  }

  // Evaluate writing submissions
  for (const submission of attempt.writingSubmissions) {
    const evaluation = evaluateWriting(
      submission.content,
      submission.writingPrompt.wordCountMin,
      submission.writingPrompt.wordCountMax,
    );

    await prisma.writingSubmission.update({
      where: { id: submission.id },
      data: {
        scores: evaluation.scores as any,
        feedback: evaluation.feedback as any,
      },
    });
  }

  // Compute score
  const isPartial = attempt.questionCount > 0 && attempt.answers.length < attempt.questionCount;
  const totalScore = attempt.questionCount > 0 ? (isPartial ? null : (correctCount / attempt.questionCount) * 100) : 0;
  const cambridgeScaleScore = totalScore !== null ? estimateCambridgeScale(totalScore) : null;

  // Compute actual timeSpentSeconds server-side from attempt.startedAt
  const completedAt = new Date();
  const actualTimeSeconds = attempt.startedAt
    ? Math.floor((completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    : 0;

  // Wrap scoring and status update in transaction
  const [updated, ..._hooks] = await prisma.$transaction([
    prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        completedAt,
        correctCount,
        totalScore,
        cambridgeScaleScore,
        timeSpentSeconds: actualTimeSeconds,
      },
    }),
  ]);

  // Post-completion hooks (only for registered users)
  let newAchievements: Array<{ type: string; label: string; description: string; icon: string }> | undefined;
  let newGoals: NewGoal[] | undefined;
  if (attempt.userId) {
    // Update streak
    await updateStreak(attempt.userId);

    // Evaluate achievements
    const unlocked = await evaluateAchievements(attempt.userId, attemptId);
    if (unlocked.length > 0) {
      newAchievements = unlocked;
    }

    // Evaluate personal goals (C2)
    const achievedGoals = await evaluateGoals(attempt.userId, attemptId);
    if (achievedGoals.length > 0) {
      newGoals = achievedGoals.map((g) => ({
        id: g.id,
        type: g.type,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
      }));
    }
  }

  return {
    attemptId: updated.id,
    status: updated.status,
    isPartial,
    questionCount: attempt.questionCount,
    answerCount: attempt.answers.length,
    correctCount,
    totalScore,
    cambridgeScaleScore,
    newAchievements,
    newGoals,
  };
}

/**
 * Delete TimeTracker after completion (cleanup).
 */
export async function deleteTimeTracker(attemptId: string) {
  await prisma.timeTracker.deleteMany({
    where: { attemptId },
  });
}
