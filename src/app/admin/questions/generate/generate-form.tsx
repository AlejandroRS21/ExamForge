// ExamForge — AI Generation Form (Client Component)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateFormProps {
  parts: Array<{ id: string; label: string; partNumber: number; timeMinutes: number }>;
}

interface GeneratedQuestion {
  id: string;
  type: string;
  prompt: any;
}

interface GenerationResult {
  generated: number;
  questions: GeneratedQuestion[];
  errors: string[];
}

export function GenerateForm({ parts }: GenerateFormProps) {
  const router = useRouter();
  const [examPartId, setExamPartId] = useState(parts[0]?.id ?? "");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examPartId,
          count,
          difficulty: difficulty || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
        {/* Exam Part */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Exam Part</label>
          <select
            value={examPartId}
            onChange={(e) => setExamPartId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          >
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {p.timeMinutes} min
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={25}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="flex h-9 w-24 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            required
          />
          <p className="text-xs text-muted-foreground">Min: 1, Max: 25</p>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Difficulty (optional)</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Mixed (default)</option>
            <option value="A">A — Easy</option>
            <option value="B">B — Standard</option>
            <option value="C">C — Challenge</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : `Generate ${count} Question${count !== 1 ? "s" : ""}`}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generation Results</h2>
            <span className="text-sm text-muted-foreground">
              {result.generated} generated
              {result.errors.length > 0 && `, ${result.errors.length} errors`}
            </span>
          </div>

          {result.errors.length > 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
              <p className="text-sm font-medium text-yellow-800">Errors</p>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {result.questions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Questions saved as DRAFT — ready for review.
              </p>
              <div className="flex gap-3">
                <a
                  href="/admin/questions?status=DRAFT"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Review Questions
                </a>
                <button
                  onClick={() => {
                    setResult(null);
                    router.refresh();
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
