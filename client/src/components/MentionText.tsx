import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

interface MentionTextProps {
  content: string;
  className?: string;
}

export function MentionText({ content, className = "" }: MentionTextProps) {
  // Regex to match @username (alphanumeric and underscore)
  const mentionRegex = /@(\w+)/g;
  
  // Extract unique usernames from content
  const usernames = Array.from(content.matchAll(mentionRegex), m => m[1]);
  const uniqueUsernames = usernames.filter((v, i, a) => a.indexOf(v) === i);
  
  // Fetch user IDs for mentioned usernames
  const { data: userMap } = trpc.user.getUserIdsByNames.useQuery(
    { names: uniqueUsernames },
    { enabled: uniqueUsernames.length > 0 }
  );
  
  // Split content by mentions and create array of parts
  const parts: Array<{ type: 'text' | 'mention', content: string }> = [];
  let lastIndex = 0;
  let match;
  
  // Reset regex
  mentionRegex.lastIndex = 0;
  
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
          const userId = userMap?.[part.content];
          
          if (userId) {
            return (
              <Link key={index} href={`/user/${userId}`}>
                <a className="text-primary font-medium hover:underline cursor-pointer transition-colors hover:text-primary/80">
                  @{part.content}
                </a>
              </Link>
            );
          }
          
          // Fallback if user not found - still styled but not clickable
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
