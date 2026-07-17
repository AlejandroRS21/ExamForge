// ExamForge — Audio Exercise Student Page
// Server component: fetches exercise data, renders AudioExerciseView client component

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AudioExerciseView } from "@/components/exercises/AudioExerciseView";

interface AudioExercisePageProps {
  params: Promise<{ id: string }>;
}

export default async function AudioExercisePage({ params }: AudioExercisePageProps) {
  const { id } = await params;
  const session = await auth();

  // Require authentication
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/exercises/audio/${id}`);
  }

  // Fetch exercise
  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      audioData: true,
      mimeType: true,
      transcript: true,
      questions: true,
      duration: true,
      attemptCount: true,
      status: true,
      createdAt: true,
    },
  });

  if (!exercise || exercise.status !== "PUBLISHED") {
    notFound();
  }

  // Convert audioData to base64 for client consumption
  const audioBase64 = exercise.audioData
    ? Buffer.from(exercise.audioData).toString("base64")
    : null;

  const exerciseData = {
    id: exercise.id,
    title: exercise.title,
    mimeType: exercise.mimeType,
    duration: exercise.duration,
    transcript: exercise.transcript,
    questions: exercise.questions as { items: Array<{ id: string; type: "MC" | "TF"; question: string; options: string[]; correctAnswer: string }> } | null,
    audioData: audioBase64,
    attemptCount: exercise.attemptCount,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav bar */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold tracking-tight hover:text-primary transition-colors"
          >
            ExamForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/exams"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Exams
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Exercise content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
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

        <AudioExerciseView exercise={exerciseData} />
      </main>
    </div>
  );
}
