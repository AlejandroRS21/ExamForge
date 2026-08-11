// OpenSloth — /learn/flashcards/[deckId] render smoke tests
// Node environment: renderToReadableStream with mocked auth + prisma deck
// (SM-2 state fields per card). Rating buttons render client-side only after
// flip, so SSR assertions cover shell, due-card session, and progress.

import { describe, it, expect, vi } from "vitest";
import type { ReactElement } from "react";
import { renderToReadableStream } from "react-dom/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "u1", role: "USER", name: "Student" } }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect(${path})`);
  }),
}));

// vi.hoisted: the vi.mock factory is hoisted above any top-level const, so
// shared fixtures must live inside the hoisted block.
const db = vi.hoisted(() => {
  const deck = {
    id: "deck-1",
    generatedContentId: "gc-1",
    title: "B2 Vocabulary: Travel",
    description: "Phrasal verbs for travel",
    examPartId: null,
    createdById: "admin-1",
    cardCount: 2,
    createdAt: new Date(),
    flashcards: [
      {
        id: "card-1",
        deckId: "deck-1",
        front: "to look forward to",
        back: "esperar con ganas",
        hint: "trip",
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewAt: null,
        createdAt: new Date(),
      },
      {
        id: "card-2",
        deckId: "deck-1",
        front: "to set off",
        back: "partir / salir de viaje",
        hint: null,
        easeFactor: 2.5,
        interval: 3,
        repetitions: 2,
        nextReviewAt: new Date(Date.now() - 86400000), // due yesterday
        createdAt: new Date(),
      },
    ],
  };
  return {
    deck,
    flashcardDeck: {
      findUnique: vi.fn().mockResolvedValue(deck),
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: db,
  default: db,
}));

async function renderPage(element: ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element);
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  // Strip React's text-node separators (<!-- -->) so interpolated
  // strings ("Question {n} of {m}") can be asserted as plain substrings.
  return new TextDecoder().decode(buf).replace(/<!-- -->/g, "");
}

describe("GET /learn/flashcards/[deckId]", () => {
  it("renders deck shell, due-card session, progress, and SM-2 review", async () => {
    const { default: FlashcardPage } = await import("./page");
    const html = await renderPage(
      await FlashcardPage({ params: Promise.resolve({ deckId: "deck-1" }) }),
    );

    expect(html).toContain("B2 Vocabulary: Travel");
    expect(html).toContain("Phrasal verbs for travel");
    expect(html).toContain("2 tarjetas");
    expect(html).toContain("2 pendientes hoy"); // both cards due
    expect(html).toContain("Tarjeta 1 de 2");
    expect(html).toContain("to look forward to");
    expect(html).toContain("<svg"); // SlothMascot
  });

  it("renders zero raw emojis (neuroinclusive policy)", async () => {
    const { default: FlashcardPage } = await import("./page");
    const html = await renderPage(
      await FlashcardPage({ params: Promise.resolve({ deckId: "deck-1" }) }),
    );
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    expect(html).not.toMatch(emoji);
  });

  it("shows a rest state when no cards are due today", async () => {
    db.flashcardDeck.findUnique.mockResolvedValueOnce({
      ...db.deck,
      flashcards: [
        {
          ...db.deck.flashcards[0],
          nextReviewAt: new Date(Date.now() + 86400000 * 3), // not due
        },
      ],
    });

    const { default: FlashcardPage } = await import("./page");
    const html = await renderPage(
      await FlashcardPage({ params: Promise.resolve({ deckId: "deck-1" }) }),
    );
    expect(html).toContain("No hay tarjetas pendientes de repaso");
  });
});