// ExamForge — Practice Part Page
// EE-01: Practice mode — pausable, no timer, hints available
// Full RSC + client component integration for question display and answer submission

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createPracticeAttempt } from "@/lib/exam/create";
import { PracticeModeClient } from "./practice-client";
import SlothPageHeader from "@/components/ui/SlothPageHeader";

interface PracticePartPageProps {
  params: Promise<{ partId: string }>;
}

export default async function PracticePartPage({ params }: PracticePartPageProps) {
  const { partId } = await params;
  const session = await auth();

  // Verify part exists
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

  // Get all exam parts for navigation
  const allParts = await prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      label: true,
      paper: true,
      partNumber: true,
      questionCount: true,
    },
  });

  // Create or resume practice attempt
  const practiceAttempt = await createPracticeAttempt(partId);

  // Fetch saved answers from the attempt
  const savedAnswers: Record<string, any> = {};
  for (const a of practiceAttempt.answers ?? []) {
    savedAnswers[a.questionId] = a.givenAnswer;
  }

  if (part.paper === "Writing") {
    // Writing practice — show prompt + editor
    const writingPrompts = await prisma.writingPrompt.findMany({
      where: { examPartId: partId },
      select: {
        id: true,
        prompt: true,
        wordCountMin: true,
        wordCountMax: true,
      },
    });

    return (
      <WritingPracticeView
        part={part}
        allParts={allParts}
        attemptId={practiceAttempt.attemptId}
        prompts={writingPrompts}
      />
    );
  }

  // R&UoE practice — show questions
  return (
    <PracticeModeClient
      part={part}
      attemptId={practiceAttempt.attemptId}
      initialQuestions={practiceAttempt.questions}
      savedAnswers={savedAnswers}
    />
  );
}

// Server component wrapper for Writing practice
async function WritingPracticeView({
  part,
  allParts,
  attemptId,
  prompts,
}: {
  part: any;
  allParts: any[];
  attemptId: string;
  prompts: { id: string; prompt: string; wordCountMin: number; wordCountMax: number }[];
}) {
  return (
    <div className="flex min-h-screen">
      {/* Part Navigation */}
      <aside className="w-64 flex-shrink-0 border-r bg-muted/20 p-4 space-y-2">
        <h2 className="text-sm font-bold mb-4">Exam Parts</h2>
        {allParts.map((p) => (
          <Link
            key={p.id}
            href={`/exams/practice/${p.id}`}
            className={`block rounded-lg p-3 text-sm transition-colors border ${
              p.id === part.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent border-border"
            }`}
          >
            <div className="font-medium">{p.label}</div>
            <div className="text-[10px] opacity-70">{p.questionCount} questions</div>
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <SlothPageHeader
            badge="Examen B2 First · Redacción"
            title={part.label}
            subtitle={part.description ?? "Escribe tu respuesta con calma y repásala antes de terminar."}
            pose="studying"
            mascotSize={110}
            backHref="/exams"
            backLabel="Todos los exámenes"
          />

          {/* Writing prompts */}
          <div className="space-y-8">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="rounded-xl border bg-card p-6">
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                  {prompt.prompt}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Word limit: {prompt.wordCountMin}–{prompt.wordCountMax} words
                </p>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm min-h-[300px] resize-y
                    focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Write your response here..."
                  rows={14}
                />
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  <span>Auto-saved in practice mode</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
