// ExamForge — Forgot Password API Route
// C1: POST /api/auth/forgot-password — creates reset token, logs URL (MVP simulates email)

import { NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { createResetToken } from "@/lib/auth/password-reset";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    // Rate limit by IP — 3 requests per 15 min per IP
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const rateCheck = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rateCheck.remaining),
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Check if the user exists — always return success to avoid email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      // Return success to prevent email enumeration
      return NextResponse.json({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      });
    }

    const { resetUrl } = await createResetToken(email);

    // MVP: Log the reset URL to console instead of sending email
    console.log("═══════════════════════════════════════════");
    console.log("  PASSWORD RESET — SIMULATED EMAIL");
    console.log(`  To: ${email}`);
    console.log(`  Reset URL: ${resetUrl}`);
    console.log("  Expires: 1 hour");
    console.log("═══════════════════════════════════════════");

    return NextResponse.json({
      message:
        "If an account with this email exists, a password reset link has been sent.",
      // MVP: Include resetUrl in response for development convenience
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
