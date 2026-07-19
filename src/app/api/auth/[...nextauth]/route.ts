// ExamForge — NextAuth v5 API Route Handler
import { handlers } from "@/lib/auth";
import { apiRateLimit } from "@/lib/utils/api-rate-limit";

// Apply rate limiting to POST requests (login, callback, etc.)
const rateLimitPost = (fn: any) => {
  return async (request: Request, ...args: any[]) => {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const rateCheck = apiRateLimit(`auth-post:${ip}`, 60, 60_000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many authentication attempts" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    return fn(request, ...args);
  };
};

// Wrap handlers to apply rate limiting
const limitedHandlers = {
  ...handlers,
  POST: rateLimitPost(handlers.POST as any),
};

export const { GET, POST } = limitedHandlers;
