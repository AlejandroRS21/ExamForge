// OpenSloth — Mock Exam Page
// EE-04: Mock mode — timed, strict, linear navigation
// Full screen exam with server-authoritative timer

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MockExamClient } from "./mock-client";

interface MockExamPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function MockExamPage({ params }: MockExamPageProps) {
  const { attemptId } = await params;
  const session = await auth();

  // Fetch attempt with full details
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      timeTracker: true,
      examPart: {
        select: {
          id: true,
          label: true,
          paper: true,
          partNumber: true,
          timeMinutes: true,
          questionCount: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          givenAnswer: true,
        },
      },
    },
  });

  if (!attempt) {
    redirect("/exams");
  }

  // Verify ownership
  const userId = session?.user?.id;
  if (attempt.userId && attempt.userId !== userId) {
    redirect("/exams");
  }

  // If already completed, redirect to results
  if (attempt.status !== "IN_PROGRESS") {
    redirect(`/exams/results/${attemptId}`);
  }

  // Fetch questions
  let questions: any[] = [];
  let writingPrompts: any[] = [];

  if (attempt.partId && attempt.examPart) {
    // Single part mock
    if (attempt.examPart.paper !== "Writing") {
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
        ...q,
        questionIndex: i,
      }));
    } else {
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
  } else {
    // Full mock — all R&UoE parts
    const allParts = await prisma.examPart.findMany({
      where: { paper: "R&UoE" },
      orderBy: { sortOrder: "asc" },
      select: { id: true, partNumber: true, label: true },
    });

    const partIds = allParts.map((p) => p.id);

    const qs = await prisma.question.findMany({
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
        examPart: { select: { partNumber: true, label: true, id: true } },
      },
      orderBy: [{ examPartId: "asc" }, { createdAt: "asc" }],
    });

    questions = qs.map((q, i) => ({
      ...q,
      questionIndex: i,
    }));
  }

  // Build answers map
  const savedAnswers: Record<string, any> = {};
  for (const a of attempt.answers) {
    savedAnswers[a.questionId] = a.givenAnswer;
  }

  // Get writing submission if exists
  let writingSubmission: any = null;
  if (writingPrompts.length > 0) {
    const sub = await prisma.writingSubmission.findFirst({
      where: { attemptId },
      orderBy: { submittedAt: "desc" },
    });
    if (sub) {
      writingSubmission = {
        id: sub.id,
        writingPromptId: sub.writingPromptId,
        content: sub.content,
        wordCount: sub.wordCount,
      };
    }
  }

  return (
    <MockExamClient
      attemptId={attempt.id}
      remainingSeconds={attempt.timeTracker?.remainingSeconds ?? 0}
      timerVersion={attempt.timeTracker?.version ?? 0}
      questions={questions}
      writingPrompts={writingPrompts}
      writingSubmission={writingSubmission}
      savedAnswers={savedAnswers}
      currentPartLabel={attempt.examPart?.label ?? "Full Mock"}
    />
  );
}
