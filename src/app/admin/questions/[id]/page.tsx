// ExamForge — Single Question Edit/Review Page
// View question details, edit content, approve/reject, see edit history

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuestionById } from "@/lib/admin/questions";
import { EditQuestionForm } from "./edit-form";
import { ReviewButtons } from "./review-buttons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionEditPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Question not found</h1>
        <p className="text-muted-foreground mt-2">
          The question you are looking for does not exist.
        </p>
        <Link
          href="/admin/questions"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground mt-6 hover:bg-primary/90 transition-colors"
        >
          Back to Question Bank
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/questions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Question Bank
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {question.examPart.label} — {question.type}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {question.aiGenerated ? "AI-generated" : "Manually created"} ·{" "}
              Difficulty {question.difficulty} · v{question.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {question.status === "DRAFT" && (
              <ReviewButtons questionId={id} status={question.status} />
            )}
            <StatusBadge status={question.status} />
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <EditQuestionForm question={question} />

      {/* Edit History */}
      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Edit History</h2>
        {(question as any).edits?.length > 0 ? (
          <div className="space-y-3">
            {(question as any).edits.map((edit: any) => (
              <div key={edit.id} className="border-l-2 border-muted pl-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {edit.editor.name ?? edit.editor.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(edit.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Changed: {Object.keys(edit.changes).join(", ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No edits recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACTIVE: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {status}
    </span>
  );
}
