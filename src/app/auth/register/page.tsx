// ExamForge — Register Page
// Account creation with optional anonymous session merging

import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Create Account — ExamForge",
  description: "Create your ExamForge account and track your B2 First progress",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start your B2 First journey and track your progress
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
