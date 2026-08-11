// OpenSloth — Login Page
// Credentials + OAuth login with warm Sloth mascot card & 3D tactile theme

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import SlothPageHeader from "@/components/ui/SlothPageHeader";

export const metadata = {
  title: "Iniciar Sesión — OpenSloth",
  description: "Accede a tu cuenta de OpenSloth para continuar tu preparación B2 First",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-amber-50/50">
      <div className="w-full max-w-md space-y-6">
        <SlothPageHeader
          badge="Accede a tu cuenta"
          title="Iniciar Sesión en OpenSloth"
          subtitle="¡Hola de nuevo! Continúa tu camino hacia el certificado B2 First"
          pose="happy"
          mascotSize={140}
          layout="stacked"
        />
        <Suspense fallback={<div className="text-center py-8 text-amber-800 font-medium">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
