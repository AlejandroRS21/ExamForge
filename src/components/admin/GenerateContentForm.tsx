// ExamForge — NotebookLM Content Generation Form (Client Component)
// Allows admins to generate interactive learning content via NotebookLM

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getStatusToneClasses } from "@/lib/design-tokens";

type SourceType = "URL" | "TEXT" | "YOUTUBE";
type ContentType = "QUIZ" | "AUDIO" | "FLASHCARDS";
type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface GenerationResult {
  id: string;
  status: GenerationStatus;
}

interface StatusResult {
  id: string;
  status: GenerationStatus;
  contentType: ContentType;
  errorMessage: string | null;
  audioExercise: { id: string; title: string; status: string } | null;
  flashcardDeck: { id: string; title: string; cardCount: number } | null;
}

export function GenerateContentForm() {
  const [sourceType, setSourceType] = useState<SourceType>("URL");
  const [sourceData, setSourceData] = useState("");
  const [contentType, setContentType] = useState<ContentType>("QUIZ");
  const [loading, setLoading] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const startPolling = useCallback((id: string) => {
    // Poll every 2 seconds until completed or failed
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/notebooklm/generate/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to fetch status");
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }
        const data: StatusResult = await res.json();
        setStatus(data);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch {
        setError("Network error while polling status");
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 2000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGenerationId(null);
    setStatus(null);

    try {
      const res = await fetch("/api/notebooklm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceData,
          contentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Generation failed to start");
        return;
      }

      const result = data as GenerationResult;
      setGenerationId(result.id);
      setStatus({
        id: result.id,
        status: result.status,
        contentType,
        errorMessage: null,
        audioExercise: null,
        flashcardDeck: null,
      });

      // Start polling if still processing
      if (result.status === "PENDING" || result.status === "PROCESSING") {
        startPolling(result.id);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const sourceTypeLabel = (st: SourceType): string => {
    switch (st) {
      case "URL": return "URL";
      case "TEXT": return "Paste Text";
      case "YOUTUBE": return "YouTube URL";
    }
  };

  const contentTypeLabel = (ct: ContentType): string => {
    switch (ct) {
      case "QUIZ": return "Quiz";
      case "AUDIO": return "Audio Exercise";
      case "FLASHCARDS": return "Flashcards";
    }
  };

  const statusBadge = (s: GenerationStatus) => {
    const colors: Record<GenerationStatus, string> = {
      PENDING: getStatusToneClasses("warning", "surface"),
      PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: getStatusToneClasses("success", "surface"),
      FAILED: getStatusToneClasses("error", "surface"),
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[s]}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
        {/* Content Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            <option value="QUIZ">Quiz</option>
            <option value="AUDIO">Audio Exercise</option>
            <option value="FLASHCARDS">Flashcards</option>
          </select>
        </div>

        {/* Source Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Source Type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            <option value="URL">URL</option>
            <option value="TEXT">Paste Text</option>
            <option value="YOUTUBE">YouTube URL</option>
          </select>
        </div>

        {/* Source Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{sourceTypeLabel(sourceType)}</label>
          {sourceType === "TEXT" ? (
            <textarea
              value={sourceData}
              onChange={(e) => setSourceData(e.target.value)}
              className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
              placeholder="Paste the text content you want to generate learning materials from..."
              required
            />
          ) : (
            <input
              type="url"
              value={sourceData}
              onChange={(e) => setSourceData(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
              placeholder={
                sourceType === "YOUTUBE"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com/article"
              }
              required
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Starting Generation..." : `Generate ${contentTypeLabel(contentType)}`}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className={`rounded-lg px-4 py-3 text-sm ${getStatusToneClasses("error", "surface")}`}>
          {error}
        </div>
      )}

      {/* Status / Result */}
      {status && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generation Progress</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {contentTypeLabel(status.contentType)}
              </span>
              {statusBadge(status.status)}
            </div>
          </div>

          {status.status === "PROCESSING" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              Generating content... This may take a moment.
            </div>
          )}

          {status.status === "FAILED" && (
            <div className={`rounded-lg px-4 py-3 text-sm ${getStatusToneClasses("error", "surface")}`}>
              {status.errorMessage ?? "Generation failed with no error message."}
            </div>
          )}

          {status.status === "COMPLETED" && (
            <div className="space-y-3">
              <div className={`rounded-lg px-4 py-3 text-sm ${getStatusToneClasses("success", "surface")}`}>
                Content generated successfully!
              </div>

              {status.audioExercise && (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{status.audioExercise.title}</p>
                    <p className="text-xs text-muted-foreground">Audio Exercise</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {status.audioExercise.status}
                  </span>
                </div>
              )}

              {status.flashcardDeck && (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{status.flashcardDeck.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {status.flashcardDeck.cardCount} cards
                    </p>
                  </div>
                  <a
                    href={`/admin/review`}
                    className="text-sm text-primary hover:underline"
                  >
                    Review
                  </a>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href="/admin/review"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Go to Review Queue
                </a>
                <button
                  onClick={() => {
                    setGenerationId(null);
                    setStatus(null);
                    setSourceData("");
                  }}
                  className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Generate More
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
