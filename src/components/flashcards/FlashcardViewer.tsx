// OpenSloth — FlashcardViewer Component
// Flip animation, rating buttons (Again/Hard/Good/Easy), keyboard shortcuts
// Tracks current card index, session progress, and handles rating submission

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AwardIcon, StarIcon } from "@/components/ui/icons/SlothIcons";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
  isDue?: boolean;
}

interface FlashcardViewerProps {
  deckId?: string;
  cards: FlashcardData[];
  onSessionComplete?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FlashcardViewer({ deckId, cards, onSessionComplete }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;
  const totalCards = cards.length;

  // Focus card container on mount and card change
  useEffect(() => {
    cardRef.current?.focus();
  }, [currentIndex]);

  // ─── Keyboard shortcuts ───────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!sessionComplete && !submitting) {
            setIsFlipped((prev) => !prev);
          }
          break;
        case "1":
          if (isFlipped && !sessionComplete) {
            handleRate(0);
          }
          break;
        case "2":
          if (isFlipped && !sessionComplete) {
            handleRate(1);
          }
          break;
        case "3":
          if (isFlipped && !sessionComplete) {
            handleRate(2);
          }
          break;
        case "4":
          if (isFlipped && !sessionComplete) {
            handleRate(3);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, sessionComplete, submitting, currentIndex, currentCard]);

  // ─── Rate a card ──────────────────────────────────────────────

  const handleRate = useCallback(
    async (rating: 0 | 1 | 2 | 3) => {
      if (!currentCard || submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        // API-backed mode: submit rating to server
        if (deckId) {
          const res = await fetch(`/api/flashcards/decks/${deckId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cardId: currentCard.id, rating }),
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error ?? "Failed to submit rating");
            return;
          }

          setRatings((prev) => ({ ...prev, [currentCard.id]: rating }));

          if (data.sessionComplete) {
            setSessionComplete(true);
            onSessionComplete?.();
            return;
          }
        } else {
          // Local-only mode: track rating in state
          setRatings((prev) => ({ ...prev, [currentCard.id]: rating }));
        }

        // Advance to next card or complete
        if (isLastCard) {
          setSessionComplete(true);
          onSessionComplete?.();
        } else {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      } catch {
        setError("Network error — please try again");
      } finally {
        setSubmitting(false);
      }
    },
    [currentCard, submitting, deckId, isLastCard, onSessionComplete],
  );

  // ─── Session Complete Screen ──────────────────────────────────

  if (sessionComplete) {
    const totalRated = Object.keys(ratings).length;
    const againCount = Object.values(ratings).filter((r) => r === 0).length;
    const hardCount = Object.values(ratings).filter((r) => r === 1).length;
    const goodCount = Object.values(ratings).filter((r) => r === 2).length;
    const easyCount = Object.values(ratings).filter((r) => r === 3).length;

    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-6" role="status" aria-label="Session complete">
        <div className="space-y-2">
          <AwardIcon className="w-12 h-12 mx-auto" color="#FFB703" aria-hidden="true" />
          <h2 className="text-2xl font-bold">¡Sesión completada!</h2>
          <p className="text-sm text-muted-foreground">
            Has repasado {totalRated} tarjeta{totalRated !== 1 ? "s" : ""} en esta sesión.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          <div className="rounded-lg bg-error-surface p-3">
            <div className="text-lg font-bold text-error">{againCount}</div>
            <div className="text-[10px] text-error/70">Otra vez</div>
          </div>
          <div className="rounded-lg bg-warning-surface p-3">
            <div className="text-lg font-bold text-warning">{hardCount}</div>
            <div className="text-[10px] text-warning/70">Difícil</div>
          </div>
          <div className="rounded-lg bg-success-surface p-3">
            <div className="text-lg font-bold text-success">{goodCount}</div>
            <div className="text-[10px] text-success/70">Normal</div>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{easyCount}</div>
            <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70">Fácil</div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setRatings({});
              setSessionComplete(false);
              setError(null);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            type="button"
          >
            Nueva sesión
          </button>
        </div>
      </div>
    );
  }

  // ─── No Cards State ───────────────────────────────────────────

  if (!currentCard) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          ¡Sin tarjetas pendientes! Vuelve más tarde.
        </p>
      </div>
    );
  }

  // ─── Card View ────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Tarjeta {currentIndex + 1} de {totalCards}
        </span>
        <span className="text-xs">
          {Object.keys(ratings).length} valoradas
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={0} aria-valuemax={totalCards}>
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-error-surface border border-error-border px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Flashcard */}
      <div
        ref={cardRef}
        tabIndex={0}
        role="button"
        aria-label={isFlipped ? "Tarjeta mostrando la respuesta. Pulsa Espacio para girar." : "Tarjeta mostrando el término. Pulsa Espacio para ver la respuesta."}
        className="relative cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        onClick={() => !submitting && setIsFlipped((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!submitting && !sessionComplete) {
              setIsFlipped((prev) => !prev);
            }
          }
        }}
      >
        <div
          className={`relative min-h-[280px] w-full rounded-xl border bg-card p-8 transition-transform duration-300 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden ${
              isFlipped ? "invisible" : "visible"
            }`}
          >
            <p className="text-center text-xl font-semibold leading-relaxed break-words max-w-lg">
              {currentCard.front}
            </p>
            {!isFlipped && (
              <p className="mt-6 text-xs text-muted-foreground/60">
                Haz clic o pulsa Espacio para ver la respuesta
              </p>
            )}
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 ${
              isFlipped ? "visible" : "invisible"
            }`}
          >
            <p className="text-center text-xl leading-relaxed break-words max-w-lg">
              {currentCard.back}
            </p>
            {currentCard.hint && (
              <p className="mt-4 text-sm text-muted-foreground italic">
                <StarIcon className="w-4 h-4 inline mr-1 -mt-0.5" color="#FFB703" aria-hidden="true" />
                {currentCard.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons — visible only after flip */}
      {isFlipped && (
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">
            ¿Cómo de bien sabías esta tarjeta? (Pulsa 1-4)
          </p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleRate(0)}
              disabled={submitting}
              className="rounded-lg bg-error px-3 py-3 text-sm font-medium text-error-foreground shadow-[0_4px_0_0_#B91C1C] active:translate-y-1 active:shadow-none hover:bg-error/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
              aria-label="Otra vez — la tarjeta volverá a salir hoy"
              type="button"
            >
              <div className="text-lg font-bold">1</div>
              <div className="text-[10px] opacity-90">Otra vez</div>
            </button>
            <button
              onClick={() => handleRate(1)}
              disabled={submitting}
              className="rounded-lg bg-warning px-3 py-3 text-sm font-medium text-warning-foreground shadow-[0_4px_0_0_#B45309] active:translate-y-1 active:shadow-none hover:bg-warning/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
              aria-label="Difícil — la tarjeta volverá a salir mañana"
              type="button"
            >
              <div className="text-lg font-bold">2</div>
              <div className="text-[10px] opacity-90">Difícil</div>
            </button>
            <button
              onClick={() => handleRate(2)}
              disabled={submitting}
              className="rounded-lg bg-success px-3 py-3 text-sm font-medium text-success-foreground shadow-[0_4px_0_0_#15803D] active:translate-y-1 active:shadow-none hover:bg-success/90 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success"
              aria-label="Normal — la tarjeta se repasará en 1-3 días"
              type="button"
            >
              <div className="text-lg font-bold">3</div>
              <div className="text-[10px] opacity-90">Normal</div>
            </button>
            <button
              onClick={() => handleRate(3)}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-3 py-3 text-sm font-medium text-white shadow-[0_4px_0_0_#1D4ED8] active:translate-y-1 active:shadow-none hover:bg-blue-700 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Fácil — la tarjeta se repasará en un intervalo más largo"
              type="button"
            >
              <div className="text-lg font-bold">4</div>
              <div className="text-[10px] opacity-90">Fácil</div>
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/50">
        <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">Espacio</kbd> Girar</span>
        <span><kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">1</kbd>–<kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">4</kbd> Valorar</span>
      </div>
    </div>
  );
}
