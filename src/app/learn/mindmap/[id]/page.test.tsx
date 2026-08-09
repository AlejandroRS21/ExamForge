// ExamForge — /learn/mindmap/[id] render smoke tests
// Node environment: renderToReadableStream with mocked auth + prisma
// GeneratedContent (MINDMAP, COMPLETED). MindMapViewer SSR renders the tree
// with all branches expanded by default.

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
  const mindMapContent = {
    id: "mm-1",
    contentType: "MINDMAP",
    status: "COMPLETED",
    rawResponse: {
      title: "Travel Vocabulary",
      nodes: [
        { id: "root", label: "Travel", children: ["n1", "n2"] },
        { id: "n1", label: "Airport", children: ["n1a"] },
        { id: "n1a", label: "check-in" },
        { id: "n2", label: "Accommodation", children: [] },
      ],
    },
  };
  return {
    mindMapContent,
    generatedContent: {
      findUnique: vi.fn().mockResolvedValue(mindMapContent),
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

describe("GET /learn/mindmap/[id]", () => {
  it("renders the collapsible mind map tree with all nodes", async () => {
    const { default: MindMapPage } = await import("./page");
    const html = await renderPage(
      await MindMapPage({ params: Promise.resolve({ id: "mm-1" }) }),
    );

    expect(html).toContain("Travel Vocabulary");
    expect(html).toContain("Estructura del tema");
    expect(html).toContain("4 nodes");
    expect(html).toContain(">Travel<");
    expect(html).toContain("Airport");
    expect(html).toContain("check-in");
    expect(html).toContain("Accommodation");
    expect(html).toContain("Expand all");
    expect(html).toContain("Collapse all");
    expect(html).toContain('role="tree"');
  });

  it("renders zero raw emojis (neuroinclusive policy)", async () => {
    const { default: MindMapPage } = await import("./page");
    const html = await renderPage(
      await MindMapPage({ params: Promise.resolve({ id: "mm-1" }) }),
    );
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    expect(html).not.toMatch(emoji);
  });

  it("shows an unavailable state for non-completed content", async () => {
    db.generatedContent.findUnique.mockResolvedValueOnce({
      ...db.mindMapContent,
      status: "FAILED",
    });

    const { default: MindMapPage } = await import("./page");
    const html = await renderPage(
      await MindMapPage({ params: Promise.resolve({ id: "mm-1" }) }),
    );
    expect(html).toContain("no está disponible");
  });
});