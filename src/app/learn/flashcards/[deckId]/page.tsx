// ExamForge — Flashcard Deck Student Page
// Server component: fetches FlashcardDeck with cards, renders FlashcardReview

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FlashcardViewer } from "@/components/flashcards/FlashcardViewer";

interface FlashcardPageProps {
  params: Promise<{ deckId: string }>;
}

async function FlashcardContent({ deckId }: { deckId: string }) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/learn/flashcards/${deckId}`);
  }

  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deck) {
    notFound();
  }

  if (deck.flashcards.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No flashcards available in this deck.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const cardsData = deck.flashcards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{deck.title}</h1>
        {deck.description && (
          <p className="text-sm text-muted-foreground mt-1">{deck.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
        </p>
      </div>

      <FlashcardViewer cards={cardsData} />
    </div>
  );
}

function FlashcardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading flashcards">
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/60" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted/60" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="relative min-h-[280px] w-full rounded-xl border bg-card p-8">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted/60" />
        </div>
      </div>
      <span className="sr-only">Loading flashcard deck...</span>
    </div>
  );
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
  const { deckId } = await params;

  return (
    <>
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

      <Suspense fallback={<FlashcardSkeleton />}>
        <FlashcardContent deckId={deckId} />
      </Suspense>
    </>
  );
}
