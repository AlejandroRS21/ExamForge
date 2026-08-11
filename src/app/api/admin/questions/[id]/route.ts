// OpenSloth — Single Question API
// GET    /api/admin/questions/[id]  → Get question details
// PUT    /api/admin/questions/[id]  → Update question
// DELETE /api/admin/questions/[id]  → Delete question

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuestionById, updateQuestion, deleteQuestion } from "@/lib/admin/questions";
import { recordEdit } from "@/lib/admin/history";

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
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const question = await getQuestionById(id);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("[admin/questions/id] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const editorId = session.user.id!;
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Fetch current state for diff tracking
    const existing = await getQuestionById(id);
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Track changes for history
    const changes: Record<string, { before: any; after: any }> = {};
    const trackedFields = [
      "prompt", "options", "correctAnswer", "explanation",
      "difficulty", "skillsTested", "status", "type",
    ];

    for (const field of trackedFields) {
      if (body[field] !== undefined) {
        const before = JSON.stringify((existing as any)[field]);
        const after = JSON.stringify(body[field]);
        if (before !== after) {
          changes[field] = {
            before: (existing as any)[field],
            after: body[field],
          };
        }
      }
    }

    // Apply update
    const updateData: any = {};
    if (body.prompt !== undefined) updateData.prompt = body.prompt;
    if (body.options !== undefined) updateData.options = body.options;
    if (body.correctAnswer !== undefined) updateData.correctAnswer = body.correctAnswer;
    if (body.explanation !== undefined) updateData.explanation = body.explanation;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.skillsTested !== undefined) updateData.skillsTested = body.skillsTested;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.type !== undefined) updateData.type = body.type;

    const updated = await updateQuestion(id, updateData);

    // Record edit history
    if (Object.keys(changes).length > 0) {
      await recordEdit({ questionId: id, editorId, changes });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/questions/id] PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: "Forbidden — only admins can delete questions" }, { status: 403 });
    }

    const { id } = await params;
    await deleteQuestion(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/questions/id] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
