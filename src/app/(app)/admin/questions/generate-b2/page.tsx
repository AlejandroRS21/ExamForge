// OpenSloth — B2 Question Generation Page
// Generate realistic Cambridge B2 First questions with AI

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenerateB2Form } from "./generate-b2-form";

export default async function GenerateB2QuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generar preguntas B2 con IA</h1>
        <p className="text-muted-foreground mt-1">
          Usa Claude para generar preguntas realistas del examen Cambridge B2 First. Todas las preguntas generadas se guardan como{" "}
          <strong>DRAFT</strong> y requieren revisión.
        </p>
      </div>

      <GenerateB2Form />

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Cobertura</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">R&UoE (7 partes)</h3>
            <ul className="text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Part 1: MC Vocabulary</li>
              <li>Part 2: Open Cloze</li>
              <li>Part 3: Word Formation</li>
              <li>Part 4: Key Word Transform</li>
              <li>Part 5: Gapped Text</li>
              <li>Part 6: Multiple Matching</li>
              <li>Part 7: Multiple Matching (long)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Writing (2 partes)</h3>
            <ul className="text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Part 1: Essay (220-260 words)</li>
              <li>Part 2: Flexible (email/article/report/review)</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Total:</strong> ~34 preguntas en todas las partes
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-2">
        <h3 className="font-semibold text-blue-900">ℹ️ Cómo funciona</h3>
        <ul className="text-sm text-blue-900 list-disc list-inside space-y-1">
          <li>Claude genera preguntas B2 siguiendo los criterios oficiales de Cambridge</li>
          <li>Las preguntas incluyen explicación y habilidades evaluadas (vocabulary, grammar, etc.)</li>
          <li>La dificultad varía: A (fácil), B (estándar), C (reto)</li>
          <li>Todas se guardan como DRAFT: tú las revisas antes de que aparezcan en los exámenes</li>
          <li>La generación tarda unos 2-3 minutos para el conjunto completo</li>
        </ul>
      </div>
    </div>
  );
}
