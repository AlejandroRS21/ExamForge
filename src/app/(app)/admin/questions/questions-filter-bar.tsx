// OpenSloth — Question Filter Bar (Client Component)

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

interface FilterBarProps {
  parts: Array<{ id: string; label: string; paper: string; partNumber: number }>;
  allSkills: string[];
  currentFilters: {
    examPartId?: string;
    type?: string;
    difficulty?: string;
    status?: string;
    skills?: string;
    search?: string;
  };
}

const questionTypes = [
  { value: "MC", label: "Multiple Choice" },
  { value: "CLOZE", label: "Open Cloze" },
  { value: "WF", label: "Word Formation" },
  { value: "KT", label: "Key Transformations" },
  { value: "GT", label: "Gapped Text" },
  { value: "MM", label: "Multiple Matching" },
];

const difficultyLevels = [
  { value: "A", label: "A — Easy" },
  { value: "B", label: "B — Standard" },
  { value: "C", label: "C — Challenge" },
];

const statuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "REJECTED", label: "Rejected" },
];

export function QuestionsFilterBar({
  parts,
  allSkills,
  currentFilters,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentFilters.search ?? "");

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1"); // Reset to first page on filter change
      router.push(`/admin/questions?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilter("search", search || undefined);
    },
    [search, updateFilter],
  );

  return (
    <div className="rounded-xl border p-4 space-y-4">
      {/* Row 1: Search + Part filter */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar preguntas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-9 w-64 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Buscar
          </button>
        </form>

        <select
          value={currentFilters.examPartId ?? ""}
          onChange={(e) => updateFilter("examPartId", e.target.value || undefined)}
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todas las partes</option>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.type ?? ""}
          onChange={(e) => updateFilter("type", e.target.value || undefined)}
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos los tipos</option>
          {questionTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.difficulty ?? ""}
          onChange={(e) => updateFilter("difficulty", e.target.value || undefined)}
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todas las dificultades</option>
          {difficultyLevels.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.status ?? ""}
          onChange={(e) => updateFilter("status", e.target.value || undefined)}
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.skills ?? ""}
          onChange={(e) => updateFilter("skills", e.target.value || undefined)}
          className="flex h-9 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todas las habilidades</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Active filters display */}
      {Object.entries(currentFilters).some(([, v]) => v) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          <button
            onClick={() => router.push("/admin/questions")}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
