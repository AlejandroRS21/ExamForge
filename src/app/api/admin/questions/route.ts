// ExamForge — Question Bank API
// GET  /api/admin/questions  → List questions with filters
// POST /api/admin/questions  → Create a new question

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { QuestionFilters } from "@/lib/admin/questions";
import { listQuestions, createQuestion, getAllSkills } from "@/lib/admin/questions";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const filters: QuestionFilters = {
      page: parseInt(url.searchParams.get("page") ?? "1"),
      pageSize: parseInt(url.searchParams.get("pageSize") ?? "20"),
      examPartId: url.searchParams.get("examPartId") ?? undefined,
      type: (url.searchParams.get("type") as QuestionFilters["type"]) ?? undefined,
      difficulty: (url.searchParams.get("difficulty") as QuestionFilters["difficulty"]) ?? undefined,
      status: (url.searchParams.get("status") as QuestionFilters["status"]) ?? undefined,
      skills: url.searchParams.get("skills")?.split(",").filter(Boolean) ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
    };

    const includeSkills = url.searchParams.get("includeSkills") === "true";

    const [questions, skills] = await Promise.all([
      listQuestions(filters),
      includeSkills ? getAllSkills() : Promise.resolve([]),
    ]);

    return NextResponse.json({ ...questions, skills });
  } catch (error) {
    console.error("[admin/questions] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const question = await createQuestion({
      examPartId: body.examPartId,
      type: body.type,
      prompt: body.prompt,
      options: body.options,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation,
      difficulty: body.difficulty,
      skillsTested: body.skillsTested,
      aiGenerated: false,
      status: "ACTIVE",
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("[admin/questions] POST error:", error);
    if (error instanceof Error && error.message === "ExamPart not found") {
      return NextResponse.json({ error: "ExamPart not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
