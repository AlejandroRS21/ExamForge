// ExamForge — Goals Client Component
// C2: Goal management UI — set goal, view progress, delete

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type GoalType = "ACCURACY" | "STREAK";

type GoalData = {
  id: string;
  userId: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string | null;
  achieved: boolean;
  achievedAt: string | null;
};

type GoalsClientProps = {
  goals: GoalData[];
};

const GOAL_TYPES = [
  { value: "ACCURACY" as const, label: "Accuracy Target", desc: "Achieve a certain average accuracy %" },
  { value: "STREAK" as const, label: "Streak Target", desc: "Maintain a consecutive day streak" },
];

function getGoalLabel(type: GoalType): string {
  return GOAL_TYPES.find((gt) => gt.value === type)?.label ?? type;
}

function getGoalDescription(type: GoalType, target: number): string {
  if (type === "ACCURACY") return `Achieve ${target}% average accuracy`;
  return `Maintain a ${target}-day streak`;
}

export function GoalsClient({ goals }: GoalsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>("ACCURACY");
  const [targetValue, setTargetValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Properly serialize dates for client component
  const parsedGoals: GoalData[] = goals.map((g) => ({
    ...g,
    startDate: typeof g.startDate === "string" ? g.startDate : g.startDate,
    endDate: typeof g.endDate === "string" ? g.endDate : g.endDate,
    achievedAt: typeof g.achievedAt === "string" ? g.achievedAt : g.achievedAt,
  }));

  const activeGoal = parsedGoals.find((g) => !g.achieved);

  const handleSetGoal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const target = parseInt(targetValue, 10);
      if (isNaN(target) || target < 1) {
        setError("Please enter a valid target value");
        return;
      }

      const maxTarget = goalType === "ACCURACY" ? 100 : 365;
      if (target > maxTarget) {
        setError(`Maximum target is ${maxTarget}`);
        return;
      }

      setIsSaving(true);
      try {
        const response = await fetch("/api/auth/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: goalType,
            targetValue: target,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error ?? "Failed to set goal");
          return;
        }

        setShowForm(false);
        setTargetValue("");
        router.refresh();
      } catch {
        setError("Connection error. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [goalType, targetValue, router],
  );

  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      try {
        await fetch(`/api/auth/goals?id=${goalId}`, {
          method: "DELETE",
        });
        router.refresh();
      } catch {
        setError("Failed to delete goal");
      }
    },
    [router],
  );

  return (
    <div className="space-y-6">
      {/* Active Goal */}
      {activeGoal && (
        <div className="rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Goal</h2>
            <button
              onClick={() => handleDeleteGoal(activeGoal.id)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {getGoalLabel(activeGoal.type)}
              </span>
              <span className="text-sm text-muted-foreground">
                {activeGoal.currentValue} / {activeGoal.targetValue}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {getGoalDescription(activeGoal.type, activeGoal.targetValue)}
            </p>
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(
                    (activeGoal.currentValue / activeGoal.targetValue) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {activeGoal.achieved && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              🎉 Goal achieved!
            </div>
          )}
        </div>
      )}

      {/* Achieved Goals History */}
      {parsedGoals.filter((g) => g.achieved).length > 0 && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Achieved Goals</h2>
          <div className="space-y-3">
            {parsedGoals
              .filter((g) => g.achieved)
              .map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {getGoalLabel(goal.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getGoalDescription(goal.type, goal.targetValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Achieved ✓
                    </span>
                    {goal.achievedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(goal.achievedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State / Set New Goal */}
      {!activeGoal && !showForm && (
        <div className="rounded-xl border border-dashed p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl">🎯</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">No active goal</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set a personal target to track your progress
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Set a Goal
          </button>
        </div>
      )}

      {/* Set Goal Form */}
      {showForm && (
        <div className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Set a New Goal</h2>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSetGoal} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {GOAL_TYPES.map((gt) => (
                  <option key={gt.value} value={gt.value}>
                    {gt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {GOAL_TYPES.find((gt) => gt.value === goalType)?.desc}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Target Value
                <span className="text-xs text-muted-foreground ml-2">
                  {goalType === "ACCURACY" ? "(%)" : "(days)"}
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={goalType === "ACCURACY" ? "100" : "365"}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={goalType === "ACCURACY" ? "e.g. 80" : "e.g. 7"}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Set Goal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Dashboard
        </Link>
        {!activeGoal && !showForm && parsedGoals.filter((g) => g.achieved).length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-primary hover:underline"
          >
            Set another goal
          </button>
        )}
      </div>
    </div>
  );
}
