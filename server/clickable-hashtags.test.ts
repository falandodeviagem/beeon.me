import { describe, it, expect } from 'vitest';
import { extractHashtags, linkHashtagsToPost, getPostsByHashtag } from './db';

describe('Clickable Hashtags', () => {
  describe('extractHashtags', () => {
    it('should have extractHashtags function', () => {
      expect(typeof extractHashtags).toBe('function');
    });

    it('should extract single hashtag', () => {
      const result = extractHashtags('Hello #world');
      expect(result).toEqual(['world']);
    });

    it('should extract multiple hashtags', () => {
      const result = extractHashtags('Check out #javascript and #react');
      expect(result).toContain('javascript');
      expect(result).toContain('react');
      expect(result.length).toBe(2);
    });

    it('should return empty array for no hashtags', () => {
      const result = extractHashtags('No hashtags here');
      expect(result).toEqual([]);
    });

    it('should convert hashtags to lowercase', () => {
      const result = extractHashtags('#JavaScript #REACT');
      expect(result).toContain('javascript');
      expect(result).toContain('react');
    });

    it('should remove duplicate hashtags', () => {
      const result = extractHashtags('#test #Test #TEST');
      expect(result).toEqual(['test']);
    });

    it('should handle hashtags with underscores', () => {
      const result = extractHashtags('#my_hashtag');
      expect(result).toEqual(['my_hashtag']);
    });

    it('should handle hashtags with numbers', () => {
      const result = extractHashtags('#web3 #react18');
      expect(result).toContain('web3');
      expect(result).toContain('react18');
    });
  });

  describe('linkHashtagsToPost', () => {
    it('should have linkHashtagsToPost function', () => {
      expect(typeof linkHashtagsToPost).toBe('function');
    });

    it('should not throw for content without hashtags', async () => {
      await expect(linkHashtagsToPost(999999, 'No hashtags here')).resolves.not.toThrow();
    });
  });

  describe('getPostsByHashtag', () => {
    it('should have getPostsByHashtag function', () => {
      expect(typeof getPostsByHashtag).toBe('function');
    });

    it('should return array', async () => {
      const result = await getPostsByHashtag('test');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('Hashtag Regex Patterns', () => {
  const hashtagRegex = /#(\w+)/g;

  it('should match hashtags at start of text', () => {
    const text = '#hello world';
    const matches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(matches).toEqual(['hello']);
  });

  it('should match hashtags at end of text', () => {
    const text = 'Check this #awesome';
    const matches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(matches).toEqual(['awesome']);
  });

  it('should match multiple hashtags in a row', () => {
    const text = '#one #two #three';
    const matches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(matches).toEqual(['one', 'two', 'three']);
  });

  it('should not match email addresses', () => {
    const text = 'Contact user@example.com';
    const matches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(matches).toEqual([]);
  });

  it('should handle mixed mentions and hashtags', () => {
    const text = '@user posted about #coding';
    const hashtagMatches = Array.from(text.matchAll(hashtagRegex), m => m[1]);
    expect(hashtagMatches).toEqual(['coding']);
  });
});
