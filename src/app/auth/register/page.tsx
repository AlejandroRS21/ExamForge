// OpenSloth — Register Page
// Account creation with warm Sloth mascot cheering & 3D tactile theme

import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import SlothPageHeader from "@/components/ui/SlothPageHeader";

export const metadata = {
  title: "Crear Cuenta — OpenSloth",
  description: "Crea tu cuenta gratuita en OpenSloth y sigue tu progreso en B2 First",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-amber-50/50">
      <div className="w-full max-w-md space-y-6">
        <SlothPageHeader
          badge="Nueva cuenta gratis"
          title="Crear tu cuenta gratuita"
          subtitle="Únete a OpenSloth y domina el examen Cambridge B2 First"
          pose="cheering"
          mascotSize={140}
          layout="stacked"
        />
        <Suspense fallback={<div className="text-center py-8 text-amber-800 font-medium">Cargando...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
