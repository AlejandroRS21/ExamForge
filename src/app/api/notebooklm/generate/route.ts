// OpenSloth — NotebookLM Content Generation API
// POST /api/notebooklm/generate → Start content generation via NotebookLM

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent } from "@/lib/notebooklm/generate";
import { generateContentSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = generateContentSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const result = await generateContent({
      sourceType: parsed.data.sourceType,
      sourceData: parsed.data.sourceData,
      contentType: parsed.data.contentType,
      createdById: session.user.id!,
      notebookId: parsed.data.notebookId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[notebooklm/generate] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
