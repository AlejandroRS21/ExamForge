// OpenSloth — Reset Password Page
// C1: Form with token + new password, POST to /api/auth/reset-password

import { Suspense } from "react";
import { ResetForm } from "./reset-form";

export const metadata = {
  title: "Reset Password — OpenSloth",
  description: "Reset your OpenSloth account password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
