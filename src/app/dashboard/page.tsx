// ExamForge — Main Dashboard Page
// T-701: accuracy%, total attempts, streak count, avg time, empty state
// T-702: Recharts line chart, skill breakdown table, weak-area highlight

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/dashboard/stats";
import { getUserAchievements } from "@/lib/challenges/achievements";
import { AccuracyChart } from "@/components/dashboard/accuracy-chart";
import { PartBreakdownTable } from "@/components/dashboard/part-breakdown";
import { BadgesDisplay } from "@/components/dashboard/badges-display";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const [stats, achievements] = await Promise.all([
    getDashboardStats(userId),
    getUserAchievements(userId),
  ]);

  const hasData = stats.completedAttempts > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {session.user.name ?? "Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your B2 First practice journey
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

        {/* ─── Stats Cards ─── */}
        {hasData ? (
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
              label="Practice Exams"
              value={String(stats.completedAttempts)}
              subtext="completed"
            />
            <StatsCard
              label="Overall Accuracy"
              value={stats.overallAccuracy !== null ? `${Math.round(stats.overallAccuracy)}%` : "—"}
              trend={stats.overallAccuracy ?? 0}
            />
            <StatsCard
              label="Day Streak"
              value={String(stats.streak.currentStreak)}
              subtext={`Best: ${stats.streak.longestStreak}`}
            />
            <StatsCard
              label="Avg Time / Question"
              value={stats.avgTimePerQuestion !== null ? formatTime(stats.avgTimePerQuestion) : "—"}
              subtext={stats.avgTimePerQuestion !== null ? "per question" : undefined}
            />
          </div>
        ) : null}

        {/* ─── Weak Areas Alert ─── */}
        {stats.weakAreas.length > 0 && (
          <div className="rounded-xl border border-error-border bg-error-surface p-6 space-y-3">
            <h2 className="text-lg font-semibold text-error">
              Areas needing attention
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.weakAreas.slice(0, 3).map((area) => (
                <div key={area.partId} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-error">
                    {area.partLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-error">
                      {Math.round(area.accuracy)}%
                    </span>
                    <Link
                      href={`/exams/practice/${area.partId}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Recommended practice →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Two-column layout: Chart + Breakdown ─── */}
        {hasData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Accuracy Chart */}
            <div className="rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Accuracy Over Time</h2>
              <AccuracyChart data={stats.accuracyHistory} />
            </div>

            {/* Per-Part Breakdown */}
            <div className="rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Skill Breakdown</h2>
              <PartBreakdownTable data={stats.partBreakdown} weakAreas={stats.weakAreas} />
            </div>
          </div>
        ) : null}

        {/* ─── Achievements ─── */}
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Achievements</h2>
            <Link
              href="/challenges"
              className="text-sm text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <BadgesDisplay badges={achievements.all} />
        </div>

        {/* ─── Personal Goals ─── */}
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Personal Goals</h2>
            <Link
              href="/dashboard/goals"
              className="text-sm text-primary hover:underline"
            >
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
                <div
                  key={attempt.id}
                  className="rounded-xl border p-4 flex items-center justify-between"
                >
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
  );
}

/* ─── Internal Components ─── */

function StatsCard({
  label,
  value,
  subtext,
  trend,
}: {
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
}) {
  return (
    <div className="rounded-xl border p-6 space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      {trend !== undefined && trend >= 0 && (
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(trend, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
