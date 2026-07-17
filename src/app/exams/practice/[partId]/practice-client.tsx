// ExamForge — Practice Mode Client Component
// Renders questions with answer inputs, handles submission via API

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AnswerInput } from "@/components/exam/AnswerInput";
import { ProgressIndicator } from "@/components/exam/ProgressIndicator";
import type { QuestionDisplayData } from "@/components/exam/AnswerInput";

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
  allParts: {
    id: string;
    label: string;
    paper: string;
    partNumber: number;
    questionCount: number;
  }[];
  attemptId: string;
  initialQuestions: QuestionDisplayData[];
  savedAnswers?: Record<string, any>;
}

export function PracticeModeClient({
  part,
  allParts,
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

  // Keep ref in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Save answer to server
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

  // Handle answer selection
  const handleAnswer = useCallback(
    (questionId: string, answer: any) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      saveAnswer(questionId, answer);
    },
    [saveAnswer],
  );

  // Navigation
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
    <div className="flex min-h-screen">
      {/* Part Navigation Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-sm font-bold">Exam Parts</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
        </nav>
        <div className="p-3 border-t">
          <Link
            href="/exams"
            className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← All exams
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold">{part.label}</h1>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Practice
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ProgressIndicator
              answeredCount={answeredCount}
              totalQuestions={questions.length}
              compact
            />
            {isSaving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
            {saveMessage && (
              <span
                className={`text-xs ${
                  saveMessage === "Saved"
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </header>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Question prompt */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQuestion.prompt?.readingPassage && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => {
                        // Toggle reading passage visibility
                        document
                          .getElementById("reading-passage")
                          ?.classList.toggle("hidden");
                      }}
                    >
                      Show reading passage
                    </button>
                  )}
                </div>

                {/* Reading passage (hidden by default for parts with passages) */}
                {currentQuestion.prompt?.readingPassage && (
                  <div
                    id="reading-passage"
                    className="hidden rounded-lg bg-muted/30 border p-4 text-sm leading-relaxed"
                  >
                    {currentQuestion.prompt.readingPassage}
                  </div>
                )}

                {/* Question text */}
                {currentQuestion.prompt?.text && (
                  <p className="text-sm leading-relaxed">
                    {currentQuestion.prompt.text}
                  </p>
                )}

                {/* Hints available indicator (practice mode feature) */}
                {currentQuestion.prompt?.hint && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground transition-colors font-medium">
                      💡 Hint available
                    </summary>
                    <p className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 leading-relaxed">
                      {currentQuestion.prompt.hint}
                    </p>
                  </details>
                )}

                {/* Answer input */}
                <AnswerInput
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion.id] ?? null}
                  onAnswer={handleAnswer}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <footer className="border-t px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium
              hover:bg-muted transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-xs text-muted-foreground">
            Question {currentIndex + 1} / {questions.length}
          </span>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex >= questions.length - 1}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
              hover:bg-primary/90 transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </footer>
      </main>
    </div>
  );
}
