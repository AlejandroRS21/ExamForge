// OpenSloth — Multiple Matching Component (Duolingo Style)
// Unordered set selection for MM questions (Parts 6 & 7)
// Uses AnswerTile primitives, pure answer-logic helpers, and useFlip animations

"use client";

import React, { useRef, useLayoutEffect } from "react";
import { AnswerTile } from "./_shared/AnswerTile";
import { useFlip } from "./_shared/useFlip";
import { toggleMatch, clearMatch } from "./_shared/answer-logic";

interface MatchOption {
  id: string;
  label: string;
}

interface MatchItem {
  id: string;
  text: string;
}

interface MatchItemsProps {
  questionId: string;
  items: MatchItem[];
  options: MatchOption[];
  selectedAnswer: Record<string, string> | null;
  onAnswer: (questionId: string, answer: Record<string, string>) => void;
  disabled?: boolean;
}

export function MatchItems({
  questionId,
  items,
  options,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: MatchItemsProps) {
  const currentMatches = selectedAnswer ?? {};
  const { register, play } = useFlip();
  const elementsRef = useRef<Map<string, HTMLElement | null>>(new Map());

  useLayoutEffect(() => {
    play(elementsRef.current);
  });

  const handleMatch = (itemId: string, optionId: string) => {
    if (disabled) return;
    const updated = toggleMatch(currentMatches, itemId, optionId);
    onAnswer(questionId, updated);
  };

  const handleClear = (itemId: string) => {
    if (disabled) return;
    const updated = clearMatch(currentMatches, itemId);
    onAnswer(questionId, updated);
  };

  return (
    <div className="space-y-6">
      {/* Options legend */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1 text-xs font-medium"
          >
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
              {opt.id}
            </span>
            {opt.label}
          </span>
        ))}
      </div>

      {/* Items to match */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm"
          >
            <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const isSelected = currentMatches[item.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    ref={(el) => {
                      register(`match-${item.id}-${opt.id}`, el);
                      if (el) elementsRef.current.set(`match-${item.id}-${opt.id}`, el);
                      else elementsRef.current.delete(`match-${item.id}-${opt.id}`);
                    }}
                  >
                    <AnswerTile
                      badge={opt.id}
                      selected={isSelected}
                      disabled={disabled}
                      onClick={() => handleMatch(item.id, opt.id)}
                      className="py-1.5 px-3 text-xs"
                    >
                      {opt.label}
                    </AnswerTile>
                  </div>
                );
              })}
              {currentMatches[item.id] && (
                <button
                  type="button"
                  onClick={() => handleClear(item.id)}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
