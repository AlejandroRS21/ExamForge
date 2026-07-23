// ExamForge — Question CSV Import Page
// Admin UI for uploading and bulk-importing questions

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportForm } from "./import-form";

export default async function AdminImportQuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Questions from CSV</h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV file containing Cambridge B2 First questions. All imported questions are saved as{" "}
          <strong>DRAFT</strong> and require review before appearing in exams.
        </p>
      </div>

      <ImportForm />

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">CSV Format</h2>
        <p className="text-sm text-muted-foreground">
          Your CSV must have these columns (comma-separated):
        </p>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs font-mono">
            examPartId,type,prompt,options,correctAnswer,difficulty,skillsTested,explanation
          </code>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-foreground">examPartId</span>
            <p className="text-muted-foreground">Internal ID of the exam part (e.g., "ruoe-part-1")</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">type</span>
            <p className="text-muted-foreground">One of: MC, CLOZE, WF, KT, GT, MM</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">prompt</span>
            <p className="text-muted-foreground">Question text (can be quoted if it contains commas)</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">options</span>
            <p className="text-muted-foreground">
              JSON array of choices (for MC) OR semicolon-separated list: ["A","B","C","D"]
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">correctAnswer</span>
            <p className="text-muted-foreground">
              The answer: single letter (MC), text, or JSON depending on question type
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">difficulty</span>
            <p className="text-muted-foreground">One of: A (easy), B (standard), C (challenge)</p>
          </div>
          <div>
            <span className="font-semibold text-foreground">skillsTested</span>
            <p className="text-muted-foreground">
              Optional. Semicolon-separated skills: "vocabulary;grammar" OR JSON array
            </p>
          </div>
          <div>
            <span className="font-semibold text-foreground">explanation</span>
            <p className="text-muted-foreground">Optional explanation text for the answer</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Example Row</h2>
        <div className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
          <div>ruoe-part-1,MC,"The school has a new ...",["facility","building","structure"],A,B,"vocabulary;synonyms","A is the most direct synonym"</div>
        </div>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 space-y-2">
        <h3 className="font-semibold text-orange-900">⚠️ Important</h3>
        <ul className="text-sm text-orange-900 list-disc list-inside space-y-1">
          <li>All imported questions are automatically set to DRAFT status.</li>
          <li>You must review each question for accuracy before it appears in exams.</li>
          <li>Duplicate questions are not automatically detected — verify your CSV before import.</li>
          <li>The import is atomic — if the upload fails, no questions are added.</li>
        </ul>
      </div>
    </div>
  );
}
