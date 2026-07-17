// ExamForge — Writing Submission Save API
// Saves/updates a writing submission with content and word count
// POST /api/exams/writing/save

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { attemptId, writingPromptId, content } = body;

    if (!attemptId || !writingPromptId || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: attemptId, writingPromptId, content" },
        { status: 400 },
      );
    }

    // Verify attempt
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, status: true, userId: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt is not in progress" }, { status: 409 });
    }

    const userId = session?.user?.id;
    if (attempt.userId && attempt.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Calculate word count
    const wordCount = content.trim()
      ? content.trim().split(/\s+/).length
      : 0;

    // Upsert writing submission
    const submission = await prisma.writingSubmission.upsert({
      where: {
        attemptId_writingPromptId: {
          attemptId,
          writingPromptId,
        },
      },
      create: {
        attemptId,
        writingPromptId,
        content,
        wordCount,
      },
      update: {
        content,
        wordCount,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      wordCount,
    });
  } catch (error) {
    console.error("[exams/writing/save] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
