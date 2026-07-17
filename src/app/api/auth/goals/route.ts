// ExamForge — Goals API Route
// C2: POST /api/auth/goals — set a new goal
//     DELETE /api/auth/goals?id=xxx — delete a goal

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { setGoal, deleteGoal } from "@/lib/challenges/goals";

const setGoalSchema = z.object({
  type: z.enum(["ACCURACY", "STREAK"]),
  targetValue: z.number().int().min(1).max(365),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = setGoalSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const goal = await setGoal(session.user.id, {
      type: parsed.data.type,
      targetValue: parsed.data.targetValue,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("[goals] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    await deleteGoal(goalId);

    return NextResponse.json({ message: "Goal deleted" });
  } catch (error) {
    console.error("[goals] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
