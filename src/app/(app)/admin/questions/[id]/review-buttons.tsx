// OpenSloth — Review Action Buttons (Client Component)
// Approve/reject a single question

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface ReviewButtonsProps {
  questionId: string;
  status: string;
}

export function ReviewButtons({ questionId, status }: ReviewButtonsProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          questionIds: [questionId],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Question ${action === "approve" ? "approved" : "rejected"} successfully.`,
        });
        setTimeout(() => router.refresh(), 1000);
      } else {
        setMessage({ type: "error", text: data.error ?? "Operation failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {message ? (
        <span
          className={`text-xs font-medium ${
            message.type === "success" ? "text-success" : "text-error"
          }`}
        >
          {message.text}
        </span>
      ) : (
        <>
          <button
            onClick={() => handleAction("approve")}
            disabled={processing}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-success/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("success", "solid")}`}
          >
            {processing ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={processing}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-error/90 disabled:opacity-50 transition-colors ${getStatusToneClasses("error", "solid")}`}
          >
            {processing ? "..." : "Reject"}
          </button>
        </>
      )}
    </div>
  );
}
