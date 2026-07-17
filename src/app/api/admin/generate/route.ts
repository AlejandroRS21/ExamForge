// ExamForge — AI Question Generation API
// POST /api/admin/generate → Generate questions via LLM and store as DRAFT

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuestions } from "@/lib/admin/generate";
import { generateQuestionsSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = generateQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const result = await generateQuestions({
      examPartId: parsed.data.examPartId,
      count: parsed.data.count,
      difficulty: parsed.data.difficulty,
    });

    const statusCode = result.errors.length > 0 && result.generated === 0 ? 500 : 200;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("[admin/generate] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
