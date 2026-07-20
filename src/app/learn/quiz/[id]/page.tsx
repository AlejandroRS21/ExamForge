// ExamForge — Quiz Student Page
// Server component: fetches GeneratedContent with contentType=QUIZ, renders QuizRenderer

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuizRenderer } from "@/components/learn/QuizRenderer";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

interface QuizData {
  title?: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
  }>;
}

async function QuizContent({ id }: { id: string }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/learn/quiz/${id}`);
  }

  const content = await prisma.generatedContent.findUnique({
    where: { id },
    select: {
      id: true,
      contentType: true,
      rawResponse: true,
      status: true,
    },
  });

  if (!content || content.contentType !== "QUIZ") {
    notFound();
  }

  if (content.status !== "COMPLETED") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This quiz is not currently available.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const quizData = content.rawResponse as QuizData | null;

  if (!quizData?.questions || quizData.questions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No questions available for this quiz.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{quizData.title ?? "Quiz"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {quizData.questions.length} question{quizData.questions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <QuizRenderer questions={quizData.questions} />
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading quiz">
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/60" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted/60" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-full rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg border bg-muted/20" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading quiz...</span>
    </div>
  );
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <Suspense fallback={<QuizSkeleton />}>
        <QuizContent id={id} />
      </Suspense>
    </>
  );
}
