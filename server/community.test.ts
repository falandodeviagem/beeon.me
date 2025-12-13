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

describe("Community Operations", () => {
  it("should create a public community", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.create({
      name: "Test Community",
      description: "A test community",
      isPaid: false,
      price: 0,
    });

    expect(result.success).toBe(true);
    expect(result.communityId).toBeGreaterThan(0);
  });

  it("should create a paid community with price", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.create({
      name: "Premium Community",
      description: "A premium paid community",
      isPaid: true,
      price: 1000, // R$ 10.00 in cents
    });

    expect(result.success).toBe(true);
    expect(result.communityId).toBeGreaterThan(0);
  });

  it("should list communities", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const communities = await caller.community.list();

    expect(Array.isArray(communities)).toBe(true);
  });
});
