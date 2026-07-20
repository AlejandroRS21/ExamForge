// ExamForge — Exam Selection Page
// Shows available exam parts for practice and mock modes

import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ExamsPage() {
  const session = await auth();

  const parts = await prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
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

  const ruoeParts = parts.filter((p) => p.paper === "R&UoE");
  const writingParts = parts.filter((p) => p.paper === "Writing");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Exam Center</h1>
        <p className="text-muted-foreground mt-2">
          Choose your mode — practice individual parts or take a full timed mock exam.
        </p>
      </div>

      {/* Practice Mode */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Practice Mode</h2>
            <p className="text-sm text-muted-foreground">
              No timer, hints available, pausable. Focus on one part at a time.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
            No timer
          </span>
        </div>

        {/* R&UoE Parts */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Reading & Use of English
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ruoeParts.map((part) => (
              <Link
                key={part.id}
                href={`/exams/practice/${part.id}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="font-medium text-sm">{part.label}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {part.description}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{part.questionCount} questions</span>
                  <span>{part.timeMinutes} min</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {writingParts.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Writing
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {writingParts.map((part) => (
                <Link
                  key={part.id}
                  href={`/exams/practice/${part.id}`}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="font-medium text-sm">{part.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{part.description}</div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{part.questionCount} tasks</span>
                    <span>{part.timeMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Mock Mode */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Mock Exam</h2>
            <p className="text-sm text-muted-foreground">
              Full timed exam with real B2 First timing. One shot — no pauses.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
            Timed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Mock */}
          <Link
            href="/exams/mock/new"
            className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 hover:border-primary/40 hover:bg-primary/10 transition-all"
          >
            <div className="font-semibold text-base">Full R&UoE Mock</div>
            <p className="text-sm text-muted-foreground mt-1">
              All 7 parts, 52 questions, 1 hour 15 minutes.
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
              <span>52 questions</span>
              <span>75 min</span>
            </div>
          </Link>

          {/* Part-by-part mocks */}
          {ruoeParts.map((part) => (
            <Link
              key={part.id}
              href={`/exams/mock/new?partId=${part.id}`}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="font-medium text-sm">{part.label} Mock</div>
              <div className="text-xs text-muted-foreground mt-1">{part.description}</div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>{part.questionCount} questions</span>
                <span>{part.timeMinutes} min</span>
                <span className="text-warning font-medium">Timed</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* History link (for authenticated users) */}
      {session?.user && (
        <div className="mt-12 pt-6 border-t">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
