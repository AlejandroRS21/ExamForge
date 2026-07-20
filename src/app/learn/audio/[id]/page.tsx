// ExamForge — Audio Content Student Page
// Server component: fetches AudioExercise, renders AudioPlayer

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AudioPlayer } from "@/components/exercises/AudioPlayer";

interface AudioPageProps {
  params: Promise<{ id: string }>;
}

async function AudioContent({ id }: { id: string }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/learn/audio/${id}`);
  }

  const exercise = await prisma.audioExercise.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      mimeType: true,
      transcript: true,
      duration: true,
      status: true,
      downloadUrl: true,
    },
  });

  if (!exercise) {
    notFound();
  }

  if (exercise.status !== "PUBLISHED") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This content is not currently available.
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Listening exercise
          {exercise.duration != null && (
            <>
              {" "}&bull;{" "}
              {Math.floor(exercise.duration / 60)}:
              {(exercise.duration % 60).toString().padStart(2, "0")} min
            </>
          )}
        </p>
      </div>

      <AudioPlayer src={`/api/audio/${exercise.id}`} title={exercise.title} downloadUrl={exercise.downloadUrl || undefined} />

      {exercise.transcript && (
        <details className="rounded-xl border bg-card">
          <summary className="px-6 py-3 text-sm font-medium cursor-pointer hover:bg-accent/50 transition-colors">
            Transcript
          </summary>
          <div className="border-t px-6 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {exercise.transcript}
            </p>
          </div>
        </details>
      )}
    </div>
  );
}

function AudioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading audio">
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/60" />
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted" />
            <div className="flex justify-between">
              <div className="h-3 w-8 rounded bg-muted/60" />
              <div className="h-3 w-8 rounded bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading audio content...</span>
    </div>
  );
}

export default async function AudioPage({ params }: AudioPageProps) {
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

      <Suspense fallback={<AudioSkeleton />}>
        <AudioContent id={id} />
      </Suspense>
    </>
  );
}
