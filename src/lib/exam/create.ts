// ExamForge — Practice & Mock Attempt Creation
// EE-01: Two modes — Practice (pausable, no timer, hints) and Mock (timed, strict)
// EE-02: Part-based navigation

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { AttemptType, AttemptStatus } from "@/generated/prisma/client";

export interface CreateAttemptResult {
  attemptId: string;
  type: AttemptType;
  partId: string | null;
  questions: QuestionForDisplay[];
  writingPrompts: WritingPromptForDisplay[];
  timeTracker?: {
    remainingSeconds: number;
    version: number;
  };
}

export interface QuestionForDisplay {
  id: string;
  type: string;
  prompt: any;
  options: any | null;
  difficulty: string;
  partNumber: number;
  questionIndex: number;
}

export interface WritingPromptForDisplay {
  id: string;
  prompt: string;
  wordCountMin: number;
  wordCountMax: number;
}

/**
 * Get the current userId or anonymousSessionId for exam scoping.
 */
async function getSessionOwner(): Promise<{ userId?: string; anonymousSessionId?: string }> {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id };
  }
  // Check for anonymous session cookie — done via the API route layer
  // Server Actions should pass anonymousSessionId explicitly
  return {};
}

/**
 * Create a new PRACTICE attempt for a given part.
 * - No timer
 * - No time limit
 * - Fetches ACTIVE questions for the part
 * - Fetches Writing prompts if part is a Writing part
 */
export async function createPracticeAttempt(partId: string, anonymousSessionId?: string): Promise<CreateAttemptResult> {
  const { userId } = await getSessionOwner();

  // Verify part exists
  const part = await prisma.examPart.findUnique({
    where: { id: partId },
    select: {
      id: true,
      paper: true,
      partNumber: true,
      questionCount: true,
      timeMinutes: true,
    },
  });

  if (!part) {
    throw new Error("ExamPart not found");
  }

  // Check for existing IN_PROGRESS practice attempt for this user/part
  const existingAttempt = await prisma.examAttempt.findFirst({
    where: {
      userId: userId ?? undefined,
      anonymousSessionId: anonymousSessionId ?? undefined,
      partId,
      type: "PRACTICE",
      status: "IN_PROGRESS",
    },
    include: {
      timeTracker: true,
    },
  });

  if (existingAttempt) {
    // Resume existing attempt
    const questions = await fetchQuestionsForPart(partId, part.paper);
    const writingPrompts = part.paper === "Writing" ? await fetchWritingPrompts(partId) : [];

    return {
      attemptId: existingAttempt.id,
      type: "PRACTICE",
      partId,
      questions,
      writingPrompts,
    };
  }

  // Create new attempt
  const questionCount = part.paper === "Writing" ? 0 : part.questionCount;

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: userId ?? undefined,
      anonymousSessionId: anonymousSessionId ?? undefined,
      type: "PRACTICE",
      status: "IN_PROGRESS",
      partId,
      questionCount,
      timeSpentSeconds: 0,
    },
  });

  const questions = await fetchQuestionsForPart(partId, part.paper);
  const writingPrompts = part.paper === "Writing" ? await fetchWritingPrompts(partId) : [];

  return {
    attemptId: attempt.id,
    type: "PRACTICE",
    partId,
    questions,
    writingPrompts,
  };
}

/**
 * Create a new MOCK attempt.
 * - Creates a TimeTracker with the full duration
 * - Fetches all questions for the part (or all parts if no partId given)
 */
export async function createMockAttempt(
  partId?: string,
  anonymousSessionId?: string,
): Promise<CreateAttemptResult> {
  const { userId } = await getSessionOwner();

  const mockAttempt = await prisma.examAttempt.create({
    data: {
      userId: userId ?? undefined,
      anonymousSessionId: anonymousSessionId ?? undefined,
      type: "MOCK",
      status: "IN_PROGRESS",
      partId: partId ?? null,
      questionCount: 0,
      timeSpentSeconds: 0,
    },
  });

  let questions: QuestionForDisplay[] = [];
  let writingPrompts: WritingPromptForDisplay[] = [];
  let totalTimeMinutes = 0;

  if (partId) {
    // Single part mock
    const part = await prisma.examPart.findUnique({
      where: { id: partId },
      select: { paper: true, questionCount: true, timeMinutes: true },
    });

    if (!part) throw new Error("ExamPart not found");

    totalTimeMinutes = part.timeMinutes;
    questions = await fetchQuestionsForPart(partId, part.paper);
    writingPrompts = part.paper === "Writing" ? await fetchWritingPrompts(partId) : [];

    await prisma.examAttempt.update({
      where: { id: mockAttempt.id },
      data: { questionCount: part.paper === "Writing" ? 0 : part.questionCount },
    });
  } else {
    // Full mock — all R&UoE parts (Writing handled separately in Phase 4)
    const parts = await prisma.examPart.findMany({
      where: { paper: "R&UoE" },
      orderBy: { sortOrder: "asc" },
      select: { id: true, timeMinutes: true, questionCount: true },
    });

    totalTimeMinutes = parts.reduce((sum, p) => sum + p.timeMinutes, 0);
    const partIds = parts.map((p) => p.id);
    const totalQuestions = parts.reduce((sum, p) => sum + p.questionCount, 0);

    const allQuestions = await prisma.question.findMany({
      where: {
        examPartId: { in: partIds },
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
      orderBy: [{ examPartId: "asc" }, { createdAt: "asc" }],
    });

    questions = allQuestions.map((q, i) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      difficulty: q.difficulty,
      partNumber: q.examPart.partNumber,
      questionIndex: i,
    }));

    await prisma.examAttempt.update({
      where: { id: mockAttempt.id },
      data: { questionCount: totalQuestions },
    });
  }

  // Create TimeTracker
  const remainingSeconds = totalTimeMinutes * 60;
  const timeTracker = await prisma.timeTracker.create({
    data: {
      attemptId: mockAttempt.id,
      remainingSeconds,
    },
  });

  return {
    attemptId: mockAttempt.id,
    type: "MOCK",
    partId: partId ?? null,
    questions,
    writingPrompts,
    timeTracker: {
      remainingSeconds: timeTracker.remainingSeconds,
      version: timeTracker.version,
    },
  };
}

/**
 * Fetch ACTIVE questions for a given exam part.
 */
async function fetchQuestionsForPart(partId: string, paper: string): Promise<QuestionForDisplay[]> {
  if (paper === "Writing") return [];

  const questions = await prisma.question.findMany({
    where: {
      examPartId: partId,
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

  return questions.map((q, i) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    difficulty: q.difficulty,
    partNumber: q.examPart.partNumber,
    questionIndex: i,
  }));
}

/**
 * Fetch Writing prompts for a Writing part.
 */
async function fetchWritingPrompts(partId: string): Promise<WritingPromptForDisplay[]> {
  const prompts = await prisma.writingPrompt.findMany({
    where: { examPartId: partId },
    select: {
      id: true,
      prompt: true,
      wordCountMin: true,
      wordCountMax: true,
    },
  });

  return prompts;
}

/**
 * Get all exam parts for navigation/listing.
 */
export async function getExamParts() {
  return prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      label: true,
      paper: true,
      partNumber: true,
      description: true,
      timeMinutes: true,
      questionCount: true,
    },
  });
}
