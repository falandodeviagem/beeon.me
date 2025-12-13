import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: topUsers, isLoading } = trpc.user.getLeaderboard.useQuery({ limit: 50 });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranking
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Os membros mais ativos da BeeOn.me
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user?.points || 0}</p>
                  <p className="text-sm text-muted-foreground">Seus Pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Nível {user?.level || 1}</p>
                  <p className="text-sm text-muted-foreground">Seu Nível</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {topUsers?.findIndex((u) => u.id === user?.id) !== -1
                      ? `#${(topUsers?.findIndex((u) => u.id === user?.id) || 0) + 1}`
                      : "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Sua Posição</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top 50 Usuários</CardTitle>
            <CardDescription>
              Ranking baseado em pontos acumulados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : topUsers && topUsers.length > 0 ? (
              <div className="space-y-2">
                {topUsers.map((topUser, index) => {
                  const position = index + 1;
                  const isCurrentUser = topUser.id === user?.id;

                  return (
                    <div
                      key={topUser.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                        isCurrentUser
                          ? "bg-primary/10 border-2 border-primary"
                          : "hover:bg-accent/5"
                      }`}
                    >
                      {/* Position */}
                      <div className="w-12 flex items-center justify-center">
                        {getMedalIcon(position) || (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {position}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={topUser.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {topUser.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {topUser.name || `Usuário #${topUser.id}`}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Nível {topUser.level}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {topUser.points.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum usuário no ranking ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card>
          <CardHeader>
            <CardTitle>Como Ganhar Pontos</CardTitle>
            <CardDescription>
              Participe ativamente para subir no ranking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span>Criar uma comunidade</span>
                <Badge variant="secondary">+100 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span>Convidar um amigo</span>
                <Badge variant="secondary">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span>Criar um post</span>
                <Badge variant="secondary">+10 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span>Comentar em um post</span>
                <Badge variant="secondary">+5 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span>Receber um like</span>
                <Badge variant="secondary">+2 pts</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
