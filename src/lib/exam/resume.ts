// ExamForge — Exam Session Restore
// EE-08: On session restore, in-progress attempt SHALL resume at the last saved state
// EE-06: Network interruption SHALL NOT lose answers beyond the last save

import prisma from "@/lib/prisma";
import type { QuestionForDisplay, WritingPromptForDisplay } from "@/lib/exam/create";

export interface SavedAnswer {
  questionId: string;
  givenAnswer: any;
  isCorrect: boolean | null;
  timeSpentSeconds: number;
}

export interface SessionRestoreData {
  attempt: {
    id: string;
    type: string;
    status: string;
    partId: string | null;
    startedAt: Date;
    timeSpentSeconds: number;
    questionCount: number;
    correctCount: number;
  };
  timeTracker: {
    remainingSeconds: number;
    version: number;
    lastHeartbeatAt: Date;
  } | null;
  answers: SavedAnswer[];
  questions: QuestionForDisplay[];
  writingPrompts: WritingPromptForDisplay[];
  writingSubmission: {
    id: string;
    writingPromptId: string;
    content: string;
    wordCount: number;
  } | null;
}

/**
 * Restore an in-progress exam session on page reload.
 * Fetches attempt, timer state, saved answers, and questions.
 */
export async function restoreSession(attemptId: string): Promise<SessionRestoreData | null> {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      timeTracker: true,
      answers: {
        select: {
          questionId: true,
          givenAnswer: true,
          isCorrect: true,
          timeSpentSeconds: true,
        },
      },
      writingSubmissions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    return null;
  }

  // Fetch questions for the part
  let questions: QuestionForDisplay[] = [];
  let writingPrompts: WritingPromptForDisplay[] = [];

  if (attempt.partId) {
    const part = await prisma.examPart.findUnique({
      where: { id: attempt.partId },
      select: { paper: true },
    });

    if (part) {
      if (part.paper !== "Writing") {
        const qs = await prisma.question.findMany({
          where: {
            examPartId: attempt.partId,
            status: "ACTIVE",
          },
          select: {
            id: true,
            type: true,
            prompt: true,
            options: true,
            difficulty: true,
            examPart: { select: { partNumber: true } },
          },
          orderBy: { createdAt: "asc" },
        });

        questions = qs.map((q, i) => ({
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          difficulty: q.difficulty,
          partNumber: q.examPart.partNumber,
          questionIndex: i,
        }));
      }

      if (part.paper === "Writing") {
        const prompts = await prisma.writingPrompt.findMany({
          where: { examPartId: attempt.partId },
          select: {
            id: true,
            prompt: true,
            wordCountMin: true,
            wordCountMax: true,
          },
        });
        writingPrompts = prompts;
      }
    }
  }

  // Build answers map
  const answers: SavedAnswer[] = attempt.answers.map((a) => ({
    questionId: a.questionId,
    givenAnswer: a.givenAnswer,
    isCorrect: a.isCorrect,
    timeSpentSeconds: a.timeSpentSeconds,
  }));

  return {
    attempt: {
      id: attempt.id,
      type: attempt.type,
      status: attempt.status,
      partId: attempt.partId,
      startedAt: attempt.startedAt,
      timeSpentSeconds: attempt.timeSpentSeconds,
      questionCount: attempt.questionCount,
      correctCount: attempt.correctCount,
    },
    timeTracker: attempt.timeTracker
      ? {
          remainingSeconds: attempt.timeTracker.remainingSeconds,
          version: attempt.timeTracker.version,
          lastHeartbeatAt: attempt.timeTracker.lastHeartbeatAt,
        }
      : null,
    answers,
    questions,
    writingPrompts,
    writingSubmission: attempt.writingSubmissions[0]
      ? {
          id: attempt.writingSubmissions[0].id,
          writingPromptId: attempt.writingSubmissions[0].writingPromptId,
          content: attempt.writingSubmissions[0].content,
          wordCount: attempt.writingSubmissions[0].wordCount,
        }
      : null,
  };
}

/**
 * Get latest answers for a given attempt, grouped by questionId.
 */
export async function getAttemptAnswers(attemptId: string): Promise<Record<string, SavedAnswer>> {
  const answers = await prisma.answer.findMany({
    where: { attemptId },
    select: {
      questionId: true,
      givenAnswer: true,
      isCorrect: true,
      timeSpentSeconds: true,
    },
  });

  const map: Record<string, SavedAnswer> = {};
  for (const a of answers) {
    map[a.questionId] = a;
  }
  return map;
}
