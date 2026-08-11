// OpenSloth — Admin Dashboard
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
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de administración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu banco de preguntas B2 First, las partes del examen y los usuarios.
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
          <p className="text-sm font-medium">Activas</p>
          <p className="text-3xl font-bold">{stats.activeCount}</p>
        </div>
        <div className={`rounded-xl p-6 space-y-2 ${getStatusToneClasses("error", "surface")}`}>
          <p className="text-sm font-medium">Rechazadas</p>
          <p className="text-3xl font-bold">{stats.rejectedCount}</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Acciones rápidas</h2>
          <div className="space-y-2">
            <Link
              href="/admin/questions/generate-b2"
              className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Generar preguntas con IA
            </Link>
            <Link
              href="/admin/questions?status=DRAFT"
              className="block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-colors"
            >
              Revisar preguntas borrador ({stats.draftCount})
            </Link>
            <Link
              href="/admin/parts"
              className="block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm font-medium hover:bg-accent transition-colors"
            >
              Gestionar partes del examen
            </Link>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          {stats.recentEdits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentEdits.map((edit) => (
                <div key={edit.id} className="text-sm">
                  <span className="font-medium">{edit.editor.name ?? edit.editor.email}</span>
                  <span className="text-muted-foreground">
                    {" "}editó{" "}
                    <Link
                      href={`/admin/questions/${edit.questionId}`}
                      className="text-primary hover:underline"
                    >
                      pregunta
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
