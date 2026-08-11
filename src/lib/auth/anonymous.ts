// OpenSloth — Anonymous Session System
// Encrypted cookie-based anonymous sessions
// Auto-creates on first visit, persists across page loads

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod/v4";

// We use uuid for generating anonymous session IDs
// Re-export a simple ID generator
export { v4 as generateId } from "uuid";

const ANON_COOKIE_NAME = "opensloth_anon";
const LEGACY_ANON_COOKIE_NAME = "examforge_anon";
const ANON_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

// Secret key for encrypting anonymous session cookies
function getAnonSecret(): Uint8Array {
  const secret = process.env.ANON_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ANON_SESSION_SECRET environment variable is required for anonymous sessions",
    );
  }
  return new TextEncoder().encode(secret);
}

interface AnonSessionPayload extends JWTPayload {
  sid: string; // anonymous session ID
  createdAt: number;
}

const anonSessionSchema = z.object({
  sid: z.string().min(1),
  createdAt: z.number(),
});

/**
 * Get or create an anonymous session ID from the cookie.
 * If no cookie exists, creates a new session and sets the cookie.
 */
export async function getOrCreateAnonymousSession(): Promise<{
  sessionId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_COOKIE_NAME) ?? cookieStore.get(LEGACY_ANON_COOKIE_NAME);

  if (existing?.value) {
    try {
      const { payload } = await jwtVerify<AnonSessionPayload>(
        existing.value,
        getAnonSecret(),
        { algorithms: ["HS256"] },
      );
      const parsed = anonSessionSchema.safeParse(payload);
      if (parsed.success) {
        return { sessionId: parsed.data.sid, isNew: false };
      }
    } catch {
      // Invalid or expired token — create new
    }
  }

  // Create new anonymous session
  const sessionId = uuidv4();
  const token = await new SignJWT({
    sid: sessionId,
    createdAt: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ANON_MAX_AGE}s`)
    .sign(getAnonSecret());

  cookieStore.set(ANON_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ANON_MAX_AGE,
    path: "/",
  });

  return { sessionId, isNew: true };
}

/**
 * Get the anonymous session ID without creating a new one.
 * Returns null if no valid session exists.
 */
export async function getAnonymousSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(ANON_COOKIE_NAME) ?? cookieStore.get(LEGACY_ANON_COOKIE_NAME);

  if (!existing?.value) return null;

  try {
    const { payload } = await jwtVerify<AnonSessionPayload>(
      existing.value,
      getAnonSecret(),
      { algorithms: ["HS256"] },
    );
    const parsed = anonSessionSchema.safeParse(payload);
    return parsed.success ? parsed.data.sid : null;
  } catch {
    return null;
  }
}

/**
 * Clear the anonymous session cookie.
 * Used after merging anonymous data into a registered account.
 */
export async function clearAnonymousSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ANON_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
