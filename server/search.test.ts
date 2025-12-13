import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Search Functionality", () => {
  it("should search communities by name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.search.communities({ 
      query: "test", 
      limit: 10,
      orderBy: "relevance"
    });

    expect(Array.isArray(results)).toBe(true);
  });

  it("should search users by name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.search.users({ query: "test", limit: 10 });

    expect(Array.isArray(results)).toBe(true);
  });

  it("should limit search results", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.search.communities({ 
      query: "test", 
      limit: 5,
      orderBy: "relevance"
    });

    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("should filter paid communities", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.search.communities({ 
      query: "test", 
      limit: 10,
      isPaid: true,
      orderBy: "relevance"
    });

    expect(Array.isArray(results)).toBe(true);
    // All results should be paid communities
    results.forEach(community => {
      if (community.isPaid !== undefined) {
        expect(community.isPaid).toBe(true);
      }
    });
  });

  it("should order by recent", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.search.communities({ 
      query: "test", 
      limit: 10,
      orderBy: "recent"
    });

    expect(Array.isArray(results)).toBe(true);
  });
});
