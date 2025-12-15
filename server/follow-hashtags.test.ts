import { describe, it, expect } from 'vitest';
import { 
  followHashtag, 
  unfollowHashtag, 
  isFollowingHashtag, 
  getUserFollowedHashtags,
  getHashtagByTag,
  getHashtagFollowersCount 
} from './db';

describe('Follow Hashtags', () => {
  describe('followHashtag', () => {
    it('should have followHashtag function', () => {
      expect(typeof followHashtag).toBe('function');
    });

    it('should return boolean', async () => {
      // Using non-existent IDs to avoid side effects
      const result = await followHashtag(999999, 999999);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('unfollowHashtag', () => {
    it('should have unfollowHashtag function', () => {
      expect(typeof unfollowHashtag).toBe('function');
    });

    it('should return boolean', async () => {
      const result = await unfollowHashtag(999999, 999999);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isFollowingHashtag', () => {
    it('should have isFollowingHashtag function', () => {
      expect(typeof isFollowingHashtag).toBe('function');
    });

    it('should return false for non-existent follow', async () => {
      const result = await isFollowingHashtag(999999, 999999);
      expect(result).toBe(false);
    });
  });

  describe('getUserFollowedHashtags', () => {
    it('should have getUserFollowedHashtags function', () => {
      expect(typeof getUserFollowedHashtags).toBe('function');
    });

    it('should return array', async () => {
      const result = await getUserFollowedHashtags(999999);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for user with no follows', async () => {
      const result = await getUserFollowedHashtags(999999);
      expect(result.length).toBe(0);
    });
  });

  describe('getHashtagByTag', () => {
    it('should have getHashtagByTag function', () => {
      expect(typeof getHashtagByTag).toBe('function');
    });

    it('should return null for non-existent hashtag', async () => {
      const result = await getHashtagByTag('xyznonexistent123456789');
      expect(result).toBeNull();
    });

    it('should normalize tag (remove # and lowercase)', async () => {
      // This tests the normalization logic
      const result1 = await getHashtagByTag('#TEST');
      const result2 = await getHashtagByTag('test');
      // Both should query the same normalized tag
      expect(result1).toEqual(result2);
    });
  });

  describe('getHashtagFollowersCount', () => {
    it('should have getHashtagFollowersCount function', () => {
      expect(typeof getHashtagFollowersCount).toBe('function');
    });

    it('should return number', async () => {
      const result = await getHashtagFollowersCount(999999);
      expect(typeof result).toBe('number');
    });

    it('should return 0 for non-existent hashtag', async () => {
      const result = await getHashtagFollowersCount(999999);
      expect(result).toBe(0);
    });
  });
});

describe('Hashtag Suggestions', () => {
  describe('searchHashtags ordering', () => {
    it('should order by popularity (useCount)', async () => {
      // This is already tested in hashtag-page.test.ts
      // Just verify the function exists and returns ordered results
      const { searchHashtags } = await import('./db');
      const results = await searchHashtags('a', 10);
      
      if (results.length >= 2) {
        // First result should have more or equal uses than second
        expect(results[0].useCount).toBeGreaterThanOrEqual(results[1].useCount);
      }
    });
  });
});
