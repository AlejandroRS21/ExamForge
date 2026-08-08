// ExamForge — NotebookLM Generation Status API
// GET /api/notebooklm/generate/[id] → Get generation status and results

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGenerationStatus } from "@/lib/notebooklm/generate";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const status = await getGenerationStatus(id);

    if (!status) {
      return NextResponse.json({ error: "Generation request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...status,
      notebookId: status.notebookId ?? null,
      artifactId: status.artifactId ?? null,
      elapsedSeconds: status.elapsed ?? null,
    });
  } catch (error) {
    console.error("[notebooklm/generate] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
