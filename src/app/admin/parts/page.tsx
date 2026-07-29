// ExamForge — Admin Exam Parts Configuration
// T-803: Manage B2 First exam parts, timing, question counts

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listParts, getPartStats } from "@/lib/admin/parts";
import { PartsClient } from "./parts-client";

export default async function AdminPartsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const parts = await listParts();

  // Get stats for each part
  const partsWithStats = await Promise.all(
    parts.map(async (part) => {
      const stats = await getPartStats(part.id);
      return { ...part, stats };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Parts</h1>
        <p className="text-muted-foreground mt-1">
          Configure B2 First exam structure — timing, question counts, and part metadata.
        </p>
      </div>

      <PartsClient parts={partsWithStats} role={role} />
    </div>
  );
}
