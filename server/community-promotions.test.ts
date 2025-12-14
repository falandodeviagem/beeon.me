import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Community Promotions', () => {
  let testCommunityId: number;
  let promotedCommunityId1: number;
  let promotedCommunityId2: number;

  beforeAll(async () => {
    // Create test communities
    testCommunityId = await db.createCommunity({
      name: 'Test Community Main',
      description: 'Main community for promotion tests',
      ownerId: 1,
      isPaid: false,
      price: 0,
    });

    promotedCommunityId1 = await db.createCommunity({
      name: 'Promoted Community 1',
      description: 'First promoted community',
      ownerId: 1,
      isPaid: false,
      price: 0,
    });

    promotedCommunityId2 = await db.createCommunity({
      name: 'Promoted Community 2',
      description: 'Second promoted community',
      ownerId: 1,
      isPaid: true,
      price: 1000,
    });
  });

  it('should add a community promotion', async () => {
    await db.addCommunityPromotion(testCommunityId, promotedCommunityId1);
    
    const promotedIds = await db.getPromotedCommunityIds(testCommunityId);
    expect(promotedIds).toContain(promotedCommunityId1);
  });

  it('should get promoted communities with full details', async () => {
    const promotedCommunities = await db.getPromotedCommunities(testCommunityId);
    
    expect(promotedCommunities.length).toBeGreaterThan(0);
    expect(promotedCommunities[0]).toHaveProperty('id');
    expect(promotedCommunities[0]).toHaveProperty('name');
    expect(promotedCommunities[0]).toHaveProperty('description');
    expect(promotedCommunities[0]).toHaveProperty('isPaid');
    expect(promotedCommunities[0]).toHaveProperty('memberCount');
  });

  it('should add multiple promotions up to 6', async () => {
    // Add second promotion
    await db.addCommunityPromotion(testCommunityId, promotedCommunityId2);
    
    const promotedIds = await db.getPromotedCommunityIds(testCommunityId);
    expect(promotedIds.length).toBeLessThanOrEqual(6);
    expect(promotedIds).toContain(promotedCommunityId2);
  });

  it('should prevent duplicate promotions', async () => {
    await expect(
      db.addCommunityPromotion(testCommunityId, promotedCommunityId1)
    ).rejects.toThrow('already being promoted');
  });

  it('should enforce maximum of 6 promotions', async () => {
    // Create and add 4 more communities to reach the limit
    const extraCommunities = [];
    for (let i = 0; i < 4; i++) {
      const id = await db.createCommunity({
        name: `Extra Community ${i}`,
        description: `Extra community ${i}`,
        ownerId: 1,
        isPaid: false,
        price: 0,
      });
      extraCommunities.push(id);
      await db.addCommunityPromotion(testCommunityId, id);
    }

    // Try to add a 7th promotion
    const overLimitId = await db.createCommunity({
      name: 'Over Limit Community',
      description: 'This should fail',
      ownerId: 1,
      isPaid: false,
      price: 0,
    });

    await expect(
      db.addCommunityPromotion(testCommunityId, overLimitId)
    ).rejects.toThrow('Maximum of 6 promoted communities reached');
  });

  it('should remove a community promotion', async () => {
    await db.removeCommunityPromotion(testCommunityId, promotedCommunityId1);
    
    const promotedIds = await db.getPromotedCommunityIds(testCommunityId);
    expect(promotedIds).not.toContain(promotedCommunityId1);
  });

  it('should return empty array for community with no promotions', async () => {
    const newCommunityId = await db.createCommunity({
      name: 'No Promotions Community',
      description: 'This community has no promotions',
      ownerId: 1,
      isPaid: false,
      price: 0,
    });

    const promotedCommunities = await db.getPromotedCommunities(newCommunityId);
    expect(promotedCommunities).toEqual([]);
  });
});
