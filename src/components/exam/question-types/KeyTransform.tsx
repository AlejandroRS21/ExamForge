// ExamForge — Key Word Transformation Component (Duolingo Style)
// Modernized textarea box for Key Word Transformation questions (Part 4) with explicit instruction

"use client";

import React, { useState } from "react";

interface KeyTransformProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
  leadIn?: string;
  keyword?: string;
}

export function KeyTransform({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
  leadIn,
  keyword,
}: KeyTransformProps) {
  const [announcement, setAnnouncement] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onAnswer(questionId, val);
    if (val.trim()) {
      setAnnouncement(`Transformation answer updated`);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {leadIn && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Original sentence:
          </span>
          {leadIn}
        </div>
      )}

      {keyword && (
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Mandatory keyword (do not change):
          </span>
          <span className="inline-flex items-center rounded-lg bg-primary/15 px-3 py-1 text-xs font-extrabold uppercase text-primary border border-primary/30">
            {keyword}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor={`kt-${questionId}`} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Complete second sentence (between 2 to 5 words including keyword):
        </label>
        <textarea
          id={`kt-${questionId}`}
          value={selectedAnswer ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Write the transformed sentence..."
          rows={3}
          className="w-full rounded-xl border-2 border-primary/40 bg-card px-4 py-3 text-sm font-medium text-foreground
            placeholder:text-muted-foreground/60 transition-all duration-200 shadow-sm resize-none
            hover:border-primary
            focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
            disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
