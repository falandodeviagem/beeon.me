import { Link } from "wouter";

interface HashtagTextProps {
  text: string;
  className?: string;
}

/**
 * Component that renders text with clickable hashtags
 * Detects #hashtag patterns and converts them to links
 */
export default function HashtagText({ text, className = "" }: HashtagTextProps) {
  // Regex to detect hashtags
  const hashtagRegex = /#(\w+)/g;
  
  // Split text into parts (text and hashtags)
  const parts: Array<{ type: 'text' | 'hashtag'; content: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add hashtag
    parts.push({
      type: 'hashtag',
      content: match[1]!, // The captured group (without #)
    });

    lastIndex = match.index + match[0]!.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <Link key={index} href={`/hashtag/${part.content.toLowerCase()}`}>
              <span className="text-primary hover:underline cursor-pointer font-medium">
                #{part.content}
              </span>
            </Link>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}
