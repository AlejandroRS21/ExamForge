// OpenSloth — Word Formation Input Component (Duolingo Style)
// Modern "blank-as-box" input for Word Formation questions (Part 3) with stem guidance

"use client";

import React, { useState } from "react";

interface WordFormProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
  stemWord?: string;
}

export function WordForm({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
  stemWord,
}: WordFormProps) {
  const [announcement, setAnnouncement] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onAnswer(questionId, val);
    if (val.trim()) {
      setAnnouncement(`Word form updated to ${val}`);
    }
  };

  return (
    <div className="space-y-2 inline-block">
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Derive from base word:
          </span>
          {stemWord && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary border border-primary/20">
              {stemWord}
            </span>
          )}
        </div>

        <div className="relative min-w-[220px] max-w-sm">
          <label htmlFor={`wf-${questionId}`} className="sr-only">
            Write transformed word
          </label>
          <input
            id={`wf-${questionId}`}
            type="text"
            value={selectedAnswer ?? ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Write derived word..."
            className="w-full rounded-xl border-2 border-primary/40 bg-card px-3.5 py-2 text-sm font-semibold text-foreground
              placeholder:text-muted-foreground/60 transition-all duration-200 shadow-sm
              hover:border-primary
              focus:border-primary focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
              disabled:opacity-50 disabled:cursor-not-allowed"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
