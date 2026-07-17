// ExamForge — Exam Review Page
// Shows all questions with correct/incorrect marked, explanations
// Accessible after exam completion

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuestionReview } from "./question-review";

interface ReviewPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { attemptId } = await params;
  const session = await auth();

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
              prompt: true,
              options: true,
              correctAnswer: true,
              explanation: true,
              difficulty: true,
              skillsTested: true,
              examPart: {
                select: { partNumber: true, label: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!attempt) {
    redirect("/exams");
  }

  const userId = session?.user?.id;
  if (attempt.userId && attempt.userId !== userId) {
    redirect("/exams");
  }

  // Redirect back to exam if still in progress
  if (attempt.status === "IN_PROGRESS") {
    if (attempt.type === "MOCK") {
      redirect(`/exams/mock/${attemptId}`);
    } else if (attempt.partId) {
      redirect(`/exams/practice/${attempt.partId}`);
    }
  }

  // Fetch writing submissions
  const writingSubmissions = await prisma.writingSubmission.findMany({
    where: { attemptId },
    include: {
      writingPrompt: {
        select: { prompt: true, wordCountMin: true, wordCountMax: true },
      },
    },
  });

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const hasWriting = writingSubmissions.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Answer Review</h1>
        <p className="text-muted-foreground mt-1">
          {attempt.examPart?.label ?? "Full Mock Exam"} &middot;{" "}
          {correctCount} of {attempt.answers.length} correct
          {attempt.status === "TIMED_OUT" && " · Timed out"}
        </p>
      </div>

      {/* Question review list */}
      {attempt.answers.length > 0 ? (
        <div className="space-y-6">
          {attempt.answers.map((answer, index) => (
            <QuestionReview
              key={answer.id}
              index={index + 1}
              question={answer.question}
              givenAnswer={answer.givenAnswer}
              isCorrect={answer.isCorrect ?? false}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <p>No answers to review for this attempt.</p>
        </div>
      )}

      {/* Writing submissions */}
      {hasWriting && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Writing Responses</h2>
          <div className="space-y-6">
            {writingSubmissions.map((submission) => (
              <div key={submission.id} className="rounded-xl border bg-card p-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Task:</span>{" "}
                  {submission.writingPrompt.prompt}
                </p>
                <div className="rounded-lg bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {submission.content || (
                    <span className="italic text-muted-foreground">No response submitted</span>
                  )}
                </div>
                {(submission.scores as Record<string, unknown> | null) && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{submission.wordCount} words</span>
                    <span>
                      Target: {submission.writingPrompt.wordCountMin}–{submission.writingPrompt.wordCountMax}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href={`/exams/results/${attemptId}`}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Results
        </Link>
        <Link
          href="/exams"
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Exam Center
        </Link>
      </div>
    </div>
  );
}
