// ExamForge — /learn/audio/[id] (RSC)
// Distraction-free audio learning view (spec: student-content-pages — audio
// scenario): audio player, transcript toggle, chunked questions, SlothMascot
// feedback. SVG icons only (CaptionsIcon / ChevronRightIcon) — zero emojis.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { SlothMascot } from "@/components/ui/SlothMascot";
import { AudioPlayer } from "@/components/exercises/AudioPlayer";
import {
  CaptionsIcon,
  ChevronRightIcon,
  VolumeIcon,
} from "@/components/ui/icons/SlothIcons";

interface AudioPageProps {
  params: Promise<{ id: string }>;
}

interface ChunkedQuestion {
  question: string;
  options?: unknown;
  answer?: unknown;
}

function normalizeQuestions(raw: unknown): ChunkedQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: ChunkedQuestion[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      out.push({ question: item });
    } else if (item && typeof item === "object" && "question" in item) {
      const q = item as Record<string, unknown>;
      out.push({
        question: String(q.question),
        options: q.options,
        answer: q.answer,
      });
    }
  }
  return out;
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
      audioUrl: true,
      questions: true,
    },
  });

  if (!exercise) notFound();

  if (exercise.status !== "PUBLISHED") {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-10 text-center shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={110} className="mx-auto" />
        <p className="mt-4 text-sm font-medium text-amber-800/80">
          Este contenido todavía no está disponible.
        </p>
      </div>
    );
  }

  const questions = normalizeQuestions(exercise.questions);
  const progressMinutes =
    exercise.duration != null
      ? `${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, "0")}`
      : null;

  return (
    <div className="space-y-8 pb-16">
      <SlothPageHeader
        badge="Audio"
        title={exercise.title}
        subtitle="Escucha activa: intenta responder las preguntas sin leer la transcripción, y compruébalo después."
        pose="studying"
        mascotSize={140}
        backHref="/dashboard"
        backLabel="Volver al Panel"
      />

      {/* Distraction-free player */}
      <section className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-6 shadow-[0_6px_0_0_#FDE68A]">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900/70">
          <VolumeIcon className="h-4 w-4" color="#FF6B35" />
          Reproductor
          {progressMinutes && (
            <span className="rounded-full border border-amber-200 bg-white px-2.5 py-0.5 normal-case">
              {progressMinutes} min
            </span>
          )}
        </div>
        <AudioPlayer
          src={`/api/audio/${exercise.id}`}
          title={exercise.title}
          duration={exercise.duration}
          downloadUrl={exercise.downloadUrl || exercise.audioUrl || undefined}
        />
      </section>

      {/* SlothMascot study feedback */}
      <aside
        aria-label="Consejo de estudio"
        className="flex items-center gap-4 rounded-3xl border-2 border-amber-200/80 bg-white p-5 shadow-[0_6px_0_0_#FDE68A]"
      >
        <SlothMascot pose="cheering" size={72} className="shrink-0" />
        <p className="text-sm font-medium leading-relaxed text-amber-900">
          Escucha una vez a velocidad normal. Si una palabra se te escapa,
          rebobina 10 segundos antes de mirar la transcripción: así entrena tu
          oído, no solo tu vista.
        </p>
      </aside>

      {/* Transcript toggle */}
      {exercise.transcript && (
        <details className="group rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] shadow-[0_6px_0_0_#FDE68A]">
          <summary className="flex cursor-pointer items-center gap-2 rounded-3xl px-6 py-4 text-sm font-bold text-amber-950 hover:bg-amber-50 transition-colors list-none">
            <CaptionsIcon className="h-5 w-5" color="#FF6B35" />
            Transcripción
            <ChevronRightIcon
              className="ml-auto h-4 w-4 text-amber-700 transition-transform group-open:rotate-90"
              color="#B45309"
            />
          </summary>
          <div className="border-t border-amber-200/80 px-6 py-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium text-amber-900/90">
              {exercise.transcript}
            </p>
          </div>
        </details>
      )}

      {/* Chunked comprehension questions */}
      {questions.length > 0 && (
        <section
          aria-label="Preguntas de comprensión"
          className="space-y-4"
        >
          <h2 className="text-lg font-extrabold tracking-tight text-amber-950">
            Preguntas de comprensión
          </h2>
          {questions.map((q, index) => (
            <div
              key={`${index}-${q.question.slice(0, 24)}`}
              className="rounded-3xl border-2 border-amber-200/80 bg-white p-5 shadow-[0_6px_0_0_#FDE68A]"
            >
              <p className="text-sm font-bold leading-relaxed text-amber-950">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35] text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                {q.question}
              </p>
              {Array.isArray(q.options) && q.options.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {q.options.map((option, oi) => (
                    <li
                      key={oi}
                      className="rounded-xl border border-amber-200/70 bg-[#FAF6F0] px-3 py-2 text-xs font-medium text-amber-900/80"
                    >
                      {String.fromCharCode(65 + oi)}. {String(option)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function AudioSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Cargando audio">
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-8">
        <div className="h-8 w-2/3 rounded-lg bg-amber-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-amber-50" />
      </div>
      <div className="h-28 rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0]" />
      <span className="sr-only">Cargando audio...</span>
    </div>
  );
}

export default async function AudioPage({ params }: AudioPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<AudioSkeleton />}>
      <AudioContent id={id} />
    </Suspense>
  );
}