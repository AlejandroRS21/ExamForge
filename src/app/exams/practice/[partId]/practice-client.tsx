// ExamForge — Practice Mode Client Component
// Renders questions with answer inputs, handles submission via API
// EE-01: Practice mode — pausable, no timer, hints available
// Neuroinclusive UI adoption: applies the approved Pencil ExamPractice
// mockup (id EPS1o) — ExamBar, question-progress track, a single-task-focus
// 720px column, prompt kicker, passage card, and footer nav with a
// reduced-motion note. The TimerChip from the mockup is intentionally
// omitted here: EE-01 requires practice mode to have no timer/time
// pressure, so showing one (even non-authoritative) would contradict that
// requirement and the "No timer" copy already advertised on /exams. The
// redesigned neutral TimerChip itself (see ExamTimer.tsx) still applies to
// the timed Mock exam flow.

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AnswerInput } from "@/components/exam/AnswerInput";
import type { QuestionDisplayData } from "@/components/exam/AnswerInput";
import { getStatusToneClasses } from "@/lib/design-tokens";
import { getQuestionTypeLabel } from "@/lib/exam/question-type-labels";

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
  const [questions] = useState(initialQuestions);
  const [answers, setAnswers] = useState<Record<string, any>>(savedAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const saveAnswer = useCallback(
    async (questionId: string, answer: any) => {
      setIsSaving(true);
      setSaveMessage(null);
      try {
        const res = await fetch("/api/exams/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId,
            givenAnswer: answer,
            timeSpentSeconds: 0,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error ?? "Save failed");
        }

        setSaveMessage("Saved");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setSaveMessage(null), 2000);
      } catch (err) {
        setSaveMessage("Failed to save");
        console.error("[PracticeMode] Save error:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [attemptId],
  );

  const handleAnswer = useCallback(
    (questionId: string, answer: any) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      saveAnswer(questionId, answer);
    },
    [saveAnswer],
  );

  const goTo = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  if (!currentQuestion && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            No questions available for this part yet.
          </p>
          <Link
            href="/exams"
            className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ExamBar */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-12">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            aria-label="Exit practice"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </Link>
          <h1 className="text-sm font-semibold text-foreground">
            {part.paper} — {part.label}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-medium text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {isSaving && <span className="text-xs text-muted-foreground">Saving...</span>}
          {saveMessage && (
            <span className={`text-xs ${saveMessage === "Saved" ? "text-success" : "text-destructive"}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </header>

      {/* Progress track */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center py-12">
        {currentQuestion && (
          <div className="flex w-full max-w-[720px] flex-col gap-8">
            {/* Prompt block */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {getQuestionTypeLabel(currentQuestion.type)}
              </span>
              {currentQuestion.prompt?.text && (
                <p className="text-[17px] leading-reading text-foreground">
                  {currentQuestion.prompt.text}
                </p>
              )}
            </div>

            {/* Passage card */}
            {currentQuestion.prompt?.readingPassage && (
              <div className="rounded-xl border bg-card p-8 text-[15px] leading-reading text-foreground">
                {currentQuestion.prompt.readingPassage}
              </div>
            )}

            {/* Hint (practice mode feature) */}
            {currentQuestion.prompt?.hint && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground transition-colors font-medium">
                  💡 Hint available
                </summary>
                <p className={`mt-2 p-3 rounded-lg leading-reading ${getStatusToneClasses("info", "surface")}`}>
                  {currentQuestion.prompt.hint}
                </p>
              </details>
            )}

            {/* Answer options */}
            <AnswerInput
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id] ?? null}
              onAnswer={handleAnswer}
            />

            {/* Footer nav */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded-lg bg-secondary px-[18px] py-2.5 text-[13px] font-medium text-secondary-foreground
                  hover:bg-secondary/80 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span aria-hidden="true">⏸</span>
                Reduced motion: no timer pulse, no slide transitions
              </span>

              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex >= questions.length - 1}
                className="rounded-lg bg-primary px-[18px] py-2.5 text-[13px] font-medium text-primary-foreground
                  hover:bg-primary/90 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next question →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
