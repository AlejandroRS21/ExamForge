// OpenSloth — Admin Parts API Route
// PATCH /api/admin/parts/[id] — Update exam part configuration

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePart } from "@/lib/admin/parts";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Validate input
  const { label, description, timeMinutes, questionCount } = body;

  if (timeMinutes !== undefined && (typeof timeMinutes !== "number" || timeMinutes < 1)) {
    return NextResponse.json({ error: "Invalid timeMinutes" }, { status: 400 });
  }
  if (questionCount !== undefined && (typeof questionCount !== "number" || questionCount < 1)) {
    return NextResponse.json({ error: "Invalid questionCount" }, { status: 400 });
  }

  try {
    const updated = await updatePart(id, {
      label,
      description,
      timeMinutes,
      questionCount,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update part:", error);
    return NextResponse.json({ error: "Failed to update part" }, { status: 500 });
  }
}
