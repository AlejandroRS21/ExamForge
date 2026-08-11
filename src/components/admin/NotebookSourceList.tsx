// OpenSloth — Notebook Source List (Client Component)
// Lists sources for a selected notebook with checkbox selection and generation trigger

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface Source {
  id: string;
  type: string;
  title?: string;
  url?: string;
}

interface NotebookSourceListProps {
  notebookId: string | null;
}

export function NotebookSourceList({ notebookId }: NotebookSourceListProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ type: string; id: string } | null>(null);

  const fetchSources = useCallback(async () => {
    if (!notebookId) return;
    try {
      setLoading(true);
      setError(null);
      setSelectedIds(new Set());
      setGenerateResult(null);
      const res = await fetch(`/api/notebooklm/sources?notebookId=${encodeURIComponent(notebookId)}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al obtener las fuentes");
        return;
      }
      const data: { sources: Source[] } = await res.json();
      setSources(data.sources);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

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
    if (selectedIds.size === sources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sources.map((s) => s.id)));
    }
  };

  const handleGenerate = async (contentType: string) => {
    if (!notebookId || selectedIds.size === 0) return;
    setGenerating(true);
    setGenerateResult(null);
    setError(null);

    try {
      const res = await fetch("/api/notebooklm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "URL",
          sourceData: `notebook:${notebookId}`,
          contentType,
          notebookId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      setGenerateResult({ type: contentType, id: data.id });
    } catch {
      setError("Network error — please try again");
    } finally {
      setGenerating(false);
    }
  };

  if (!notebookId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Selecciona una libreta para ver sus fuentes.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fuentes</CardTitle>
        <CardDescription>
          {loading
            ? "Cargando fuentes..."
            : `${sources.length} fuente${sources.length !== 1 ? "s" : ""} en la libreta`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${getStatusToneClasses("error", "surface")}`}>
            {error}
          </div>
        )}

        {generateResult && (
          <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${getStatusToneClasses("success", "surface")}`}>
            {generateResult.type} iniciada (ID: {generateResult.id}). Revisa la cola de revisión
            para ver los resultados.
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Cargando fuentes...
          </div>
        )}

        {!loading && sources.length === 0 && !error && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No se encontraron fuentes en esta libreta. Añade fuentes en NotebookLM primero.
          </div>
        )}

        {!loading && sources.length > 0 && (
          <>
            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 mb-4">
                <span className="text-sm font-medium">{selectedIds.size} seleccionada(s)</span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleGenerate("QUIZ")}
                  disabled={generating}
                >
                  {generating ? "Generando..." : "Generar Quiz"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate("FLASHCARDS")}
                  disabled={generating}
                >
                  {generating ? "Generando..." : "Generar Flashcards"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate("AUDIO")}
                  disabled={generating}
                >
                  {generating ? "Generando..." : "Generar Audio"}
                </Button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Borrar selección
                </button>
              </div>
            )}

            {/* Table */}
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="w-10 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === sources.length && sources.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Título / URL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr
                      key={source.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(source.id)}
                          onChange={() => toggleSelect(source.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 border-gray-200">
                          {source.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-[400px] truncate">
                          {source.title && (
                            <span className="font-medium">{source.title}</span>
                          )}
                          {source.url && (
                            <span className="text-muted-foreground">
                              {source.title ? " — " : ""}{source.url}
                            </span>
                          )}
                          {!source.title && !source.url && (
                            <span className="text-muted-foreground font-mono text-xs">
                              {source.id}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
