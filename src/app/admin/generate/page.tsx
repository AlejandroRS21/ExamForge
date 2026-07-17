// ExamForge — NotebookLM Content Generation Page
// Generate interactive learning content (quizzes, audio, flashcards) via NotebookLM

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenerateContentForm } from "@/components/admin/GenerateContentForm";

export default async function GenerateContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Learning Content</h1>
        <p className="text-muted-foreground mt-1">
          Use NotebookLM to generate interactive learning materials from URLs, text, or
          YouTube videos. Generated content requires review before it is published.
        </p>
      </div>

      <GenerateContentForm />

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <h3 className="text-sm font-semibold text-amber-800">About Generation</h3>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>
            Content is generated using NotebookLM and saved with <strong>COMPLETED</strong> status.
          </li>
          <li>
            Generated content must be reviewed and approved before it becomes available to students.
          </li>
          <li>
            Audio exercises will show as placeholder until NotebookLM audio generation is fully
            integrated.
          </li>
        </ul>
      </div>
    </div>
  );
}
