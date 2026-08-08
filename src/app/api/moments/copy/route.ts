// ExamForge — Moment Engine Copy API Route
// POST { eventType } → forwards to queryNotebook with 800ms timeout.
// Returns { copy: string } on success, 204 on timeout/error.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MCPClient, MCPClientError } from "@/lib/notebooklm/mcp-client";
import type { MomentEventType } from "@/lib/moments/types";
import { containsBlameLanguage } from "@/lib/moments/copy";

const VALID_TYPES = new Set<MomentEventType>([
  "EXAM_COMPLETE",
  "BADGE_UNLOCKED",
  "STREAK_MILESTONE",
  "GOAL_ACHIEVED",
  "STREAK_RESET",
]);

const PROMPTS: Record<MomentEventType, string> = {
  EXAM_COMPLETE:
    "Give me ONE short celebratory sentence (max 10 words) for completing an English exam. Warm, positive, no manipulation.",
  BADGE_UNLOCKED:
    "Give me ONE short celebratory sentence (max 10 words) for unlocking a badge. Warm, positive.",
  STREAK_MILESTONE:
    "Give me ONE short encouraging sentence (max 10 words) for a study streak milestone. Warm, no pressure.",
  GOAL_ACHIEVED:
    "Give me ONE short celebratory sentence (max 10 words) for reaching a study goal. Warm, positive.",
  STREAK_RESET:
    "Give me ONE short NEUTRAL reframe sentence (max 10 words) for a study streak reset. NO blame, NO guilt, NO shame. Focus on fresh start.",
};

// In-memory cache keyed by `${eventType}:${YYYY-MM-DD}`.
// Max 50 entries — evict on overflow to bound memory on long-lived servers.
const COPY_CACHE_MAX = 50;
const copyCache = new Map<string, string>();

function dayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // F4: auth guard — degrade silently to 204 (matching all other failure paths)
  const session = await auth();
  if (!session) {
    return new NextResponse(null, { status: 204 });
  }

  let eventType: string;
  try {
    const body = await req.json();
    eventType = body?.eventType;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!VALID_TYPES.has(eventType as MomentEventType)) {
    return new NextResponse(null, { status: 204 });
  }

  const notebookId = process.env.MOMENTS_COPY_NOTEBOOK_ID;
  if (!notebookId) {
    return new NextResponse(null, { status: 204 });
  }

  const cacheKey = `${eventType}:${dayBucket()}`;
  if (copyCache.has(cacheKey)) {
    return NextResponse.json({ copy: copyCache.get(cacheKey) });
  }

  const client = new MCPClient();
  const prompt = PROMPTS[eventType as MomentEventType];

  try {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const result = await Promise.race([
      client.queryNotebook(notebookId, prompt),
      new Promise<never>(
        (_, reject) =>
          (timeoutHandle = setTimeout(() => reject(new Error("timeout")), 800)),
      ),
    ]).finally(() => clearTimeout(timeoutHandle!));

    const copy =
      typeof result === "string"
        ? result.trim()
        : (result as any)?.response?.trim?.() ?? "";

    if (!copy) return new NextResponse(null, { status: 204 });

    // Never serve model output that ignored the no-blame instruction —
    // fall back to static copy instead of trusting the prompt alone.
    if (eventType === "STREAK_RESET" && containsBlameLanguage(copy)) {
      return new NextResponse(null, { status: 204 });
    }

    if (copyCache.size >= COPY_CACHE_MAX) copyCache.clear();
    copyCache.set(cacheKey, copy);
    return NextResponse.json({ copy });
  } catch (err) {
    if (err instanceof MCPClientError || (err as Error).message === "timeout") {
      return new NextResponse(null, { status: 204 });
    }
    return new NextResponse(null, { status: 204 });
  }
}
