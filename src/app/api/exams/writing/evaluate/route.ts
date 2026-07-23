// ExamForge — Writing Evaluation API
// Evaluates a writing submission against Cambridge B2 First rubric using Claude AI
// POST /api/exams/writing/evaluate

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evaluateWritingWithClaude } from "@/lib/scoring/writing";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { attemptId, writingPromptId } = body;

    if (!attemptId || !writingPromptId) {
      return NextResponse.json(
        { error: "Missing required fields: attemptId, writingPromptId" },
        { status: 400 },
      );
    }

    // Fetch attempt + writing submission
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, status: true, userId: true },
    });

    if (!attempt || attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Attempt not found or access denied" }, { status: 404 });
    }

    const submission = await prisma.writingSubmission.findUnique({
      where: {
        attemptId_writingPromptId: { attemptId, writingPromptId },
      },
      include: { writingPrompt: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Writing submission not found" }, { status: 404 });
    }

    // Evaluate using Claude
    const evaluation = await evaluateWritingWithClaude(
      submission.content,
      submission.writingPrompt.wordCountMin,
      submission.writingPrompt.wordCountMax,
      submission.writingPrompt.prompt,
    );

    // Update submission with scores + feedback
    const updated = await prisma.writingSubmission.update({
      where: { id: submission.id },
      data: {
        scores: evaluation.scores,
        feedback: evaluation.feedback,
      },
    });

    return NextResponse.json({
      id: updated.id,
      scores: evaluation.scores,
      feedback: evaluation.feedback,
      totalScore: evaluation.totalScore,
      averageScore: evaluation.averageScore,
    });
  } catch (error) {
    console.error("Writing evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
