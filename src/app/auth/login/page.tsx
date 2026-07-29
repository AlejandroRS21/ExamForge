// ExamForge — Login Page
// Credentials + OAuth login with warm Sloth mascot card & 3D tactile theme

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { SlothMascot } from "@/components/ui/SlothMascot";

export const metadata = {
  title: "Iniciar Sesión — ExamForge",
  description: "Accede a tu cuenta de ExamForge para continuar tu preparación B2 First",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-amber-50/50">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl border-2 border-amber-200/80 shadow-[0_8px_0_0_#FDE68A]">
        <div className="text-center space-y-2 flex flex-col items-center">
          <SlothMascot pose="happy" size={140} className="mb-1" />
          <h1 className="text-2xl font-bold tracking-tight text-amber-950">
            Iniciar Sesión en ExamForge
          </h1>
          <p className="text-sm text-amber-800/80">
            ¡Hola de nuevo! Continúa tu camino hacia el certificado B2 First
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-8 text-amber-800 font-medium">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
