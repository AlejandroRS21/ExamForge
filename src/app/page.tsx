// ExamForge — Landing Page
// Public entrance with CTA to practice or sign in

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  // Authenticated users go to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">ExamForge</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master the{" "}
              <span className="text-primary">Cambridge B2 First</span> Exam
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with realistic mock exams, get AI-powered feedback on
              your writing, and track your progress — all for free.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/exams/practice/ruoe-part-1"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try a Practice Part
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-base font-medium hover:bg-accent transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t">
          <div className="container mx-auto px-4 py-24">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Realistic Mock Exams</h3>
                <p className="text-sm text-muted-foreground">
                  Full R&amp;UoE and Writing papers with official timing,
                  part navigation, and auto-submit on timeout.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">AI Writing Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Get scored on the 4 Cambridge criteria: Content,
                  Communicative Achievement, Organisation, and Language.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  See your accuracy trends, skill breakdown, and weekly
                  rankings. Stay motivated with achievements and streaks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            ExamForge is an independent practice platform and is not affiliated
            with, endorsed by, or connected to Cambridge Assessment English.
          </p>
        </div>
      </footer>
    </div>
  );
}
