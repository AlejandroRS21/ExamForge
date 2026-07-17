// ExamForge — Flashcards Home Page
// Server component: auth guard + fetch decks, render FlashcardDeckList

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FlashcardDeckList } from "@/components/flashcards/FlashcardDeckList";

export default async function FlashcardsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/flashcards");
  }

  // Fetch decks with card counts and due info
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

  const decksData = decks.map((deck) => {
    const dueCount = deck.flashcards.filter(
      (card) => card.nextReviewAt === null || card.nextReviewAt <= now,
    ).length;

    const lastReviewed = deck.flashcards
      .filter((c) => c.nextReviewAt !== null)
      .sort((a, b) => b.nextReviewAt!.getTime() - a.nextReviewAt!.getTime())
      .at(0)?.nextReviewAt ?? null;

    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.cardCount,
      dueCount,
      lastReviewedAt: lastReviewed?.toISOString() ?? null,
      createdAt: deck.createdAt.toISOString(),
    };
  });

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
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">
            Review vocabulary flashcards with spaced repetition
          </p>
        </div>

        {/* Deck list */}
        <FlashcardDeckList decks={decksData} />
      </main>
    </div>
  );
}
