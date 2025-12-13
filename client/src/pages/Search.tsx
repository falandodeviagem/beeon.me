import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Search as SearchIcon, Users, Trophy, Lock, Unlock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"communities" | "users">("communities");

  const { data: communities, isLoading: communitiesLoading } = trpc.search.communities.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length >= 2 }
  );

  const { data: users, isLoading: usersLoading } = trpc.search.users.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length >= 2 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SearchIcon className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Buscar
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Encontre comunidades e pessoas na BeeOn.me
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Digite para buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg h-12"
                autoFocus
              />
              <Button type="submit" size="lg" className="gap-2">
                <SearchIcon className="w-5 h-5" />
                Buscar
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-3">
              Digite pelo menos 2 caracteres para buscar
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {searchQuery.length >= 2 && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "communities" | "users")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="communities" className="gap-2">
                <Users className="w-4 h-4" />
                Comunidades
                {communities && <Badge variant="secondary">{communities.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Trophy className="w-4 h-4" />
                Usuários
                {users && <Badge variant="secondary">{users.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* Communities Tab */}
            <TabsContent value="communities" className="space-y-4 mt-6">
              {communitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : communities && communities.length > 0 ? (
                <div className="space-y-4">
                  {communities.map((community) => (
                    <Link key={community.id} href={`/community/${community.id}`}>
                      <a>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                <Users className="w-8 h-8 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold truncate">{community.name}</h3>
                                  {community.isPaid ? (
                                    <Badge variant="default" className="gap-1">
                                      <Lock className="w-3 h-3" />
                                      Paga
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="gap-1">
                                      <Unlock className="w-3 h-3" />
                                      Gratuita
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-muted-foreground line-clamp-2 mb-3">
                                  {community.description || "Sem descrição"}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {community.memberCount} membros
                                  </div>
                                  {community.isPaid && (
                                    <div className="font-semibold text-primary">
                                      R$ {(community.price / 100).toFixed(2)}/mês
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma comunidade encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente buscar com outros termos
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4 mt-6">
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <Link key={user.id} href={`/profile?userId=${user.id}`}>
                      <a>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage src={user.avatarUrl || undefined} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                  {user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-bold truncate">{user.name}</h3>
                                  <Badge variant="secondary">Nível {user.level}</Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                  {user.bio || "Sem bio"}
                                </p>

                                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                                  <Trophy className="w-4 h-4" />
                                  {user.points} pontos
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <SearchIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum usuário encontrado</h3>
                    <p className="text-muted-foreground">
                      Tente buscar com outros termos
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {searchQuery.length < 2 && (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <SearchIcon className="w-20 h-20 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Comece a buscar</h3>
                <p className="text-muted-foreground text-lg">
                  Digite no campo acima para encontrar comunidades e pessoas
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
