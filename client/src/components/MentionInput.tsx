import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onMentionsChange?: (mentions: number[]) => void;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  onMentionsChange,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionedUserIds, setMentionedUserIds] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: users, isLoading } = trpc.search.users.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length >= 1 && showDropdown }
  );

  // Detect @ symbol and extract search query
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursor = textarea.selectionStart;
    
    // Find the last @ before cursor
    const textBeforeCursor = text.substring(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setSearchQuery(textAfterAt);
        setShowDropdown(true);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowDropdown(false);
  }, [value, cursorPosition]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown || !users || users.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
    } else if (e.key === 'Enter' && showDropdown) {
      e.preventDefault();
      insertMention(users[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
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
      const newText = `${beforeAt}@${user.name!} ${afterCursor}`;
      
      onChange(newText);
      setShowDropdown(false);
      
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
          ) : !users || users.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              {searchQuery.length === 0 ? "Digite para buscar" : "Nenhum usuário encontrado"}
            </div>
          ) : (
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
          )}
        </Card>
      )}
    </div>
  );
}
