// OpenSloth — Practice Mode Client Component (In-Context UX + Flow Navigation)
// Renders questions in context using ContextFrame. Grading is server-side only
// (P-S-2): correctAnswer never reaches this component; the verdict and score
// come from POST /api/exams/practice/finish.

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnswerInput } from "@/components/exam/AnswerInput";
import type { QuestionDisplayData } from "@/components/exam/AnswerInput";
import { ContextFrame } from "@/components/exam/ContextFrame";
import { QuestionRatingWidget } from "@/components/exam/QuestionRatingWidget";
import { getQuestionTypeLabel } from "@/lib/exam/question-type-labels";
import { practiceTimeLow, formatRemaining } from "@/lib/exam/timer-guard";
import { summarizePracticeResult } from "@/lib/exam/practice";
import type { PracticeFinishSummary } from "@/lib/exam/practice";
import { TactileButton } from "@/components/ui/TactileButton";
import { SlothMascot } from "@/components/ui/SlothMascot";
import { PlayIcon, AwardIcon } from "@/components/ui/icons/SlothIcons";

interface PracticeModeClientProps {
  part: {
    id: string;
    label: string;
    paper: string;
    partNumber: number;
    description: string | null;
    timeMinutes: number;
    questionCount: number;
  };
  attemptId: string;
  initialQuestions: QuestionDisplayData[];
  savedAnswers?: Record<string, any>;
}

export function PracticeModeClient({
  part,
  attemptId,
  initialQuestions,
  savedAnswers = {},
}: PracticeModeClientProps) {
  const router = useRouter();
  const [questions] = useState(initialQuestions);
  const [answers, setAnswers] = useState<Record<string, any>>(savedAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<PracticeFinishSummary | null>(null);

  // Calm Sloth timer guard: presentational only — tracks elapsed time to
  // decide WHEN to show the reassurance, never wires a real countdown.
  // ponytail: static guard, no pause-aware timer, add when real timing ships.
  const [elapsedSec, setElapsedSec] = useState(0);
  const timed = part.timeMinutes > 0;
  useEffect(() => {
    if (!timed || isFinished) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timed, isFinished]);
  const showCalmGuard = practiceTimeLow(elapsedSec, part.timeMinutes);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const handleAnswer = useCallback(
    (questionId: string, value: any) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    []
  );

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Persist remaining answers + grade server-side via the finish route.
      // P-S-1: answers are stored on finish; P-S-2: verdict comes from the server.
      const res = await fetch("/api/exams/practice/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers }),
      });

      if (!res.ok) {
        let message = "No se pudo guardar tu sesión. Inténtalo de nuevo.";
        try {
          const err = await res.json();
          if (err?.error) message = err.error;
        } catch {
          // keep default message
        }
        setSubmitError(message);
        return;
      }

      const data = await res.json();
      const summary = summarizePracticeResult(data);
      // Partial finish: the attempt stays IN_PROGRESS — surface how many
      // questions remain so the user can answer them and finish again.
      // The partial payload carries answeredCount/totalCount (not the
      // complete-result fields) since no grading ran yet.
      setResult(
        data?.isPartial
          ? { ...summary, answerCount: Number(data.answeredCount ?? 0), questionCount: Number(data.totalCount ?? 0) }
          : summary,
      );
      setIsFinished(true);
    } catch (e) {
      console.error("Failed to finish practice:", e);
      setSubmitError("Error de conexión: no se pudo guardar tu sesión. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">No se encontraron preguntas</h2>
          <p className="text-sm text-muted-foreground">
            Todavía no hay preguntas disponibles para esta sección.
          </p>
          <Link
            href="/exams"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Volver a la selección de exámenes
          </Link>
        </div>
      </div>
    );
  }

  // Score summary comes exclusively from the server (P-S-2)
  const scoreText =
    result && result.totalScore !== null
      ? `${result.correctCount} / ${result.questionCount}`
      : result
        ? `${result.answerCount} / ${result.questionCount}`
        : "";

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border-2 border-border bg-card p-8 text-center space-y-6 shadow-md">
          <AwardIcon className="w-14 h-14 mx-auto" color="#FFB703" aria-hidden="true" />
          <h2 className="text-xl font-bold text-foreground">¡Sesión de práctica completada!</h2>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">Tu puntuación</span>
            <p className="text-3xl font-extrabold text-primary">{scoreText}</p>
            {result?.totalScore !== null && result && (
              <p className="text-xs text-muted-foreground">
                ({Math.round((result.correctCount / Math.max(1, result.questionCount)) * 100)}% precisión)
              </p>
            )}
            {result?.isPartial && (
              <p className="text-xs text-muted-foreground">
                Respondiste {result.answerCount} de {result.questionCount} preguntas. Responde las
                restantes y vuelve a terminar para obtener tu puntuación.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFinished(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted transition-colors"
            >
              Revisar respuestas
            </button>
            <Link
              href="/exams"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Volver a exámenes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const promptText = typeof currentQuestion.prompt === "string"
    ? currentQuestion.prompt
    : currentQuestion.prompt?.text ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Practice Bar */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="rounded-lg border border-border p-2 text-xs font-medium hover:bg-muted transition-colors"
          >
            ← Leave
          </Link>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">
              {part.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {getQuestionTypeLabel(currentQuestion.type)} • Question {currentIndex + 1} of{" "}
              {questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <PlayIcon className="w-4 h-4" color="#6B5E57" aria-hidden="true" />
            <span>Límite: {part.timeMinutes} min</span>
          </div>

          <TactileButton
            variant="primary"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs"
          >
            {isSubmitting ? "Enviando..." : "Terminar y evaluar"}
          </TactileButton>
        </div>
      </header>

      {/* Visible submit error — no silent 404 (P-S-1 submit-fails) */}
      {submitError && (
        <div
          role="alert"
          className="mx-auto max-w-4xl w-full px-6 pt-4"
        >
          <p className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {submitError} Tus respuestas siguen aquí: no las pierdas y vuelve a intentarlo.
          </p>
        </div>
      )}

      {/* Main Question Display */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        {showCalmGuard && (
          <aside
            aria-live="polite"
            className="flex items-center gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-[0_3px_0_0_#FDE68A]"
          >
            <SlothMascot pose="calm" size={64} className="shrink-0" />
            <div>
              <p className="font-bold text-amber-950">¡Sin prisas! Vas bien.</p>
              <p className="text-xs font-semibold text-amber-800/80">
                Quedan {formatRemaining(Math.max(0, part.timeMinutes * 60 - elapsedSec))} para
                terminar la parte.
              </p>
            </div>
          </aside>
        )}

        <ContextFrame promptText={promptText}>
          <div className="space-y-6">
            <AnswerInput
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswer={handleAnswer}
            />
          </div>
        </ContextFrame>

        {/* Rating widget */}
        <div className="pt-4 border-t border-border flex justify-end">
          <QuestionRatingWidget questionId={currentQuestion.id} />
        </div>
      </main>

      {/* Footer Navigation Bar */}
      <footer className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between max-w-4xl w-full mx-auto">
        <TactileButton
          variant="soft"
          onClick={handlePrev}
          disabled={isFirst}
        >
          ← Anterior
        </TactileButton>

        <div className="text-xs text-muted-foreground font-medium">
          {currentIndex + 1} / {questions.length}
        </div>

        {isLast ? (
          <TactileButton
            variant="primary"
            onClick={handleFinish}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Terminar práctica ✓"}
          </TactileButton>
        ) : (
          <TactileButton variant="primary" onClick={handleNext}>
            Siguiente →
          </TactileButton>
        )}
      </footer>
    </div>
  );
}
