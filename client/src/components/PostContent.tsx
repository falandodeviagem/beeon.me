import { RichTextDisplay } from "@/components/RichTextDisplay";
import { LinkPreviewCard } from "@/components/LinkPreviewCard";
import { useMemo } from "react";

interface PostContentProps {
  content: string;
  className?: string;
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<"']+)/g;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

export function PostContent({ content, className }: PostContentProps) {
  const urls = useMemo(() => extractUrls(content), [content]);

  return (
    <div className={className}>
      <RichTextDisplay content={content} />
      
      {urls.length > 0 && (
        <div className="space-y-2 mt-3">
          {urls.slice(0, 3).map((url) => (
            <LinkPreviewCard key={url} url={url} />
          ))}
          {urls.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{urls.length - 3} link{urls.length - 3 > 1 ? 's' : ''} adicional{urls.length - 3 > 1 ? 'is' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
