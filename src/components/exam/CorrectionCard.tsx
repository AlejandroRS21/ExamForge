// ExamForge — Strict Pedagogical Correction Card Component
// Provides rigorous educational feedback, expected vs given comparison, and B2 grammar/vocab explanations

"use client";

import React from "react";

interface CorrectionCardProps {
  isCorrect: boolean;
  givenAnswer: any;
  correctAnswer: any;
  explanation?: string;
  skillsTested?: string[];
  difficulty?: string;
}

/**
 * Format answer payloads safely into readable strings for comparison display
 */
function formatAnswer(answer: any): string {
  if (answer === null || answer === undefined || answer === "") {
    return "(No answer provided)";
  }
  if (typeof answer === "string") {
    return answer;
  }
  if (Array.isArray(answer)) {
    return answer.join(" → ");
  }
  if (typeof answer === "object") {
    return Object.entries(answer)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return String(answer);
}

export function CorrectionCard({
  isCorrect,
  givenAnswer,
  correctAnswer,
  explanation,
  skillsTested = [],
  difficulty,
}: CorrectionCardProps) {
  const formattedGiven = formatAnswer(givenAnswer);
  const formattedExpected = formatAnswer(correctAnswer);

  return (
    <div
      role="region"
      aria-label="Answer evaluation feedback"
      className={`rounded-2xl border-2 p-5 shadow-sm space-y-4 transition-all duration-300 ${
        isCorrect
          ? "border-success bg-success/5 text-foreground"
          : "border-destructive bg-destructive/5 text-foreground"
      }`}
    >
      {/* Banner Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {isCorrect ? "✅" : "❌"}
          </span>
          <h3
            className={`text-base font-bold uppercase tracking-wider ${
              isCorrect ? "text-success" : "text-destructive"
            }`}
          >
            {isCorrect ? "Correct!" : "Incorrect — Study Feedback"}
          </h3>
        </div>

        {difficulty && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground">
            Level {difficulty}
          </span>
        )}
      </div>

      {/* Answer Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div
          className={`rounded-xl p-3.5 border ${
            isCorrect
              ? "bg-success/10 border-success/30 text-success"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80 mb-1">
            Your Answer:
          </span>
          <span className="font-semibold text-base break-words">
            {formattedGiven}
          </span>
        </div>

        <div className="rounded-xl p-3.5 border bg-primary/10 border-primary/30 text-primary">
          <span className="text-xs font-bold uppercase tracking-wider block opacity-80 mb-1">
            Expected Answer:
          </span>
          <span className="font-semibold text-base break-words">
            {formattedExpected}
          </span>
        </div>
      </div>

      {/* Pedagogical Explanation & Rules */}
      {explanation && (
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Grammar & Vocabulary Explanation:
          </h4>
          <p className="text-sm leading-relaxed text-foreground bg-card p-3.5 rounded-xl border border-border">
            {explanation}
          </p>
        </div>
      )}

      {/* Skills Tested Chips */}
      {skillsTested.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Skills tested:
          </span>
          {skillsTested.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-lg bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
