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
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-[#F0E8DD] rounded-3xl p-6 shadow-[0_4px_0_#F0E8DD]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E6FF] shadow-[0_3px_0_#D3B3FF]">
            <SlothMascot size={56} pose="studying" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#2B1E19]">
              Flashcards & Phrasal Verbs
            </h1>
            <p className="text-sm font-bold text-[#6B5E57]">
              Repetición espaciada inteligente para dominar el vocabulario de Cambridge B2.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="rounded-2xl border-2 border-[#F0E8DD] bg-[#FAF6F0] px-5 py-3 text-sm font-black text-[#2B1E19] hover:bg-[#FFE8D6] transition-colors"
        >
          Volver al Dashboard
        </Link>
      </header>

      {/* Main deck content */}
      <ErrorBoundary>
        <Suspense fallback={<FlashcardsLoadingSkeleton />}>
          <FlashcardsContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
