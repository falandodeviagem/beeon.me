import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Reactions System', () => {
  let testUserId: number;
  let testUser2Id: number;
  let communityId: number;
  let postId: number;

  beforeAll(async () => {
    const user1OpenId = 'test-reaction-user-1-' + Date.now();
    const user2OpenId = 'test-reaction-user-2-' + Date.now();
    
    await db.upsertUser({
      openId: user1OpenId,
      name: 'Reaction User 1',
      email: 'reaction1@test.com',
    });
    
    await db.upsertUser({
      openId: user2OpenId,
      name: 'Reaction User 2',
      email: 'reaction2@test.com',
    });

    const user1 = await db.getUserByOpenId(user1OpenId);
    const user2 = await db.getUserByOpenId(user2OpenId);
    
    if (!user1 || !user2) {
      throw new Error('Failed to create test users');
    }

    testUserId = user1.id;
    testUser2Id = user2.id;

    // Create test community
    communityId = await db.createCommunity({
      name: 'Test Community for Reactions',
      description: 'Test',
      ownerId: testUserId,
    });

    // Join community
    await db.addCommunityMember({ communityId, userId: testUserId, role: 'member' });
    await db.addCommunityMember({ communityId, userId: testUser2Id, role: 'member' });

    // Create test post
    postId = await db.createPost({
      communityId,
      authorId: testUserId,
      content: 'Test post for reactions',
    });
  });

  it('should add reaction to post', async () => {
    await db.addPostReaction(postId, testUserId, 'love');

    const reaction = await db.getUserReaction(postId, testUserId);
    
    expect(reaction).toBeDefined();
    expect(reaction?.reactionType).toBe('love');
  });

  it('should change reaction type when user reacts again', async () => {
    await db.addPostReaction(postId, testUserId, 'like');
    
    const reaction = await db.getUserReaction(postId, testUserId);
    
    expect(reaction).toBeDefined();
    expect(reaction?.reactionType).toBe('like');
  });

  it('should remove reaction', async () => {
    await db.addPostReaction(postId, testUserId, 'laugh');
    await db.removePostReaction(postId, testUserId);

    const reaction = await db.getUserReaction(postId, testUserId);
    
    expect(reaction).toBeNull();
  });

  it('should count reactions by type', async () => {
    // Add different reactions from different users
    await db.addPostReaction(postId, testUserId, 'love');
    await db.addPostReaction(postId, testUser2Id, 'love');

    const counts = await db.getPostReactionCounts(postId);
    
    expect(counts).toBeDefined();
    expect(counts.love).toBe(2);
  });

  it('should get all reactions for a post', async () => {
    const reactions = await db.getPostReactions(postId);
    
    expect(reactions).toBeDefined();
    expect(reactions.length).toBeGreaterThan(0);
  });

  it('should support all 6 reaction types', async () => {
    const reactionTypes = ['love', 'like', 'laugh', 'wow', 'sad', 'angry'];
    
    for (const type of reactionTypes) {
      await db.addPostReaction(postId, testUserId, type);
      const reaction = await db.getUserReaction(postId, testUserId);
      expect(reaction?.reactionType).toBe(type);
    }
  });

  it('should only allow one reaction per user per post', async () => {
    await db.addPostReaction(postId, testUserId, 'love');
    await db.addPostReaction(postId, testUserId, 'like');

    const reactions = await db.getPostReactions(postId);
    const userReactions = reactions.filter(r => r.userId === testUserId);
    
    expect(userReactions.length).toBe(1);
    expect(userReactions[0].reactionType).toBe('like');
  });
});
