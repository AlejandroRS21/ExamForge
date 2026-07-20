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
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
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
      <div className="rounded-xl border bg-card p-12 text-center space-y-3" role="status">
        <div className="text-4xl" aria-hidden="true">📚</div>
        <h3 className="text-lg font-semibold">No flashcard decks yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          No flashcard decks yet &mdash; ask your teacher to generate some!
        </p>
      </div>
    );
  }

  // Deck list
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Flashcard decks">
      {decks.map((deck) => (
        <Link
          key={deck.id}
          href={`/flashcards/decks/${deck.id}`}
          className="rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          role="listitem"
          aria-label={`${deck.title} — ${deck.cardCount} cards, ${deck.dueCount} due`}
        >
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {deck.title}
            </h3>

            {/* Description */}
            {deck.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {deck.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
              </span>
              {deck.dueCount > 0 && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {deck.dueCount} due
                </span>
              )}
              {deck.dueCount === 0 && deck.cardCount > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  All reviewed
                </span>
              )}
            </div>

            {/* Last reviewed */}
            {deck.lastReviewedAt && (
              <p className="text-[10px] text-muted-foreground/60">
                Last reviewed: {formatLastReviewed(deck.lastReviewedAt)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
