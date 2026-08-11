// OpenSloth — Challenges / Leaderboard Page
// Warm Sloth theme with achievements badges, streak tracker, and weekly leaderboard

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaderboard } from "@/lib/challenges/leaderboard";
import { getUserAchievements } from "@/lib/challenges/achievements";
import { getStreakInfo } from "@/lib/challenges/streak";
import { getAllUserGoals } from "@/lib/challenges/goals";
import { BadgesDisplay } from "@/components/dashboard/badges-display";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { FlameIcon, TargetIcon, AwardIcon, StarIcon } from "@/components/ui/icons/SlothIcons";

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const [leaderboard, achievements, streakInfo, goals] = await Promise.all([
    getLeaderboard(50),
    getUserAchievements(userId),
    getStreakInfo(userId),
    getAllUserGoals(userId),
  ]);

  const activeGoal = goals[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="space-y-8">
          {/* Header Hero */}
          <SlothPageHeader
            badge="Desafíos y Logros"
            title="Desafíos y Clasificación"
            subtitle="Compite amistosamente con otros estudiantes, supera retos diarios y desbloquea insignias exclusivas."
            pose="cheering"
          />

          {/* Daily Goals / Streak Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 shadow-[0_4px_0_0_#FDE68A] flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <FlameIcon className="w-7 h-7" color="var(--primary)" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800/70 uppercase">Racha de Estudio</div>
                <div className="text-xl font-extrabold text-amber-950">
                  {streakInfo.currentStreak} {streakInfo.currentStreak === 1 ? "Día" : "Días"} Seguidos
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 shadow-[0_4px_0_0_#FDE68A] flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <TargetIcon className="w-7 h-7" color="#FFB703" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800/70 uppercase">Meta Diaria</div>
                <div className="text-xl font-extrabold text-amber-950">
                  {activeGoal ? `${activeGoal.currentValue} / ${activeGoal.targetValue}` : "Sin meta activa"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-6 shadow-[0_4px_0_0_#FDE68A] flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <AwardIcon className="w-7 h-7" color="#059669" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800/70 uppercase">Insignias Ganadas</div>
                <div className="text-xl font-extrabold text-amber-950">
                  {achievements.unlocked.length} / {achievements.all.length}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Achievements Section ─── */}
          <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-7 space-y-5 shadow-[0_6px_0_0_#FDE68A]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                <AwardIcon className="w-6 h-6" color="#FFB703" /> Mis Insignias y Logros
              </h2>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                {achievements.unlocked.length} de {achievements.all.length} desbloqueadas
              </span>
            </div>
            <BadgesDisplay badges={achievements.all} />
          </div>

          {/* ─── Weekly Leaderboard ─── */}
          <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-7 space-y-5 shadow-[0_6px_0_0_#FDE68A]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                  <StarIcon className="w-6 h-6" color="#FFB703" /> Clasificación Semanal
                </h2>
                <p className="text-xs font-medium text-amber-800/70 mt-0.5">
                  Semana {leaderboard.weekId} · {leaderboard.totalParticipants} estudiante{leaderboard.totalParticipants !== 1 ? "s" : ""} participando
                </p>
              </div>
            </div>

            {leaderboard.entries.length === 0 ? (
              /* Empty state */
              <div className="py-12 text-center space-y-4">
                <AwardIcon className="w-16 h-16 mx-auto" color="#FFB703" />
                <h3 className="text-xl font-bold text-amber-950">Aún no hay participantes esta semana</h3>
                <p className="text-sm font-medium text-amber-800/80 max-w-sm mx-auto">
                  ¡Sé el primero en la tabla! Completa un ejercicio de práctica o simulacro para aparecer en el ranking.
                </p>
                <Link
                  href="/exams"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#FF7A45] to-primary px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_0_#C84B1B] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all mt-2"
                >
                  Empezar un Examen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-amber-100 text-left">
                      <th className="pb-3 text-xs font-bold text-amber-900 uppercase tracking-wider w-16">Puesto</th>
                      <th className="pb-3 text-xs font-bold text-amber-900 uppercase tracking-wider">Estudiante</th>
                      <th className="pb-3 text-xs font-bold text-amber-900 uppercase tracking-wider text-right">Correctas</th>
                      <th className="pb-3 text-xs font-bold text-amber-900 uppercase tracking-wider text-right">Precisión</th>
                      <th className="pb-3 text-xs font-bold text-amber-900 uppercase tracking-wider text-right">Intentos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {leaderboard.entries.map((entry, idx) => {
                      const isCurrentUser = entry.userId === userId;
                      const medalColors: Record<number, string> = {
                        1: "#E0A800", // oro
                        2: "#A8B0BC", // plata
                        3: "#C47B3F", // bronce
                      };
                      const showMedal = entry.rank <= 3;

                      return (
                        <tr
                          key={entry.userId}
                          className={`transition-colors ${
                            isCurrentUser
                              ? "bg-amber-100/60 font-bold"
                              : idx % 2 === 0
                                ? "bg-amber-50/30"
                                : "bg-white"
                          }`}
                        >
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-1.5">
                              {showMedal ? (
                                <AwardIcon className="w-6 h-6" color={medalColors[entry.rank]} aria-hidden="true" />
                              ) : (
                                <span className="text-sm font-bold text-amber-900/80 w-6 text-center">
                                  {entry.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              {entry.image ? (
                                <img
                                  src={entry.image}
                                  alt=""
                                  className="w-7 h-7 rounded-full border border-amber-300"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-xs font-extrabold text-amber-950">
                                  {(entry.name ?? "A").charAt(0)}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-amber-950">{entry.name}</span>
                              {isCurrentUser && (
                                <span className="text-xs font-bold text-primary bg-orange-100 px-2 py-0.5 rounded-md">(Tú)</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-right font-extrabold text-amber-950">
                            {entry.totalCorrect}
                          </td>
                          <td className="py-3.5 pr-4 text-sm text-right font-semibold text-amber-800">
                            {entry.totalQuestions > 0 ? `${entry.accuracy}%` : "—"}
                          </td>
                          <td className="py-3.5 text-sm text-right font-semibold text-amber-800">
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
    </div>
  );
}
