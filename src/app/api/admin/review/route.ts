// ExamForge — Question Review API
// POST /api/admin/review → Approve/reject individual or bulk questions

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  approveQuestion,
  rejectQuestion,
  bulkApprove,
  bulkReject,
  getReviewQueue,
} from "@/lib/admin/review";
import { approveQuestionsSchema } from "@/lib/schemas";

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
    const filters = {
      examPartId: url.searchParams.get("examPartId") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
      page: parseInt(url.searchParams.get("page") ?? "1"),
      pageSize: parseInt(url.searchParams.get("pageSize") ?? "20"),
    };

    const queue = await getReviewQueue(filters);
    return NextResponse.json(queue);
  } catch (error) {
    console.error("[admin/review] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { action, questionIds } = body;

    if (!action || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "action and questionIds[] are required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "approve": {
        if (questionIds.length === 1) {
          const question = await approveQuestion(questionIds[0], editorId);
          return NextResponse.json({ updated: 1, question });
        }
        const result = await bulkApprove(questionIds, editorId);
        return NextResponse.json(result);
      }

      case "reject": {
        if (questionIds.length === 1) {
          const question = await rejectQuestion(questionIds[0], editorId);
          return NextResponse.json({ updated: 1, question });
        }
        const result = await bulkReject(questionIds, editorId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use "approve" or "reject".` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[admin/review] POST error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
