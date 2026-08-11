// OpenSloth — NotebookLM Content Generation Page
// Generate interactive learning content (quizzes, audio, flashcards) via NotebookLM

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenerateContentForm } from "@/components/admin/GenerateContentForm";
import { getStatusToneClasses } from "@/lib/design-tokens";

export default async function GenerateContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generar contenido de aprendizaje</h1>
        <p className="text-muted-foreground mt-1">
          Usa NotebookLM para generar materiales de aprendizaje interactivos a partir de URL, texto o
          vídeos de YouTube. El contenido generado requiere revisión antes de publicarse.
        </p>
      </div>

      <GenerateContentForm />

      <div className={`rounded-xl p-4 ${getStatusToneClasses("warning", "surface")}`}>
        <h3 className="text-sm font-semibold">Acerca de la generación</h3>
        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
          <li>
            El contenido se genera con NotebookLM y se guarda con estado <strong>COMPLETED</strong>.
          </li>
          <li>
            El contenido generado debe revisarse y aprobarse antes de estar disponible para los estudiantes.
          </li>
          <li>
            Los ejercicios de audio se mostrarán como marcadores hasta que la generación de audio de
            integrated.
          </li>
        </ul>
      </div>
    </div>
  );
}
