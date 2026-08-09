// ExamForge — /learn/audio/[id] render smoke tests
// Node environment (repo choice): renderToReadableStream (awaits async RSC
// children inside Suspense; renderToStaticMarkup would flush skeletons).
// Mock auth (logged-in student) + prisma AudioExercise so the RSC reaches its
// published content branch.

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
  const publishedExercise = {
    id: "audio-1",
    title: "Travel Phrasal Verbs",
    mimeType: "audio/mpeg",
    transcript: "Welcome back to the show...",
    duration: 154,
    status: "PUBLISHED",
    downloadUrl: null,
    audioUrl: null,
    questions: [
      { question: "What is the host's main advice?", options: ["A", "B"], answer: "B" },
      { question: "Second comprehension question" },
    ],
  };
  return {
    publishedExercise,
    audioExercise: {
      findUnique: vi.fn().mockResolvedValue(publishedExercise),
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

describe("GET /learn/audio/[id]", () => {
  it("renders player, transcript toggle, questions, and mascot feedback", async () => {
    const { default: AudioPage } = await import("./page");
    const html = await renderPage(
      await AudioPage({ params: Promise.resolve({ id: "audio-1" }) }),
    );

    expect(html).toContain("Travel Phrasal Verbs");
    expect(html).toContain("Reproductor");
    expect(html).toContain("Transcripción");
    expect(html).toContain("Welcome back to the show");
    expect(html).toContain("Preguntas de comprensión");
    expect(html).toContain("What is the host"); // React escapes apostrophes (&#x27;)
    expect(html).toContain("<svg"); // SlothMascot + SlothIcons
    expect(html).toContain("Audio player"); // AudioPlayer region label
  });

  it("renders zero raw emojis (neuroinclusive policy)", async () => {
    const { default: AudioPage } = await import("./page");
    const html = await renderPage(
      await AudioPage({ params: Promise.resolve({ id: "audio-1" }) }),
    );
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    expect(html).not.toMatch(emoji);
  });

  it("shows an unavailable state for non-published exercises", async () => {
    db.audioExercise.findUnique.mockResolvedValueOnce({
      ...db.publishedExercise,
      status: "DRAFT",
    });

    const { default: AudioPage } = await import("./page");
    const html = await renderPage(
      await AudioPage({ params: Promise.resolve({ id: "audio-1" }) }),
    );
    expect(html).toContain("no está disponible");
  });
});