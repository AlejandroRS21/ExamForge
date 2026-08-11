// OpenSloth — NotebookLM Pending Content API
// GET /api/notebooklm/pending → List completed content awaiting review

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPendingContent } from "@/lib/notebooklm/generate";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pending = await listPendingContent();
    return NextResponse.json(pending);
  } catch (error) {
    console.error("[notebooklm/pending] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
