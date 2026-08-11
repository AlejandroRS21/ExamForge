// OpenSloth — Practice Finish Route — no-leak guard (P-S-2)
// Server-side grading only: correctAnswer MUST never appear in the response
// JSON or in anything the route writes back to the attempt. Tests run the
// route with a mocked prisma proxy (defaults per method, overridable per test).

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { createPracticeAttempt } from "@/lib/exam/create";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Prisma mock: one Proxy that routes every model method through a shared set
// of vi.fn() spies with safe defaults, so hooks (streak/achievements/goals)
// inside completeAttempt resolve without crashing.
const h = vi.hoisted(() => {
  const impls: Record<string, (...args: any[]) => any> = {
    findMany: async () => [],
    findFirst: async () => null,
    findFirstOrThrow: async () => null,
    findUnique: async () => ({
      id: "neutral",
      lastActiveDate: new Date(),
      currentStreak: 1,
      longestStreak: 1,
    }),
    findUniqueOrThrow: async () => null,
    create: async ({ data }: any) => data,
    createMany: async () => ({ count: 0 }),
    createManyAndReturn: async () => [],
    update: async ({ data }: any) => data,
    updateMany: async () => ({ count: 0 }),
    updateManyAndReturn: async () => [],
    upsert: async ({ create }: any) => create,
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
    count: async () => 0,
    aggregate: async () => ({}),
    groupBy: async () => [],
  };
  const fns: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const [k, impl] of Object.entries(impls)) fns[k] = vi.fn(impl);
  return { impls, fns };
});

vi.mock("@/lib/prisma", () => {
  const handler: ProxyHandler<any> = {
    get: (_t, prop: string | symbol) => {
      if (typeof prop === "string" && prop.startsWith("$")) {
        if (prop === "$transaction") {
          return (arg: any) => (Array.isArray(arg) ? Promise.all(arg) : arg(proxy));
        }
        return async () => {};
      }
      const key = String(prop);
      if (key in h.fns) return h.fns[key];
      return new Proxy(() => {}, handler);
    },
  };
  const proxy = new Proxy({}, handler);
  return { prisma: proxy, default: proxy };
});

const authMock = vi.mocked(auth);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/exams/practice/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Attempt row as completeAttempt's read would shape it (server-side, includes correctAnswer). */
function fullAttemptRead() {
  return {
    id: "attempt-1",
    status: "IN_PROGRESS",
    type: "PRACTICE",
    userId: "user-1",
    partId: "part-1",
    questionCount: 2,
    startedAt: new Date(),
    lastActiveDate: new Date(),
    currentStreak: 1,
    longestStreak: 1,
    answers: [
      {
        id: "a-1",
        questionId: "q-1",
        givenAnswer: "threat",
        question: { id: "q-1", type: "MC", correctAnswer: "threat" },
      },
      {
        id: "a-2",
        questionId: "q-2",
        givenAnswer: "wrong",
        question: { id: "q-2", type: "MC", correctAnswer: "threat" },
      },
    ],
    writingSubmissions: [],
  };
}

describe("POST /api/exams/practice/finish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const [k, impl] of Object.entries(h.impls)) {
      h.fns[k].mockReset();
      h.fns[k].mockImplementation(impl as any);
    }
  });

  it("returns 404 when the attempt does not exist", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique.mockResolvedValueOnce(null); // ownership lookup misses
    const res = await POST(makeRequest({ attemptId: "missing", answers: {} }));

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Attempt not found");
  });

  it("returns 403 when the attempt belongs to another user", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique.mockResolvedValueOnce({
      id: "attempt-1",
      status: "IN_PROGRESS",
      userId: "user-2",
      partId: "part-1",
    });

    const res = await POST(makeRequest({ attemptId: "attempt-1", answers: {} }));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
    expect(h.fns.upsert).not.toHaveBeenCalled();
  });

  it("upserts remaining answers, grades server-side, and leaks no correctAnswer", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique
      .mockResolvedValueOnce({ id: "attempt-1", status: "IN_PROGRESS", userId: "user-1", partId: "part-1", questionCount: 2 })
      .mockResolvedValueOnce({ id: "q-1", examPartId: "part-1" })
      .mockResolvedValueOnce({ id: "q-2", examPartId: "part-1" })
      .mockResolvedValue(fullAttemptRead());
    h.fns.upsert.mockResolvedValue({ id: "a-1", questionId: "q-1" });
    h.fns.count.mockResolvedValueOnce(2); // both answers persisted → full

    const res = await POST(
      makeRequest({ attemptId: "attempt-1", answers: { "q-1": "threat", "q-2": "wrong" } }),
    );

    expect(res.status).toBe(200);

    // Persistence: both remaining answers upserted
    expect(h.fns.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { attemptId_questionId: { attemptId: "attempt-1", questionId: "q-1" } },
      }),
    );
    expect(h.fns.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { attemptId_questionId: { attemptId: "attempt-1", questionId: "q-2" } },
      }),
    );

    // Server-computed score (P-S-2 server-score scenario)
    const json = await res.json();
    expect(json.correctCount).toBe(1);
    expect(json.questionCount).toBe(2);
    expect(json.totalScore).toBe(50);
    expect(json.isPartial).toBe(false);

    // No-leak: response JSON carries no correctAnswer anywhere
    expect(json).not.toHaveProperty("correctAnswer");
    expect(JSON.stringify(json)).not.toContain("correctAnswer");
    expect(JSON.stringify(json)).not.toContain("threat"); // answer keys stay server-side

    // No-leak: nothing the route wrote back to prisma contained correctAnswer
    const writtenArgs = [
      ...h.fns.upsert.mock.calls.map((c) => c[0]),
      ...h.fns.update.mock.calls.map((c) => c[0]),
    ];
    expect(writtenArgs.length).toBeGreaterThan(0);
    expect(JSON.stringify(writtenArgs)).not.toContain("correctAnswer");
  });

  it("returns a partial result (IN_PROGRESS, unscored) when not all questions are answered, and never completes the attempt", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique
      .mockResolvedValueOnce({ id: "attempt-1", status: "IN_PROGRESS", userId: "user-1", partId: "part-1", questionCount: 2 })
      .mockResolvedValueOnce({ id: "q-1", examPartId: "part-1" })
      .mockResolvedValueOnce({ id: "q-2", examPartId: "part-1" });
    h.fns.upsert.mockResolvedValue({ id: "a-1", questionId: "q-1" });
    h.fns.count.mockResolvedValueOnce(1); // only 1 of 2 answered

    const res = await POST(makeRequest({ attemptId: "attempt-1", answers: { "q-1": "threat", "q-2": "wrong" } }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isPartial).toBe(true);
    expect(json.answeredCount).toBe(1);
    expect(json.totalCount).toBe(2);
    expect(json.score).toBeNull();
    expect(json.status).toBe("IN_PROGRESS");
    // Dead-end removed: the attempt must NOT be completed, so a later finish
    // on the same attempt is still allowed (no 409).
    expect(h.fns.update).not.toHaveBeenCalled();
    expect(JSON.stringify(json)).not.toContain("correctAnswer");
  });

  it("lets the user re-finish the same attempt after answering the rest (no 409 dead-end)", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    const attemptRow = { id: "attempt-1", status: "IN_PROGRESS", userId: "user-1", partId: "part-1", questionCount: 2 };
    h.fns.findUnique
      .mockResolvedValueOnce(attemptRow) // POST #1: attempt lookup
      .mockResolvedValueOnce({ id: "q-1", examPartId: "part-1" }) // POST #1: question
      .mockResolvedValueOnce(attemptRow) // POST #2: attempt still IN_PROGRESS (partial did not complete it)
      .mockResolvedValueOnce({ id: "q-1", examPartId: "part-1" }) // POST #2: question
      .mockResolvedValueOnce({ id: "q-2", examPartId: "part-1" }) // POST #2: question
      .mockResolvedValue(fullAttemptRead()); // completeAttempt read
    h.fns.upsert.mockResolvedValue({ id: "a-1", questionId: "q-1" });
    h.fns.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2); // 1/2 then 2/2

    // Partial finish first
    const first = await POST(makeRequest({ attemptId: "attempt-1", answers: { "q-1": "threat" } }));
    expect(first.status).toBe(200);
    expect((await first.json()).status).toBe("IN_PROGRESS");

    // Re-finish after answering the rest — must NOT 409
    const second = await POST(
      makeRequest({ attemptId: "attempt-1", answers: { "q-1": "threat", "q-2": "wrong" } }),
    );
    expect(second.status).toBe(200);
    const json = await second.json();
    expect(json.status).toBe("COMPLETED");
    expect(json.isPartial).toBe(false);
    expect(json.correctCount).toBe(1);
    expect(json.totalScore).toBe(50);
    expect(JSON.stringify(json)).not.toContain("correctAnswer");
  });

  it("rejects an answer that does not belong to the attempt's part", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique
      .mockResolvedValueOnce({ id: "attempt-1", status: "IN_PROGRESS", userId: "user-1", partId: "part-1" })
      .mockResolvedValueOnce({ id: "q-99", examPartId: "other-part" });

    const res = await POST(makeRequest({ attemptId: "attempt-1", answers: { "q-99": "x" } }));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Question does not belong to this attempt's part");
    expect(h.fns.upsert).not.toHaveBeenCalled();
  });
});

describe("QuestionForDisplay — correctAnswer never picked (P-S-2)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const [k, impl] of Object.entries(h.impls)) {
      h.fns[k].mockReset();
      h.fns[k].mockImplementation(impl as any);
    }
  });

  it("strips correctAnswer even when the query layer returns it", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    h.fns.findUnique
      .mockResolvedValueOnce({ id: "part-1", paper: "R&UoE", partNumber: 1, questionCount: 8, timeMinutes: 10 })
      .mockResolvedValueOnce(null) // no existing IN_PROGRESS attempt
      .mockResolvedValue({});
    h.fns.create.mockResolvedValueOnce({ id: "attempt-1" });
    h.fns.findMany
      .mockResolvedValueOnce([
        {
          id: "q-1",
          type: "MC",
          prompt: { text: "prompt" },
          options: null,
          difficulty: "B",
          examPart: { partNumber: 1 },
          correctAnswer: "SECRET-KEY",
        },
      ]) // questions for the part
      .mockResolvedValueOnce([]); // answers after create

    const result = await createPracticeAttempt("part-1");

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]).not.toHaveProperty("correctAnswer");
    expect(JSON.stringify(result.questions)).not.toContain("SECRET-KEY");
    // The mapped shape still carries display fields
    expect(result.questions[0].id).toBe("q-1");
    expect(result.questions[0].type).toBe("MC");
  });
});
