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
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentQuestion = questions[currentIndex] as (QuestionDisplayData & {
    correctAnswer?: any;
    explanation?: string;
    skillsTested?: string[];
  }) | undefined;

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

  const handleCompletePractice = async () => {
    setIsCompleting(true);
    try {
      await fetch("/api/exams/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      setIsFinished(true);
    } catch (err) {
      console.error("[PracticeMode] Complete error:", err);
    } finally {
      setIsCompleting(false);
    }
  };

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
            Back to Exams Selection
          </Link>
        </div>
      </div>
    );
  }

  // Calculate score summary if finished
  const totalCorrect = questions.reduce((acc, q) => {
    const given = answers[q.id];
    const expected = (q as any).correctAnswer;
    return checkIsCorrect(given, expected) ? acc + 1 : acc;
  }, 0);

  if (isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border-2 border-border bg-card p-8 text-center space-y-6 shadow-md">
          <div className="text-4xl">🎓</div>
          <h2 className="text-xl font-bold text-foreground">Practice Session Completed!</h2>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">Your Score</span>
            <p className="text-3xl font-extrabold text-primary">
              {totalCorrect} / {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              ({Math.round((totalCorrect / Math.max(1, questions.length)) * 100)}% Accuracy)
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFinished(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-xs font-semibold hover:bg-muted transition-colors"
            >
              Review Answers
            </button>
            <Link
              href="/exams"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              ← Select Another Exam Part
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentGivenAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const hasSubmittedAnswer = currentGivenAnswer !== undefined && currentGivenAnswer !== null && currentGivenAnswer !== "";
  const isCorrect = currentQuestion && hasSubmittedAnswer
    ? checkIsCorrect(currentGivenAnswer, currentQuestion.correctAnswer)
    : false;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header bar with clear exit and part switching */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/exams"
            aria-label="Exit to Exams Selection"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            ← Change Part / Exit
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
      <div className="h-1.5 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center py-8 px-4">
        {currentQuestion && (
          <div className="flex w-full max-w-[760px] flex-col gap-6">
            {/* Header badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md">
                {getQuestionTypeLabel(currentQuestion.type)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Difficulty {currentQuestion.difficulty}
              </span>
            </div>

            {/* In-Context Frame wrapping prompt text & answer input */}
            <ContextFrame
              promptText={currentQuestion.prompt?.text}
              hint={currentQuestion.prompt?.hint}
              readingPassage={currentQuestion.prompt?.readingPassage}
            >
              <AnswerInput
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] ?? null}
                onAnswer={handleAnswer}
              />
            </ContextFrame>

            {/* Strict Pedagogical Correction Card */}
            {hasSubmittedAnswer && currentQuestion.correctAnswer && (
              <CorrectionCard
                isCorrect={isCorrect}
                givenAnswer={currentGivenAnswer}
                correctAnswer={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
                skillsTested={currentQuestion.skillsTested}
                difficulty={currentQuestion.difficulty}
              />
            )}

            {/* Quality Rating Widget remounted per question via key */}
            <QuestionRatingWidget key={currentQuestion.id} questionId={currentQuestion.id} />

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded-xl bg-secondary px-5 py-2.5 text-xs font-semibold text-secondary-foreground
                  hover:bg-secondary/80 transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleCompletePractice}
                  disabled={isCompleting}
                  className="rounded-xl bg-success px-6 py-2.5 text-xs font-bold text-success-foreground hover:bg-success/90 transition-colors"
                >
                  {isCompleting ? "Evaluating..." : "Finish & Evaluate Practice ✓"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(currentIndex + 1)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground
                    hover:bg-primary/90 transition-colors"
                >
                  Next question →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
