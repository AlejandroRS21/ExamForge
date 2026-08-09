// ExamForge — NotebookLM Admin Dashboard (RSC)
// Full admin content manager: notebook browser, source manager, generation
// trigger with progress monitor, and draft review queue (spec:
// admin-content-manager). Neuroinclusive: SlothPageHeader (warm #FAF6F0
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
        title="Content Studio"
        subtitle="Browse notebooks, manage sources, trigger generation, and review drafts before they reach students."
        pose="studying"
        mascotSize={140}
      />

      {/* Notebook browser + source manager */}
      <NotebookLMViewer />

      {/* Generation trigger + status monitor */}
      <section className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-6 shadow-[0_6px_0_0_#FDE68A]">
        <h2 className="text-xl font-extrabold tracking-tight text-amber-950">
          Generate Content
        </h2>
        <p className="mb-5 mt-1 text-sm font-medium text-amber-800/80">
          Start a new quiz, audio exercise, or flashcard deck from a source.
          Generation runs in the background — watch the progress below.
        </p>
        <GenerateContentForm />
      </section>

      {/* Draft review queue */}
      <section className="rounded-3xl border-2 border-amber-200/80 bg-[#FAF6F0] p-6 shadow-[0_6px_0_0_#FDE68A]">
        <h2 className="text-xl font-extrabold tracking-tight text-amber-950">
          Drafts Awaiting Review
        </h2>
        <p className="mb-5 mt-1 text-sm font-medium text-amber-800/80">
          Approve or reject generated content. Approved items become visible to
          students.
        </p>
        <ReviewQueue />
      </section>
    </div>
  );
}