import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onMentionsChange?: (mentions: number[]) => void;
}

type DropdownMode = 'none' | 'mention' | 'hashtag';

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  onMentionsChange,
}: MentionInputProps) {
  const [dropdownMode, setDropdownMode] = useState<DropdownMode>('none');
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUserIds, setMentionedUserIds] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User search for mentions
  const { data: users, isLoading: usersLoading } = trpc.search.users.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length >= 1 && dropdownMode === 'mention' }
  );

  // Hashtag search
  const { data: hashtags, isLoading: hashtagsLoading } = trpc.search.hashtags.useQuery(
    { query: searchQuery, limit: 8 },
    { enabled: searchQuery.length >= 1 && dropdownMode === 'hashtag' }
  );

  // Detect @ or # symbol and extract search query
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursor = textarea.selectionStart;
    
    const textBeforeCursor = text.substring(0, cursor);
    
    // Find the last @ or # before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    // Determine which trigger is more recent
    const triggerIndex = Math.max(lastAtIndex, lastHashIndex);
    const isMention = lastAtIndex > lastHashIndex;
    
    if (triggerIndex !== -1) {
      const textAfterTrigger = textBeforeCursor.substring(triggerIndex + 1);
      
      // Check if there's a space after trigger (which would end the autocomplete)
      if (!textAfterTrigger.includes(' ') && !textAfterTrigger.includes('\n')) {
        setSearchQuery(textAfterTrigger);
        setDropdownMode(isMention ? 'mention' : 'hashtag');
        setSelectedIndex(0);
        return;
      }
    }
    
    setDropdownMode('none');
  }, [value, cursorPosition]);

  const showDropdown = dropdownMode !== 'none';
  const isLoading = dropdownMode === 'mention' ? usersLoading : hashtagsLoading;
  const items = dropdownMode === 'mention' ? users : hashtags;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || !items || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && showDropdown) {
      e.preventDefault();
      if (dropdownMode === 'mention' && users) {
        insertMention(users[selectedIndex]);
      } else if (dropdownMode === 'hashtag' && hashtags) {
        insertHashtag(hashtags[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setDropdownMode('none');
    } else if (e.key === 'Tab' && showDropdown) {
      e.preventDefault();
      if (dropdownMode === 'mention' && users && users.length > 0) {
        insertMention(users[selectedIndex]);
      } else if (dropdownMode === 'hashtag' && hashtags && hashtags.length > 0) {
        insertHashtag(hashtags[selectedIndex]);
      }
    }
  };

  const insertMention = (user: { id: number; name: string | null }) => {
    const textarea = textareaRef.current;
    if (!textarea || !user.name) return;

    const text = value;
    const cursor = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = text.substring(0, lastAtIndex);
      const afterCursor = text.substring(cursor);
      const newText = `${beforeAt}@${user.name} ${afterCursor}`;
      
      onChange(newText);
      setDropdownMode('none');
      
      // Update mentions list
      const newMentions = [...mentionedUserIds, user.id];
      setMentionedUserIds(newMentions);
      onMentionsChange?.(newMentions);
      
      // Set cursor position after mention
      setTimeout(() => {
        const newPosition = lastAtIndex + user.name!.length + 2;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }
  };

  const insertHashtag = (hashtag: { id: number; tag: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursor = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursor);
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    if (lastHashIndex !== -1) {
      const beforeHash = text.substring(0, lastHashIndex);
      const afterCursor = text.substring(cursor);
      const newText = `${beforeHash}#${hashtag.tag} ${afterCursor}`;
      
      onChange(newText);
      setDropdownMode('none');
      
      // Set cursor position after hashtag
      setTimeout(() => {
        const newPosition = lastHashIndex + hashtag.tag.length + 2;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
      />

      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute z-50 w-full max-w-sm mt-1 p-2 shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Buscando...</div>
          ) : !items || items.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              {searchQuery.length === 0 
                ? "Digite para buscar" 
                : dropdownMode === 'mention' 
                  ? "Nenhum usuário encontrado"
                  : "Nenhuma hashtag encontrada"
              }
            </div>
          ) : dropdownMode === 'mention' && users ? (
            <div className="space-y-1">
              {users.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Nível {user.level} • {user.points} pts
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : dropdownMode === 'hashtag' && hashtags ? (
            <div className="space-y-1">
              {hashtags.map((hashtag, index) => (
                <button
                  key={hashtag.id}
                  onClick={() => insertHashtag(hashtag)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">#{hashtag.tag}</div>
                    <div className="text-xs text-muted-foreground">
                      {hashtag.useCount} {hashtag.useCount === 1 ? 'uso' : 'usos'}
                    </div>
                  </div>
                  {hashtag.useCount >= 50 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      🔥 {hashtag.useCount >= 100 ? 'Popular' : 'Em alta'}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
