import ogs from 'open-graph-scraper';

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const { result } = await ogs({ url, timeout: 5000 });
    
    if (!result.success) {
      return null;
    }

    return {
      url,
      title: result.ogTitle || result.twitterTitle,
      description: result.ogDescription || result.twitterDescription,
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
      siteName: result.ogSiteName,
    };
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}
