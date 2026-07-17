// ExamForge — Forgot Password Page
// C1: Email input form, POST to /api/auth/forgot-password

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { z } from "zod/v4";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setServerError(null);

      const result = emailSchema.safeParse({ email });
      if (!result.success) {
        setError(result.error.issues[0]?.message ?? "Invalid email");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: result.data.email }),
        });

        const data = await response.json();

        if (!response.ok) {
          setServerError(data.error ?? "Something went wrong");
          return;
        }

        setSent(true);

        // Log the reset URL in dev mode for convenience
        if (data.resetUrl) {
          console.log("Password reset URL (dev mode):", data.resetUrl);
        }
      } catch {
        setServerError("Connection error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email],
  );

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">
            If an account with that email exists, we&apos;ve sent a password reset link.
            It will expire in 1 hour.
          </p>
          <p className="text-xs text-muted-foreground">
            (In development mode, the reset link is also logged to the console and may
            appear in the API response.)
          </p>
          <Link
            href="/auth/login"
            className="inline-block text-sm text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {serverError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="email"
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
