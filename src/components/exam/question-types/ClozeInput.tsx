// ExamForge — Open Cloze Input Component (Duolingo Style)
// Modern "blank-as-box" text input for Cloze questions (Part 2) with micro-guidance

"use client";

import React, { useState } from "react";

interface ClozeInputProps {
  questionId: string;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export function ClozeInput({
  questionId,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: ClozeInputProps) {
  const [announcement, setAnnouncement] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onAnswer(questionId, val);
    if (val.trim()) {
      setAnnouncement(`Answer updated to ${val}`);
    }
  };

  return (
    <div className="space-y-2 inline-block">
      {/* Live region for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Type missing word (grammar / preposition / article):
        </span>
        <div className="relative min-w-[200px] max-w-sm">
          <label htmlFor={`cloze-${questionId}`} className="sr-only">
            Fill in the missing word
          </label>
          <input
            id={`cloze-${questionId}`}
            type="text"
            value={selectedAnswer ?? ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Type word..."
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
