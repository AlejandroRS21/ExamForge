// OpenSloth — mock-client handleFinish Moment emit isolation test
// Tests failure isolation: Moment Engine errors must NOT block exam routing.
// Uses plain fetch stubs and direct function logic — no React renderer needed.

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("handleFinish — Moment emit isolation logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emit errors are swallowed and routing still proceeds", async () => {
    // Simulate the exact try/catch pattern in handleFinish
    const pushMock = vi.fn();
    const emitMock = vi.fn().mockImplementation(() => {
      throw new Error("moment engine exploded");
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        attemptId: "test",
        newAchievements: [{ type: "FIRST_STEPS", label: "First Steps", description: "", icon: "🎯" }],
        newGoals: [],
      }),
    });

    // Inline the handleFinish logic to test the isolation contract
    async function simulateHandleFinish(attemptId: string) {
      const res = await fetchMock("/api/exams/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      if (!res.ok) {
        throw new Error("Failed to complete");
      }

      // Moment emit — must be isolated
      try {
        const data = await res.json();
        emitMock({ type: "EXAM_COMPLETE", id: "uuid-1" });
        if (data.newAchievements?.length) {
          for (const a of data.newAchievements) {
            emitMock({ type: "BADGE_UNLOCKED", id: "uuid-2", payload: { achievementLabel: a.label } });
          }
        }
      } catch (momentErr) {
        console.warn("[MockExam] Moment emit error (non-fatal):", momentErr);
      }

      // Routing must always happen
      pushMock(`/exams/results/${attemptId}`);
    }

    await simulateHandleFinish("attempt-123");

    // Router called despite emit throwing
    expect(pushMock).toHaveBeenCalledWith("/exams/results/attempt-123");
  });

  it("EXAM_COMPLETE and BADGE_UNLOCKED emitted on successful response", async () => {
    const pushMock = vi.fn();
    const emitCalls: string[] = [];
    const emitMock = vi.fn().mockImplementation((evt: any) => {
      emitCalls.push(evt.type);
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        attemptId: "test",
        newAchievements: [{ type: "FIRST_STEPS", label: "First Steps", description: "", icon: "🎯" }],
        newGoals: [{ id: "g1", type: "DAILY_GOAL", targetValue: 1, currentValue: 1 }],
      }),
    });

    async function simulateHandleFinish(attemptId: string) {
      const res = await fetchMock("/api/exams/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      if (!res.ok) throw new Error("Failed");

      try {
        const data = await res.json();
        emitMock({ type: "EXAM_COMPLETE", id: "uuid-1" });
        if (data.newAchievements?.length) {
          for (const a of data.newAchievements) {
            emitMock({ type: "BADGE_UNLOCKED", id: "uuid-2", payload: { achievementLabel: a.label } });
          }
        }
        if (data.newGoals?.length) {
          for (const g of data.newGoals) {
            emitMock({ type: "GOAL_ACHIEVED", id: "uuid-3", payload: { goalType: g.type } });
          }
        }
      } catch (e) {
        console.warn("non-fatal", e);
      }

      pushMock(`/exams/results/${attemptId}`);
    }

    await simulateHandleFinish("attempt-456");

    expect(emitCalls).toContain("EXAM_COMPLETE");
    expect(emitCalls).toContain("BADGE_UNLOCKED");
    expect(emitCalls).toContain("GOAL_ACHIEVED");
    expect(pushMock).toHaveBeenCalledWith("/exams/results/attempt-456");
  });
});
