import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Search, TrendingUp, MessageSquare, Heart, Award, Clock, 
  Calendar, AlertTriangle, Shield, Ban, CheckCircle, Activity,
  BarChart3, PieChart, UserCheck, UserX
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainLayout from "@/components/MainLayout";

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const categoryLabels: Record<string, string> = {
  technology: "Tecnologia",
  sports: "Esportes",
  art: "Arte",
  music: "Música",
  gaming: "Games",
  education: "Educação",
  business: "Negócios",
  lifestyle: "Lifestyle",
  other: "Outros",
};

export default function UserInsights() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: searchResults, isLoading: searching } = trpc.moderation.searchUsersForInsights.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 2 }
  );

  const { data: insights, isLoading: loadingInsights } = trpc.moderation.getUserInsights.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  if (user?.role !== "admin") {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Acesso restrito a administradores</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const getEngagementColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Insights de Usuários</h1>
            <p className="text-muted-foreground">Dados comportamentais e de engajamento (LGPD compliant)</p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Nome ou ID do usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {searching && <p className="text-sm text-muted-foreground mt-4">Buscando...</p>}

            {searchResults && searchResults.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((u: any) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUserId === u.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar || undefined} />
                      <AvatarFallback>{u.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Nível {u.level} • {u.points} pts
                      </p>
                    </div>
                    {u.isBanned && <Badge variant="destructive">Banido</Badge>}
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults?.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">Nenhum usuário encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* User Insights */}
        {selectedUserId && (
          loadingInsights ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-40" />
                </Card>
              ))}
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* User Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={insights.user.avatar || undefined} />
                      <AvatarFallback className="text-2xl">{insights.user.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{insights.user.name}</h2>
                        {insights.user.isBanned && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" /> Banido
                          </Badge>
                        )}
                        {insights.user.role === "admin" && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">{insights.user.bio || "Sem bio"}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Membro há {insights.user.daysSinceRegistration} dias
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Nível {insights.user.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {insights.user.points} pontos
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getEngagementColor(insights.engagement.score)}`}>
                        {insights.engagement.score}
                      </div>
                      <p className="text-sm text-muted-foreground">Score de Engajamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="engagement">
                <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                  <TabsTrigger value="engagement">Engajamento</TabsTrigger>
                  <TabsTrigger value="interests">Interesses</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                  <TabsTrigger value="moderation">Moderação</TabsTrigger>
                </TabsList>

                {/* Engagement Tab */}
                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.posts}</div>
                        <p className="text-sm text-muted-foreground">Posts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.comments}</div>
                        <p className="text-sm text-muted-foreground">Comentários</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Heart className="w-8 h-8 mx-auto text-red-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.reactions}</div>
                        <p className="text-sm text-muted-foreground">Reações Dadas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Heart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.reactionsReceived}</div>
                        <p className="text-sm text-muted-foreground">Reações Recebidas</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <UserCheck className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.followers}</div>
                        <p className="text-sm text-muted-foreground">Seguidores</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Users className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.engagement.following}</div>
                        <p className="text-sm text-muted-foreground">Seguindo</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Badges Conquistados ({insights.badges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.badges.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum badge conquistado</p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {insights.badges.map((badge: any) => (
                            <div
                              key={badge.badgeId}
                              className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg"
                              title={badge.badgeDescription}
                            >
                              <span className="text-2xl">{badge.badgeIcon}</span>
                              <div>
                                <p className="font-medium text-sm">{badge.badgeName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Interests Tab */}
                <TabsContent value="interests" className="space-y-4">
                  {/* Category Interests */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Categorias de Interesse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.categoryInterests.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma categoria identificada</p>
                      ) : (
                        <div className="space-y-3">
                          {insights.categoryInterests.map((cat: any) => {
                            const total = insights.categoryInterests.reduce((sum: number, c: any) => sum + c.count, 0);
                            const percentage = total > 0 ? (cat.count / total) * 100 : 0;
                            return (
                              <div key={cat.category} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{categoryLabels[cat.category] || cat.category}</span>
                                  <span className="font-medium">{cat.count} comunidades ({percentage.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Communities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Comunidades ({insights.communities.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.communities.length === 0 ? (
                        <p className="text-muted-foreground">Não participa de nenhuma comunidade</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {insights.communities.map((comm: any) => (
                            <div
                              key={comm.communityId}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{comm.communityName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {categoryLabels[comm.category] || comm.category} • 
                                  Entrou {formatDistanceToNow(new Date(comm.joinedAt), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  {/* Activity by Hour */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Atividade por Horário (últimos 30 dias)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.activity.byHour.length === 0 ? (
                        <p className="text-muted-foreground">Sem dados de atividade</p>
                      ) : (
                        <div className="flex items-end gap-1 h-32">
                          {Array.from({ length: 24 }, (_, hour) => {
                            const data = insights.activity.byHour.find((h: any) => h.hour === hour);
                            const count = data?.count || 0;
                            const maxCount = Math.max(...insights.activity.byHour.map((h: any) => h.count), 1);
                            const height = (count / maxCount) * 100;
                            return (
                              <div
                                key={hour}
                                className="flex-1 bg-primary/70 rounded-t hover:bg-primary transition-colors cursor-pointer group relative"
                                style={{ height: `${Math.max(height, 2)}%` }}
                                title={`${hour}h: ${count} ações`}
                              >
                                {count > 0 && (
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {count}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>0h</span>
                        <span>6h</span>
                        <span>12h</span>
                        <span>18h</span>
                        <span>23h</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity by Day */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Atividade por Dia da Semana
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.activity.byDay.length === 0 ? (
                        <p className="text-muted-foreground">Sem dados de atividade</p>
                      ) : (
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 7 }, (_, i) => {
                            const dayIndex = i + 1; // MySQL DAYOFWEEK starts at 1 (Sunday)
                            const data = insights.activity.byDay.find((d: any) => d.dayOfWeek === dayIndex);
                            const count = data?.count || 0;
                            const maxCount = Math.max(...insights.activity.byDay.map((d: any) => d.count), 1);
                            const intensity = count / maxCount;
                            return (
                              <div key={i} className="text-center">
                                <div
                                  className="w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium"
                                  style={{
                                    backgroundColor: `rgba(234, 88, 12, ${Math.max(intensity * 0.8, 0.1)})`,
                                    color: intensity > 0.5 ? "white" : "inherit",
                                  }}
                                >
                                  {count}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{dayNames[i]}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Atividade Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.activity.recent.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma atividade recente</p>
                      ) : (
                        <div className="space-y-2">
                          {insights.activity.recent.map((act: any) => (
                            <div
                              key={act.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            >
                              <span className="text-sm">{act.action}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">+{act.points} pts</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Moderation Tab */}
                <TabsContent value="moderation" className="space-y-4">
                  {/* Moderation Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${insights.moderation.activeWarnings > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
                        <div className="text-2xl font-bold">{insights.moderation.activeWarnings}</div>
                        <p className="text-sm text-muted-foreground">Avisos Ativos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">{insights.moderation.warnings.length}</div>
                        <p className="text-sm text-muted-foreground">Total de Avisos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Shield className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">{insights.moderation.reportsMade}</div>
                        <p className="text-sm text-muted-foreground">Denúncias Feitas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <UserX className={`w-8 h-8 mx-auto mb-2 ${insights.moderation.reportsAgainst > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                        <div className="text-2xl font-bold">{insights.moderation.reportsAgainst}</div>
                        <p className="text-sm text-muted-foreground">Denúncias Recebidas</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ban Status */}
                  {insights.user.isBanned && (
                    <Card className="border-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                          <Ban className="w-5 h-5" />
                          Usuário Banido
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{insights.user.banReason || "Motivo não especificado"}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Warnings History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Histórico de Avisos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {insights.moderation.warnings.length === 0 ? (
                        <div className="text-center py-4">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-muted-foreground">Nenhum aviso registrado</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {insights.moderation.warnings.map((warning: any) => (
                            <div
                              key={warning.id}
                              className={`p-3 rounded-lg border ${warning.isActive ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : "border-muted"}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={warning.isActive ? "default" : "secondary"}>
                                      {warning.isActive ? "Ativo" : "Expirado"}
                                    </Badge>
                                    <Badge variant="outline">{warning.severity}</Badge>
                                  </div>
                                  <p className="mt-2 text-sm">{warning.reason}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Por: {warning.issuerName || `Admin #${warning.issuedBy}`} • 
                                    {formatDistanceToNow(new Date(warning.createdAt), { addSuffix: true, locale: ptBR })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Usuário não encontrado</p>
              </CardContent>
            </Card>
          )
        )}

        {!selectedUserId && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Selecione um usuário</h3>
              <p className="text-muted-foreground">Use a busca acima para encontrar e analisar um usuário</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
