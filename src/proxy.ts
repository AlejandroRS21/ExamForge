// OpenSloth — Next.js Proxy (renamed from middleware in Next 16)
// Session guard + admin role check on /admin/*
// Uses JWT-only auth (no Prisma dependency — safe for Edge Runtime)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth-core";

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];
// Auth routes (always public)
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes and static files
  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Admin route guard
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Dashboard requires auth
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/challenges")) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};
