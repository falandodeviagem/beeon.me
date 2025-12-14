import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Follow System", () => {
  it("should follow a user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.follow.follow({ userId: 2 });
    expect(result).toEqual({ success: true });
  });

  it("should not allow following yourself", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.follow.follow({ userId: 1 })).rejects.toThrow();
  });

  it("should unfollow a user", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First follow
    await caller.follow.follow({ userId: 2 });
    
    // Then unfollow
    const result = await caller.follow.unfollow({ userId: 2 });
    expect(result).toEqual({ success: true });
  });
});

describe("Trending System", () => {
  it("should get trending communities", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trending.communities({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get trending posts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trending.posts({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });
});
