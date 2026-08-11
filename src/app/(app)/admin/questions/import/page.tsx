// OpenSloth — Question CSV Import Page
// Admin UI for uploading and bulk-importing questions

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportForm } from "./import-form";

export default async function AdminImportQuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar preguntas desde CSV</h1>
        <p className="text-muted-foreground mt-1">
          Sube un archivo CSV con preguntas del Cambridge B2 First. Todas las preguntas importadas se guardan como{" "}
          <strong>DRAFT</strong> y requieren revisión antes de aparecer en los exámenes.
        </p>
      </div>

      <ImportForm />

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Formato CSV</h2>
        <p className="text-sm text-muted-foreground">
          Tu CSV debe tener estas columnas (separadas por comas):
        </p>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs font-mono">
            examPartId,type,prompt,options,correctAnswer,difficulty,skillsTested,explanation
          </code>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-foreground">examPartId</span>
            <p className="text-muted-foreground">ID interno de la parte del examen (p. ej., "ruoe-part-1")</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">type</span>
            <p className="text-muted-foreground">Uno de: MC, CLOZE, WF, KT, GT, MM</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">prompt</span>
            <p className="text-muted-foreground">Texto de la pregunta (se puede poner entre comillas si contiene comas)</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">options</span>
            <p className="text-muted-foreground">
              Array JSON de opciones (para MC) O lista separada por punto y coma: ["A","B","C","D"]
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">correctAnswer</span>
            <p className="text-muted-foreground">
              La respuesta: una letra (MC), texto o JSON según el tipo de pregunta
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">difficulty</span>
            <p className="text-muted-foreground">Uno de: A (fácil), B (estándar), C (reto)</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">skillsTested</span>
            <p className="text-muted-foreground">
              Opcional. Habilidades separadas por punto y coma: "vocabulary;grammar" O array JSON
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">explanation</span>
            <p className="text-muted-foreground">Texto de explicación opcional para la respuesta</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Fila de ejemplo</h2>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
          <div>ruoe-part-1,MC,"The school has a new ...",["facility","building","structure"],A,B,"vocabulary;synonyms","A is the most direct synonym"</div>
        </div>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 space-y-2">
        <h3 className="font-semibold text-orange-900">⚠️ Importante</h3>
        <ul className="text-sm text-orange-900 list-disc list-inside space-y-1">
          <li>Todas las preguntas importadas se configuran automáticamente con estado DRAFT.</li>
          <li>Debes revisar cada pregunta para comprobar su precisión antes de que aparezca en los exámenes.</li>
          <li>Las preguntas duplicadas no se detectan automáticamente: verifica tu CSV antes de importar.</li>
          <li>La importación es atómica: si la carga falla, no se añade ninguna pregunta.</li>
        </ul>
      </div>
    </div>
  );
}
