import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: 'manus',
    role: 'user',
    bio: null,
    avatarUrl: null,
    points: 0,
    level: 1,
    inviteCode: null,
    invitedBy: null,
    isBanned: false,
    bannedUntil: null,
    banReason: null,
    hasCompletedOnboarding: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };

  return ctx;
}

describe('Community Recommendations', () => {
  it('should return recommended communities for authenticated user', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const recommendations = await caller.community.getRecommended({ limit: 6 });

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(6);
  });

  it('should respect limit parameter', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const recommendations = await caller.community.getRecommended({ limit: 3 });

    expect(recommendations.length).toBeLessThanOrEqual(3);
  });

  it('should not recommend communities user is already member of', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    // Create a community and join it
    const community = await caller.community.create({
      name: `Test Community ${Date.now()}`,
      description: 'Test community for recommendations',
      isPaid: false,
      price: 0,
      category: 'tecnologia',
    });

    // User is automatically a member after creating
    const recommendations = await caller.community.getRecommended({ limit: 10 });

    // Should not include the community user created
    const recommendedIds = recommendations.map(c => c.id);
    expect(recommendedIds).not.toContain(community.id);
  });

  it('should return communities with all required fields', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const recommendations = await caller.community.getRecommended({ limit: 6 });

    if (recommendations.length > 0) {
      const community = recommendations[0];
      expect(community).toHaveProperty('id');
      expect(community).toHaveProperty('name');
      expect(community).toHaveProperty('category');
      expect(community).toHaveProperty('memberCount');
      expect(community).toHaveProperty('isPaid');
    }
  });

  it('should work with default limit when not specified', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const recommendations = await caller.community.getRecommended();

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeLessThanOrEqual(6);
  });
});
