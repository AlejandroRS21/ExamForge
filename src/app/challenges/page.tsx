// ExamForge — Challenges / Leaderboard Page
// T-704: Weekly ranking, tied-score skipping, empty state
// T-703: Achievement badges display

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaderboard } from "@/lib/challenges/leaderboard";
import { getUserAchievements } from "@/lib/challenges/achievements";
import { BadgesDisplay } from "@/components/dashboard/badges-display";

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const [leaderboard, achievements] = await Promise.all([
    getLeaderboard(50),
    getUserAchievements(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground mt-1">
            Compete with other students and earn achievements.
          </p>
        </div>

        {/* ─── Achievements Section ─── */}
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Your Badges
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {achievements.unlocked.length}/{achievements.all.length} unlocked
            </span>
          </h2>
          <BadgesDisplay badges={achievements.all} />
        </div>

        {/* ─── Weekly Leaderboard ─── */}
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly Leaderboard</h2>
              <p className="text-xs text-muted-foreground">
                Week of {leaderboard.weekId} · {leaderboard.totalParticipants} participant{leaderboard.totalParticipants !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {leaderboard.entries.length === 0 ? (
            /* Empty state */
            <div className="py-12 text-center space-y-3">
              <span className="text-4xl">🏆</span>
              <h3 className="text-lg font-semibold">No participants yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Be the first! Complete a practice part or mock exam to appear
                on this week&apos;s leaderboard.
              </p>
              <Link
                href="/exams"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
              >
                Start an Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">Rank</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Correct</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Accuracy</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.entries.map((entry, idx) => {
                    const isCurrentUser = entry.userId === userId;
                    const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                    const showMedal = entry.rank <= 3;

                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b last:border-b-0 ${
                          isCurrentUser
                            ? "bg-primary/5 font-medium"
                            : idx % 2 === 0
                              ? "bg-muted/20"
                              : ""
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            {showMedal ? (
                              <span className="text-lg">{medals[entry.rank]}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground w-6 text-center">
                                {entry.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {entry.image ? (
                              <img
                                src={entry.image}
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {(entry.name ?? "A").charAt(0)}
                              </div>
                            )}
                            <span className="text-sm">{entry.name}</span>
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground">(you)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-right font-medium">
                          {entry.totalCorrect}
                        </td>
                        <td className="py-3 pr-4 text-sm text-right text-muted-foreground">
                          {entry.totalQuestions > 0 ? `${entry.accuracy}%` : "—"}
                        </td>
                        <td className="py-3 text-sm text-right text-muted-foreground">
                          {entry.attemptCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
