// ExamForge — Flashcards Home Page
// Server component: auth guard + fetch decks, render FlashcardDeckList
// Wraps content in Suspense boundary and ErrorBoundary with Sloth theme

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FlashcardDeckList } from "@/components/flashcards/FlashcardDeckList";
import { ErrorBoundary } from "@/components/exercises/ErrorBoundary";
import { SlothMascot } from "@/components/ui/SlothMascot";

async function FlashcardsContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/flashcards");
  }

  const decks = await prisma.flashcardDeck.findMany({
    where: { createdById: session.user.id },
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

    // Use the most recent past nextReviewAt as proxy for last review time
    const pastReviews = deck.flashcards
      .filter((c) => c.nextReviewAt !== null && c.nextReviewAt <= now)
      .sort((a, b) => b.nextReviewAt!.getTime() - a.nextReviewAt!.getTime());
    const lastReviewed = pastReviews.at(0)?.nextReviewAt ?? null;

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

  return <FlashcardDeckList decks={decksData} />;
}

export default async function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Warm Header Nav */}
      <header className="border-b-2 border-amber-200/80 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-5xl">
          <Link
            href="/dashboard"
            className="text-base font-extrabold tracking-tight text-amber-950 hover:text-[#FF6B35] transition-colors"
          >
            ExamForge 🦥
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/exams"
              className="text-sm font-semibold text-amber-900/80 hover:text-amber-950 transition-colors"
            >
              Exámenes
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-amber-900/80 hover:text-amber-950 transition-colors"
            >
              Panel Principal
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Hero */}
        <div className="mb-8 bg-white p-6 md:p-8 rounded-3xl border-2 border-amber-200/80 shadow-[0_6px_0_0_#FDE68A] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-amber-800/80 hover:text-amber-950 transition-colors inline-flex items-center gap-1 mb-1"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver al Panel Principal
            </Link>
            <h1 className="text-3xl font-extrabold text-amber-950">
              Tarjetas de Memoria (Flashcards)
            </h1>
            <p className="text-sm md:text-base font-medium text-amber-800/80 max-w-lg">
              Repasa tu vocabulario B2 con repetición espaciada y afianza tus palabras clave cada día.
            </p>
          </div>
          <SlothMascot pose="studying" size={130} className="shrink-0" />
        </div>

        {/* Deck list with ErrorBoundary and Suspense */}
        <ErrorBoundary>
          <Suspense fallback={<FlashcardDeckList decks={[]} loading={true} />}>
            <FlashcardsContent />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
