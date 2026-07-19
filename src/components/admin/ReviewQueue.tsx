// ExamForge — NotebookLM Review Queue (Client Component)
// Lists pending generated content with approve/reject buttons

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface PendingContent {
  id: string;
  sourceType: string;
  contentType: string;
  status: string;
  createdAt: string;
  errorMessage: string | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export function ReviewQueue() {
  const router = useRouter();
  const [items, setItems] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/notebooklm/pending");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to fetch queue");
        return;
      }
      const data: PendingContent[] = await res.json();
      setItems(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleReview = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    setError(null);

    try {
      const res = await fetch(`/api/notebooklm/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? `Failed to ${action.toLowerCase()} content`);
        return;
      }

      // Remove from local list
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const contentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      QUIZ: "bg-purple-100 text-purple-800 border-purple-200",
      AUDIO: "bg-blue-100 text-blue-800 border-blue-200",
      FLASHCARDS: getStatusToneClasses("success", "surface"),
    };
    const label = type.charAt(0) + type.slice(1).toLowerCase();
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[type] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
        Loading review queue...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error */}
      {error && (
        <div className={`rounded-lg px-4 py-3 text-sm ${getStatusToneClasses("error", "surface")}`}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !error && (
        <div className="rounded-xl border p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No pending content to review.
          </p>
          <a
            href="/admin/generate"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Generate New Content
          </a>
        </div>
      )}

      {/* Queue Table */}
      {items.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">By</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {contentTypeBadge(item.contentType)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {item.sourceType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {item.createdBy?.name ?? item.createdBy?.email ?? "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReview(item.id, "APPROVE")}
                        disabled={actionLoading === item.id}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-success/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("success", "solid")}`}
                      >
                        {actionLoading === item.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReview(item.id, "REJECT")}
                        disabled={actionLoading === item.id}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-error/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("error", "solid")}`}
                      >
                        {actionLoading === item.id ? "..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
