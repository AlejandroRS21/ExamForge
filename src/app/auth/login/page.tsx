// ExamForge — Login Page
// Credentials + OAuth login with error handling

import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In — ExamForge",
  description: "Sign in to your ExamForge account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your B2 First practice journey
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
