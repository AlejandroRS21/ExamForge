// ExamForge — Prisma client singleton
// Server-only module — never import this in client components
// Uses Neon serverless adapter for edge compatibility

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Configure Neon for serverless
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const poolConfig = { connectionString: process.env.DATABASE_URL! };
  const adapter = new PrismaNeon(poolConfig);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
