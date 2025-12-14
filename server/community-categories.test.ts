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

describe('Community Categories', () => {
  it('should create community with default category', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.create({
      name: `Test Community Default ${Date.now()}`,
      description: 'Testing default category',
      isPaid: false,
      price: 0,
    });

    expect(result.id).toBeDefined();
    
    const community = await caller.community.getById({ id: result.id });
    expect(community).toBeDefined();
    expect(community.category).toBe('outros');
  });

  it('should create community with specific category', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);

    const result = await caller.community.create({
      name: `Test Community Tech ${Date.now()}`,
      description: 'Testing tech category',
      isPaid: false,
      price: 0,
      category: 'tecnologia',
    });

    expect(result.id).toBeDefined();

    const community = await caller.community.getById({ id: result.id });
    expect(community).toBeDefined();
    expect(community.category).toBe('tecnologia');
  });

  it('should create communities with different categories', async () => {
    const ctx = createAuthContext(Math.floor(Math.random() * 1000000));
    const caller = appRouter.createCaller(ctx);
    
    const categories = ['esportes', 'arte', 'musica', 'educacao'] as const;
    
    for (const category of categories) {
      const result = await caller.community.create({
        name: `Test Community ${category} ${Date.now()}`,
        description: `Testing ${category} category`,
        isPaid: false,
        price: 0,
        category,
      });

      const community = await caller.community.getById({ id: result.id });
      expect(community.category).toBe(category);
    }
  });

  it('should list all communities with categories', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const communities = await caller.community.list();
    
    expect(communities.length).toBeGreaterThan(0);
    
    // Check that all communities have a category field
    communities.forEach(community => {
      expect(community.category).toBeDefined();
      expect(typeof community.category).toBe('string');
    });
  });
});
