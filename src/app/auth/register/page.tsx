// ExamForge — Register Page
// Account creation with warm Sloth mascot cheering & 3D tactile theme

import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import { SlothMascot } from "@/components/ui/SlothMascot";

export const metadata = {
  title: "Crear Cuenta — ExamForge",
  description: "Crea tu cuenta gratuita en ExamForge y sigue tu progreso en B2 First",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-amber-50/50">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl border-2 border-amber-200/80 shadow-[0_8px_0_0_#FDE68A]">
        <div className="text-center space-y-2 flex flex-col items-center">
          <SlothMascot pose="cheering" size={140} className="mb-1" />
          <h1 className="text-2xl font-bold tracking-tight text-amber-950">
            Crear tu cuenta gratuita
          </h1>
          <p className="text-sm text-amber-800/80">
            Únete a ExamForge y domina el examen Cambridge B2 First
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-8 text-amber-800 font-medium">Cargando...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
