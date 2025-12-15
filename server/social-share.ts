export interface ShareData {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
}

export function generateWhatsAppShareUrl(data: ShareData): string {
  const text = `${data.title}\n\n${data.url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function generateTwitterShareUrl(data: ShareData): string {
  const params = new URLSearchParams();
  params.append('url', data.url);
  params.append('text', data.title);
  
  if (data.hashtags && data.hashtags.length > 0) {
    params.append('hashtags', data.hashtags.join(','));
  }
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function generateLinkedInShareUrl(data: ShareData): string {
  const params = new URLSearchParams();
  params.append('url', data.url);
  
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function generateFacebookShareUrl(data: ShareData): string {
  const params = new URLSearchParams();
  params.append('u', data.url);
  
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

export function generateTelegramShareUrl(data: ShareData): string {
  const params = new URLSearchParams();
  params.append('url', data.url);
  params.append('text', data.title);
  
  return `https://t.me/share/url?${params.toString()}`;
}

export function extractHashtagsFromContent(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.replace('#', '')).slice(0, 3); // Max 3 hashtags
}
