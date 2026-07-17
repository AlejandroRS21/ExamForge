// ExamForge — Admin User Role API Route
// PATCH /api/admin/users/role — Update user role

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUserRole } from "@/lib/admin/users";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requesterRole = (session.user as any).role;
  if (requesterRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  const validRoles = ["USER", "ADMIN", "EDITOR", "VIEWER"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const updated = await updateUserRole(userId, role, session.user.id!);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
