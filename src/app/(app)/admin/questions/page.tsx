// OpenSloth — Question Bank Page
// Filterable, paginated list of questions with bulk approve/reject

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { QuestionFilters } from "@/lib/admin/questions";
import { listQuestions, getAllSkills } from "@/lib/admin/questions";
import type { QuestionType, QuestionDifficulty, QuestionStatus } from "@/generated/prisma/client";
import { QuestionsFilterBar } from "./questions-filter-bar";
import { QuestionsTable } from "./questions-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    examPartId?: string;
    type?: string;
    difficulty?: string;
    status?: string;
    skills?: string;
    search?: string;
  }>;
}

export interface QuestionListItem {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  skillsTested: string[];
  aiGenerated: boolean;
  createdAt: Date;
  examPart: {
    id: string;
    label: string;
    paper: string;
    partNumber: number;
  };
}

export default async function AdminQuestionsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const params = await searchParams;
  const filters: QuestionFilters = {
    page: parseInt(params.page ?? "1"),
    pageSize: parseInt(params.pageSize ?? "20"),
    examPartId: params.examPartId || undefined,
    type: (params.type as QuestionFilters["type"]) || undefined,
    difficulty: (params.difficulty as QuestionFilters["difficulty"]) || undefined,
    status: (params.status as QuestionFilters["status"]) || undefined,
    skills: params.skills?.split(",").filter(Boolean),
    search: params.search || undefined,
  };

  const [result, allSkills, parts] = await Promise.all([
    listQuestions(filters),
    getAllSkills(),
    getExamParts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de preguntas</h1>
          <p className="text-muted-foreground mt-1">
            {result.total} pregunta{result.total !== 1 ? "s" : ""} en total
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/questions/generate-b2"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Generar con IA
          </Link>
          <Link
            href="/admin/questions?status=DRAFT"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Review Drafts
          </Link>
        </div>
      </div>

      <QuestionsFilterBar
        parts={parts}
        allSkills={allSkills}
        currentFilters={{
          ...filters,
          skills: filters.skills?.join(",") ?? "",
        }}
      />

      <QuestionsTable
        questions={result.items as QuestionListItem[]}
        pagination={{
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        }}
      />
    </div>
  );
}

async function getExamParts() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.examPart.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, paper: true, partNumber: true },
  });
}
