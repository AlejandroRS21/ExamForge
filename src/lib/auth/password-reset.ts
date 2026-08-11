// OpenSloth — Password Reset Utilities
// C1: Password recovery flow — generate, validate, and consume reset tokens
// MVP simulates email by logging the reset URL to console

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Generate a cryptographically secure random token.
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a password reset token for the given email.
 * Returns the token and the reset URL (for MVP logging).
 */
export async function createResetToken(email: string): Promise<{
  token: string;
  resetUrl: string;
}> {
  // Delete any existing unused tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset-password?token=${token}`;

  return { token, resetUrl };
}

/**
 * Validate a reset token and return the associated email.
 * Returns null if the token is invalid or expired.
 */
export async function validateResetToken(
  token: string,
): Promise<{ email: string } | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (new Date() > record.expiresAt) return null;

  return { email: record.email };
}

/**
 * Update the user's password using a valid reset token.
 * Marks the token as used.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const validation = await validateResetToken(token);
  if (!validation) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  const { email } = validation;

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
