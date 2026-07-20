// ExamForge — Exam Results Page
// SE-02: Raw marks → Cambridge English Scale display with disclaimer
// SE-04: All scoring results display disclaimer
// SE-05: Partial attempts show "Complete all parts to see your score"
// Shows raw score, scale estimate, per-part breakdown, writing rubric scores

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SCORE_DISCLAIMER, getScaleGrade } from "@/lib/scoring";
import { ResultsSummary } from "./results-summary";
import { ScoreBreakdown } from "./score-breakdown";
import { WritingFeedback } from "./writing-feedback";

interface ResultsPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { attemptId } = await params;
  const session = await auth();

  // Fetch attempt with full details
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      examPart: {
        select: { id: true, label: true, paper: true, partNumber: true },
      },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              type: true,
              examPartId: true,
              prompt: true,
              options: true,
              correctAnswer: true,
              explanation: true,
              difficulty: true,
              skillsTested: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      writingSubmissions: {
        include: {
          writingPrompt: {
            select: {
              id: true,
              prompt: true,
              wordCountMin: true,
              wordCountMax: true,
            },
          },
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

  const isInProgress = attempt.status === "IN_PROGRESS";

  // If still in progress, show message
  if (isInProgress) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Exam in Progress</h1>
          <p className="text-muted-foreground">
            This exam hasn&apos;t been completed yet. Finish the exam to see your results.
          </p>
          <Link
            href={attempt.type === "MOCK" ? `/exams/mock/${attemptId}` : `/exams/practice/${attempt.partId ?? ""}`}
            className="inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {attempt.type === "MOCK" ? "Resume Exam" : "Continue Practicing"}
          </Link>
        </div>
      </div>
    );
  }

  // SE-05: Partial answers (unfinished exam) SHALL NOT be scored
  const questionsCount = attempt.questionCount;
  const answeredCount = attempt.answers.length;
  const isPartial = questionsCount > 0 && answeredCount < questionsCount;

  // Group answers by part
  const answersByPart: Record<string, typeof attempt.answers> = {};
  for (const answer of attempt.answers) {
    const partId = answer.question.examPartId;
    if (!answersByPart[partId]) answersByPart[partId] = [];
    answersByPart[partId].push(answer);
  }

  // Fetch all exam parts for labeling
  const allParts = await prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, paper: true, partNumber: true, questionCount: true },
  });

  const partMap = new Map(allParts.map((p) => [p.id, p]));

  // Build per-part stats
  const partStats = Object.entries(answersByPart).map(([partId, partAnswers]) => {
    const part = partMap.get(partId);
    const correct = partAnswers.filter((a) => a.isCorrect).length;
    return {
      partId,
      label: part?.label ?? partId,
      partNumber: part?.partNumber ?? 0,
      paper: part?.paper ?? "",
      questionCount: partAnswers.length,
      correctCount: correct,
      percentage: partAnswers.length > 0 ? Math.round((correct / partAnswers.length) * 100) : 0,
    };
  });

  partStats.sort((a, b) => a.partNumber - b.partNumber);

  const hasWriting = attempt.writingSubmissions.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {attempt.type === "MOCK" ? "Exam Results" : "Practice Results"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {attempt.examPart?.label ?? "Full Mock Exam"} &middot; Completed{" "}
          {attempt.completedAt
            ? new Date(attempt.completedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
      </div>

      {/* Score summary */}
      <ResultsSummary
        totalScore={attempt.totalScore}
        cambridgeScaleScore={attempt.cambridgeScaleScore}
        correctCount={attempt.correctCount}
        questionCount={questionsCount}
        isPartial={isPartial}
        answeredCount={answeredCount}
        status={attempt.status}
      />

      {/* Per-part breakdown */}
      {!isPartial && partStats.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4">Part Breakdown</h2>
          <ScoreBreakdown partStats={partStats} />
        </>
      )}

      {/* Writing feedback */}
      {hasWriting && (
        <>
          <h2 className="text-xl font-semibold mt-10 mb-4">Writing Evaluation</h2>
          <WritingFeedback submissions={attempt.writingSubmissions} />
        </>
      )}

      {/* Action buttons */}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/exams/review/${attemptId}`}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Review Answers
        </Link>
        <Link
          href="/exams"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Back to Exam Center
        </Link>
        {attempt.type === "PRACTICE" && attempt.partId && (
          <Link
            href={`/exams/practice/${attempt.partId}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Practice Again
          </Link>
        )}
      </div>

      {/* Disclaimer */}
      {attempt.totalScore !== null && (
        <div className="mt-8 rounded-lg border border-warning-border bg-warning-surface p-4">
          <p className="text-xs text-warning leading-relaxed">
            {SCORE_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  );
}
