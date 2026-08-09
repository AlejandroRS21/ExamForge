// ExamForge — Personal Goals Page
// C2 (CH-04/CH-05): Set goals, view progress, manage active goals

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUserGoals } from "@/lib/challenges/goals";
import { GoalsClient } from "./goals-client";

export const metadata = {
  title: "Goals — OpenSloth",
  description: "Set and track your personal practice goals",
};

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id!;
  const goals = await getAllUserGoals(userId);

  // Serialize dates for client component
  const serializedGoals = goals.map((g) => ({
    ...g,
    startDate: g.startDate.toISOString(),
    endDate: g.endDate?.toISOString() ?? null,
    achievedAt: g.achievedAt?.toISOString() ?? null,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set accuracy and streak targets to stay motivated
          </p>
        </div>

        <GoalsClient goals={serializedGoals} />
      </div>
    </div>
  );
}
