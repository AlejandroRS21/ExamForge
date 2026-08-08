// ExamForge — Question Quality Rating Widget Component
// Allows users to evaluate AI-generated questions in real-time (👍 / 👎)

"use client";

import React, { useState } from "react";

interface QuestionRatingWidgetProps {
  questionId: string;
}

export function QuestionRatingWidget({ questionId }: QuestionRatingWidgetProps) {
  const [rated, setRated] = useState<"POSITIVE" | "NEGATIVE" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (rating: "POSITIVE" | "NEGATIVE") => {
    if (isSubmitting || rated !== null) return;
    setIsSubmitting(true);
    setRated(rating);

    try {
      await fetch("/api/questions/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, rating }),
      });
    } catch (err) {
      console.error("[QuestionRating] Error submitting rating:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-card border border-border/80 px-4 py-2.5 text-xs text-muted-foreground shadow-sm">
      <span>Was this exercise helpful and accurate?</span>

      {rated ? (
        <span className="font-semibold text-success flex items-center gap-1">
          ✓ Thanks for your feedback!
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleRate("POSITIVE")}
            disabled={isSubmitting}
            aria-label="Rate helpful"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-success/10 hover:text-success hover:border-success/30 transition-colors disabled:opacity-50"
          >
            👍 Helpful
          </button>
          <button
            type="button"
            onClick={() => handleRate("NEGATIVE")}
            disabled={isSubmitting}
            aria-label="Rate needs improvement"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
          >
            👎 Needs Improvement
          </button>
        </div>
      )}
    </div>
  );
}
