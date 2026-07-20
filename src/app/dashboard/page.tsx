// ExamForge — Main Dashboard Page
// T-701: accuracy%, total attempts, streak count, avg time, empty state
// T-702: Recharts line chart, skill breakdown table, weak-area highlight
// Neuroinclusive UI adoption: applies the approved Pencil Dashboard mockup
// (id U0Xr4F) — shared LearnHeader, time-of-day greeting, MetricCard row,
// paper-level progress chart, weak-areas + achievements side column, and a
// real "continue where you left off" CTA.

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { getUserAchievements, BADGE_DEFINITIONS } from "@/lib/challenges/achievements";
import { getResumeCta } from "@/lib/exam/resume";
import { aggregateByPaper } from "@/lib/dashboard/paper-breakdown";
import { getTimeOfDayGreeting } from "@/lib/dashboard/greeting";
import { AccuracyChart } from "@/components/dashboard/accuracy-chart";
import { PartBreakdownTable } from "@/components/dashboard/part-breakdown";
import { BadgesDisplay } from "@/components/dashboard/badges-display";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LearnHeader } from "@/components/learn/LearnHeader";

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

          {/* ─── Metric Cards ─── */}
          {hasData ? (
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard icon="🎯" label="Overall score" value={stats.overallAccuracy !== null ? `${Math.round(stats.overallAccuracy)}%` : "—"} />
              <MetricCard
                icon="🔥"
                label="Streak"
                value={`${stats.streak.currentStreak} days`}
                delta={
                  stats.streak.currentStreak > 0 && stats.streak.currentStreak === stats.streak.longestStreak
                    ? "Personal best"
                    : stats.streak.longestStreak > 0
                      ? `Best: ${stats.streak.longestStreak} days`
                      : undefined
                }
              />
              <MetricCard icon="✅" label="Exercises done" value={String(stats.totalQuestions)} />
              <MetricCard icon="⏱️" label="Study time" value={formatTime(stats.totalTimeSeconds)} />
            </div>
          ) : null}

          {/* ─── Mid row: paper progress chart + side column ─── */}
          {hasData ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              {/* Progress by paper */}
              <div className="flex flex-col gap-6 rounded-xl border bg-card p-8">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-foreground">Progress by paper</h2>
                  <p className="text-[13px] text-muted-foreground">Average accuracy per exam paper</p>
                </div>
                <div className="flex h-[180px] items-end gap-7">
                  {paperBreakdown.map((p) => (
                    <div key={p.paper} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div
                        className={`w-11 rounded-t-md ${p.isWeak ? "bg-warning" : "bg-primary"}`}
                        style={{ height: `${Math.min(Math.max(p.accuracy, 2), 100)}%` }}
                        title={`${p.paper}: ${Math.round(p.accuracy)}%`}
                      />
                      <span className="text-xs text-muted-foreground">{p.paper}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side column */}
              <div className="flex flex-col gap-4">
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
                  <div className="flex flex-col gap-3 rounded-xl border bg-card p-generous">
                    <h3 className="text-sm font-semibold text-foreground">Recent achievements</h3>
                    {recentBadges.map((badge) => (
                      <div key={badge.type} className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-success-surface text-sm text-success"
                        >
                          {badge.icon}
                        </span>
                        <span className="text-[13px] font-medium text-foreground">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                className="rounded-lg bg-primary px-[18px] py-2.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
