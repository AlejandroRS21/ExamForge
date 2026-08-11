// OpenSloth — /learn/quiz/[id] (RSC)
// Interactive quiz view (spec: student-content-pages — quiz scenario): chunked
// one-question cards, instant correction feedback via QuizRenderer, warm
// focus-optimized layout, zero raw emojis.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { SlothMascot } from "@/components/ui/SlothMascot";
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

  if (!content || content.contentType !== "QUIZ") notFound();

  if (content.status !== "COMPLETED") {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-background p-10 text-center shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={110} className="mx-auto" />
        <p className="mt-4 text-sm font-medium text-amber-800/80">
          Este cuestionario todavía no está disponible.
        </p>
      </div>
    );
  }

  const quizData = content.rawResponse as QuizData | null;

  if (!quizData?.questions || quizData.questions.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-background p-10 text-center shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={110} className="mx-auto" />
        <p className="mt-4 text-sm font-medium text-amber-800/80">
          No hay preguntas disponibles para este cuestionario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <SlothPageHeader
        badge="Quiz"
        title={quizData.title ?? "Quiz"}
        subtitle="Una pregunta por tarjeta, con corrección inmediata: tu cerebro consolida mejor lo que comprueba al instante."
        pose="studying"
        mascotSize={140}
        backHref="/dashboard"
        backLabel="Volver al Panel"
      />

      <QuizRenderer questions={quizData.questions} />
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Cargando cuestionario">
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-8">
        <div className="h-8 w-2/3 rounded-lg bg-amber-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-amber-50" />
      </div>
      <div className="min-h-[240px] rounded-3xl border-2 border-amber-200/80 bg-background p-6 space-y-4">
        <div className="h-5 w-full rounded bg-amber-100" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-2xl border-2 border-amber-200/70 bg-white" />
          ))}
        </div>
      </div>
      <span className="sr-only">Cargando cuestionario...</span>
    </div>
  );
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizContent id={id} />
    </Suspense>
  );
}