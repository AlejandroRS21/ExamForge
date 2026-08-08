// ExamForge — Multiple Choice Question Component (Duolingo Style)
// 2x2 Grid with AnswerTile primitives, roving keyboard focus, and aria-live announcements

"use client";

import React, { useRef, useState, useCallback } from "react";
import { AnswerTile } from "./_shared/AnswerTile";
import { calculateNextIndex } from "./_shared/answer-logic";

interface MultipleChoiceProps {
  questionId: string;
  options: string[] | Record<string, string>;
  selectedAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({
  questionId,
  options,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: MultipleChoiceProps) {
  // Normalize options to array of { value, label } (A, B, C, D)
  const optionEntries: { value: string; label: string }[] = Array.isArray(options)
    ? options.map((opt, i) => ({ value: String.fromCharCode(65 + i), label: opt }))
    : Object.entries(options).map(([key, val]) => ({ value: key, label: val }));

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [announcement, setAnnouncement] = useState<string>("");
  const tilesRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (value: string, label: string) => {
      if (disabled) return;
      onAnswer(questionId, value);
      setAnnouncement(`Option ${value} selected: ${label}`);
    },
    [disabled, onAnswer, questionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    // Number keys 1-4 direct selection
    const numKey = parseInt(e.key, 10);
    if (!isNaN(numKey) && numKey >= 1 && numKey <= optionEntries.length) {
      e.preventDefault();
      const target = optionEntries[numKey - 1];
      setFocusedIndex(numKey - 1);
      tilesRef.current[numKey - 1]?.focus();
      handleSelect(target.value, target.label);
      return;
    }

    // Arrow navigation within 2x2 grid
    if (["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const nextIdx = calculateNextIndex(focusedIndex, optionEntries.length, e.key, 2);
      setFocusedIndex(nextIdx);
      tilesRef.current[nextIdx]?.focus();
    }
  };

  return (
    <div className="space-y-3">
      {/* Live region for screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* 2x2 Interactive Grid */}
      <div
        role="radiogroup"
        aria-label="Multiple choice options"
        onKeyDown={handleKeyDown}
        className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
      >
        {optionEntries.map(({ value, label }, index) => {
          const isSelected = selectedAnswer === value;
          return (
            <AnswerTile
              key={value}
              ref={(el) => {
                tilesRef.current[index] = el;
              }}
              badge={value}
              selected={isSelected}
              disabled={disabled}
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => {
                setFocusedIndex(index);
                handleSelect(value, label);
              }}
              aria-checked={isSelected}
              role="radio"
            >
              {label}
            </AnswerTile>
          );
        })}
      </div>
    </div>
  );
}
