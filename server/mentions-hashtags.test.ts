import { describe, it, expect } from 'vitest';
import { searchUsers, getUserByName, createMention, searchHashtags, getUserMentions } from './db';

describe('Clickable Mentions', () => {
  describe('getUserIdsByNames helper', () => {
    it('should have getUserByName function', () => {
      expect(typeof getUserByName).toBe('function');
    });

    it('should return user with id when found', async () => {
      const user = await getUserByName('TestUser');
      // User may or may not exist, but function should not throw
      expect(user === null || user === undefined || typeof user?.id === 'number').toBe(true);
    });
  });
});

describe('Mentions Page', () => {
  describe('getUserMentions', () => {
    it('should have getUserMentions function', () => {
      expect(typeof getUserMentions).toBe('function');
    });

    it('should return array of mentions', async () => {
      const mentions = await getUserMentions(1, 10);
      expect(Array.isArray(mentions)).toBe(true);
    });

    it('should return mentions with required fields', async () => {
      const mentions = await getUserMentions(1, 10);
      if (mentions.length > 0) {
        const mention = mentions[0];
        expect(mention).toHaveProperty('id');
        expect(mention).toHaveProperty('createdAt');
        expect(mention).toHaveProperty('mentionedBy');
      }
    });

    it('should respect limit parameter', async () => {
      const mentions = await getUserMentions(1, 5);
      expect(mentions.length).toBeLessThanOrEqual(5);
    });
  });
});

describe('Hashtag Autocomplete', () => {
  describe('searchHashtags', () => {
    it('should have searchHashtags function', () => {
      expect(typeof searchHashtags).toBe('function');
    });

    it('should return array for search results', async () => {
      const results = await searchHashtags('test');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await searchHashtags('xyznonexistent123456789');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      const results = await searchHashtags('a', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return hashtag data with required fields', async () => {
      const results = await searchHashtags('a', 5);
      if (results.length > 0) {
        const hashtag = results[0];
        expect(hashtag).toHaveProperty('id');
        expect(hashtag).toHaveProperty('tag');
        expect(hashtag).toHaveProperty('useCount');
      }
    });

    it('should handle # prefix in query', async () => {
      const results = await searchHashtags('#test');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for empty query', async () => {
      const results = await searchHashtags('');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});

describe('Mention and Hashtag Detection Regex', () => {
  const mentionRegex = /@(\w+)/g;
  const hashtagRegex = /#(\w+)/g;

  it('should extract mentions correctly', () => {
    const text = 'Hey @alice and @bob, check this!';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual(['alice', 'bob']);
  });

  it('should extract hashtags correctly', () => {
    const text = 'Check out #javascript and #react!';
    const matches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(matches).toEqual(['javascript', 'react']);
  });

  it('should handle mixed mentions and hashtags', () => {
    const text = '@user posted about #coding';
    const mentions = Array.from(text.matchAll(mentionRegex), m => m[1]);
    const hashtags = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(mentions).toEqual(['user']);
    expect(hashtags).toEqual(['coding']);
  });
});
