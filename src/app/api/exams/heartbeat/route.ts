// ExamForge — Timer Heartbeat API
// EE-05: Timer SHALL continue counting if tab loses focus (server-authoritative)
// EE-04: Mock mode SHALL auto-submit when timer reaches 0:00
// POST /api/exams/heartbeat — decrement remaining, return version, trigger auto-complete

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { heartbeatSchema } from "@/lib/schemas";
import { completeAttempt, deleteTimeTracker } from "@/lib/exam/complete";

export async function POST(request: Request) {
  try {
    const session = await auth();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate with Zod
    const parsed = heartbeatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { attemptId } = parsed.data;

    // Verify attempt exists and is MOCK type
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        type: true,
        userId: true,
        anonymousSessionId: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Verify the user owns this attempt
    const userId = session?.user?.id;
    if (attempt.userId && attempt.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If already completed, return final state
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({
        remainingSeconds: 0,
        version: -1,
        status: attempt.status,
        completed: true,
      });
    }

    // Read TimeTracker with optimistic locking
    const tracker = await prisma.timeTracker.findUnique({
      where: { attemptId },
    });

    if (!tracker) {
      return NextResponse.json({ error: "TimeTracker not found" }, { status: 404 });
    }

    // Calculate elapsed seconds since last heartbeat
    const now = new Date();
    const elapsed = Math.floor(
      (now.getTime() - tracker.lastHeartbeatAt.getTime()) / 1000,
    );

    // Clamp: minimum 30s (standard heartbeat interval), maximum 300s (safety against long gaps)
    const decrement = Math.max(30, Math.min(elapsed, 300));

    // Calculate new remaining time
    let newRemaining = Math.max(0, tracker.remainingSeconds - decrement);
    let attemptStatus: "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT" = attempt.status;
    let autoCompleted = false;

    // If timer expired, auto-complete
    if (newRemaining <= 0 && attempt.type === "MOCK") {
      newRemaining = 0;

      // Update tracker first (to mark as expired)
      await prisma.timeTracker.update({
        where: { id: tracker.id },
        data: {
          remainingSeconds: 0,
          lastHeartbeatAt: now,
          version: { increment: 1 },
        },
      });

      // Run auto-complete
      const result = await completeAttempt(attemptId, "TIMED_OUT");
      await deleteTimeTracker(attemptId);
      attemptStatus = result.status;
      autoCompleted = true;

      return NextResponse.json({
        remainingSeconds: 0,
        version: -1,
        status: attemptStatus,
        completed: true,
        autoCompleted: true,
        result: {
          questionCount: result.questionCount,
          answerCount: result.answerCount,
          correctCount: result.correctCount,
          totalScore: result.totalScore,
          cambridgeScaleScore: result.cambridgeScaleScore,
        },
      });
    }

    // Normal heartbeat: update TimeTracker with version check
    try {
      const updated = await prisma.timeTracker.update({
        where: {
          id: tracker.id,
          version: tracker.version, // Optimistic lock
        },
        data: {
          remainingSeconds: newRemaining,
          lastHeartbeatAt: now,
          version: { increment: 1 },
        },
      });

      return NextResponse.json({
        remainingSeconds: updated.remainingSeconds,
        version: updated.version,
        status: "IN_PROGRESS",
        completed: false,
        heartbeatAt: now.toISOString(),
      });
    } catch {
      // Version conflict — another heartbeat won; return current state
      const currentTracker = await prisma.timeTracker.findUnique({
        where: { attemptId },
      });

      return NextResponse.json({
        remainingSeconds: currentTracker?.remainingSeconds ?? 0,
        version: currentTracker?.version ?? -1,
        status: "IN_PROGRESS",
        completed: false,
        conflictRetry: true,
      });
    }
  } catch (error) {
    console.error("[exams/heartbeat] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
