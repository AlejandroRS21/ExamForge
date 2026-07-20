// ExamForge — Learn Shell Layout
// Wraps every /learn/* content-type page (quiz, flashcards, audio, mindmap) in
// a shared header + content-width-constrained main area. Consumes the
// spacing/width tokens wired in `globals.css` (`py-breathing`, `max-w-content`)
// instead of the ad-hoc `py-8 max-w-2xl` previously duplicated per page.
// No auth guard here: each /learn/* page already checks the session itself
// and redirects with its own deep-link-preserving callbackUrl (e.g.
// `/auth/login?callbackUrl=/learn/audio/${id}`) — a layout-level guard would
// fire before those page-specific redirects and, since there is no
// `/learn/page.tsx` landing route, would send users to a generic
// `callbackUrl=/learn` that 404s after login.

import { LearnHeader } from "@/components/learn/LearnHeader";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <LearnHeader />
      <main className="container mx-auto px-4 py-breathing max-w-content">
        {children}
      </main>
    </div>
  );
}
