// ExamForge — B2 Question Generation API
// POST /api/admin/questions/generate-b2
// Generate realistic Cambridge B2 First questions with Claude

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAllB2Questions } from "@/lib/admin/generate-b2-questions";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden: only admins/editors can generate questions" }, { status: 403 });
    }

    console.log(`[Generate B2] Starting question generation for user ${session.user.email}`);

    const result = await generateAllB2Questions();

    console.log(`[Generate B2] Complete: ${result.created} created, ${result.failed} failed`);

    return NextResponse.json({
      created: result.created,
      failed: result.failed,
      message: `Generated ${result.created} B2 questions successfully`,
    });
  } catch (error) {
    console.error("B2 question generation error:", error);
    return NextResponse.json(
      { error: `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    );
  }
}
