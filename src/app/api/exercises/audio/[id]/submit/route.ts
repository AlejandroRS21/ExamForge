// OpenSloth — Audio Exercise Submit API
// POST /api/exercises/audio/[id]/submit → Score comprehension answers

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitAnswers } from "@/lib/exercises/audio";
import { audioSubmitSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = audioSubmitSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const result = await submitAnswers(id, parsed.data.answers);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") || message.includes("not published") ? 404 : 500;
    console.error("[exercises/audio] POST submit error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
