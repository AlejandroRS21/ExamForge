// ExamForge — Edit Question Form (Client Component)
// Inline editor for question content, answers, metadata

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface EditFormProps {
  question: any;
}

export function EditQuestionForm({ question }: EditFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(JSON.stringify(question.prompt, null, 2));
  const [correctAnswer, setCorrectAnswer] = useState(
    JSON.stringify(question.correctAnswer, null, 2),
  );
  const [explanation, setExplanation] = useState(question.explanation ?? "");
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [skillsTested, setSkillsTested] = useState(
    question.skillsTested?.join(", ") ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      let parsedPrompt: any;
      let parsedAnswer: any;

      try {
        parsedPrompt = JSON.parse(prompt);
      } catch {
        setMessage({ type: "error", text: "Invalid JSON in prompt field" });
        setSaving(false);
        return;
      }

      try {
        parsedAnswer = JSON.parse(correctAnswer);
      } catch {
        setMessage({ type: "error", text: "Invalid JSON in correct answer field" });
        setSaving(false);
        return;
      }

      const body: any = {
        prompt: parsedPrompt,
        correctAnswer: parsedAnswer,
        explanation: explanation || undefined,
        difficulty,
        skillsTested: skillsTested
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean),
      };

      if (question.options) {
        try {
          body.options = typeof question.options === "string"
            ? JSON.parse(question.options)
            : question.options;
        } catch {
          // Keep existing options
        }
      }

      const res = await fetch(`/api/admin/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed to save" });
        return;
      }

      setMessage({ type: "success", text: "Question updated successfully" });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error — please try again" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <h2 className="text-lg font-semibold">Edit Question</h2>

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

      {/* Prompt (JSON) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Prompt (JSON)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Correct Answer (JSON) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Correct Answer (JSON)</label>
        <textarea
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          rows={4}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Explanation */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Difficulty + Skills */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="A">A — Easy</option>
            <option value="B">B — Standard</option>
            <option value="C">C — Challenge</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Skills Tested (comma-separated)</label>
          <input
            type="text"
            value={skillsTested}
            onChange={(e) => setSkillsTested(e.target.value)}
            placeholder="e.g. vocabulary, grammar, collocations"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message?.type === "success" && (
          <a
            href="/admin/questions"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Back to List
          </a>
        )}
      </div>
    </div>
  );
}
