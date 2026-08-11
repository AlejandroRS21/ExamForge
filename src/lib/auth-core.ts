// OpenSloth — Auth.js Core (Middleware-safe, no Prisma dependency)
// JWT-only auth for proxy (middleware) — does NOT import Prisma

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Middleware-safe config — providers used for token validation only
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({ credentials: {} as any, authorize: () => null }),
    Google({ clientId: "", clientSecret: "" }),
    GitHub({ clientId: "", clientSecret: "" }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};

export const { auth } = NextAuth(authConfig);
