// ExamForge — Answer Submission API
// EE-03: Answers SHALL be persisted on every save action (incremental upsert)
// POST /api/exams/submit — Zod validate → upsert Answer (attemptId+questionId unique)

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { answerSubmitSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const session = await auth();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate with Zod
    const parsed = answerSubmitSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[exams/submit] Validation failed:", JSON.stringify(body), parsed.error.issues);
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { attemptId, questionId, givenAnswer, timeSpentSeconds } = parsed.data;

    // Verify attempt exists and is IN_PROGRESS
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        userId: true,
        anonymousSessionId: true,
        partId: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is not in progress" }, { status: 409 });
    }

    // Verify the user owns this attempt
    const userId = session?.user?.id;
    if (attempt.userId && attempt.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify question exists and belongs to the right part
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, examPartId: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    
    // Verify question belongs to attempt's part
    if (question.examPartId !== attempt.partId) {
      return NextResponse.json({ error: "Question does not belong to this attempt's part" }, { status: 403 });
    }

    // Upsert answer
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        givenAnswer,
        timeSpentSeconds: timeSpentSeconds ?? 0,
      },
      update: {
        givenAnswer,
        timeSpentSeconds: timeSpentSeconds ?? 0,
      },
    });

    // Time spent will be calculated server-side when completeAttempt is called
    // No longer update time here to avoid double counting

    return NextResponse.json({
      success: true,
      answerId: answer.id,
      questionId: answer.questionId,
    });
  } catch (error) {
    console.error("[exams/submit] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
