// ExamForge — Notebook Browser (Client Component)
// Fetches and displays notebooks from the user's NotebookLM account

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Notebook {
  id: string;
  title: string;
}

interface NotebookBrowserProps {
  onSelect: (notebookId: string) => void;
  selectedNotebookId: string | null;
}

export function NotebookBrowser({ onSelect, selectedNotebookId }: NotebookBrowserProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotebooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/notebooklm/notebooks");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to fetch notebooks");
        return;
      }
      const data: { notebooks: Notebook[] } = await res.json();
      setNotebooks(data.notebooks);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notebooks</CardTitle>
        <CardDescription>Select a NotebookLM notebook to browse sources</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Loading notebooks...
          </div>
        )}

        {!loading && notebooks.length === 0 && !error && (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No notebooks found. Create a notebook in NotebookLM first.
            </p>
          </div>
        )}

        {!loading && notebooks.length > 0 && (
          <div className="space-y-2">
            {notebooks.map((nb) => (
              <button
                key={nb.id}
                onClick={() => onSelect(nb.id)}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  selectedNotebookId === nb.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-medium">{nb.title}</span>
                <span className="block text-xs text-muted-foreground mt-0.5 font-mono">
                  {nb.id}
                </span>
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotebooks}
            className="mt-4"
          >
            Refresh
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
