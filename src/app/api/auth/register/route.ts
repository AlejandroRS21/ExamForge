// OpenSloth — Registration API Route
// POST /api/auth/register — Creates user account with bcrypt password hash
// Optionally merges anonymous session data

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { mergeAnonymousData } from "@/lib/auth/merge";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  anonymousSessionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const rateCheck = await checkRateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { name, email, password, anonymousSessionId } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password with bcrypt (cost 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerified: new Date(), // Auto-verify for credentials
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Merge anonymous data if session exists
    if (anonymousSessionId) {
      try {
        const { attemptsMigrated, answersMigrated } = await mergeAnonymousData(
          anonymousSessionId,
          user.id,
        );
        console.log(
          `[merge] Migrated ${attemptsMigrated} attempts and ${answersMigrated} answers for user ${user.id}`,
        );
      } catch (mergeError) {
        // Log but don't fail registration — data stays on anonymous session
        console.error("[merge] Failed to merge anonymous data:", mergeError);
      }
    }

    return NextResponse.json(
      {
        user,
        message: "Account created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
