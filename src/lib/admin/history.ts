// OpenSloth — Question Edit History
// Tracks who changed what on a question and when

import prisma from "@/lib/prisma";

export interface EditRecordInput {
  questionId: string;
  editorId: string;
  changes: Record<string, { before: any; after: any }>;
}

/**
 * Record a question edit in the history log.
 */
export async function recordEdit(input: EditRecordInput) {
  return prisma.questionEdit.create({
    data: {
      questionId: input.questionId,
      editorId: input.editorId,
      changes: input.changes,
    },
  });
}

/**
 * Get edit history for a specific question.
 */
export async function getEditHistory(questionId: string, limit = 50) {
  return prisma.questionEdit.findMany({
    where: { questionId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      editor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get recent edits across all questions (for admin activity feed).
 */
export async function getRecentEdits(limit = 20) {
  return prisma.questionEdit.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      question: {
        select: {
          id: true,
          type: true,
          prompt: true,
        },
      },
      editor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get edit count for a user (for dashboard stats).
 */
export async function getEditorEditCount(userId: string): Promise<number> {
  return prisma.questionEdit.count({
    where: { editorId: userId },
  });
}
