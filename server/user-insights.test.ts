import { describe, it, expect } from 'vitest';
import { getUserInsights, searchUsersForInsights } from './db-moderation';

describe('User Insights System', () => {
  it('should have getUserInsights function', () => {
    expect(typeof getUserInsights).toBe('function');
  });

  it('should have searchUsersForInsights function', () => {
    expect(typeof searchUsersForInsights).toBe('function');
  });

  it('should return null for non-existent user', async () => {
    const result = await getUserInsights(999999);
    expect(result).toBeNull();
  });

  it('should return array for search results', async () => {
    const results = await searchUsersForInsights('test');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array for no matches', async () => {
    const results = await searchUsersForInsights('xyznonexistent123456');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should search by user ID', async () => {
    const results = await searchUsersForInsights('1');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should respect limit parameter', async () => {
    const results = await searchUsersForInsights('a', 5);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});

describe('User Insights Data Structure', () => {
  it('should return correct structure for existing user', async () => {
    // First search for any user
    const searchResults = await searchUsersForInsights('a', 1);
    
    if (searchResults.length > 0) {
      const userId = searchResults[0].id;
      const insights = await getUserInsights(userId);
      
      expect(insights).not.toBeNull();
      
      if (insights) {
        // Check user object
        expect(insights).toHaveProperty('user');
        expect(insights.user).toHaveProperty('id');
        expect(insights.user).toHaveProperty('name');
        expect(insights.user).toHaveProperty('points');
        expect(insights.user).toHaveProperty('level');
        expect(insights.user).toHaveProperty('daysSinceRegistration');
        
        // Check engagement object
        expect(insights).toHaveProperty('engagement');
        expect(insights.engagement).toHaveProperty('score');
        expect(insights.engagement).toHaveProperty('posts');
        expect(insights.engagement).toHaveProperty('comments');
        expect(insights.engagement).toHaveProperty('reactions');
        expect(insights.engagement).toHaveProperty('followers');
        expect(insights.engagement).toHaveProperty('following');
        
        // Check communities array
        expect(insights).toHaveProperty('communities');
        expect(Array.isArray(insights.communities)).toBe(true);
        
        // Check categoryInterests array
        expect(insights).toHaveProperty('categoryInterests');
        expect(Array.isArray(insights.categoryInterests)).toBe(true);
        
        // Check badges array
        expect(insights).toHaveProperty('badges');
        expect(Array.isArray(insights.badges)).toBe(true);
        
        // Check activity object
        expect(insights).toHaveProperty('activity');
        expect(insights.activity).toHaveProperty('byHour');
        expect(insights.activity).toHaveProperty('byDay');
        expect(insights.activity).toHaveProperty('recent');
        
        // Check moderation object
        expect(insights).toHaveProperty('moderation');
        expect(insights.moderation).toHaveProperty('warnings');
        expect(insights.moderation).toHaveProperty('activeWarnings');
        expect(insights.moderation).toHaveProperty('reportsMade');
        expect(insights.moderation).toHaveProperty('reportsAgainst');
      }
    }
  });

  it('should calculate engagement score as number between 0-100', async () => {
    const searchResults = await searchUsersForInsights('a', 1);
    
    if (searchResults.length > 0) {
      const userId = searchResults[0].id;
      const insights = await getUserInsights(userId);
      
      if (insights) {
        expect(typeof insights.engagement.score).toBe('number');
        expect(insights.engagement.score).toBeGreaterThanOrEqual(0);
        expect(insights.engagement.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('should return numeric values for engagement metrics', async () => {
    const searchResults = await searchUsersForInsights('a', 1);
    
    if (searchResults.length > 0) {
      const userId = searchResults[0].id;
      const insights = await getUserInsights(userId);
      
      if (insights) {
        expect(typeof insights.engagement.posts).toBe('number');
        expect(typeof insights.engagement.comments).toBe('number');
        expect(typeof insights.engagement.reactions).toBe('number');
        expect(typeof insights.engagement.followers).toBe('number');
        expect(typeof insights.engagement.following).toBe('number');
      }
    }
  });
});
