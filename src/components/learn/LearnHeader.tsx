// ExamForge — Learn Shell Header
// Shared header for all /learn/* content types (quiz, flashcards, audio,
// mindmap). Purely presentational — no per-page state — extracted from the
// identical header markup that used to be duplicated in each of the 4 pages.
// Matches the approved Pencil LearnHeader mockup (id IEZQZ).

import Link from "next/link";
import { MuteToggle } from "@/components/moments/MuteToggle";

export function LearnHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="text-sm font-bold tracking-tight hover:text-primary transition-colors"
        >
          OpenSloth
        </Link>
        <nav className="flex items-center gap-normal">
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
          <MuteToggle />
        </nav>
      </div>
    </header>
  );
}
