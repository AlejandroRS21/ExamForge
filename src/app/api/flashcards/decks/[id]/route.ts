// OpenSloth — Flashcard Deck Detail API
// GET /api/flashcards/decks/[id] → Deck detail with due cards and session limit
// POST /api/flashcards/decks/[id] → Rate a card (internal endpoint)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDeck, getDueCards, rateCard } from "@/lib/flashcards/service";

const SESSION_CARD_LIMIT = 20;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deck = await getDeck(id, session.user.id);

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Get due cards for the session (limited)
    const dueCards = await getDueCards(id, session.user.id, SESSION_CARD_LIMIT);

    return NextResponse.json({
      deck: {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        cardCount: deck.cardCount,
        dueCount: deck.dueCount,
        lastReviewedAt: deck.lastReviewedAt,
        createdAt: deck.createdAt,
        generatedContentId: deck.generatedContentId,
        examPartId: deck.examPartId,
      },
      sessionCards: dueCards,
      sessionLimit: SESSION_CARD_LIMIT,
    });
  } catch (error) {
    console.error("[flashcards/decks] GET detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cardId, rating } = body;

    if (!cardId || typeof rating !== "number" || rating < 0 || rating > 3) {
      return NextResponse.json(
        { error: "Invalid request: cardId and rating (0-3) required" },
        { status: 400 },
      );
    }

    const updated = await rateCard(cardId, session.user.id, rating as 0 | 1 | 2 | 3);
    // Get updated due cards to check if session is complete
    const remainingCards = await getDueCards(id, session.user.id, SESSION_CARD_LIMIT);

    return NextResponse.json({
      card: {
        id: updated.id,
        easeFactor: updated.easeFactor,
        interval: updated.interval,
        repetitions: updated.repetitions,
        nextReviewAt: updated.nextReviewAt,
      },
      sessionComplete: remainingCards.length === 0,
      remainingCards: remainingCards.length,
    });
  } catch (error) {
    console.error("[flashcards/decks] POST rate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
