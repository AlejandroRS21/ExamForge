// ExamForge — Question Review Flow
// Approve/reject individual questions, bulk operations, and status management

import prisma from "@/lib/prisma";
import { recordEdit } from "@/lib/admin/history";

/**
 * Approve a single question: DRAFT → ACTIVE
 */
export async function approveQuestion(questionId: string, editorId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, status: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.status !== "DRAFT") {
    throw new Error(`Cannot approve question in ${question.status} status — only DRAFT questions can be approved`);
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { status: "ACTIVE" },
  });

  await recordEdit({
    questionId,
    editorId,
    changes: {
      status: { before: question.status, after: "ACTIVE" },
      reviewedAt: { before: null, after: new Date().toISOString() },
    },
  });

  return updated;
}

/**
 * Reject a single question: DRAFT → REJECTED
 */
export async function rejectQuestion(questionId: string, editorId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, status: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.status !== "DRAFT") {
    throw new Error(`Cannot reject question in ${question.status} status — only DRAFT questions can be rejected`);
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { status: "REJECTED" },
  });

  await recordEdit({
    questionId,
    editorId,
    changes: {
      status: { before: question.status, after: "REJECTED" },
      reviewedAt: { before: null, after: new Date().toISOString() },
    },
  });

  return updated;
}

/**
 * Bulk approve multiple questions at once.
 */
export async function bulkApprove(questionIds: string[], editorId: string) {
  // Verify all questions are in DRAFT status
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, status: true },
  });

  const validIds: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  for (const q of questions) {
    if (q.status === "DRAFT") {
      validIds.push(q.id);
    } else {
      skipped.push({ id: q.id, reason: `Cannot approve ${q.status} question` });
    }
  }

  if (validIds.length === 0) {
    return { updated: 0, skipped };
  }

  await prisma.question.updateMany({
    where: { id: { in: validIds } },
    data: { status: "ACTIVE" },
  });

  // Record edits for each approved question
  for (const qid of validIds) {
    await recordEdit({
      questionId: qid,
      editorId,
      changes: {
        status: { before: "DRAFT", after: "ACTIVE" },
        reviewedAt: { before: null, after: new Date().toISOString() },
        action: { before: null, after: "bulk_approve" },
      },
    });
  }

  return { updated: validIds.length, skipped };
}

/**
 * Bulk reject multiple questions at once.
 */
export async function bulkReject(questionIds: string[], editorId: string) {
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, status: true },
  });

  const validIds: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  for (const q of questions) {
    if (q.status === "DRAFT") {
      validIds.push(q.id);
    } else {
      skipped.push({ id: q.id, reason: `Cannot reject ${q.status} question` });
    }
  }

  if (validIds.length === 0) {
    return { updated: 0, skipped };
  }

  await prisma.question.updateMany({
    where: { id: { in: validIds } },
    data: { status: "REJECTED" },
  });

  for (const qid of validIds) {
    await recordEdit({
      questionId: qid,
      editorId,
      changes: {
        status: { before: "DRAFT", after: "REJECTED" },
        reviewedAt: { before: null, after: new Date().toISOString() },
        action: { before: null, after: "bulk_reject" },
      },
    });
  }

  return { updated: validIds.length, skipped };
}

/**
 * Get review queue — all DRAFT questions ordered by creation date.
 */
export async function getReviewQueue(filters?: {
  examPartId?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const skip = (page - 1) * pageSize;

  const where: any = { status: "DRAFT" };
  if (filters?.examPartId) where.examPartId = filters.examPartId;
  if (filters?.type) where.type = filters.type;

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
      include: {
        examPart: { select: { id: true, label: true, paper: true, partNumber: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
