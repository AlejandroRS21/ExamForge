// ExamForge — NotebookLM Review Queue Page
// Approve or reject generated interactive learning content

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewQueue } from "@/components/admin/ReviewQueue";

export default async function ReviewContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve generated content before it is published to students.
        </p>
      </div>

      <ReviewQueue />
    </div>
  );
}
