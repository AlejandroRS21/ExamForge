// ExamForge — Exam Completion API
// Manually complete an attempt (user clicks "Finish" or timer expires)
// POST /api/exams/complete

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { completeAttemptSchema } from "@/lib/schemas";
import { completeAttempt as completeAttemptLib, deleteTimeTracker } from "@/lib/exam/complete";

export async function POST(request: Request) {
  try {
    const session = await auth();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = completeAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { attemptId } = parsed.data;

    // Verify ownership via the attempt lookup in completeAttemptLib
    const { auth: serverAuth } = await import("@/lib/auth-core");
    const serverSession = await serverAuth();
    const userId = serverSession?.user?.id;

    // Fetch attempt to verify ownership
    const { default: prisma } = await import("@/lib/prisma");
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, userId: true, anonymousSessionId: true, status: true, type: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Handle both authenticated and anonymous attempts
    if (attempt.userId) {
      // Registered attempt — check userId matches
      if (attempt.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (attempt.anonymousSessionId) {
      // Anonymous attempt — check anonymousSessionId matches
      const anonymousSessionIdFromHeader = request.headers.get('x-anonymous-session-id');
      if (!anonymousSessionIdFromHeader || anonymousSessionIdFromHeader !== attempt.anonymousSessionId) {
        return NextResponse.json({ error: "Unauthorized - not the owner of this attempt" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Attempt already completed" }, { status: 409 });
    }

    // Complete the attempt
    const result = await completeAttemptLib(attemptId, "COMPLETED");

    // Clean up TimeTracker
    await deleteTimeTracker(attemptId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[exams/complete] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/exams/complete?attemptId=xxx
 * Check if an attempt is already completed (for page redirects)
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const attemptId = url.searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    }

    const { default: prisma } = await import("@/lib/prisma");
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        completedAt: true,
        type: true,
        correctCount: true,
        questionCount: true,
        totalScore: true,
        cambridgeScaleScore: true,
        userId: true,
        anonymousSessionId: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Add auth and ownership check
    const userId = session?.user?.id;
    // Handle both authenticated and anonymous attempts
    if (attempt.userId) {
      // Registered attempt — check userId matches
      if (attempt.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (attempt.anonymousSessionId) {
      // Anonymous attempt — check anonymousSessionId matches
      const anonymousSessionIdFromHeader = request.headers.get('x-anonymous-session-id');
      if (!anonymousSessionIdFromHeader || anonymousSessionIdFromHeader !== attempt.anonymousSessionId) {
        return NextResponse.json({ error: "Unauthorized - not the owner of this attempt" }, { status: 403 });
      }
    }
    // If neither userId nor anonymousSessionId — deny (shouldn't happen)
    if (!attempt.userId && !attempt.anonymousSessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("[exams/complete] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
