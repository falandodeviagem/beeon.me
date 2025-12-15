import { cn } from "@/lib/utils";
import { MentionText } from "@/components/MentionText";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  // Check if content contains HTML tags (from rich text editor)
  const hasHtml = /<[^>]+>/.test(content);
  
  if (hasHtml) {
    // For HTML content, render as before but process mentions/hashtags in text nodes
    // This is a simplified approach - for full support, would need HTML parsing
    return (
      <div 
        className={cn(
          "prose prose-sm max-w-none",
          "prose-p:my-2 prose-p:leading-relaxed",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-a:text-primary prose-a:underline prose-a:cursor-pointer hover:prose-a:text-primary/80",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-em:text-foreground",
          "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-1",
          "prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto",
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  
  // For plain text content, use MentionText to render clickable mentions and hashtags
  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none whitespace-pre-wrap",
        "prose-p:my-2 prose-p:leading-relaxed",
        className
      )}
    >
      <MentionText content={content} />
    </div>
  );
}
