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

describe("Gamification System", () => {
  it("should get user profile with points and level", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Ensure user exists in database first
    const db = await import("./db");
    const userId = await db.upsertUser({
      openId: ctx.user!.openId,
      email: ctx.user!.email,
      name: ctx.user!.name,
      avatarUrl: null,
      loginMethod: ctx.user!.loginMethod,
    });

    const profile = await caller.user.getProfile({ userId });

    expect(profile).toBeDefined();
    expect(typeof profile.points).toBe("number");
    expect(typeof profile.level).toBe("number");
  });

  it("should get leaderboard", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.user.getLeaderboard({ limit: 10 });

    expect(Array.isArray(leaderboard)).toBe(true);
  });

  it("should generate invite code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.generateInviteCode();

    expect(result.inviteCode).toBeDefined();
    expect(typeof result.inviteCode).toBe("string");
    expect(result.inviteCode.length).toBeGreaterThan(0);
  });
});
