import { describe, it, expect } from 'vitest';
import { getPostsByHashtag, getTrendingHashtags, searchHashtags } from './db';

describe('Hashtag Page', () => {
  describe('getPostsByHashtag', () => {
    it('should have getPostsByHashtag function', () => {
      expect(typeof getPostsByHashtag).toBe('function');
    });

    it('should return array of posts', async () => {
      const posts = await getPostsByHashtag('test');
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should return empty array for non-existent hashtag', async () => {
      const posts = await getPostsByHashtag('xyznonexistent123456789');
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      const posts = await getPostsByHashtag('test', 5);
      expect(posts.length).toBeLessThanOrEqual(5);
    });

    it('should return posts with required fields', async () => {
      const posts = await getPostsByHashtag('test', 10);
      if (posts.length > 0) {
        const post = posts[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('createdAt');
      }
    });
  });
});

describe('Trending Hashtags Widget', () => {
  describe('getTrendingHashtags', () => {
    it('should have getTrendingHashtags function', () => {
      expect(typeof getTrendingHashtags).toBe('function');
    });

    it('should return array of hashtags', async () => {
      const hashtags = await getTrendingHashtags();
      expect(Array.isArray(hashtags)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const hashtags = await getTrendingHashtags(5);
      expect(hashtags.length).toBeLessThanOrEqual(5);
    });

    it('should return hashtags with required fields', async () => {
      const hashtags = await getTrendingHashtags(10);
      if (hashtags.length > 0) {
        const hashtag = hashtags[0];
        expect(hashtag).toHaveProperty('id');
        expect(hashtag).toHaveProperty('tag');
        expect(hashtag).toHaveProperty('useCount');
      }
    });

    it('should order by popularity', async () => {
      const hashtags = await getTrendingHashtags(10);
      if (hashtags.length >= 2) {
        // First hashtag should have more or equal posts than second
        const first = hashtags[0].postCount || hashtags[0].useCount;
        const second = hashtags[1].postCount || hashtags[1].useCount;
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });
  });

  describe('searchHashtags for autocomplete', () => {
    it('should have searchHashtags function', () => {
      expect(typeof searchHashtags).toBe('function');
    });

    it('should return array for search', async () => {
      const results = await searchHashtags('a');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return hashtags matching prefix', async () => {
      const results = await searchHashtags('test');
      if (results.length > 0) {
        results.forEach(h => {
          expect(h.tag.toLowerCase().startsWith('test')).toBe(true);
        });
      }
    });
  });
});
