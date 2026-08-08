// ExamForge — Practice Mode Client Component (In-Context UX + Strict Correction + Flow Navigation)
// Renders questions in context using ContextFrame, evaluates answers with CorrectionCard, allows part switching & completion

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnswerInput } from "@/components/exam/AnswerInput";
import type { QuestionDisplayData } from "@/components/exam/AnswerInput";
import { ContextFrame } from "@/components/exam/ContextFrame";
import { CorrectionCard } from "@/components/exam/CorrectionCard";
import { QuestionRatingWidget } from "@/components/exam/QuestionRatingWidget";
import { getQuestionTypeLabel } from "@/lib/exam/question-type-labels";
import { practiceTimeLow, formatRemaining } from "@/lib/exam/timer-guard";
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

/** Helper to evaluate equality of given answer vs expected answer */
function checkIsCorrect(given: any, expected: any): boolean {
  if (given === null || given === undefined || expected === null || expected === undefined) {
    return false;
  }
  const normGiven = String(given).trim().toLowerCase();
  
  if (typeof expected === "string") {
    return normGiven === expected.trim().toLowerCase();
  }
  if (Array.isArray(expected)) {
    return expected.some((exp) => String(exp).trim().toLowerCase() === normGiven);
  }
  if (typeof expected === "object") {
    return JSON.stringify(given) === JSON.stringify(expected);
  }
  return false;
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
    try {
      // Save current attempt state
      await fetch(`/api/user/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, isFinished: true }),
      });
      setIsFinished(true);
    } catch (e) {
      console.error("Failed to finish practice:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">No Questions Found</h2>
          <p className="text-sm text-muted-foreground">
            No questions are available for this section yet.
          </p>
          <Link
            href="/exams"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to Exams Selection
          </Link>
        </div>
      </div>
    );
  }

  // Calculate score summary if finished
  const totalCorrect = questions.reduce((acc, q) => {
    const given = answers[q.id];
    const expected = (q as any).correctAnswer ?? (q.options ? q.options.correctAnswer : null);
    return checkIsCorrect(given, expected) ? acc + 1 : acc;
  }, 0);

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border-2 border-border bg-card p-8 text-center space-y-6 shadow-md">
          <AwardIcon className="w-14 h-14 mx-auto" color="#FFB703" aria-hidden="true" />
          <h2 className="text-xl font-bold text-foreground">¡Sesión de práctica completada!</h2>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">Tu puntuación</span>
            <p className="text-3xl font-extrabold text-primary">
              {totalCorrect} / {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              ({Math.round((totalCorrect / Math.max(1, questions.length)) * 100)}% precisión)
            </p>
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

  const currentGiven = answers[currentQuestion.id];
  const currentExpected = (currentQuestion as any).correctAnswer ?? (currentQuestion.options ? currentQuestion.options.correctAnswer : null);
  const isCurrentCorrect = checkIsCorrect(currentGiven, currentExpected);

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

            {/* Answer Feedback overlay once an answer is chosen */}
            {answers[currentQuestion.id] !== undefined && (
              <CorrectionCard
                isCorrect={isCurrentCorrect}
                givenAnswer={currentGiven}
                correctAnswer={currentExpected}
                difficulty={currentQuestion.difficulty}
              />
            )}
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
