// ExamForge — FlashcardSm2Review (client)
// SM-2 spaced repetition review session for /learn/flashcards/[deckId].
// Neuroinclusive: warm #FAF6F0 cards, 3D tactile rating buttons
// (Otra vez / Difícil / Normal / Fácil), SVG icons only — zero raw emojis.
//
// SM-2 source of truth: `reviewCardSM2` from @/lib/flashcards/sm2 renders the
// schedule preview BEFORE the student commits; the chosen rating persists
// through the existing POST /api/flashcards/decks/[deckId] (numeric mapping,
// identical algorithm) so the preview matches what the server stores.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  reviewCardSM2,
  sm2RatingToNumeric,
  type SM2CardState,
  type SM2Rating,
  type SM2ReviewResult,
} from "@/lib/flashcards/sm2";
import { SlothMascot } from "@/components/ui/SlothMascot";
import { BookIcon, ClockIcon } from "@/components/ui/icons/SlothIcons";

export interface Sm2ReviewCard {
  id: string;
  front: string;
  back: string;
  hint?: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

interface FlashcardSm2ReviewProps {
  deckId: string;
  deckTitle: string;
  cards: Sm2ReviewCard[];
}

const RATING_ORDER: SM2Rating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

const RATING_BUTTON: Record<
  SM2Rating,
  { label: string; hint: string; klass: string; aria: string }
> = {
  AGAIN: {
    label: "Otra vez",
    hint: "Hoy",
    klass:
      "bg-[#D9534F] text-white shadow-[0_4px_0_0_#A73B38] hover:brightness-105",
    aria: "Otra vez: la tarjeta volverá a salir hoy",
  },
  HARD: {
    label: "Difícil",
    hint: "1.2x",
    klass:
      "bg-[#FFB703] text-[#2B1E19] shadow-[0_4px_0_0_#D99A00] hover:brightness-105",
    aria: "Difícil: intervalo corto hasta la próxima revisión",
  },
  GOOD: {
    label: "Normal",
    hint: "2.5x",
    klass:
      "bg-[#46A872] text-white shadow-[0_4px_0_0_#2F7A4F] hover:brightness-105",
    aria: "Normal: intervalo estándar hasta la próxima revisión",
  },
  EASY: {
    label: "Fácil",
    hint: "3.0x",
    klass:
      "bg-[#5B8DEF] text-white shadow-[0_4px_0_0_#3B66C4] hover:brightness-105",
    aria: "Fácil: intervalo largo hasta la próxima revisión",
  },
};

function formatInterval(interval: number): string {
  if (interval <= 0) return "hoy";
  if (interval === 1) return "mañana";
  return `en ${interval} días`;
}

function sm2State(card: Sm2ReviewCard): SM2CardState {
  return {
    id: card.id,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
  };
}

export function FlashcardSm2Review({
  deckId,
  deckTitle,
  cards,
}: FlashcardSm2ReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Partial<Record<string, SM2Rating>>>({});
  const [results, setResults] = useState<Partial<Record<string, SM2ReviewResult>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex >= cards.length - 1;
  const totalCards = cards.length;

  useEffect(() => {
    cardRef.current?.focus();
  }, [currentIndex]);

  const handleRate = useCallback(
    async (rating: SM2Rating) => {
      if (!currentCard || submitting) return;

      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch(`/api/flashcards/decks/${deckId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId: currentCard.id,
            rating: sm2RatingToNumeric(rating),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "No se pudo guardar la valoración");
          return;
        }

        setRatings((prev) => ({ ...prev, [currentCard.id]: rating }));
        // Trust the server-persisted schedule (same algorithm, authoritative).
        setResults((prev) => ({
          ...prev,
          [currentCard.id]: {
            cardId: currentCard.id,
            rating,
            newEaseFactor: data.card.easeFactor,
            newInterval: data.card.interval,
            newRepetitions: data.card.repetitions,
            nextReviewAt: new Date(data.card.nextReviewAt),
          } satisfies SM2ReviewResult,
        }));

        if (data.sessionComplete) {
          setSessionComplete(true);
          return;
        }
      } catch {
        setError("Error de red: inténtalo de nuevo");
        return;
      } finally {
        setSubmitting(false);
      }

      if (isLastCard) {
        setSessionComplete(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      }
    },
    [currentCard, submitting, deckId, isLastCard],
  );

  // ─── Keyboard shortcuts (Space flips, 1-4 rate when flipped) ────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        if (!sessionComplete && !submitting) setIsFlipped((prev) => !prev);
        return;
      }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0 && isFlipped && !sessionComplete) {
        void handleRate(RATING_ORDER[idx]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, sessionComplete, submitting, handleRate]);

  // ─── Session complete ────────────────────────────────────────────────────
  if (sessionComplete) {
    const rated = Object.keys(ratings).length;
    const countFor = (r: SM2Rating) =>
      Object.values(ratings).filter((v) => v === r).length;
    const againCount = countFor("AGAIN");
    const hardCount = countFor("HARD");
    const goodCount = countFor("GOOD");
    const easyCount = countFor("EASY");

    const nextDates = Object.values(results).map((r) => r!.nextReviewAt.getTime());
    const earliestNext =
      nextDates.length > 0 ? new Date(Math.min(...nextDates)) : null;

    return (
      <div
        className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-8 text-center space-y-6 shadow-[0_6px_0_0_#FDE68A]"
        role="status"
        aria-label="Sesión de repaso completada"
      >
        <SlothMascot pose="cheering" size={140} className="mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-amber-950">
            Sesión completada
          </h2>
          <p className="text-sm font-medium text-amber-800/80">
            Repasaste {rated} tarjeta{rated !== 1 ? "s" : ""} de {deckTitle}.
            El repaso espaciado programa cada tarjeta según tu memoria.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
          {(
            [
              [againCount, "Otra vez", "text-[#A73B38] bg-[#FBE3E2]"],
              [hardCount, "Difícil", "text-[#D99A00] bg-[#FFF3D6]"],
              [goodCount, "Normal", "text-[#2F7A4F] bg-[#E4F3EA]"],
              [easyCount, "Fácil", "text-[#3B66C4] bg-[#E7EEFC]"],
            ] as const
          ).map(([count, label, klass]) => (
            <div key={label} className={`rounded-xl p-3 ${klass}`}>
              <div className="text-lg font-extrabold">{count}</div>
              <div className="text-[10px] font-bold opacity-80">{label}</div>
            </div>
          ))}
        </div>

        {earliestNext && (
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-1.5 text-xs font-bold text-amber-900">
            <ClockIcon className="h-4 w-4" color="#FF6B35" />
            Próxima tarjeta pendiente: {formatInterval(
              Math.max(0, Math.round((earliestNext.getTime() - Date.now()) / 86400000)),
            )}
          </p>
        )}

        <div className="pt-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setRatings({});
              setResults({});
              setSessionComplete(false);
              setError(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-8 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_0_var(--btn-shadow-primary)] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
            type="button"
          >
            <BookIcon className="h-4 w-4" color="#FFFFFF" />
            Nueva sesión
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-8 text-center space-y-4 shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={120} className="mx-auto" />
        <p className="text-sm font-medium text-amber-800/80">
          No hay tarjetas pendientes de repaso. Vuelve más tarde.
        </p>
      </div>
    );
  }

  const currentState = sm2State(currentCard);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm font-medium text-amber-900">
        <span>
          Tarjeta {currentIndex + 1} de {totalCards}
        </span>
        <span className="text-xs opacity-70">
          {Object.keys(ratings).length} valoradas
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full border border-amber-200 bg-white"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={0}
        aria-valuemax={totalCards}
      >
        <div
          className="h-full rounded-full bg-[#FF6B35] transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-[#E8B4B0] bg-[#FBE3E2] px-4 py-3 text-sm font-medium text-[#A73B38]">
          {error}
        </div>
      )}

      {/* Card */}
      <div
        ref={cardRef}
        tabIndex={0}
        role="button"
        aria-label={
          isFlipped
            ? "Tarjeta mostrando la respuesta. Pulsa Espacio para girar de nuevo."
            : "Tarjeta mostrando el término. Pulsa Espacio para ver la respuesta."
        }
        className="relative cursor-pointer rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
        onClick={() => !submitting && setIsFlipped((prev) => !prev)}
      >
        <div
          className={`relative min-h-[280px] w-full rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-8 shadow-[0_6px_0_0_#FDE68A] transition-transform duration-300 preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden ${
              isFlipped ? "invisible" : "visible"
            }`}
          >
            <p className="max-w-lg break-words text-center text-xl font-bold leading-relaxed text-amber-950">
              {currentCard.front}
            </p>
            {!isFlipped && (
              <p className="mt-6 text-xs font-medium text-amber-800/60">
                Haz clic o pulsa Espacio para ver la respuesta
              </p>
            )}
          </div>
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 ${
              isFlipped ? "visible" : "invisible"
            }`}
          >
            <p className="max-w-lg break-words text-center text-xl leading-relaxed text-amber-950">
              {currentCard.back}
            </p>
            {currentCard.hint && (
              <p className="mt-4 text-sm italic text-amber-800/70">
                Pista: {currentCard.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons + SM-2 schedule preview */}
      {isFlipped && (
        <div className="space-y-3">
          <p className="text-center text-xs font-bold text-amber-800/70">
            ¿Cómo de bien sabías esta tarjeta? (Pulsa 1-4)
          </p>
          <div className="grid grid-cols-4 gap-3">
            {RATING_ORDER.map((rating, index) => {
              const cfg = RATING_BUTTON[rating];
              const preview = reviewCardSM2(currentState, rating);
              return (
                <button
                  key={rating}
                  onClick={() => void handleRate(rating)}
                  disabled={submitting}
                  className={`rounded-2xl px-3 py-3 text-sm font-bold transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] ${cfg.klass}`}
                  aria-label={`${cfg.aria}. Volverá ${formatInterval(preview.newInterval)}.`}
                  type="button"
                >
                  <div className="text-lg font-extrabold">{index + 1}</div>
                  <div className="text-[11px] opacity-95">{cfg.label}</div>
                  <div className="mt-1 rounded-lg bg-black/10 px-1.5 py-0.5 text-[10px] opacity-90">
                    vuelve {formatInterval(preview.newInterval)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 text-[10px] font-medium text-amber-800/50">
        <span className="rounded border border-amber-200 bg-white px-1 py-0.5 font-mono">
          Espacio
        </span>
        Girar
        <span className="rounded border border-amber-200 bg-white px-1 py-0.5 font-mono">
          1-4
        </span>
        Valorar
      </div>
    </div>
  );
}