// OpenSloth — Exam Part Configuration Management
// T-803: Admin parts — manage B2 First exam structure

import prisma from "@/lib/prisma";

export interface ExamPartData {
  id: string;
  label: string;
  paper: string;
  partNumber: number;
  description: string | null;
  timeMinutes: number;
  questionCount: number;
  sortOrder: number;
}

export interface PartUpdateInput {
  label?: string;
  description?: string | null;
  timeMinutes?: number;
  questionCount?: number;
}

/**
 * List all exam parts ordered by sort order.
 */
export async function listParts(): Promise<ExamPartData[]> {
  return prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get a single exam part by ID.
 */
export async function getPartById(id: string): Promise<ExamPartData | null> {
  return prisma.examPart.findUnique({
    where: { id },
  });
}

/**
 * Update an exam part's configuration.
 */
export async function updatePart(
  id: string,
  data: PartUpdateInput,
): Promise<ExamPartData> {
  return prisma.examPart.update({
    where: { id },
    data,
  });
}

/**
 * Get part statistics (question count, average difficulty, etc.).
 */
export async function getPartStats(partId: string) {
  const [questionCount, byDifficulty, byStatus, activeQuestions] = await Promise.all([
    prisma.question.count({ where: { examPartId: partId } }),
    Promise.all([
      prisma.question.count({ where: { examPartId: partId, difficulty: "A" } }),
      prisma.question.count({ where: { examPartId: partId, difficulty: "B" } }),
      prisma.question.count({ where: { examPartId: partId, difficulty: "C" } }),
    ]),
    Promise.all([
      prisma.question.count({ where: { examPartId: partId, status: "DRAFT" } }),
      prisma.question.count({ where: { examPartId: partId, status: "ACTIVE" } }),
      prisma.question.count({ where: { examPartId: partId, status: "REJECTED" } }),
    ]),
    prisma.question.findMany({
      where: { examPartId: partId, status: "ACTIVE" },
      select: { id: true },
    }),
  ]);

  return {
    totalQuestions: questionCount,
    byDifficulty: {
      A: byDifficulty[0],
      B: byDifficulty[1],
      C: byDifficulty[2],
    },
    byStatus: {
      DRAFT: byStatus[0],
      ACTIVE: byStatus[1],
      REJECTED: byStatus[2],
    },
    activeQuestionIds: activeQuestions.map((q) => q.id),
  };
}
