import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Comment Mentions', () => {
  let testUserId: number;
  let mentionedUserId: number;
  let communityId: number;
  let postId: number;

  beforeAll(async () => {
    const authorOpenId = 'test-comment-author-' + Date.now();
    const mentionedOpenId = 'test-mentioned-user-' + Date.now();
    
    await db.upsertUser({
      openId: authorOpenId,
      name: 'Comment Author',
      email: 'comment-author@test.com',
    });
    
    await db.upsertUser({
      openId: mentionedOpenId,
      name: 'MentionedUser',
      email: 'mentioned@test.com',
    });
    
    const author = await db.getUserByOpenId(authorOpenId);
    const mentioned = await db.getUserByOpenId(mentionedOpenId);
    
    if (!author || !mentioned) {
      throw new Error('Failed to create test users');
    }

    testUserId = author.id;
    mentionedUserId = mentioned.id;

    // Create test community
    communityId = await db.createCommunity({
      name: 'Test Community for Comment Mentions',
      description: 'Test',
      ownerId: testUserId,
    });

    // Join community
    await db.joinCommunity(communityId, testUserId);

    // Create test post
    postId = await db.createPost({
      communityId,
      authorId: testUserId,
      content: 'Test post for comment mentions',
    });
  });

  it('should create comment with mention and save to mentions table', async () => {
    const commentId = await db.createComment({
      postId,
      authorId: testUserId,
      content: 'Hey @MentionedUser check this out!',
    }, testUserId);

    expect(commentId).toBeGreaterThan(0);

    // Verify mention was saved
    const mentions = await db.getDb().then(d => 
      d?.select().from(db['mentions']).where(db.eq(db['mentions'].commentId, commentId))
    );

    expect(mentions).toBeDefined();
    expect(mentions!.length).toBeGreaterThan(0);
    expect(mentions![0].mentionedUserId).toBe(mentionedUserId);
  });

  it('should create notification for mentioned user in comment', async () => {
    const commentId = await db.createComment({
      postId,
      authorId: testUserId,
      content: 'Another test @MentionedUser',
    }, testUserId);

    // Verify notification was created
    const notifications = await db.getUserNotifications(mentionedUserId);
    
    const mentionNotification = notifications.find(n => 
      n.type === 'mention' && n.relatedCommentId === commentId
    );

    expect(mentionNotification).toBeDefined();
    expect(mentionNotification?.userId).toBe(mentionedUserId);
  });

  it('should not create mention for author mentioning themselves', async () => {
    const commentId = await db.createComment({
      postId,
      authorId: testUserId,
      content: 'Mentioning myself @CommentAuthor',
    }, testUserId);

    // Verify no self-mention was saved
    const mentions = await db.getDb().then(d => 
      d?.select().from(db['mentions']).where(db.eq(db['mentions'].commentId, commentId))
    );

    expect(mentions).toBeDefined();
    expect(mentions!.length).toBe(0);
  });

  it('should handle multiple mentions in single comment', async () => {
    // Create another user to mention
    await db.upsertUser({
      openId: 'test-user-3-' + Date.now(),
      name: 'ThirdUser',
      email: 'third@test.com',
    });

    const commentId = await db.createComment({
      postId,
      authorId: testUserId,
      content: 'Hey @MentionedUser and @ThirdUser, check this!',
    }, testUserId);

    // Verify both mentions were saved
    const mentions = await db.getDb().then(d => 
      d?.select().from(db['mentions']).where(db.eq(db['mentions'].commentId, commentId))
    );

    expect(mentions).toBeDefined();
    expect(mentions!.length).toBe(2);
  });
});
