import { useState, useEffect, useRef } from "react";
import { Search, Users, Hash, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = trpc.search.global.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length >= 2 }
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  const hasResults = results && (
    results.communities.length > 0 ||
    results.users.length > 0 ||
    results.posts.length > 0 ||
    results.hashtags.length > 0
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar comunidades, usuários, posts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-y-auto z-50 shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {/* Communities */}
              {results.communities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                    <Users className="h-3 w-3" />
                    COMUNIDADES
                  </div>
                  <div className="space-y-1">
                    {results.communities.map((community) => (
                      <Link
                        key={community.id}
                        href={`/community/${community.id}`}
                        onClick={() => handleClear()}
                      >
                        <a className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {community.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{community.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {community.memberCount} membros
                            </div>
                          </div>
                          {community.isPaid && (
                            <Badge variant="secondary" className="text-xs">
                              Paga
                            </Badge>
                          )}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                    <Users className="h-3 w-3" />
                    USUÁRIOS
                  </div>
                  <div className="space-y-1">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        onClick={() => handleClear()}
                      >
                        <a className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Nível {user.level} • {user.points} pts
                            </div>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    POSTS
                  </div>
                  <div className="space-y-1">
                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/community/${post.communityId}`}
                        onClick={() => handleClear()}
                      >
                        <a className="block p-2 rounded-md hover:bg-accent transition-colors">
                          <div className="text-sm line-clamp-2">{post.content}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {post.likeCount} curtidas • {post.commentCount} comentários
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {results.hashtags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    HASHTAGS
                  </div>
                  <div className="flex flex-wrap gap-2 p-2">
                    {results.hashtags.map((hashtag) => (
                      <Link
                        key={hashtag.id}
                        href={`/search?q=${encodeURIComponent("#" + hashtag.tag)}`}
                        onClick={() => handleClear()}
                      >
                        <a>
                          <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                            #{hashtag.tag} ({hashtag.postCount})
                          </Badge>
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
