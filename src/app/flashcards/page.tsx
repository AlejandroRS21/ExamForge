// ExamForge — Flashcards Home Page
// Server component: auth guard + fetch decks, render FlashcardDeckList
// Wraps content in Suspense boundary and ErrorBoundary with Sloth theme

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FlashcardDeckList } from "@/components/flashcards/FlashcardDeckList";
import { ErrorBoundary } from "@/components/exercises/ErrorBoundary";
import SlothPageHeader from "@/components/ui/SlothPageHeader";

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

  const formattedDecks = decks.map((deck) => {
    const dueCount = deck.flashcards.filter(
      (card) => card.nextReviewAt && card.nextReviewAt <= now
    ).length;

    return {
      id: deck.id,
      title: deck.title,
      description: deck.description,
      cardCount: deck.flashcards.length,
      dueCount,
      lastReviewedAt: null,
      createdAt: deck.createdAt.toISOString(),
    };
  });

  return <FlashcardDeckList decks={formattedDecks} />;
}

function FlashcardsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 rounded-3xl bg-white/70 border-2 border-[#F0E8DD]"
        />
      ))}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2B1E19] font-sans p-6 md:p-10 space-y-8">
      {/* Header */}
      <SlothPageHeader
        badge="Cambridge B2 · Vocabulario"
        title="Flashcards & Phrasal Verbs"
        subtitle="Repetición espaciada inteligente para dominar el vocabulario de Cambridge B2."
        pose="studying"
        mascotSize={120}
        backHref="/dashboard"
        backLabel="Volver al Dashboard"
      />

      {/* Main deck content */}
      <ErrorBoundary>
        <Suspense fallback={<FlashcardsLoadingSkeleton />}>
          <FlashcardsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
