// OpenSloth — Practice Finish API
// P-S-1: Practice answers persist server-side on finish.
// P-S-2: Grading runs server-side only — correctAnswer never reaches the client.
// POST /api/exams/practice/finish — upserts remaining answers, then completes
// the attempt via the shared completeAttempt (same code path as mock mode).
// Partial finish (not every question answered) keeps the attempt IN_PROGRESS
// and returns an unscored partial result, so a later finish on the SAME attempt
// succeeds instead of hitting the IN_PROGRESS-only 409 dead-end (R3-001).

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { completeAttempt } from "@/lib/exam/complete";

export async function POST(request: Request) {
  try {
    const session = await auth();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { attemptId, answers } = body ?? {};

    if (!attemptId || typeof attemptId !== "string") {
      return NextResponse.json({ error: "Missing required field: attemptId" }, { status: 400 });
    }

    // Verify attempt exists and is IN_PROGRESS
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        userId: true,
        partId: true,
        questionCount: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is not in progress" }, { status: 409 });
    }

    // Verify the user owns this attempt (mirrors /api/exams/submit)
    const userId = session?.user?.id;
    if (attempt.userId && attempt.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Upsert remaining answers: validate part-membership per question, then
    // persist. Grading happens later in completeAttempt — never here.
    if (answers && typeof answers === "object") {
      for (const [questionId, givenAnswer] of Object.entries(answers as Record<string, unknown>)) {
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          select: { id: true, examPartId: true },
        });

        if (!question) {
          return NextResponse.json({ error: "Question not found" }, { status: 404 });
        }

        if (question.examPartId !== attempt.partId) {
          return NextResponse.json(
            { error: "Question does not belong to this attempt's part" },
            { status: 403 },
          );
        }

        await prisma.answer.upsert({
          where: {
            attemptId_questionId: { attemptId, questionId },
          },
          create: {
            attemptId,
            questionId,
            givenAnswer: givenAnswer as Prisma.InputJsonValue,
          },
          update: {
            givenAnswer: givenAnswer as Prisma.InputJsonValue,
          },
        });
      }
    }

    // Partial finish: count answered vs total questions for the part. If not
    // every question is answered, keep the attempt IN_PROGRESS and return an
    // unscored partial result, so the user can finish again on the SAME
    // attempt after answering the rest. No completeAttempt → attempt never
    // locks to COMPLETED, resume logic (create.ts finds IN_PROGRESS) works.
    const totalCount = attempt.questionCount ?? 0;
    const answeredCount = await prisma.answer.count({ where: { attemptId } });

    if (totalCount > 0 && answeredCount < totalCount) {
      return NextResponse.json({
        attemptId,
        status: "IN_PROGRESS",
        isPartial: true,
        answeredCount,
        totalCount,
        score: null,
      });
    }

    // Server-side grading + completion (shared with mock mode). The response
    // only carries the score summary — no question answers, no correctAnswer.
    const result = await completeAttempt(attemptId, "COMPLETED");

    return NextResponse.json(result);
  } catch (error) {
    console.error("[exams/practice/finish] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
