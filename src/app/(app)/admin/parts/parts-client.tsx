// OpenSloth — Exam Parts Client Component
// T-803: Manage parts with inline editing

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface PartStats {
  totalQuestions: number;
  byDifficulty: { A: number; B: number; C: number };
  byStatus: { DRAFT: number; ACTIVE: number; REJECTED: number };
}

interface PartWithStats {
  id: string;
  label: string;
  paper: string;
  partNumber: number;
  description: string | null;
  timeMinutes: number;
  questionCount: number;
  sortOrder: number;
  stats: PartStats;
}

interface PartsClientProps {
  parts: PartWithStats[];
  role: string;
}

export function PartsClient({ parts, role }: PartsClientProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canEdit = role === "ADMIN";

  const groupedByPaper = parts.reduce(
    (acc, part) => {
      if (!acc[part.paper]) acc[part.paper] = [];
      acc[part.paper].push(part);
      return acc;
    },
    {} as Record<string, PartWithStats[]>,
  );

  return (
    <div className="space-y-6">
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

      {Object.entries(groupedByPaper).map(([paper, paperParts]) => (
        <div key={paper} className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b">
            <h2 className="text-lg font-semibold">{paper}</h2>
          </div>
          <div className="divide-y">
            {paperParts.map((part) => (
              <div key={part.id} className="p-6 space-y-4">
                {editingId === part.id ? (
                  <EditForm
                    part={part}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      setMessage({ type: "success", text: "Part updated successfully" });
                      router.refresh();
                    }}
                    setSaving={setSaving}
                    saving={saving}
                    setMessage={setMessage}
                  />
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{part.label}</h3>
                        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                          Part {part.partNumber}
                        </span>
                      </div>
                      {part.description && (
                        <p className="text-sm text-muted-foreground">{part.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground pt-1">
                        <span>Time: {part.timeMinutes} min</span>
                        <span>Questions: {part.questionCount}</span>
                        <span>Order: {part.sortOrder}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0 ml-4">
                      <p className="text-sm font-medium">{part.stats.totalQuestions} questions</p>
                      <div className="flex gap-2 text-xs text-muted-foreground justify-end">
                        <span className="text-blue-600">{part.stats.byDifficulty.A} easy</span>
                        <span>{part.stats.byDifficulty.B} std</span>
                        <span className="text-purple-600">{part.stats.byDifficulty.C} hard</span>
                      </div>
                      <div className="flex gap-2 text-xs justify-end">
                        <span className="text-warning">{part.stats.byStatus.DRAFT} draft</span>
                        <span className="text-success">{part.stats.byStatus.ACTIVE} active</span>
                        <span className="text-error">{part.stats.byStatus.REJECTED} rejected</span>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setEditingId(part.id)}
                        className="ml-4 text-sm text-primary hover:underline flex-shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EditForm({
  part,
  onCancel,
  onSaved,
  setSaving,
  saving,
  setMessage,
}: {
  part: PartWithStats;
  onCancel: () => void;
  onSaved: () => void;
  setSaving: (v: boolean) => void;
  saving: boolean;
  setMessage: (m: { type: "success" | "error"; text: string }) => void;
}) {
  const [label, setLabel] = useState(part.label);
  const [description, setDescription] = useState(part.description ?? "");
  const [timeMinutes, setTimeMinutes] = useState(part.timeMinutes);
  const [questionCount, setQuestionCount] = useState(part.questionCount);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/parts/${part.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          description: description || null,
          timeMinutes,
          questionCount,
        }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error ?? "Failed to update part" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Time (minutes)</label>
          <input
            type="number"
            min={1}
            value={timeMinutes}
            onChange={(e) => setTimeMinutes(parseInt(e.target.value) || 1)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Question Count</label>
          <input
            type="number"
            min={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg border border-input px-4 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
