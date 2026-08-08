// ExamForge — AI Question Generation Page
// Form to select part + count + difficulty, preview results

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { GenerateForm } from "./generate-form";
import { getStatusToneClasses } from "@/lib/design-tokens";

export default async function GenerateQuestionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const parts = await prisma.examPart.findMany({
    where: { paper: "R&UoE" },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, partNumber: true, timeMinutes: true },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Questions with AI</h1>
        <p className="text-muted-foreground mt-1">
          Select an exam part and the number of questions to generate. All generated questions
          will be saved as <strong>DRAFT</strong> and require review before they appear in exams.
        </p>
      </div>

      <GenerateForm parts={parts} />

      <div className={`rounded-xl p-4 ${getStatusToneClasses("warning", "surface")}`}>
        <h3 className="text-sm font-semibold">Important Notes</h3>
        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
          <li>
            AI-generated questions are placeholders — always review for accuracy, appropriateness,
            and alignment with Cambridge B2 First standards.
          </li>
          <li>
            Generated questions are saved as <strong>DRAFT</strong> and will not appear in student
            exams until approved.
          </li>
          <li>
            The current implementation uses a mock LLM. Replace with OpenAI/Anthropic when the
            provider choice is finalized.
          </li>
        </ul>
      </div>
    </div>
  );
}
