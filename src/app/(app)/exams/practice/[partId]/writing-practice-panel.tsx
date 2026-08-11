// OpenSloth — Writing Practice Panel (client)
// W-P-1: Writing practice saves drafts (WritingEditor → /api/exams/writing/save)
// and submits for server evaluation (/api/exams/writing/evaluate); the verdict
// renders inline via WritingFeedback. No client-side scoring.

"use client";

import { useState } from "react";
import { WritingEditor } from "@/components/exam/WritingEditor";
import { WritingFeedback } from "@/app/(app)/exams/results/[attemptId]/writing-feedback";
import { buildWritingFeedbackSubmission } from "@/lib/exam/practice";

interface WritingPracticePanelProps {
  attemptId: string;
  prompt: {
    id: string;
    prompt: string;
    wordCountMin: number;
    wordCountMax: number;
  };
  initialContent?: string;
}

export function WritingPracticePanel({
  attemptId,
  prompt,
  initialContent = "",
}: WritingPracticePanelProps) {
  const [content, setContent] = useState(initialContent);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    id: string;
    scores: unknown;
    feedback: unknown;
  } | null>(null);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setEvalError(null);
    try {
      // Ensure the draft is persisted before asking for evaluation
      const saved = await fetch("/api/exams/writing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, writingPromptId: prompt.id, content }),
      });
      if (!saved.ok) {
        setEvalError("No se pudo guardar el borrador. Inténtalo de nuevo.");
        return;
      }

      const res = await fetch("/api/exams/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, writingPromptId: prompt.id }),
      });

      if (!res.ok) {
        setEvalError("No se pudo evaluar tu redacción. Inténtalo de nuevo.");
        return;
      }

      const data = await res.json();
      setEvaluation({
        id: data.id,
        scores: data.scores,
        feedback: data.feedback,
      });
    } catch (e) {
      console.error("Failed to evaluate writing:", e);
      setEvalError("Error de conexión: no se pudo evaluar tu redacción.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <WritingEditor
        attemptId={attemptId}
        writingPromptId={prompt.id}
        promptText={prompt.prompt}
        wordCountMin={prompt.wordCountMin}
        wordCountMax={prompt.wordCountMax}
        initialContent={initialContent}
        onSave={setContent}
        disabled={isEvaluating}
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground
            hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isEvaluating ? "Evaluando..." : "Terminar y evaluar"}
        </button>

        {evalError && (
          <p role="alert" className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
            {evalError}
          </p>
        )}
      </div>

      {evaluation && (
        <WritingFeedback
          submissions={[
            buildWritingFeedbackSubmission({
              submissionId: evaluation.id,
              prompt,
              content,
              scores: evaluation.scores,
              feedback: evaluation.feedback,
            }),
          ]}
        />
      )}
    </div>
  );
}