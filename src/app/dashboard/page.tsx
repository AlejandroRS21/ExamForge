// ExamForge — Main Dashboard Page
// T-701: accuracy%, total attempts, streak count, avg time, empty state
// T-702: Recharts line chart, skill breakdown table, weak-area highlight
// Neuroinclusive UI adoption: applies the approved "Dashboard — Readiness
// Journey" Pencil mockup — shared LearnHeader, time-of-day greeting with a
// decorative Focus mode pill, an exam-readiness donut + progress mini-stats
// hero row (all-time totals — see the mini-stats block below for why the
// mockup's "This week" framing was dropped), a papers-journey node row (only the 2 real papers this app's
// schema supports — R&UoE and Writing), a weak-areas + achievement-medallions
// row, and a real "continue where you left off" CTA using the single warm
// primary-CTA accent (60-30-10 color-psychology rule).

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { getUserAchievements, BADGE_DEFINITIONS } from "@/lib/challenges/achievements";
import { getResumeCta } from "@/lib/exam/resume";
import { aggregateByPaper, PAPER_WEAK_THRESHOLD } from "@/lib/dashboard/paper-breakdown";
import { buildPapersJourney } from "@/lib/dashboard/papers-journey";
import { getTimeOfDayGreeting } from "@/lib/dashboard/greeting";
import { AccuracyChart } from "@/components/dashboard/accuracy-chart";
import { PartBreakdownTable } from "@/components/dashboard/part-breakdown";
import { BadgesDisplay } from "@/components/dashboard/badges-display";
import { LearnHeader } from "@/components/learn/LearnHeader";

/** Small literal mapping — this app's schema only has 2 real papers. */
const PAPER_EMOJI: Record<string, string> = {
  "R&UoE": "📖",
  Writing: "✍️",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const [stats, achievements, resumeCta] = await Promise.all([
    getDashboardStats(userId),
    getUserAchievements(userId),
    getResumeCta(userId),
  ]);

  const hasData = stats.completedAttempts > 0;
  const name = session.user.name ?? "Student";
  const greeting = `${getTimeOfDayGreeting(new Date())}, ${name}`;
  const paperBreakdown = aggregateByPaper(stats.partBreakdown);
  const weakestArea = stats.weakAreas[0] ?? null;

  // Looked up against stats.partBreakdown to find which real paper the user
  // is mid-attempt on, using resumeCta's own partId (no href-parsing).
  const currentPaper = resumeCta
    ? (stats.partBreakdown.find((p) => p.partId === resumeCta.partId)?.paper ?? null)
    : null;
  const papersJourney = buildPapersJourney(paperBreakdown, currentPaper);

  // Readiness donut geometry — plain SVG circle (no chart library needed).
  // Ring thickness sized so the inner radius is ~0.82 of the outer radius
  // (86px outer / 70px inner ≈ 0.814, per the approved mockup's ratio).
  const ringOuterRadius = 86;
  const ringStrokeWidth = 16;
  const ringPathRadius = ringOuterRadius - ringStrokeWidth / 2;
  const ringCircumference = 2 * Math.PI * ringPathRadius;
  const ringFraction = stats.overallAccuracy !== null ? stats.overallAccuracy / 100 : 0;
  const ringDashOffset = ringCircumference * (1 - ringFraction);
  // achievements.unlocked is already ordered by unlockedAt desc (real recency);
  // achievements.all is BADGE_DEFINITIONS' fixed definitional order and must
  // not be used here, or "recent" would silently mean "earliest-defined".
  const recentBadges = achievements.unlocked.slice(0, 3).map((a) => {
    // Safe: every unlocked Achievement.type is written by awardIf() using a
    // literal BADGE_DEFINITIONS type (achievements.ts), and AchievementType's
    // 6 enum values match BADGE_DEFINITIONS' 6 entries 1:1 — this assertion
    // would only fail if that invariant is broken by a future edit to either.
    const def = BADGE_DEFINITIONS.find((b) => b.type === a.type)!;
    return { type: a.type, label: def.label, icon: def.icon };
  });

  return (
    <div>
      <LearnHeader />
      <div className="container mx-auto px-4 py-breathing">
        <div className="space-y-generous">
          {/* ─── Greeting ─── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[26px] font-semibold text-foreground">{greeting}</h1>
              <p className="text-sm leading-reading text-muted-foreground">
                {hasData
                  ? `You are on track for the B2 First exam. ${
                      stats.streak.currentStreak > 0
                        ? "One focused session today keeps the streak alive."
                        : "Complete a practice today to start a new streak."
                    }`
                  : "Start your first practice session to see your accuracy, streak, and achievements here."}
              </p>
            </div>
            {/* Decorative only — no click handler/state. A real Focus Mode
                toggle (reduced motion/contrast) is a future, separate change. */}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-surface px-3.5 py-1.5 text-[13px] font-medium text-success">
              <span aria-hidden="true">🎯</span>
              Focus mode
            </span>
          </div>

          {!hasData ? (
            /* ─── Empty State ─── */
            <div className="rounded-xl border border-dashed p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h2 className="text-xl font-semibold">Start your first practice</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                Choose an exam part to begin your B2 First preparation. Your
                accuracy, streaks, and achievements will appear here once you
                complete an exam.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/exams"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Browse Exams
                </Link>
                <Link
                  href="/exams/practice/ruoe-part-1"
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Start Practicing
                </Link>
              </div>
            </div>
          ) : null}

          {/* ─── Hero row: exam readiness donut + progress mini-stats ─── */}
          {hasData ? (
            <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
              {/* Readiness card */}
              <div className="flex flex-col gap-6 rounded-xl border bg-card p-8">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-info-surface text-sm text-info"
                  >
                    🎯
                  </span>
                  <h2 className="text-sm font-semibold text-foreground">Exam readiness</h2>
                </div>
                <div className="relative mx-auto h-[172px] w-[172px]">
                  <svg viewBox="0 0 172 172" className="h-full w-full -rotate-90">
                    <circle
                      cx={ringOuterRadius}
                      cy={ringOuterRadius}
                      r={ringPathRadius}
                      strokeWidth={ringStrokeWidth}
                      fill="none"
                      className="stroke-muted"
                    />
                    <circle
                      cx={ringOuterRadius}
                      cy={ringOuterRadius}
                      r={ringPathRadius}
                      strokeWidth={ringStrokeWidth}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringDashOffset}
                      className="stroke-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[32px] font-semibold text-foreground">
                      {stats.overallAccuracy !== null ? `${Math.round(stats.overallAccuracy)}%` : "—"}
                    </span>
                  </div>
                  {stats.streak.currentStreak > 0 && (
                    <div className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full border-4 border-card bg-focus-warm-surface">
                      <span aria-hidden="true" className="text-lg leading-none">🔥</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini-stats — all-time totals, not week-scoped (stats.ts has
                  no date-range filter on totalQuestions/totalTimeSeconds), so
                  this must not claim to be "This week" like the mockup did. */}
              <div className="flex flex-col gap-6 rounded-xl border bg-card p-8">
                <h2 className="text-sm font-semibold text-foreground">Your progress</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-focus-warm text-sm text-focus-warm-foreground"
                      >
                        🔥
                      </span>
                      <span className="text-[13px] text-muted-foreground">Study streak</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {stats.streak.currentStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm text-accent-foreground"
                      >
                        ✅
                      </span>
                      <span className="text-[13px] text-muted-foreground">Exercises done</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{String(stats.totalQuestions)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-info-surface text-sm text-info"
                      >
                        ⏱️
                      </span>
                      <span className="text-[13px] text-muted-foreground">Study time</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatTime(stats.totalTimeSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ─── Papers journey ─── */}
          {hasData ? (
            <div className="flex flex-col gap-6 rounded-xl border bg-card p-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-foreground">Papers journey</h2>
                <p className="text-[13px] text-muted-foreground">Your mastery across the exam papers</p>
              </div>
              <div className="relative flex items-start justify-center gap-20 pt-8">
                <div
                  aria-hidden="true"
                  className="absolute left-[15%] right-[15%] top-[36px] h-px bg-border"
                />
                {papersJourney.map((node) => (
                  <div key={node.paper} className="relative flex flex-col items-center gap-2">
                    {node.isCurrent && (
                      <span className="absolute -top-8 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
                        You&apos;re here
                      </span>
                    )}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full text-xl ${
                        node.accuracy === null
                          ? "bg-muted"
                          : node.accuracy >= PAPER_WEAK_THRESHOLD
                            ? "bg-success"
                            : "bg-warning"
                      }`}
                    >
                      <span aria-hidden="true">{PAPER_EMOJI[node.paper] ?? "📘"}</span>
                    </div>
                    <span className="text-[13px] font-medium text-foreground">{node.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {node.accuracy !== null ? `${Math.round(node.accuracy)}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ─── Weak areas alert + Achievements row ─── */}
          {hasData && (weakestArea || recentBadges.length > 0) ? (
            <div className="grid gap-4 md:grid-cols-2">
              {weakestArea && (
                <div className="flex flex-col gap-3 rounded-xl border border-error-border bg-error-surface p-generous">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-error">⚠️</span>
                    <h3 className="text-sm font-semibold text-error">Weak areas</h3>
                  </div>
                  <p className="text-[13px] leading-reading text-foreground">
                    {weakestArea.partLabel} is below your target at {Math.round(weakestArea.accuracy)}%.
                    Focused practice this week would close the gap.
                  </p>
                  <Link
                    href={`/exams/practice/${weakestArea.partId}`}
                    className="inline-flex w-fit items-center rounded-lg bg-error px-3.5 py-2 text-[13px] font-medium text-error-foreground hover:opacity-90 transition-opacity"
                  >
                    Practice {weakestArea.partLabel}
                  </Link>
                </div>
              )}

              {recentBadges.length > 0 && (
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-generous">
                  <h3 className="text-sm font-semibold text-foreground">Recent achievements</h3>
                  <div className="flex items-center gap-3">
                    {recentBadges.map((badge, i) => {
                      const medallionBg = ["bg-focus-warm-surface", "bg-info-surface", "bg-success-surface"][
                        i % 3
                      ];
                      return (
                        <div key={badge.type} className="flex flex-col items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${medallionBg}`}
                          >
                            {badge.icon}
                          </span>
                          <span className="max-w-[84px] text-center text-[11px] font-medium text-foreground">
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* ─── Continue where you left off ─── */}
          {resumeCta && (
            <div className="flex items-center gap-4 rounded-xl bg-info-surface p-generous">
              <span aria-hidden="true" className="text-info">📖</span>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">{resumeCta.title}</p>
                <p className="text-[13px] text-muted-foreground">{resumeCta.subtitle}</p>
              </div>
              <Link
                href={resumeCta.resumeHref}
                className="rounded-lg bg-focus-warm px-[18px] py-2.5 text-[13px] font-medium text-focus-warm-foreground hover:bg-focus-warm/90 transition-colors"
              >
                Resume
              </Link>
            </div>
          )}

          {/* ─── Skill Breakdown (full per-part table, unchanged) ─── */}
          {hasData ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border p-6 space-y-4">
                <h2 className="text-lg font-semibold">Accuracy Over Time</h2>
                <AccuracyChart data={stats.accuracyHistory} />
              </div>
              <div className="rounded-xl border p-6 space-y-4">
                <h2 className="text-lg font-semibold">Skill Breakdown</h2>
                <PartBreakdownTable data={stats.partBreakdown} weakAreas={stats.weakAreas} />
              </div>
            </div>
          ) : null}

          {/* ─── Achievements (full grid) ─── */}
          <div className="rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Achievements</h2>
              <Link href="/challenges" className="text-sm text-primary hover:underline">
                View all →
              </Link>
            </div>
            <BadgesDisplay badges={achievements.all} />
          </div>

          {/* ─── Personal Goals ─── */}
          <div className="rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Personal Goals</h2>
              <Link href="/dashboard/goals" className="text-sm text-primary hover:underline">
                Manage goals →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Set accuracy and streak targets to track your progress.
            </p>
          </div>

          {/* ─── Recent Activity ─── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            {stats.recentAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity yet. Complete an exam to see your results here.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-xl border p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {attempt.partLabel ?? (attempt.type === "MOCK" ? "Full Mock" : "Practice")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "In progress"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.totalScore !== null && (
                        <span className="text-sm font-bold">{Math.round(attempt.totalScore)}%</span>
                      )}
                      <Link
                        href={`/exams/results/${attempt.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View results
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}
