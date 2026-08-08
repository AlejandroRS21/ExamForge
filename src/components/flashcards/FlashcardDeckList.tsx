// ExamForge — FlashcardDeckList Component
// Grid of deck cards showing title, description, card count, due count, last reviewed
// Skeleton loading state and empty state included

"use client";

import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DeckData {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  dueCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
}

interface FlashcardDeckListProps {
  decks: DeckData[];
  loading?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatLastReviewed(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString();
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DeckCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3 animate-pulse" aria-hidden="true">
      <div className="h-5 w-3/4 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted/60" />
      <div className="flex items-center gap-4 pt-2">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FlashcardDeckList({ decks, loading = false }: FlashcardDeckListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading decks">
        {Array.from({ length: 6 }).map((_, i) => (
          <DeckCardSkeleton key={i} />
        ))}
        <span className="sr-only">Loading flashcard decks...</span>
      </div>
    );
  }

  // Empty state
  if (decks.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-12 text-center space-y-4 shadow-[0_6px_0_0_#FDE68A]" role="status">
        <div className="text-5xl" aria-hidden="true">📚</div>
        <h3 className="text-xl font-bold text-amber-950">Aún no tienes mazos de tarjetas</h3>
        <p className="text-sm font-medium text-amber-800/80 max-w-sm mx-auto">
          No hay mazos de vocabulario asignados. ¡Pide a tu profesor o genera tus primeros ejercicios en el panel!
        </p>
      </div>
    );
  }

  // Deck list
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Flashcard decks">
      {decks.map((deck) => (
        <Link
          key={deck.id}
          href={`/flashcards/decks/${deck.id}`}
          className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 hover:border-amber-300 shadow-[0_4px_0_0_#FDE68A] hover:shadow-[0_6px_0_0_#FDE68A] hover:-translate-y-0.5 transition-all group flex flex-col justify-between focus-visible:outline-none"
          role="listitem"
          aria-label={`${deck.title} — ${deck.cardCount} tarjetas, ${deck.dueCount} pendientes`}
        >
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-extrabold text-lg text-amber-950 leading-snug group-hover:text-[#FF6B35] transition-colors line-clamp-2">
              {deck.title}
            </h3>

            {/* Description */}
            {deck.description && (
              <p className="text-xs font-medium text-amber-800/70 line-clamp-2 leading-relaxed">
                {deck.description}
              </p>
            )}
          </div>

          <div className="pt-4 mt-3 border-t border-amber-100 space-y-2">
            {/* Stats */}
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-amber-900">
                <svg className="h-4 w-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                </svg>
                {deck.cardCount} tarjeta{deck.cardCount !== 1 ? "s" : ""}
              </span>
              {deck.dueCount > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-300 text-[#FF6B35] font-extrabold">
                  {deck.dueCount} pendientes
                </span>
              )}
              {deck.dueCount === 0 && deck.cardCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  ✓ Al día
                </span>
              )}
            </div>

            {/* Last reviewed */}
            {deck.lastReviewedAt && (
              <p className="text-[11px] font-semibold text-amber-800/60">
                Último repaso: {formatLastReviewed(deck.lastReviewedAt)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
