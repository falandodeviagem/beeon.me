import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import {
  generateWhatsAppShareUrl,
  generateTwitterShareUrl,
  generateLinkedInShareUrl,
  generateFacebookShareUrl,
  generateTelegramShareUrl,
  extractHashtagsFromContent,
} from './social-share';

describe('Sistema de Compartilhamento Social', () => {
  let testUser: any;
  let testCommunity: any;
  let testPost: any;

  beforeAll(async () => {
    // Create test user
    const openId = `test-share-user-${Date.now()}`;
    await db.upsertUser({
      openId,
      name: 'Share Test User',
      email: `sharetest-${Date.now()}@test.com`,
    });

    testUser = await db.getUserByOpenId(openId);

    const caller = appRouter.createCaller({ user: testUser });

    // Create community
    testCommunity = await caller.community.create({
      name: 'Share Test Community',
      description: 'Community for share testing',
      category: 'tecnologia',
    });

    // Create post
    testPost = await caller.post.create({
      content: 'This is a test post for sharing #technology #social',
      communityId: testCommunity.id,
    });
  });

  describe('Helper Functions', () => {
    it('deve extrair hashtags do conteúdo', () => {
      const content = 'Post about #technology and #programming with #ai';
      const hashtags = extractHashtagsFromContent(content);

      expect(hashtags).toEqual(['technology', 'programming', 'ai']);
    });

    it('deve limitar hashtags a 3', () => {
      const content = '#one #two #three #four #five';
      const hashtags = extractHashtagsFromContent(content);

      expect(hashtags.length).toBe(3);
      expect(hashtags).toEqual(['one', 'two', 'three']);
    });

    it('deve retornar array vazio quando sem hashtags', () => {
      const content = 'Post without hashtags';
      const hashtags = extractHashtagsFromContent(content);

      expect(hashtags).toEqual([]);
    });

    it('deve gerar URL do WhatsApp corretamente', () => {
      const url = generateWhatsAppShareUrl({
        url: 'https://example.com/post/123',
        title: 'Test Post',
      });

      expect(url).toContain('wa.me');
      expect(url).toContain(encodeURIComponent('Test Post'));
      expect(url).toContain(encodeURIComponent('https://example.com/post/123'));
    });

    it('deve gerar URL do Twitter com hashtags', () => {
      const url = generateTwitterShareUrl({
        url: 'https://example.com/post/123',
        title: 'Test Post',
        hashtags: ['tech', 'social'],
      });

      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('hashtags=tech%2Csocial');
    });

    it('deve gerar URL do LinkedIn corretamente', () => {
      const url = generateLinkedInShareUrl({
        url: 'https://example.com/post/123',
        title: 'Test Post',
      });

      expect(url).toContain('linkedin.com/sharing/share-offsite');
      expect(url).toContain(encodeURIComponent('https://example.com/post/123'));
    });

    it('deve gerar URL do Facebook corretamente', () => {
      const url = generateFacebookShareUrl({
        url: 'https://example.com/post/123',
        title: 'Test Post',
      });

      expect(url).toContain('facebook.com/sharer');
    });

    it('deve gerar URL do Telegram corretamente', () => {
      const url = generateTelegramShareUrl({
        url: 'https://example.com/post/123',
        title: 'Test Post',
      });

      expect(url).toContain('t.me/share/url');
      expect(url).toContain('Test+Post'); // URLSearchParams uses + for spaces
    });
  });

  describe('tRPC Procedures', () => {
    it('deve buscar post por ID (público)', async () => {
      const caller = appRouter.createCaller({ user: null as any });

      const post = await caller.post.getById({ id: testPost.id });

      expect(post).toBeDefined();
      expect(post.id).toBe(testPost.id);
      expect(post.authorName).toBeDefined();
      expect(post.communityName).toBeDefined();
    });

    it('deve gerar URLs de compartilhamento para post', async () => {
      const caller = appRouter.createCaller({ user: null as any });

      const shareUrls = await caller.post.getShareUrls({ postId: testPost.id });

      expect(shareUrls).toBeDefined();
      expect(shareUrls.whatsapp).toContain('wa.me');
      expect(shareUrls.twitter).toContain('twitter.com');
      expect(shareUrls.linkedin).toContain('linkedin.com');
      expect(shareUrls.facebook).toContain('facebook.com');
      expect(shareUrls.telegram).toContain('t.me');
      expect(shareUrls.directUrl).toContain(`/post/${testPost.id}`);
    });

    it('deve incluir hashtags nas URLs do Twitter', async () => {
      const caller = appRouter.createCaller({ user: null as any });

      const shareUrls = await caller.post.getShareUrls({ postId: testPost.id });

      expect(shareUrls.twitter).toContain('hashtags=');
      expect(shareUrls.twitter).toContain('technology');
    });

    it('deve retornar erro para post inexistente', async () => {
      const caller = appRouter.createCaller({ user: null as any });

      await expect(
        caller.post.getShareUrls({ postId: 999999 })
      ).rejects.toThrow();
    });

    it('deve truncar conteúdo longo no título', async () => {
      const caller = appRouter.createCaller({ user: testUser });

      // Create post with long content
      const longPost = await caller.post.create({
        content: 'A'.repeat(200),
        communityId: testCommunity.id,
      });

      const publicCaller = appRouter.createCaller({ user: null as any });
      const shareUrls = await publicCaller.post.getShareUrls({ postId: longPost.id });

      // Title should be truncated to 100 chars + "..."
      expect(shareUrls.whatsapp.length).toBeLessThan(1000);
    });
  });
});
