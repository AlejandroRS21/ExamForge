// ExamForge — Admin Dashboard
// Quick stats: total questions by status, recent edits, generate shortcut

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getRecentEdits } from "@/lib/admin/history";
import { getStatusToneClasses } from "@/lib/design-tokens";

async function getStats() {
  const [totalQuestions, byStatus, totalParts, recentEdits] = await Promise.all([
    prisma.question.count(),
    Promise.all([
      prisma.question.count({ where: { status: "DRAFT" } }),
      prisma.question.count({ where: { status: "ACTIVE" } }),
      prisma.question.count({ where: { status: "REJECTED" } }),
    ]),
    prisma.examPart.count(),
    getRecentEdits(5),
  ]);

  return {
    totalQuestions,
    draftCount: byStatus[0],
    activeCount: byStatus[1],
    rejectedCount: byStatus[2],
    totalParts,
    recentEdits,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your B2 First question bank, exam parts, and users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Questions</p>
          <p className="text-3xl font-bold">{stats.totalQuestions}</p>
        </div>
        <div className={`rounded-xl p-6 space-y-2 ${getStatusToneClasses("warning", "surface")}`}>
          <p className="text-sm font-medium">Draft</p>
          <p className="text-3xl font-bold">{stats.draftCount}</p>
        </div>
        <div className={`rounded-xl p-6 space-y-2 ${getStatusToneClasses("success", "surface")}`}>
          <p className="text-sm font-medium">Active</p>
          <p className="text-3xl font-bold">{stats.activeCount}</p>
        </div>
        <div className={`rounded-xl p-6 space-y-2 ${getStatusToneClasses("error", "surface")}`}>
          <p className="text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold">{stats.rejectedCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/questions/generate"
              className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Generate Questions with AI
            </Link>
            <Link
              href="/admin/questions?status=DRAFT"
              className="block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-colors"
            >
              Review Draft Questions ({stats.draftCount})
            </Link>
            <Link
              href="/admin/parts"
              className="block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-colors"
            >
              Manage Exam Parts
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          {stats.recentEdits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEdits.map((edit) => (
                <div key={edit.id} className="text-sm">
                  <span className="font-medium">{edit.editor.name ?? edit.editor.email}</span>
                  <span className="text-muted-foreground">
                    {" "}edited{" "}
                    <Link
                      href={`/admin/questions/${edit.questionId}`}
                      className="text-primary hover:underline"
                    >
                      question
                    </Link>
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(edit.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
