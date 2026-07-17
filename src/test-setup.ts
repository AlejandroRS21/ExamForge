// Vitest setup — mock prisma singleton to prevent adapter initialization in tests
// Tests that need real DB access should override this mock per-file

import { vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const handler: ProxyHandler<any> = {
    get: (_target, prop: string | symbol) => {
      // $transaction, $connect, $disconnect
      if (typeof prop === "string" && prop.startsWith("$")) {
        if (prop === "$transaction") {
          return (fn: (client: any) => any) => fn(proxy);
        }
        return async () => {};
      }
      // Model methods
      if (prop === "findMany") return async () => [];
      if (prop === "findFirst" || prop === "findFirstOrThrow") return async () => null;
      if (prop === "findUnique" || prop === "findUniqueOrThrow") return async () => null;
      if (prop === "create") return async ({ data }: any) => data;
      if (prop === "createMany") return async () => ({ count: 0 });
      if (prop === "createManyAndReturn") return async () => [];
      if (prop === "update") return async ({ data }: any) => data;
      if (prop === "updateMany") return async () => ({ count: 0 });
      if (prop === "updateManyAndReturn") return async () => [];
      if (prop === "upsert") return async ({ create }: any) => create;
      if (prop === "delete") return async () => ({});
      if (prop === "deleteMany") return async () => ({ count: 0 });
      if (prop === "count") return async () => 0;
      if (prop === "aggregate") return async () => ({ _avg: {}, _sum: {}, _min: {}, _max: {} });
      if (prop === "groupBy") return async () => [];
      // Nested model access (e.g. prisma.user)
      return new Proxy(() => {}, handler);
    },
  };

  const proxy = new Proxy({}, handler);

  return { prisma: proxy, default: proxy };
});
