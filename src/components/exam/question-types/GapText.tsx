// OpenSloth — Gapped Text Component (Duolingo Style)
// Ordered sequence matching for GT questions (Part 5)
// Uses AnswerTile primitives, pure answer-logic helpers, and useFlip animations

"use client";

import React, { useRef, useLayoutEffect } from "react";
import { AnswerTile } from "./_shared/AnswerTile";
import { useFlip } from "./_shared/useFlip";
import {
  placeGapItem,
  removeGapItem,
  moveGapItemUp,
  moveGapItemDown,
} from "./_shared/answer-logic";

interface GapItem {
  id: string;
  text: string;
}

interface GapTextProps {
  questionId: string;
  items: GapItem[];
  selectedAnswer: string[] | null;
  onAnswer: (questionId: string, answer: string[]) => void;
  disabled?: boolean;
}

export function GapText({
  questionId,
  items,
  selectedAnswer,
  onAnswer,
  disabled = false,
}: GapTextProps) {
  const placedIds = selectedAnswer ?? [];
  const available = items.filter((item) => !placedIds.includes(item.id));
  const placed = placedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as GapItem[];

  const { register, play } = useFlip();
  const elementsRef = useRef<Map<string, HTMLElement | null>>(new Map());

  useLayoutEffect(() => {
    play(elementsRef.current);
  });

  const handlePlace = (itemId: string) => {
    if (disabled) return;
    const nextOrder = placeGapItem(placedIds, itemId);
    onAnswer(questionId, nextOrder);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    const nextOrder = removeGapItem(placedIds, index);
    onAnswer(questionId, nextOrder);
  };

  const handleUp = (index: number) => {
    if (disabled || index === 0) return;
    const nextOrder = moveGapItemUp(placedIds, index);
    onAnswer(questionId, nextOrder);
  };

  const handleDown = (index: number) => {
    if (disabled || index >= placedIds.length - 1) return;
    const nextOrder = moveGapItemDown(placedIds, index);
    onAnswer(questionId, nextOrder);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Available items */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Available Sentences
        </h4>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">All sentences placed.</p>
        ) : (
          <div className="space-y-2.5">
            {available.map((item) => (
              <div
                key={item.id}
                ref={(el) => {
                  register(`avail-${item.id}`, el);
                  if (el) elementsRef.current.set(`avail-${item.id}`, el);
                  else elementsRef.current.delete(`avail-${item.id}`);
                }}
              >
                <AnswerTile
                  disabled={disabled}
                  onClick={() => handlePlace(item.id)}
                  className="w-full text-left"
                >
                  {item.text}
                </AnswerTile>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ordered placement */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Your Order
        </h4>
        {placed.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Click sentences from the left to build your order.
          </p>
        ) : (
          <div className="space-y-2.5">
            {placed.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  register(`placed-${item.id}`, el);
                  if (el) elementsRef.current.set(`placed-${item.id}`, el);
                  else elementsRef.current.delete(`placed-${item.id}`);
                }}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm"
              >
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 text-sm leading-relaxed text-foreground">{item.text}</div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUp(index)}
                    disabled={disabled || index === 0}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                    title="Move up"
                    aria-label={`Move sentence ${index + 1} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDown(index)}
                    disabled={disabled || index >= placed.length - 1}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                    title="Move down"
                    aria-label={`Move sentence ${index + 1} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive disabled:opacity-30 transition-colors"
                    title="Remove"
                    aria-label={`Remove sentence ${index + 1}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
