// OpenSloth — Writing Editor Component
// EE-06: Writing tasks SHALL present a rich text area with character count
// Rich text area with word count and auto-save

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface WritingEditorProps {
  attemptId: string;
  writingPromptId: string;
  promptText: string;
  wordCountMin: number;
  wordCountMax: number;
  initialContent?: string;
  onSave?: (content: string) => void;
  disabled?: boolean;
}

export function WritingEditor({
  attemptId,
  writingPromptId,
  promptText,
  wordCountMin,
  wordCountMax,
  initialContent = "",
  onSave,
  disabled = false,
}: WritingEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(content);
  const hasUnsavedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Word count
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  const isUnderMin = wordCount < wordCountMin;
  const isOverMax = wordCount > wordCountMax;
  const wordStatusColor = isOverMax
    ? "text-destructive"
    : isUnderMin
      ? "text-warning"
      : "text-muted-foreground";

  // Auto-save with debounce (3s after last keystroke)
  const doSave = useCallback(async () => {
    if (hasUnsavedRef.current) {
      setIsSaving(true);
      setSaveError(null);
      try {
        const res = await fetch("/api/exams/writing/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            writingPromptId,
            content: contentRef.current,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Error al guardar");
        }

        setLastSaved(new Date());
        hasUnsavedRef.current = false;
        onSave?.(contentRef.current);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Error al guardar");
      } finally {
        setIsSaving(false);
      }
    }
  }, [attemptId, writingPromptId, onSave]);

  // Debounced auto-save
  const handleChange = (value: string) => {
    setContent(value);
    hasUnsavedRef.current = true;

    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    autoSaveRef.current = setTimeout(() => {
      doSave();
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      // Final save attempt on unmount
      if (hasUnsavedRef.current) {
        doSave();
      }
    };
  }, [doSave]);

  // Manual save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doSave]);

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div className="rounded-lg bg-muted/50 border p-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Tarea de redacción
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{promptText}</p>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder="Escribe tu respuesta aquí..."
          rows={16}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed
            placeholder:text-muted-foreground/40
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-input
            disabled:opacity-60 disabled:cursor-not-allowed resize-y min-h-[300px]"
          autoComplete="off"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Word count */}
          <span className={wordStatusColor}>
            <span className="font-medium tabular-nums">{wordCount}</span>
            <span className="mx-0.5">/</span>
            <span>{wordCountMax}</span>
            <span className="ml-1">palabras</span>
          </span>

          {isUnderMin && (
            <span className="text-warning font-medium">
              Mín. {wordCountMin} palabras
            </span>
          )}

          {isOverMax && (
            <span className="text-destructive font-medium">
              ¡Superas el límite de palabras!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          {isSaving && (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Guardando...
            </span>
          )}

          {!isSaving && lastSaved && !hasUnsavedRef.current && (
            <span className="text-muted-foreground">
              Guardado {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {!isSaving && hasUnsavedRef.current && (
            <span className="text-warning">Cambios sin guardar</span>
          )}

          {saveError && (
            <span className="text-destructive" title={saveError}>
              Error al guardar
            </span>
          )}

          {/* Manual save button */}
          <button
            onClick={doSave}
            disabled={disabled || isSaving || !hasUnsavedRef.current}
            className="rounded-md bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground
              hover:bg-primary/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
