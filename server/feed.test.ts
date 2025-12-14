import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Feed Functionality", () => {
  it("should get feed posts for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feed.get({ limit: 10 });

    expect(result).toHaveProperty("posts");
    expect(result).toHaveProperty("nextCursor");
    expect(Array.isArray(result.posts)).toBe(true);
  });

  it("should return posts with author and community info", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feed.get({ limit: 10 });

    if (result.posts.length > 0) {
      const post = result.posts[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("authorName");
      expect(post).toHaveProperty("communityName");
      expect(post).toHaveProperty("likeCount");
      expect(post).toHaveProperty("commentCount");
    }
  });

  it("should respect limit parameter", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feed.get({ limit: 5 });

    expect(result.posts.length).toBeLessThanOrEqual(5);
  });

  it("should support cursor-based pagination", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const firstPage = await caller.feed.get({ limit: 5 });
    
    if (firstPage.nextCursor) {
      const secondPage = await caller.feed.get({ limit: 5, cursor: firstPage.nextCursor });
      expect(Array.isArray(secondPage.posts)).toBe(true);
    }
  });
});
