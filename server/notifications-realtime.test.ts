import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Notificações em Tempo Real', () => {
  let testUser1: any;
  let testUser2: any;

  beforeAll(async () => {
    // Create test users
    const user1Id = await db.createUser({
      openId: `test-notif-user1-${Date.now()}`,
      name: 'Test User 1',
      email: `testuser1-${Date.now()}@test.com`,
    });

    const user2Id = await db.createUser({
      openId: `test-notif-user2-${Date.now()}`,
      name: 'Test User 2',
      email: `testuser2-${Date.now()}@test.com`,
    });

    testUser1 = await db.getUserByOpenId(`test-notif-user1-${Date.now()}`);
    testUser2 = await db.getUserByOpenId(`test-notif-user2-${Date.now()}`);
  });

  it('deve criar notificação quando usuário recebe like', async () => {
    const caller = appRouter.createCaller({ user: testUser1 });

    // Create community
    const community = await caller.community.create({
      name: 'Test Community Notif',
      description: 'Test',
      category: 'tecnologia',
    });

    // Create post
    const post = await caller.post.create({
      content: 'Test post for notification',
      communityId: community.id,
    });

    // User 2 likes the post
    const caller2 = appRouter.createCaller({ user: testUser2 });
    await caller2.post.like({ postId: post.id });

    // Check if notification was created for user 1
    const notifications = await caller.notification.list({ limit: 10 });
    const likeNotification = notifications.find(
      (n) => n.type === 'like' && n.relatedId === post.id
    );

    expect(likeNotification).toBeDefined();
    expect(likeNotification?.userId).toBe(testUser1.id);
  });

  it('deve retornar contador de notificações não lidas', async () => {
    const caller = appRouter.createCaller({ user: testUser1 });

    const unreadCount = await caller.notification.unreadCount();

    expect(typeof unreadCount).toBe('number');
    expect(unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('deve marcar notificação como lida', async () => {
    const caller = appRouter.createCaller({ user: testUser1 });

    // Get notifications
    const notifications = await caller.notification.list({ limit: 10 });
    const unreadNotif = notifications.find((n) => !n.isRead);

    if (unreadNotif) {
      // Mark as read
      await caller.notification.markAsRead({ id: unreadNotif.id });

      // Verify it's marked as read
      const updatedNotifications = await caller.notification.list({ limit: 10 });
      const markedNotif = updatedNotifications.find((n) => n.id === unreadNotif.id);

      expect(markedNotif?.isRead).toBe(true);
    }
  });

  it('deve marcar todas as notificações como lidas', async () => {
    const caller = appRouter.createCaller({ user: testUser1 });

    // Mark all as read
    await caller.notification.markAllAsRead();

    // Verify all are read
    const unreadCount = await caller.notification.unreadCount();
    expect(unreadCount).toBe(0);
  });

  it('deve criar notificação quando usuário é mencionado', async () => {
    const caller = appRouter.createCaller({ user: testUser1 });

    // Create community
    const community = await caller.community.create({
      name: 'Test Community Mention Notif',
      description: 'Test',
      category: 'tecnologia',
    });

    // Create post with mention
    const post = await caller.post.create({
      content: `Hello @${testUser2.name}`,
      communityId: community.id,
    });

    // Check if notification was created for user 2
    const caller2 = appRouter.createCaller({ user: testUser2 });
    const notifications = await caller2.notification.list({ limit: 10 });
    const mentionNotification = notifications.find(
      (n) => n.type === 'mention' && n.relatedId === post.id
    );

    expect(mentionNotification).toBeDefined();
    expect(mentionNotification?.userId).toBe(testUser2.id);
  });
});
