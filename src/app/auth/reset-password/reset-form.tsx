// ExamForge — Reset Password Form
// C1: Client component wrapped in Suspense

"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod/v4";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number",
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormErrors = Partial<Record<"password" | "confirmPassword", string>>;

export function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      setServerError(null);

      if (!token) {
        setServerError("Missing reset token. Please use the link from your email.");
        return;
      }

      const result = resetSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const fieldErrors: FormErrors = {};
        for (const issue of result.error.issues) {
          const path = issue.path[0] as keyof FormErrors;
          if (path) fieldErrors[path] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: result.data.password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setServerError(data.error ?? "Failed to reset password");
          return;
        }

        setSuccess(true);
      } catch {
        setServerError("Connection error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, password, confirmPassword],
  );

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Invalid Link</h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link
          href="/auth/login"
          className="inline-block text-sm text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-success-surface flex items-center justify-center mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Password Reset</h1>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link
          href="/auth/login"
          className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
