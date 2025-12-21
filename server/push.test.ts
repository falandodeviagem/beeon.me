import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Push Notifications', () => {
  let userId: number;
  let ctx: any;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a test user
    userId = await db.upsertUser({
      openId: 'test-push-user-' + Date.now(),
      name: 'Push Test User',
      email: 'push@test.com',
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
    // Cleanup: delete test subscriptions
    const subscriptions = await db.getUserPushSubscriptions(userId);
    for (const sub of subscriptions) {
      await db.deletePushSubscription(sub.endpoint);
    }
  });

  it('should get VAPID public key', async () => {
    const result = await caller.push.getPublicKey();
    expect(result).toHaveProperty('publicKey');
    expect(typeof result.publicKey).toBe('string');
    expect(result.publicKey.length).toBeGreaterThan(0);
  });

  it('should create push subscription', async () => {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-' + Date.now(),
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key',
      userAgent: 'Test Browser',
    };

    const result = await caller.push.subscribe(subscription);
    expect(result.success).toBe(true);

    // Verify subscription was created
    const subscriptions = await db.getUserPushSubscriptions(userId);
    expect(subscriptions.length).toBeGreaterThan(0);
    expect(subscriptions[0].endpoint).toBe(subscription.endpoint);
  });

  it('should get user push subscriptions', async () => {
    const subscriptions = await caller.push.getSubscriptions();
    expect(Array.isArray(subscriptions)).toBe(true);
    expect(subscriptions.length).toBeGreaterThan(0);
  });

  it('should get notification preferences', async () => {
    const preferences = await caller.push.getPreferences();
    expect(preferences).toHaveProperty('pushEnabled');
    expect(preferences).toHaveProperty('pushComments');
    expect(preferences).toHaveProperty('pushLikes');
    expect(preferences).toHaveProperty('pushFollows');
    expect(preferences).toHaveProperty('pushMessages');
    expect(preferences).toHaveProperty('pushBadges');
    expect(preferences).toHaveProperty('pushCommunity');
    expect(preferences).toHaveProperty('inAppEnabled');
  });

  it('should update notification preferences', async () => {
    const result = await caller.push.updatePreferences({
      pushComments: false,
      pushLikes: false,
    });
    expect(result.success).toBe(true);

    // Verify preferences were updated
    const preferences = await caller.push.getPreferences();
    expect(preferences.pushComments).toBe(false);
    expect(preferences.pushLikes).toBe(false);
  });

  it('should unsubscribe from push notifications', async () => {
    const subscriptions = await db.getUserPushSubscriptions(userId);
    if (subscriptions.length > 0) {
      const result = await caller.push.unsubscribe({
        endpoint: subscriptions[0].endpoint,
      });
      expect(result.success).toBe(true);

      // Verify subscription was deleted
      const remainingSubscriptions = await db.getUserPushSubscriptions(userId);
      expect(remainingSubscriptions.length).toBe(subscriptions.length - 1);
    }
  });
});
