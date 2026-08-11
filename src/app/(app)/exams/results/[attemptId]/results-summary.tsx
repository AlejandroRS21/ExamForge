// OpenSloth — Results Summary Component
// Shows the overall score summary with Cambridge Scale estimate

"use client";

import { getScaleGrade } from "@/lib/scoring";

interface ResultsSummaryProps {
  totalScore: number | null;
  cambridgeScaleScore: number | null;
  correctCount: number;
  questionCount: number;
  isPartial: boolean;
  answeredCount: number;
  status: string;
}

export function ResultsSummary({
  totalScore,
  cambridgeScaleScore,
  correctCount,
  questionCount,
  isPartial,
  answeredCount,
  status,
}: ResultsSummaryProps) {
  // SE-05: Partial attempts
  if (isPartial) {
    return (
      <div className="rounded-xl border border-warning-border bg-warning-surface p-6 text-center">
        <h2 className="text-lg font-semibold text-warning mb-2">
          Intento incompleto
        </h2>
        <p className="text-sm text-warning">
          Completa todas las partes para ver tu puntuación.
        </p>
        <p className="text-xs text-warning/80 mt-2">
          Has respondido {answeredCount} de {questionCount} preguntas.
          {status === "TIMED_OUT"
            ? " El examen se envió automáticamente cuando se agotó el tiempo."
            : ""}
        </p>
      </div>
    );
  }

  if (totalScore === null) {
    return (
      <div className="rounded-xl border border-muted bg-card p-6 text-center">
        <p className="text-muted-foreground">No hay datos de puntuación disponibles para este intento.</p>
      </div>
    );
  }

  const grade = cambridgeScaleScore !== null ? getScaleGrade(cambridgeScaleScore) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Raw Score */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Puntuación</p>
        <p className="text-3xl font-bold">{Math.round(totalScore)}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {correctCount} / {questionCount} correctas
        </p>
      </div>

      {/* Cambridge Scale */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Escala de Cambridge        </p>
        <p className="text-3xl font-bold">{cambridgeScaleScore ?? "—"}</p>
        {cambridgeScaleScore && (
          <p className="text-xs text-muted-foreground mt-1">
            Rango B2 First: 120–190
          </p>
        )}
      </div>

      {/* Grade */}
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Nota</p>
        <p className="text-3xl font-bold">{grade ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {grade === "A"
            ? "Excepcional (180+)"
            : grade === "B"
              ? "Bien (173–179)"
              : grade === "C"
                ? "Aprobado (160–172)"
                : grade === "B1"
                  ? "Por debajo de B2 (140–159)"
                  : "Por debajo del aprobado"}
        </p>
      </div>
    </div>
  );
}
