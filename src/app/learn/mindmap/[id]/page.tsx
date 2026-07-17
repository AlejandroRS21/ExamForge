// ExamForge — Mind Map Student Page
// Server component: fetches GeneratedContent with contentType=MINDMAP, renders MindMapViewer

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MindMapViewer } from "@/components/learn/MindMapViewer";

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

  if (!content || content.contentType !== "MINDMAP") {
    notFound();
  }

  if (content.status !== "COMPLETED") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This mind map is not currently available.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const mindMapData = content.rawResponse as MindMapRawData | null;

  if (!mindMapData?.nodes || mindMapData.nodes.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No mind map data available.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{mindMapData.title ?? "Mind Map"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mindMapData.nodes.length} node{mindMapData.nodes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <MindMapViewer data={mindMapData} />
    </div>
  );
}

function MindMapSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading mind map">
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded-lg bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted/60" />
      </div>
      <div className="rounded-xl border bg-card">
        <div className="px-4 py-3 border-b">
          <div className="h-3 w-20 rounded bg-muted/60" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 20 + 8}px` }}>
              <div className="h-5 w-5 rounded bg-muted" />
              <div className="h-4 rounded bg-muted" style={{ width: `${60 + (i % 3) * 20}%` }} />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading mind map...</span>
    </div>
  );
}

export default async function MindMapPage({ params }: MindMapPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="text-sm font-bold tracking-tight hover:text-primary transition-colors"
          >
            ExamForge
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/exams"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Exams
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <Suspense fallback={<MindMapSkeleton />}>
          <MindMapContent id={id} />
        </Suspense>
      </main>
    </div>
  );
}
