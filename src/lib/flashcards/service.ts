// OpenSloth — Flashcard Service
// CRUD + SM-2 spaced repetition algorithm for vocabulary flashcards
//
// SM-2 Algorithm Reference:
//   Rating 0 (Again) → Reset interval/reps, show again today
//   Rating 1 (Hard)  → Reset repetitions, next review tomorrow, 1.2x interval thereafter
//   Rating 2 (Good)  → 2.5x interval multiplier
//   Rating 3 (Easy)  → 3.0x interval multiplier
//   Ease factor floor: 1.3

import prisma from "@/lib/prisma";
import type { Flashcard } from "@/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SM2Result {
  easeFactor: number;
  interval: number;    // in days
  repetitions: number;
  nextReviewAt: Date;
}

export interface DeckSummary {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  dueCount: number;
  lastReviewedAt: Date | null;
  createdAt: Date;
}

export interface DeckDetail extends DeckSummary {
  generatedContentId: string;
  examPartId: string | null;
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    hint: string | null;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewAt: Date | null;
  }>;
}

export interface CardWithProgress {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  isDue: boolean;
}

export interface DeckProgress {
  deckId: string;
  deckTitle: string;
  totalCards: number;
  dueCards: number;
  reviewedCards: number;
  lastReviewedAt: Date | null;
}

export interface CreateDeckInput {
  generatedContentId: string;
  title: string;
  description?: string;
  examPartId?: string;
  createdById: string;
}

export interface CreateCardInput {
  front: string;
  back: string;
  hint?: string;
}

// ─── SM-2 Algorithm ─────────────────────────────────────────────────────────

/**
 * Calculate next review schedule using the SM-2 algorithm.
 *
 * @param rating  Student rating: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
 * @param current Current card SM-2 state
 */
export function calculateSM2(
  rating: 0 | 1 | 2 | 3,
  current: { easeFactor: number; interval: number; repetitions: number },
): SM2Result {
  let { easeFactor, interval, repetitions } = current;

  if (rating < 2) {
    // Again (0) or Hard (1) — reset repetitions
    repetitions = 0;
    interval = rating === 0 ? 0 : 1; // again = today, hard = tomorrow
  } else {
    // Good (2) or Easy (3)
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  }

  // Adjust ease factor based on rating
  if (rating === 3) {
    easeFactor += 0.15;
  } else if (rating === 2) {
    easeFactor += 0; // unchanged
  } else if (rating === 1) {
    easeFactor -= 0.15;
  } else {
    easeFactor -= 0.2;
  }
  easeFactor = Math.max(1.3, easeFactor);

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  nextReviewAt.setHours(0, 0, 0, 0);

  return { easeFactor, interval, repetitions, nextReviewAt };
}

// ─── Admin: Create ──────────────────────────────────────────────────────────

/**
 * Create a new flashcard deck (admin use).
 */
export async function createDeck(data: CreateDeckInput) {
  const deck = await prisma.flashcardDeck.create({
    data: {
      generatedContentId: data.generatedContentId,
      title: data.title,
      description: data.description ?? null,
      examPartId: data.examPartId ?? null,
      createdById: data.createdById,
    },
  });

  return deck;
}

/**
 * Bulk-create flashcards in a deck and update the deck's card count (admin use).
 */
export async function createCards(deckId: string, cards: CreateCardInput[]) {
  const created = await prisma.$transaction(async (tx) => {
    const flashcards = await tx.flashcard.createManyAndReturn({
      data: cards.map((card) => ({
        deckId,
        front: card.front,
        back: card.back,
        hint: card.hint ?? null,
      })),
    });

    // Update deck card count
    await tx.flashcardDeck.update({
      where: { id: deckId },
      data: { cardCount: { increment: cards.length } },
    });

    return flashcards;
  });

  return created;
}

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * List all flashcard decks visible to the user.
 * For now, all decks are visible. The userId parameter is reserved for future
 * per-user filtering (e.g., showing user's own decks + published decks).
 */
export async function listDecks(_userId: string): Promise<DeckSummary[]> {
  const decks = await prisma.flashcardDeck.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      flashcards: {
        select: {
          id: true,
          nextReviewAt: true,
        },
      },
    },
  });

  const now = new Date();

  return decks.map((deck) => {
    const dueCount = deck.flashcards.filter(
      (card) => card.nextReviewAt === null || card.nextReviewAt <= now,
    ).length;

    const lastReviewed = deck.flashcards
      .filter((c) => c.nextReviewAt !== null)
      .sort((a, b) => (b.nextReviewAt!.getTime() - a.nextReviewAt!.getTime()))
      .at(0)?.nextReviewAt ?? null;

    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.cardCount,
      dueCount,
      lastReviewedAt: lastReviewed,
      createdAt: deck.createdAt,
    };
  });
}

/**
 * Get full deck detail including all flashcards.
 * Returns null if the deck doesn't exist or the user shouldn't see it.
 */
export async function getDeck(deckId: string, _userId: string): Promise<DeckDetail | null> {
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deck) return null;

  const now = new Date();
  const dueCount = deck.flashcards.filter(
    (card) => card.nextReviewAt === null || card.nextReviewAt <= now,
  ).length;

  const lastReviewed = deck.flashcards
    .filter((c) => c.nextReviewAt !== null)
    .sort((a, b) => (b.nextReviewAt!.getTime() - a.nextReviewAt!.getTime()))
    .at(0)?.nextReviewAt ?? null;

  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    cardCount: deck.cardCount,
    dueCount,
    lastReviewedAt: lastReviewed,
    createdAt: deck.createdAt,
    generatedContentId: deck.generatedContentId,
    examPartId: deck.examPartId,
    flashcards: deck.flashcards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      hint: card.hint,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      nextReviewAt: card.nextReviewAt,
    })),
  };
}

/**
 * Get cards due for review in a deck, limited to a session count.
 * Cards due first (null nextReviewAt or past due) sorted oldest-first,
 * then cards not yet due (for forward-learning context).
 *
 * @param limit Maximum cards to return per session (default: 20)
 */
export async function getDueCards(
  deckId: string,
  _userId: string,
  limit: number = 20,
): Promise<CardWithProgress[]> {
  const now = new Date();

  // Get due cards sorted most-overdue first
  const dueCards = await prisma.flashcard.findMany({
    where: {
      deckId,
      OR: [
        { nextReviewAt: null },
        { nextReviewAt: { lte: now } },
      ],
    },
    orderBy: [{ nextReviewAt: "asc" }, { createdAt: "asc" }],
    take: limit,
  });

  return dueCards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    hint: card.hint,
    isDue: card.nextReviewAt === null || card.nextReviewAt <= now,
  }));
}

/**
 * Rate a flashcard, updating its SM-2 scheduling fields.
 * The rating determines when this card appears again for review.
 *
 * Note: SM-2 state is stored per-card (shared). In a future phase,
 * per-user progress tracking can be added via a UserFlashcardProgress model.
 */
export async function rateCard(
  cardId: string,
  _userId: string,
  rating: 0 | 1 | 2 | 3,
  now?: Date,
): Promise<Flashcard> {
  const card = await prisma.flashcard.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error(`Flashcard not found: ${cardId}`);
  }

  const result = calculateSM2(rating, {
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
  });

  const updated = await prisma.flashcard.update({
    where: { id: cardId },
    data: {
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReviewAt: result.nextReviewAt,
    },
  });

  return updated;
}

/**
 * Get per-deck progress statistics for a user.
 * For Phase 4, returns aggregate stats across all visible decks.
 */
export async function getUserFlashcardProgress(_userId: string): Promise<DeckProgress[]> {
  const decks = await prisma.flashcardDeck.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      flashcards: {
        select: {
          id: true,
          nextReviewAt: true,
        },
      },
    },
  });

  const now = new Date();

  return decks.map((deck) => {
    const dueCards = deck.flashcards.filter(
      (card) => card.nextReviewAt === null || card.nextReviewAt <= now,
    ).length;

    const reviewedCards = deck.flashcards.filter(
      (card) => card.nextReviewAt !== null,
    ).length;

    const lastReviewed = deck.flashcards
      .filter((c) => c.nextReviewAt !== null)
      .sort((a, b) => (b.nextReviewAt!.getTime() - a.nextReviewAt!.getTime()))
      .at(0)?.nextReviewAt ?? null;

    return {
      deckId: deck.id,
      deckTitle: deck.title,
      totalCards: deck.cardCount,
      dueCards,
      reviewedCards,
      lastReviewedAt: lastReviewed,
    };
  });
}
