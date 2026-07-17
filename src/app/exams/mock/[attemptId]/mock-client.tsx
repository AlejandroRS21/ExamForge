// ExamForge — Mock Exam Client Component
// Full timed exam with server-authoritative timer, linear navigation, auto-save

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { AnswerInput } from "@/components/exam/AnswerInput";
import { ProgressIndicator } from "@/components/exam/ProgressIndicator";
import { TabGuard } from "@/components/exam/TabGuard";
import { WritingEditor } from "@/components/exam/WritingEditor";
import type { QuestionDisplayData } from "@/components/exam/AnswerInput";

interface MockExamClientProps {
  attemptId: string;
  remainingSeconds: number;
  timerVersion: number;
  questions: QuestionDisplayData[];
  writingPrompts: {
    id: string;
    prompt: string;
    wordCountMin: number;
    wordCountMax: number;
  }[];
  writingSubmission: {
    id: string;
    writingPromptId: string;
    content: string;
    wordCount: number;
  } | null;
  savedAnswers: Record<string, any>;
  allParts: {
    id: string;
    label: string;
    paper: string;
    partNumber: number;
    questionCount: number;
  }[];
  currentPartLabel: string;
  currentPartId: string | null;
}

export function MockExamClient({
  attemptId,
  remainingSeconds: initialRemaining,
  timerVersion: initialVersion,
  questions,
  writingPrompts,
  writingSubmission,
  savedAnswers: initialSaved,
  allParts,
  currentPartLabel,
  currentPartId,
}: MockExamClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, any>>(initialSaved);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemaining);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Save answer to server
  const saveAnswer = useCallback(
    async (questionId: string, answer: any) => {
      try {
        await fetch("/api/exams/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId,
            givenAnswer: answer,
            timeSpentSeconds: 0,
          }),
        });
      } catch (err) {
        console.error("[MockExam] Save error:", err);
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

  // Linear navigation (no skipping in mock mode)
  const goForward = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions.length]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Handle timer timeout → auto-submit
  const handleTimeout = useCallback(() => {
    router.push(`/exams/results/${attemptId}`);
  }, [attemptId, router]);

  // Handle manual finish
  const handleFinish = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/exams/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to complete");
      }

      router.push(`/exams/results/${attemptId}`);
    } catch (err) {
      console.error("[MockExam] Complete error:", err);
      setIsSubmitting(false);
      setShowFinishConfirm(false);
    }
  }, [attemptId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        goForward();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        goBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goForward, goBack, currentIndex, questions.length]);

  // Determine if this is a writing attempt
  const isWriting = writingPrompts.length > 0;

  if (isWriting) {
    return (
      <div className="min-h-screen flex flex-col">
        <TabGuard attemptId={attemptId} />
        {/* Top bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
          <h1 className="text-sm font-semibold">{currentPartLabel} — Mock</h1>
          <ExamTimer
            attemptId={attemptId}
            initialRemainingSeconds={initialRemaining}
            initialVersion={initialVersion}
            onTimeout={handleTimeout}
          />
        </header>

        {/* Writing content */}
        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="space-y-6">
            {writingPrompts.map((prompt) => (
              <WritingEditor
                key={prompt.id}
                attemptId={attemptId}
                writingPromptId={prompt.id}
                promptText={prompt.prompt}
                wordCountMin={prompt.wordCountMin}
                wordCountMax={prompt.wordCountMax}
                initialContent={
                  writingSubmission?.writingPromptId === prompt.id
                    ? writingSubmission.content
                    : ""
                }
                disabled={isSubmitting}
              />
            ))}
          </div>

          {/* Finish button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowFinishConfirm(true)}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground
                hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Finish Exam"}
            </button>
          </div>
        </main>

        {/* Finish confirmation dialog */}
        {showFinishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="max-w-sm rounded-xl border bg-card p-6 shadow-lg text-center space-y-4">
              <h2 className="text-lg font-bold">Submit your writing?</h2>
              <p className="text-sm text-muted-foreground">
                Make sure you&apos;ve completed your response. You cannot edit
                after submission.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // R&UoE mock exam view
  return (
    <div className="min-h-screen flex flex-col">
      <TabGuard attemptId={attemptId} />

      {/* Top bar */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold">{currentPartLabel}</h1>
          <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Mock
          </span>
        </div>

        <div className="flex items-center gap-6">
          <ProgressIndicator
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            remainingSeconds={remainingSeconds}
            totalSeconds={initialRemaining}
            compact
          />
          <ExamTimer
            attemptId={attemptId}
            initialRemainingSeconds={initialRemaining}
            initialVersion={initialVersion}
            onTimeout={handleTimeout}
            onTick={setRemainingSeconds}
          />
          <button
            onClick={() => setShowFinishConfirm(true)}
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground
              hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Finish"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question navigation sidebar */}
        <aside className="w-56 flex-shrink-0 border-r bg-muted/10 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Questions
          </h3>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = i === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full aspect-square rounded-md text-xs font-medium transition-colors
                    ${
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                        : isAnswered
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                    }
                  `}
                  title={`Question ${i + 1}${isAnswered ? " (answered)" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Part indicator */}
          {questions.length > 0 && currentQuestion && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border text-xs text-muted-foreground">
              <span className="font-medium">Part {currentQuestion.partNumber}</span>
              {currentQuestion.prompt?.readingPassage && (
                <button
                  onClick={() =>
                    document
                      .getElementById("mock-reading-passage")
                      ?.classList.toggle("hidden")
                  }
                  className="block mt-1 text-primary hover:underline"
                >
                  Show passage
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Question display area */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Reading passage (expandable) */}
              {currentQuestion.prompt?.readingPassage && (
                <div
                  id="mock-reading-passage"
                  className="hidden rounded-lg bg-muted/30 border p-4 text-sm leading-relaxed"
                >
                  {currentQuestion.prompt.readingPassage}
                </div>
              )}

              {/* Question text */}
              {currentQuestion.prompt?.text && (
                <p className="text-sm leading-relaxed">{currentQuestion.prompt.text}</p>
              )}

              {/* Answer input */}
              <AnswerInput
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] ?? null}
                onAnswer={handleAnswer}
              />
            </div>
          )}
        </main>
      </div>

      {/* Bottom navigation */}
      <footer className="border-t px-6 py-3 flex items-center justify-between bg-card">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium
            hover:bg-muted transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <span className="text-xs text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>

        <button
          onClick={goForward}
          disabled={currentIndex >= questions.length - 1}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
            hover:bg-primary/90 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </footer>

      {/* Finish confirmation dialog */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="max-w-sm rounded-xl border bg-card p-6 shadow-lg text-center space-y-4">
            <h2 className="text-lg font-bold">Finish the exam?</h2>
            <p className="text-sm text-muted-foreground">
              You have answered {answeredCount} of {questions.length} questions.
              Unanswered questions will be marked as incorrect.
            </p>
            {answeredCount < questions.length && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-300">
                ⚠️ {questions.length - answeredCount} unanswered question
                {questions.length - answeredCount !== 1 ? "s" : ""}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
                  hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit All"}
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
              >
                Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
