import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Analytics', () => {
  let userId: number;
  let communityId: number;
  let postId: number;
  let ctx: any;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a test user
    userId = await db.upsertUser({
      openId: 'test-analytics-user-' + Date.now(),
      name: 'Analytics Test User',
      email: 'analytics@test.com',
    });

    // Create a test community
    communityId = await db.createCommunity({
      name: 'Test Analytics Community',
      description: 'Community for analytics testing',
      ownerId: userId,
    });

    // Create a test post
    postId = await db.createPost({
      content: 'Test post for analytics',
      authorId: userId,
      communityId,
    });

    // Create mock context with the test user
    const user = await db.getUserById(userId);
    ctx = {
      user: user!,
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(ctx);
  });

  afterAll(async () => {
    // Cleanup: delete test data
    await db.deletePost(postId);
    await db.deleteCommunity(communityId);
  });

  it('should record post view', async () => {
    const result = await caller.analytics.recordPostView({
      postId,
    });
    expect(result.success).toBe(true);

    // Verify view was recorded
    const analytics = await db.getPostAnalytics(postId);
    expect(analytics).not.toBeNull();
    expect(analytics!.views).toBeGreaterThan(0);
  });

  it('should get post analytics', async () => {
    const analytics = await caller.analytics.getPostAnalytics({
      postId,
    });
    expect(analytics).not.toBeNull();
    expect(analytics).toHaveProperty('views');
    expect(analytics).toHaveProperty('uniqueViews');
    expect(analytics).toHaveProperty('clicks');
    expect(analytics).toHaveProperty('shares');
  });

  it('should get community analytics', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const analytics = await caller.analytics.getCommunityAnalytics({
      communityId,
      startDate,
      endDate,
    });

    expect(Array.isArray(analytics)).toBe(true);
  });

  it('should increment post views multiple times', async () => {
    const initialAnalytics = await db.getPostAnalytics(postId);
    const initialViews = initialAnalytics?.views || 0;

    // Record multiple views
    await caller.analytics.recordPostView({ postId });
    await caller.analytics.recordPostView({ postId });
    await caller.analytics.recordPostView({ postId });

    const finalAnalytics = await db.getPostAnalytics(postId);
    expect(finalAnalytics!.views).toBe(initialViews + 3);
  });

  it('should create post analytics if not exists', async () => {
    // Create a new post
    const newPostId = await db.createPost({
      content: 'New post for analytics test',
      authorId: userId,
      communityId,
    });

    // Verify no analytics exist yet
    let analytics = await db.getPostAnalytics(newPostId);
    expect(analytics).toBeNull();

    // Record a view
    await db.incrementPostViews(newPostId);

    // Verify analytics were created
    analytics = await db.getPostAnalytics(newPostId);
    expect(analytics).not.toBeNull();
    expect(analytics!.views).toBe(1);

    // Cleanup
    await db.deletePost(newPostId);
  });
});
