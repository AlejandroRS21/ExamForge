// ExamForge — /learn/quiz/[id] render smoke tests
// Node environment: renderToReadableStream with mocked auth + prisma
// GeneratedContent (QUIZ, COMPLETED). QuizRenderer is a client component —
// SSR renders its initial question chunk.

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
  const quizContent = {
    id: "quiz-1",
    contentType: "QUIZ",
    status: "COMPLETED",
    rawResponse: {
      title: "Phrasal Verbs Check",
      questions: [
        {
          id: "q1",
          prompt: "Choose the correct phrasal verb: 'I ___ my flight to London.'",
          options: ["looked forward to", "set off", "got over", "turned down"],
          correctAnswer: "looked forward to",
        },
      ],
    },
  };
  return {
    quizContent,
    generatedContent: {
      findUnique: vi.fn().mockResolvedValue(quizContent),
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

describe("GET /learn/quiz/[id]", () => {
  it("renders quiz shell with chunked question card and options", async () => {
    const { default: QuizPage } = await import("./page");
    const html = await renderPage(
      await QuizPage({ params: Promise.resolve({ id: "quiz-1" }) }),
    );

    expect(html).toContain("Phrasal Verbs Check");
    expect(html).toContain("Question 1 of 1");
    expect(html).toContain("Choose the correct phrasal verb");
    expect(html).toContain("looked forward to");
    expect(html).toContain("set off");
    expect(html).toContain("<svg"); // SlothMascot + SlothIcons
  });

  it("renders zero raw emojis (neuroinclusive policy)", async () => {
    const { default: QuizPage } = await import("./page");
    const html = await renderPage(
      await QuizPage({ params: Promise.resolve({ id: "quiz-1" }) }),
    );
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    expect(html).not.toMatch(emoji);
  });

  it("shows an unavailable state for non-completed content", async () => {
    db.generatedContent.findUnique.mockResolvedValueOnce({
      ...db.quizContent,
      status: "PENDING",
    });

    const { default: QuizPage } = await import("./page");
    const html = await renderPage(
      await QuizPage({ params: Promise.resolve({ id: "quiz-1" }) }),
    );
    expect(html).toContain("no está disponible");
  });
});