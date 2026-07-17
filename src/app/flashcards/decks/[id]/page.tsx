// ExamForge — Flashcard Deck Review Page
// Server component: auth guard, fetch deck + due cards, render FlashcardViewer

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FlashcardViewer } from "@/components/flashcards/FlashcardViewer";

const SESSION_CARD_LIMIT = 20;

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardDeckPage({ params }: DeckPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/flashcards/decks/${id}`);
  }

  // Fetch deck
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id },
    include: {
      flashcards: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  // Get due cards only (limited session)
  const now = new Date();
  const dueCards = deck.flashcards
    .filter((card) => card.nextReviewAt === null || card.nextReviewAt <= now)
    .slice(0, SESSION_CARD_LIMIT);

  const cardsData = dueCards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    hint: card.hint,
    isDue: card.nextReviewAt === null || card.nextReviewAt <= now,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Nav bar */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold tracking-tight hover:text-primary transition-colors"
          >
            ExamForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/exams"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Exams
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/flashcards"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Flashcards
          </Link>
        </div>

        {/* Deck info */}
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          {deck.description && (
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
            &nbsp;&bull;&nbsp;
            {dueCards.length} due for review
            {dueCards.length > SESSION_CARD_LIMIT && (
              <span> (showing first {SESSION_CARD_LIMIT})</span>
            )}
          </p>
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer deckId={id} cards={cardsData} />
      </main>
    </div>
  );
}
