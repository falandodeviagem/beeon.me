import { describe, it, expect } from 'vitest';
import { extractUrls } from './link-preview';

describe('Link Preview', () => {
  describe('extractUrls', () => {
    it('should extract single URL from text', () => {
      const text = 'Check out this link: https://example.com';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('https://example.com');
    });

    it('should extract multiple URLs from text', () => {
      const text = 'Visit https://example.com and https://test.com for more info';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(2);
      expect(urls).toContain('https://example.com');
      expect(urls).toContain('https://test.com');
    });

    it('should extract URLs with paths and query params', () => {
      const text = 'Check https://example.com/path/to/page?param=value&other=123';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('https://example.com/path/to/page?param=value&other=123');
    });

    it('should extract both http and https URLs', () => {
      const text = 'Visit http://example.com and https://secure.com';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(2);
      expect(urls).toContain('http://example.com');
      expect(urls).toContain('https://secure.com');
    });

    it('should return empty array when no URLs found', () => {
      const text = 'This text has no URLs at all';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(0);
    });

    it('should handle URLs at start and end of text', () => {
      const text = 'https://start.com some text in middle https://end.com';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(2);
      expect(urls[0]).toBe('https://start.com');
      expect(urls[1]).toBe('https://end.com');
    });

    it('should handle URLs with fragments', () => {
      const text = 'Go to https://example.com/page#section';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('https://example.com/page#section');
    });

    it('should not extract incomplete URLs', () => {
      const text = 'example.com is not a complete URL';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(0);
    });

    it('should handle URLs in HTML content', () => {
      const text = '<p>Visit <a href="https://example.com">this link</a></p>';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('https://example.com');
    });

    it('should handle URLs with special characters in domain', () => {
      const text = 'Check https://sub-domain.example-site.com/path';
      const urls = extractUrls(text);
      
      expect(urls).toHaveLength(1);
      expect(urls[0]).toBe('https://sub-domain.example-site.com/path');
    });
  });
});
