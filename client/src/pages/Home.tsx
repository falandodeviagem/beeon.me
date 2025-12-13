import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Users, Trophy, UserPlus, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const { data: feedPosts, isLoading: feedLoading } = trpc.feed.get.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  const { data: communities } = trpc.community.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const likeMutation = trpc.post.like.useMutation({
    onSuccess: () => {
      utils.feed.get.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/10">
        <div className="container max-w-6xl py-16 px-4">
          <div className="text-center space-y-8 mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🐝</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Bem-vindo ao BeeOn.me
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                A plataforma de comunidades que recompensa seu engajamento
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <a>
                  <Button size="lg" className="gap-2 text-lg h-14 px-8">
                    <Sparkles className="w-5 h-5" />
                    Começar Agora
                  </Button>
                </a>
              </Link>
              <Link href="/communities">
                <a>
                  <Button size="lg" variant="outline" className="gap-2 text-lg h-14 px-8">
                    <Users className="w-5 h-5" />
                    Explorar Comunidades
                  </Button>
                </a>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Comunidades Exclusivas</h3>
                  <p className="text-muted-foreground">
                    Participe de comunidades públicas ou crie sua própria comunidade paga e monetize seu conteúdo
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Sistema de Gamificação</h3>
                  <p className="text-muted-foreground">
                    Ganhe pontos por cada ação, desbloqueie badges especiais e suba no ranking global
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Convide e Ganhe</h3>
                  <p className="text-muted-foreground">
                    Convide amigos e ganhe 50 pontos por cada convite aceito. Quanto mais amigos, mais recompensas!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl font-bold">Pronto para começar?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Junte-se a milhares de usuários que já estão construindo comunidades incríveis e ganhando recompensas
              </p>
              <Link href="/login">
                <a>
                  <Button size="lg" className="gap-2">
                    Criar Conta Grátis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Seu Feed</h2>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Personalizado
              </Badge>
            </div>

            {feedLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : feedPosts && feedPosts.length > 0 ? (
              <div className="space-y-4">
                {feedPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">Usuário #{post.authorId}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                      <div className="flex items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => likeMutation.mutate({ postId: post.id })}
                        >
                          <Heart className="w-4 h-4" />
                          {post.likeCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentCount}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center space-y-4">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Seu feed está vazio</h3>
                    <p className="text-muted-foreground mb-6">
                      Entre em comunidades para ver posts no seu feed
                    </p>
                    <Link href="/communities">
                      <a>
                        <Button className="gap-2">
                          <Users className="w-4 h-4" />
                          Explorar Comunidades
                        </Button>
                      </a>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">Nível {user?.level || 1}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <p className="text-2xl font-bold text-primary">{user?.points || 0}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                  <Link href="/leaderboard">
                    <a className="block">
                      <div className="p-3 rounded-lg bg-secondary/20 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
                        <Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Ver Ranking</p>
                      </div>
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold mb-3">Ações Rápidas</h3>
                <Link href="/communities">
                  <a>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" />
                      Explorar Comunidades
                    </Button>
                  </a>
                </Link>
                <Link href="/invites">
                  <a>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <UserPlus className="w-4 h-4" />
                      Convidar Amigos
                    </Button>
                  </a>
                </Link>
                <Link href="/profile">
                  <a>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Trophy className="w-4 h-4" />
                      Meu Perfil
                    </Button>
                  </a>
                </Link>
              </CardContent>
            </Card>

            {communities && communities.length > 0 && (
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h3 className="font-semibold mb-3">Comunidades em Alta</h3>
                  {communities.slice(0, 3).map((community) => (
                    <Link key={community.id} href={`/community/${community.id}`}>
                      <a className="block p-3 rounded-lg hover:bg-accent/5 transition-colors">
                        <p className="font-medium line-clamp-1">{community.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {community.memberCount} membros
                        </p>
                      </a>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
