// ExamForge — Prisma client singleton
// Server-only module — never import this in client components
// Uses Neon serverless adapter when connecting to Neon (edge-compatible)
// Uses @prisma/adapter-pg for local PostgreSQL (Docker)

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isNeonUrl(url: string): boolean {
  return url.includes("neon.tech") || url.includes("neondb");
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const isNeon = isNeonUrl(databaseUrl);

  if (isNeon) {
    // Neon: use serverless adapter for edge compatibility
    const { neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    neonConfig.poolQueryViaFetch = true;
    const adapter = new PrismaNeon({ connectionString: databaseUrl });
    return new PrismaClient({ adapter });
  }

  // Local PostgreSQL (Docker): use pg adapter for direct TCP connection with pooling config
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
