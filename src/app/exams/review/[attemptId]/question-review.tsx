// ExamForge — Individual Question Review Component

"use client";

import { useState } from "react";

interface QuestionReviewProps {
  index: number;
  question: {
    id: string;
    type: string;
    prompt: any;
    options: any | null;
    correctAnswer: any;
    explanation: string | null;
    difficulty: string;
    skillsTested: string[];
    examPart: {
      partNumber: number;
      label: string;
    };
  };
  givenAnswer: any;
  isCorrect: boolean;
}

export function QuestionReview({
  index,
  question,
  givenAnswer,
  isCorrect,
}: QuestionReviewProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const formatAnswer = (answer: any): string => {
    if (answer === null || answer === undefined) return "No answer";
    if (typeof answer === "string") return answer;
    if (Array.isArray(answer)) return answer.join(", ");
    if (typeof answer === "object") {
      try {
        return JSON.stringify(answer);
      } catch {
        return String(answer);
      }
    }
    return String(answer);
  };

  const formatCorrectAnswer = (answer: any): string => {
    if (typeof answer === "object" && !Array.isArray(answer) && answer !== null) {
      // KT format: { keyword, acceptable }
      if (answer.keyword && answer.acceptable) {
        return `${String(answer.keyword)} — ${(answer.acceptable as string[]).join(" / ")}`;
      }
      return JSON.stringify(answer, null, 1);
    }
    return formatAnswer(answer);
  };

  const typeLabels: Record<string, string> = {
    MC: "Multiple Choice",
    CLOZE: "Open Cloze",
    WF: "Word Formation",
    KT: "Key Word Transformation",
    GT: "Gapped Text",
    MM: "Multiple Matching",
  };

  const difficultyLabels: Record<string, string> = {
    A: "Easy",
    B: "Standard",
    C: "Challenge",
  };

  return (
    <div
      className={`rounded-xl border p-5 space-y-3 transition-all ${
        isCorrect
          ? "border-success-border bg-success-surface"
          : "border-error-border bg-error-surface"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Status indicator */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isCorrect
                ? "bg-success-surface text-success"
                : "bg-error-surface text-error"
            }`}
          >
            {isCorrect ? "✓" : "✗"}
          </div>

          {/* Question info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Q{index}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {typeLabels[question.type] ?? question.type}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {question.examPart.label}
              </span>
            </div>

            {/* Question text */}
            <div className="mt-2 text-sm leading-reading">
              {typeof question.prompt === "string" ? (
                <p>{question.prompt}</p>
              ) : (
                <>
                  {question.prompt?.text && (
                    <p>{question.prompt.text}</p>
                  )}
                  {question.prompt?.readingPassage && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Show passage
                      </summary>
                      <p className="mt-2 text-xs leading-reading text-muted-foreground whitespace-pre-wrap">
                        {question.prompt.readingPassage}
                      </p>
                    </details>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty badge */}
        <span
          className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            question.difficulty === "C"
              ? "bg-error-surface text-error"
              : question.difficulty === "A"
                ? "bg-success-surface text-success"
                : "bg-warning-surface text-warning"
          }`}
        >
          {difficultyLabels[question.difficulty] ?? question.difficulty}
        </span>
      </div>

      {/* Answers comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Your Answer
          </p>
          <p className={`text-sm font-medium ${isCorrect ? "text-success" : "text-error"}`}>
            {formatAnswer(givenAnswer)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Correct Answer
          </p>
          <p className="text-sm font-medium text-success">
            {formatCorrectAnswer(question.correctAnswer)}
          </p>
        </div>
      </div>

      {/* Skills */}
      {question.skillsTested.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">Skills:</span>
          {question.skillsTested.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Explanation toggle */}
      {question.explanation && (
        <div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-primary hover:underline focus:outline-none"
          >
            {showExplanation ? "Hide explanation" : "Show explanation"}
          </button>
          {showExplanation && (
            <div className="mt-2 rounded-lg bg-muted/30 border p-3 text-xs leading-relaxed text-muted-foreground">
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
