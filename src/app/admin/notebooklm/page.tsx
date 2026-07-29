// ExamForge — NotebookLM Admin Page
// Two-panel layout: notebook browser on left, sources on right

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotebookLMViewer } from "@/components/admin/NotebookLMViewer";

export default async function NotebookLMPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NotebookLM</h1>
        <p className="text-muted-foreground mt-1">
          Browse your NotebookLM notebooks and generate interactive learning content from sources.
        </p>
      </div>

      <NotebookLMViewer />
    </div>
  );
}
