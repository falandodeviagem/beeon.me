interface MentionTextProps {
  content: string;
  className?: string;
}

export function MentionText({ content, className = "" }: MentionTextProps) {
  // Regex to match @username (alphanumeric and underscore)
  const mentionRegex = /@(\w+)/g;
  
  // Split content by mentions and create array of parts
  const parts: Array<{ type: 'text' | 'mention', content: string }> = [];
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }
    
    // Add mention
    parts.push({
      type: 'mention',
      content: match[1] // username without @
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          // For now, link to search page with username
          // TODO: Create a proper user profile lookup by name
          return (
            <span key={index} className="text-primary font-medium">
              @{part.content}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}
