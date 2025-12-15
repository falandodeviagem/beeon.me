import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Comment Edit', () => {
  let testUserId: number;
  let otherUserId: number;
  let communityId: number;
  let postId: number;
  let commentId: number;

  beforeAll(async () => {
    const userOpenId = 'test-comment-edit-user-' + Date.now();
    const otherOpenId = 'test-other-user-' + Date.now();
    
    await db.upsertUser({
      openId: userOpenId,
      name: 'Test User',
      email: 'test-edit@test.com',
    });
    
    await db.upsertUser({
      openId: otherOpenId,
      name: 'Other User',
      email: 'other@test.com',
    });

    const user = await db.getUserByOpenId(userOpenId);
    const other = await db.getUserByOpenId(otherOpenId);
    
    if (!user || !other) {
      throw new Error('Failed to create test users');
    }

    testUserId = user.id;
    otherUserId = other.id;

    // Create test community
    communityId = await db.createCommunity({
      name: 'Test Community for Comment Edit',
      description: 'Test',
      ownerId: testUserId,
    });

    // Join community
    await db.addCommunityMember({
      communityId,
      userId: testUserId,
      role: 'member',
      subscriptionStatus: 'active',
      subscriptionId: null,
    });

    // Create test post
    postId = await db.createPost({
      communityId,
      authorId: testUserId,
      content: 'Test post',
    });

    // Create test comment
    commentId = await db.createComment({
      postId,
      authorId: testUserId,
      content: 'Original comment content',
    }, testUserId);
  });

  it('should update comment content and mark as edited', async () => {
    const newContent = 'Updated comment content';
    await db.updateComment(commentId, newContent);

    const comment = await db.getCommentById(commentId);
    
    expect(comment).toBeDefined();
    expect(comment?.content).toBe(newContent);
    expect(comment?.isEdited).toBe(true);
    expect(comment?.editedAt).toBeDefined();
  });

  it('should get comment by id', async () => {
    const comment = await db.getCommentById(commentId);
    
    expect(comment).toBeDefined();
    expect(comment?.id).toBe(commentId);
    expect(comment?.authorId).toBe(testUserId);
  });

  it('should return null for non-existent comment', async () => {
    const comment = await db.getCommentById(999999);
    
    expect(comment).toBeNull();
  });

  it('should preserve editedAt timestamp after update', async () => {
    const comment = await db.getCommentById(commentId);
    const firstEditedAt = comment?.editedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1100));

    await db.updateComment(commentId, 'Another update');
    const updatedComment = await db.getCommentById(commentId);

    expect(updatedComment?.editedAt).toBeDefined();
    expect(updatedComment?.isEdited).toBe(true);
    // Timestamp should be updated
    expect(updatedComment?.editedAt?.getTime()).toBeGreaterThan(firstEditedAt?.getTime() || 0);
  });
});
