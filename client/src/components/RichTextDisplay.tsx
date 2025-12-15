import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
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
