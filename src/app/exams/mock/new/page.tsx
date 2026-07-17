// ExamForge — Start Mock Exam Page
// T-501: Server Action create mock attempt + TimeTracker with duration
// Shows confirmation and starts the mock exam

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMockAttempt } from "@/lib/exam/create";

interface NewMockPageProps {
  searchParams: Promise<{ partId?: string }>;
}

export default async function NewMockPage({ searchParams }: NewMockPageProps) {
  const session = await auth();
  const { partId } = await searchParams;

  // If partId is provided, show single-part mock confirmation
  if (partId) {
    const part = await prisma.examPart.findUnique({
      where: { id: partId },
      select: {
        id: true,
        label: true,
        paper: true,
        partNumber: true,
        description: true,
        timeMinutes: true,
        questionCount: true,
      },
    });

    if (!part) {
      redirect("/exams");
    }

    async function startMock() {
      "use server";
      const result = await createMockAttempt(partId);
      redirect(`/exams/mock/${result.attemptId}`);
    }

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="rounded-xl border bg-card p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Start Mock: {part.label}</h1>
            <p className="text-muted-foreground mt-2">{part.description}</p>
          </div>

          {/* Exam info */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
            <div>
              <dt className="text-xs text-muted-foreground">Questions</dt>
              <dd className="text-lg font-bold">{part.questionCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Time Limit</dt>
              <dd className="text-lg font-bold">{part.timeMinutes} min</dd>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">Before you start:</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>✓ Timer starts as soon as you click &quot;Start&quot;</li>
              <li>✓ Answers are auto-submitted when time runs out</li>
              <li>✓ Do not refresh or close the browser during the exam</li>
              <li>✓ You cannot pause or restart once started</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <form action={startMock}>
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground
                  hover:bg-primary/90 transition-colors"
              >
                Start Exam
              </button>
            </form>
            <Link
              href="/exams"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium
                hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full mock — all 7 R&UoE parts
  const parts = await prisma.examPart.findMany({
    where: { paper: "R&UoE" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      label: true,
      partNumber: true,
      timeMinutes: true,
      questionCount: true,
    },
  });

  const totalMinutes = parts.reduce((sum, p) => sum + p.timeMinutes, 0);
  const totalQuestions = parts.reduce((sum, p) => sum + p.questionCount, 0);

  async function startFullMock() {
    "use server";
    const result = await createMockAttempt();
    redirect(`/exams/mock/${result.attemptId}`);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="rounded-xl border bg-card p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Start Full R&UoE Mock Exam</h1>
          <p className="text-muted-foreground mt-2">
            Simulate the full Cambridge B2 First Reading & Use of English paper.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            You can also take individual parts as mocks from the exam listing.
          </p>
        </div>

        {/* Exam info */}
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
          <div>
            <dt className="text-xs text-muted-foreground">Parts</dt>
            <dd className="text-lg font-bold">{parts.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Questions</dt>
            <dd className="text-lg font-bold">{totalQuestions}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Time Limit</dt>
            <dd className="text-lg font-bold">{totalMinutes} min</dd>
          </div>
        </div>

        {/* Parts breakdown */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors">
            View parts breakdown
          </summary>
          <div className="mt-3 space-y-2">
            {parts.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between rounded-lg border px-4 py-2.5"
              >
                <span className="font-medium">{part.label}</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{part.questionCount} questions</span>
                  <span>{part.timeMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </details>

        {/* Rules */}
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Before you start:</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li>✓ Timer starts immediately — {totalMinutes} minute countdown</li>
            <li>✓ All answers are auto-submitted when time expires</li>
            <li>✓ Do not refresh, navigate away, or open another tab during the exam</li>
            <li>✓ Answers are saved as you go — network interruptions will not lose progress</li>
            <li>✓ Partial exams will not be scored</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <form action={startFullMock}>
            <button
              type="submit"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground
                hover:bg-primary/90 transition-colors shadow-md"
            >
              Start Full Mock
            </button>
          </form>
          <Link
            href="/exams"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium
              hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
