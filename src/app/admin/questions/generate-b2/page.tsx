// ExamForge — B2 Question Generation Page
// Generate realistic Cambridge B2 First questions with AI

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenerateB2Form } from "./generate-b2-form";

export default async function GenerateB2QuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate B2 Questions with AI</h1>
        <p className="text-muted-foreground mt-1">
          Use Claude to generate realistic Cambridge B2 First exam questions. All generated questions are saved as{" "}
          <strong>DRAFT</strong> and require review.
        </p>
      </div>

      <GenerateB2Form />

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Coverage</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">R&UoE (7 parts)</h3>
            <ul className="text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Part 1: MC Vocabulary</li>
              <li>Part 2: Open Cloze</li>
              <li>Part 3: Word Formation</li>
              <li>Part 4: Key Word Transform</li>
              <li>Part 5: Gapped Text</li>
              <li>Part 6: Multiple Matching</li>
              <li>Part 7: Multiple Matching (long)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Writing (2 parts)</h3>
            <ul className="text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Part 1: Essay (220-260 words)</li>
              <li>Part 2: Flexible (email/article/report/review)</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Total:</strong> ~34 questions across all parts
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-2">
        <h3 className="font-semibold text-blue-900">ℹ️ How it works</h3>
        <ul className="text-sm text-blue-900 list-disc list-inside space-y-1">
          <li>Claude generates B2 questions using official Cambridge criteria</li>
          <li>Questions include explanation + skills tested (vocabulary, grammar, etc)</li>
          <li>Difficulty varies: A (easy), B (standard), C (challenge)</li>
          <li>All saved as DRAFT — you review before they appear in exams</li>
          <li>Generation takes ~2-3 minutes for the full set</li>
        </ul>
      </div>
    </div>
  );
}
