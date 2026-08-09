// ExamForge — /admin/notebooklm page render smoke tests
// Node environment (repo choice): renderToStaticMarkup, no jsdom/RTL.
// The page is an RSC: mock auth (admin) + next/navigation so the guard passes
// and client sub-components render their initial (loading) state.

import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN", name: "Admin" } }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect(${path})`);
  }),
  useRouter: vi.fn(() => ({ push: vi.fn(), refresh: vi.fn() })),
}));

describe("GET /admin/notebooklm", () => {
  it("renders the dashboard shell with header, browser, sources, generation, and review queue", async () => {
    const { default: NotebookLMPage } = await import("./page");
    const html = renderToStaticMarkup(await NotebookLMPage());

    // Header / mascot (neuroinclusive warm sloth theme)
    expect(html).toContain("NotebookLM");
    expect(html).toContain("<svg"); // SlothMascot

    // All four task-4.4 panels present
    expect(html).toContain("Notebooks");
    expect(html).toContain("Select a notebook");
    expect(html).toContain("Select a notebook to view its sources");
    expect(html).toContain("Generate Content");
    expect(html).toContain("Content Type");
    expect(html).toContain("Generate Quiz"); // trigger button
    expect(html).toContain("Drafts Awaiting Review");
    expect(html).toContain("Loading review queue..."); // review queue panel
  });

  it("renders zero raw emojis (neuroinclusive policy)", async () => {
    const { default: NotebookLMPage } = await import("./page");
    const html = renderToStaticMarkup(await NotebookLMPage());
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    expect(html).not.toMatch(emoji);
  });
});

describe("GET /admin/notebooklm guard", () => {
  it("redirects when the session user is not ADMIN or EDITOR", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: "u1", role: "USER" } } as any);

    const { redirect } = await import("next/navigation");
    vi.mocked(redirect).mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`);
    });

    const { default: NotebookLMPage } = await import("./page");
    await expect(NotebookLMPage()).rejects.toThrow("redirect:/dashboard");
  });
});