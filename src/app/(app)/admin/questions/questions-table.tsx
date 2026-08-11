// OpenSloth — Questions Table (Client Component)
// Displays paginated question list with status badges and bulk actions

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionListItem } from "./page";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface TableProps {
  questions: QuestionListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const typeLabels: Record<string, string> = {
  MC: "MC Cloze",
  CLOZE: "Open Cloze",
  WF: "Word Form",
  KT: "Key Transf.",
  GT: "Gapped Text",
  MM: "Mult. Match",
};

const statusStyles: Record<string, string> = {
  DRAFT: getStatusToneClasses("warning", "surface"),
  ACTIVE: getStatusToneClasses("success", "surface"),
  REJECTED: getStatusToneClasses("error", "surface"),
};

const difficultyStyles: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-gray-100 text-gray-700",
  C: "bg-purple-100 text-purple-700",
};

export function QuestionsTable({ questions, pagination }: TableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedIds.size === 0) return;
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, questionIds: Array.from(selectedIds) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `${data.updated ?? 0} pregunta(s) ${action === "approve" ? "aprobada(s)" : "rechazada(s)"} correctamente.${data.skipped?.length ? ` ${data.skipped.length} omitida(s).` : ""}`,
        });
        setSelectedIds(new Set());
        router.refresh();
      } else {
        setMessage({ type: "error", text: data.error ?? "La operación falló" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de red: inténtalo de nuevo" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${getStatusToneClasses(
            message.type === "success" ? "success" : "error",
            "surface",
          )}`}
        >
          {message.text}
        </div>
      )}

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} seleccionada(s)</span>
          <button
            onClick={() => handleBulkAction("approve")}
            disabled={processing}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-success/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("success", "solid")}`}
          >
            Aprobar seleccionadas
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            disabled={processing}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-error/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("error", "solid")}`}
          >
            Rechazar seleccionadas
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Borrar selección
          </button>
        </div>
      )}

      {/* Table */}
      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold">No se encontraron preguntas</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Ajusta tus filtros o genera nuevas preguntas con IA.
          </p>
          <Link
            href="/admin/questions/generate-b2"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Generar preguntas
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === questions.length && questions.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Parte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dificultad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Habilidades
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Creada
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">{q.examPart.label}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">
                      {typeLabels[q.type] ?? q.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${difficultyStyles[q.difficulty]}`}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[q.status]}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                    {q.skillsTested.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {q.aiGenerated ? (
                      <span className="text-xs text-purple-600 font-medium">IA</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Manual</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/questions/${q.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <PaginationButton
              href={`/admin/questions?page=${pagination.page - 1}`}
              disabled={pagination.page <= 1}
              label="Anterior"
            />
            <PaginationButton
              href={`/admin/questions?page=${pagination.page + 1}`}
              disabled={pagination.page >= pagination.totalPages}
              label="Siguiente"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationButton({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
    >
      {label}
    </Link>
  );
}
