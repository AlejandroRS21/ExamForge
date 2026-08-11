// OpenSloth — Edit History API
// GET /api/admin/history → Recent edits across all questions
// GET /api/admin/history?questionId=xxx → Edits for a specific question

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEditHistory, getRecentEdits } from "@/lib/admin/history";

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
    const questionId = url.searchParams.get("questionId");

    if (questionId) {
      const history = await getEditHistory(questionId);
      return NextResponse.json({ history });
    }

    const recent = await getRecentEdits(20);
    return NextResponse.json({ history: recent });
  } catch (error) {
    console.error("[admin/history] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
