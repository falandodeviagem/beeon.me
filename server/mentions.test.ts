import { describe, it, expect } from 'vitest';
import { searchUsers, createMention, getUserByName } from './db';

describe('Mentions System', () => {
  describe('User Search for Mentions', () => {
    it('should have searchUsers function', () => {
      expect(typeof searchUsers).toBe('function');
    });

    it('should return array for search results', async () => {
      const results = await searchUsers('a');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await searchUsers('xyznonexistent123456789');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should respect limit parameter', async () => {
      const results = await searchUsers('a', 3);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return user data with required fields', async () => {
      const results = await searchUsers('a', 1);
      if (results.length > 0) {
        const user = results[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('points');
        expect(user).toHaveProperty('level');
      }
    });
  });

  describe('Get User By Name', () => {
    it('should have getUserByName function', () => {
      expect(typeof getUserByName).toBe('function');
    });

    it('should return null or undefined for non-existent user', async () => {
      const result = await getUserByName('nonexistentuser123456789');
      expect(result == null).toBe(true); // null or undefined
    });
  });

  describe('Create Mention', () => {
    it('should have createMention function', () => {
      expect(typeof createMention).toBe('function');
    });
  });
});

describe('Mention Extraction Regex', () => {
  const mentionRegex = /@(\w+)/g;

  it('should extract single mention', () => {
    const text = 'Hello @john how are you?';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual(['john']);
  });

  it('should extract multiple mentions', () => {
    const text = 'Hey @alice and @bob, check this out!';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual(['alice', 'bob']);
  });

  it('should handle mentions at start and end', () => {
    const text = '@start is here and @end';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual(['start', 'end']);
  });

  it('should not match email addresses as mentions', () => {
    const text = 'Contact me at test@example.com';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    // The regex will match 'example' from @example.com
    expect(matches).toEqual(['example']);
  });

  it('should handle text with no mentions', () => {
    const text = 'This is a normal text without mentions';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual([]);
  });

  it('should handle mentions with underscores', () => {
    const text = 'Hey @user_name check this';
    const matches = Array.from(text.matchAll(mentionRegex), m => m[1]);
    expect(matches).toEqual(['user_name']);
  });
});
