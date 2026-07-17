// ExamForge — NotebookLM Content Review API
// POST /api/notebooklm/review/[id] → Approve or reject generated content

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reviewContent } from "@/lib/notebooklm/generate";
import { reviewContentSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = reviewContentSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const result = await reviewContent(
      id,
      parsed.data.action,
      session.user.id!,
      parsed.data.reason,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notebooklm/review] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
