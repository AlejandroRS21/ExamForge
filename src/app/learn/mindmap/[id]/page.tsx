// ExamForge — /learn/mindmap/[id] (RSC)
// Visual mind map tree view (spec: student-content-pages — mindmap scenario):
// collapsible branches with clear visual hierarchy, warm focus-optimized
// layout, SVG icons only — zero raw emojis.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SlothPageHeader from "@/components/ui/SlothPageHeader";
import { SlothMascot } from "@/components/ui/SlothMascot";
import { MindMapViewer } from "@/components/learn/MindMapViewer";
import { BrainIcon } from "@/components/ui/icons/SlothIcons";

interface MindMapPageProps {
  params: Promise<{ id: string }>;
}

interface MindMapNode {
  id: string;
  label: string;
  children?: string[];
}

interface MindMapRawData {
  title?: string;
  nodes: MindMapNode[];
}

async function MindMapContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/learn/mindmap/${id}`);
  }

  const content = await prisma.generatedContent.findUnique({
    where: { id },
    select: {
      id: true,
      contentType: true,
      rawResponse: true,
      status: true,
    },
  });

  if (!content || content.contentType !== "MINDMAP") notFound();

  if (content.status !== "COMPLETED") {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-10 text-center shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={110} className="mx-auto" />
        <p className="mt-4 text-sm font-medium text-amber-800/80">
          Este mapa mental todavía no está disponible.
        </p>
      </div>
    );
  }

  const mindMapData = content.rawResponse as MindMapRawData | null;

  if (!mindMapData?.nodes || mindMapData.nodes.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-10 text-center shadow-[0_6px_0_0_#FDE68A]">
        <SlothMascot pose="calm" size={110} className="mx-auto" />
        <p className="mt-4 text-sm font-medium text-amber-800/80">
          No hay datos de mapa mental disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <SlothPageHeader
        badge="Mind Map"
        title={mindMapData.title ?? "Mind Map"}
        subtitle="Explora las ramas a tu ritmo: colapsa lo que ya dominas y concéntrate en una sección a la vez."
        pose="studying"
        mascotSize={140}
        backHref="/dashboard"
        backLabel="Volver al Panel"
      />

      <section
        aria-label="Mapa mental interactivo"
        className="space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900/70">
          <BrainIcon className="h-4 w-4" color="#FF6B35" />
          Estructura del tema
        </div>
        <MindMapViewer data={mindMapData} />
      </section>
    </div>
  );
}

function MindMapSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Cargando mapa mental">
      <div className="rounded-3xl border-2 border-amber-200/80 bg-white p-8">
        <div className="h-8 w-2/3 rounded-lg bg-amber-100" />
        <div className="mt-3 h-4 w-1/2 rounded bg-amber-50" />
      </div>
      <div className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-2"
            style={{ paddingLeft: `${(i % 3) * 20 + 8}px` }}
          >
            <div className="h-5 w-5 rounded bg-amber-100" />
            <div className="h-4 rounded bg-amber-100" style={{ width: `${60 + (i % 3) * 20}%` }} />
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando mapa mental...</span>
    </div>
  );
}

export default async function MindMapPage({ params }: MindMapPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<MindMapSkeleton />}>
      <MindMapContent id={id} />
    </Suspense>
  );
}