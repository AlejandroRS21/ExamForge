"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateB2Form() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/admin/questions/generate-b2", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Generation failed");
        return;
      }

      setResult({ created: data.created, failed: data.failed });

      // Refresh questions list after delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? "🚀 Generating questions (2-3 min)..." : "Generate 34 B2 Questions"}
      </button>

      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-red-900 font-semibold">❌ Error</p>
          <p className="text-red-800 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl p-4 bg-green-50 border border-green-200 space-y-2">
          <p className="text-green-900 font-semibold">✅ Generation complete!</p>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              <strong>{result.created}</strong> questions created (DRAFT status)
            </p>
            {result.failed > 0 && <p className="text-orange-700">{result.failed} failed to generate</p>}
            <p className="mt-3 text-xs">Next: Review the questions at /admin/questions before using in exams</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-foreground">What gets generated?</h3>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>4 MC questions for R&UoE Part 1 (varying difficulty)</li>
          <li>4 open cloze questions for R&UoE Part 2</li>
          <li>4 word formation questions for R&UoE Part 3</li>
          <li>4 key word transformation questions for R&UoE Part 4</li>
          <li>3 gapped text questions for R&UoE Part 5</li>
          <li>3 multiple matching questions for R&UoE Part 6</li>
          <li>3 multiple matching questions for R&UoE Part 7</li>
          <li>5 essay prompts for Writing Part 1</li>
          <li>5 flexible writing prompts for Writing Part 2</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          All questions include explanations and skill tags. Difficulty ranges from A (baseline) to C (challenge).
        </p>
      </div>
    </div>
  );
}
