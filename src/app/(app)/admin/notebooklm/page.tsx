// OpenSloth — NotebookLM Admin Dashboard (RSC)
// Full admin content manager: notebook browser, source manager, generation
// trigger with progress monitor, and draft review queue (spec:
// admin-content-manager). Neuroinclusive: SlothPageHeader (warm cream
// palette + SlothMascot), tactile 3D buttons, zero raw emojis.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { NotebookLMViewer } from "@/components/admin/NotebookLMViewer";
import { GenerateContentForm } from "@/components/admin/GenerateContentForm";
import { ReviewQueue } from "@/components/admin/ReviewQueue";

export default async function NotebookLMPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  return (
    <div className="space-y-8 pb-16">
      <SlothPageHeader
        badge="NotebookLM"
        title="Estudio de contenido"
        subtitle="Explora libretas, gestiona fuentes, inicia la generación y revisa los borradores antes de que lleguen a los estudiantes."
        pose="studying"
        mascotSize={140}
      />

      {/* Notebook browser + source manager */}
      <NotebookLMViewer />

      {/* Generation trigger + status monitor */}
      <section className="rounded-3xl border-2 border-amber-200/80 bg-background p-6 shadow-[0_6px_0_0_#FDE68A]">
        <h2 className="text-xl font-extrabold tracking-tight text-amber-950">
          Generar contenido        </h2>
        <p className="mb-5 mt-1 text-sm font-medium text-amber-800/80">
          Inicia un nuevo cuestionario, ejercicio de audio o mazo de tarjetas desde una fuente.
          La generación se ejecuta en segundo plano: sigue el progreso a continuación.
        </p>
        <GenerateContentForm />
      </section>

      {/* Draft review queue */}
      <section className="rounded-3xl border-2 border-amber-200/80 bg-background p-6 shadow-[0_6px_0_0_#FDE68A]">
        <h2 className="text-xl font-extrabold tracking-tight text-amber-950">
          Borradores pendientes de revisión        </h2>
        <p className="mb-5 mt-1 text-sm font-medium text-amber-800/80">
          Aprueba o rechaza el contenido generado. Los elementos aprobados se vuelven
          visibles para los estudiantes.
        </p>
        <ReviewQueue />
      </section>
    </div>
  );
}