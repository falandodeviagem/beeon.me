import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Busca Avançada', () => {
  let testUser: any;
  let testCommunity: any;
  let testPost: any;

  beforeAll(async () => {
    // Create test user
    const openId = `test-search-user-${Date.now()}`;
    const userId = await db.upsertUser({
      openId,
      name: 'Search Test User',
      email: `searchtest-${Date.now()}@test.com`,
    });

    testUser = await db.getUserById(userId);

    const caller = appRouter.createCaller({ user: testUser });

    // Create community
    testCommunity = await caller.community.create({
      name: 'Search Test Community',
      description: 'Community for search testing',
      category: 'tecnologia',
    });

    // Create post with hashtags
    testPost = await caller.post.create({
      content: 'This is a test post about #technology and #programming',
      communityId: testCommunity.id,
    });
  });

  it('deve buscar posts por query de texto', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      query: 'test post',
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    const foundPost = results.find((p) => p.id === testPost.id);
    expect(foundPost).toBeDefined();
  });

  it('deve buscar posts por comunidade', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      communityId: testCommunity.id,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.every((p) => p.communityId === testCommunity.id)).toBe(true);
  });

  it('deve buscar posts por autor', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      authorId: testUser.id,
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    expect(results.every((p) => p.authorId === testUser.id)).toBe(true);
  });

  it('deve buscar posts por hashtag', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      hashtags: ['technology'],
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    // Should find the post with #technology hashtag
    const foundPost = results.find((p) => p.id === testPost.id);
    expect(foundPost).toBeDefined();
  });

  it('deve ordenar posts por data', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      sortBy: 'date',
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 1) {
      // Check if sorted by date descending
      for (let i = 0; i < results.length - 1; i++) {
        const current = new Date(results[i].createdAt).getTime();
        const next = new Date(results[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it('deve ordenar posts por likes', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.posts({
      sortBy: 'likes',
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 1) {
      // Check if sorted by likes descending
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].likeCount).toBeGreaterThanOrEqual(results[i + 1].likeCount);
      }
    }
  });

  it('deve buscar usuários por query', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.users({
      query: 'Search Test',
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    const foundUser = results.find((u) => u.id === testUser.id);
    expect(foundUser).toBeDefined();
  });

  it('deve buscar comunidades por query', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const results = await caller.search.communities({
      query: 'Search Test',
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
    const foundCommunity = results.find((c) => c.id === testCommunity.id);
    expect(foundCommunity).toBeDefined();
  });

  it('deve retornar sugestões de busca', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const suggestions = await caller.search.suggestions({
      query: 'test',
    });

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions.users)).toBe(true);
    expect(Array.isArray(suggestions.communities)).toBe(true);
    expect(Array.isArray(suggestions.hashtags)).toBe(true);
  });

  it('deve retornar hashtags trending quando query vazia', async () => {
    const caller = appRouter.createCaller({ user: testUser });

    const suggestions = await caller.search.suggestions({
      query: '',
    });

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions.hashtags)).toBe(true);
    // Should return trending hashtags when no query
  });
});
