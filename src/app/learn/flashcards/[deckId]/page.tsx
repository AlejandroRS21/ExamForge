// ExamForge — /learn/flashcards/[deckId] (RSC)
// SM-2 spaced repetition review session with 3D tactile buttons and progress
// display (spec: student-content-pages — flashcard SM-2 review scenario).
// Due-filtered deck is fetched with per-card SM-2 state and handed to the
// client FlashcardSm2Review, which computes schedule previews via
// @/lib/flashcards/sm2 and persists ratings through the existing API route.
// Neuroinclusive: warm palette, SlothMascot, zero raw emojis.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { FlashcardSm2Review, type Sm2ReviewCard } from "@/components/learn/FlashcardSm2Review";

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

  if (!deck) notFound();

  // SM-2 review sessions surface cards that are due (or never reviewed).
  const now = new Date();
  const dueCards: Sm2ReviewCard[] = deck.flashcards
    .filter((card) => card.nextReviewAt === null || card.nextReviewAt <= now)
    .map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      hint: card.hint,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
    }));

  return (
    <div className="space-y-8 pb-16">
      <SlothPageHeader
        badge="Flashcards"
        title={deck.title}
        subtitle={
          deck.description ??
          "Repaso espaciado con el algoritmo SM-2: cada tarjeta vuelve cuando tu memoria lo necesita."
        }
        pose="studying"
        mascotSize={140}
        backHref="/flashcards"
        backLabel="Volver a Flashcards"
      />

      <div className="flex items-center gap-2 text-xs font-bold text-amber-800/70">
        <span className="rounded-full border border-amber-200 bg-white px-3 py-1">
          {deck.cardCount} tarjeta{deck.cardCount !== 1 ? "s" : ""}
        </span>
        <span className="rounded-full border border-amber-200 bg-white px-3 py-1">
          {dueCards.length} pendiente{dueCards.length !== 1 ? "s" : ""} hoy
        </span>
      </div>

      <FlashcardSm2Review
        deckId={deck.id}
        deckTitle={deck.title}
        cards={dueCards}
      />
    </div>
  );
}

function FlashcardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Cargando mazo de tarjetas">
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-8">
        <div className="h-8 w-2/3 rounded-lg bg-amber-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-amber-50" />
      </div>
      <div className="h-2 w-full rounded-full bg-amber-100" />
      <div className="min-h-[280px] w-full rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-8" />
      <span className="sr-only">Cargando mazo de tarjetas...</span>
    </div>
  );
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
  const { deckId } = await params;
  return (
    <Suspense fallback={<FlashcardSkeleton />}>
      <FlashcardContent deckId={deckId} />
    </Suspense>
  );
}