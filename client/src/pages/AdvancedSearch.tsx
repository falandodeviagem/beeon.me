import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import PostCard from "@/components/PostCard";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search, Filter, X, Clock, Hash, User, Building2 } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [communityId, setCommunityId] = useState<number | undefined>();
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "likes" | "relevance">("date");
  const [showFilters, setShowFilters] = useState(false);

  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  const { data: results, isLoading, refetch } = trpc.search.posts.useQuery(
    {
      query: query || undefined,
      communityId,
      authorId,
      hashtags: selectedHashtags.length > 0 ? selectedHashtags : undefined,
      sortBy,
      limit: 50,
    },
    {
      enabled: false, // Only fetch when user clicks search
    }
  );

  const { data: suggestions } = trpc.search.suggestions.useQuery(
    { query: query || "" },
    {
      enabled: query.length > 0,
    }
  );

  const handleSearch = () => {
    if (query.trim()) {
      addToHistory(query, "text");
    }
    refetch();
  };

  const handleHashtagClick = (tag: string) => {
    if (!selectedHashtags.includes(tag)) {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const removeHashtag = (tag: string) => {
    setSelectedHashtags(selectedHashtags.filter((t) => t !== tag));
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    addToHistory(historyQuery, "text");
    refetch();
  };

  const clearFilters = () => {
    setCommunityId(undefined);
    setAuthorId(undefined);
    setSelectedHashtags([]);
    setSortBy("date");
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Busca Avançada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected Hashtags */}
                {selectedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedHashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeHashtag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Filters */}
                {showFilters && (
                  <div className="space-y-3 p-4 bg-accent/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Filtros</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto p-1 text-xs"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Ordenar por
                        </label>
                        <Select
                          value={sortBy}
                          onValueChange={(value: any) => setSortBy(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Mais recentes</SelectItem>
                            <SelectItem value="likes">Mais curtidos</SelectItem>
                            <SelectItem value="relevance">Relevância</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((post) => (
                  <PostCard key={post.id} post={{ ...post, communityName: post.communityName || 'Sem comunidade' }} />
                ))}
              </div>
            ) : results ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar seus filtros ou usar palavras-chave diferentes
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Buscas Recentes
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-auto p-1 text-xs"
                    >
                      Limpar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {history.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleHistoryClick(item.query)}
                          className="flex-1 text-left text-sm hover:text-primary transition-colors truncate"
                        >
                          {item.query}
                        </button>
                        <X
                          className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-foreground flex-shrink-0"
                          onClick={() => removeFromHistory(item.query)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hashtag Suggestions */}
            {suggestions && suggestions.hashtags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags Sugeridas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag.tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => handleHashtagClick(hashtag.tag)}
                      >
                        #{hashtag.tag}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {hashtag.count}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Suggestions */}
            {suggestions && suggestions.users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.users.map((user) => (
                      <Link key={user.id} href={`/profile?userId=${user.id}`}>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.points} pts
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Suggestions */}
            {suggestions && suggestions.communities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Comunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suggestions.communities.map((community) => (
                      <Link key={community.id} href={`/community/${community.id}`}>
                        <div className="cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors">
                          <p className="text-sm font-medium">{community.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {community.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {community.memberCount} membros
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
