import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Clock, Users, Flag, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";

export default function ModerationAnalytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>("30");

  const { data: analytics, isLoading } = trpc.moderation.getAnalytics.useQuery({
    days: parseInt(period),
  });

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

  const typeLabels: Record<string, string> = {
    post: "Posts",
    comment: "Comentários",
    user: "Usuários",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendentes",
    reviewed: "Revisadas",
    resolved: "Resolvidas",
    dismissed: "Descartadas",
  };

  const actionLabels: Record<string, string> = {
    remove_post: "Remover Post",
    remove_comment: "Remover Comentário",
    ban_user: "Banir Usuário",
    unban_user: "Desbanir Usuário",
    resolve_report: "Resolver Denúncia",
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics de Moderação
            </h1>
            <p className="text-muted-foreground">Métricas e tendências de moderação</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics ? (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Denúncias
                  </CardTitle>
                  <Flag className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalReports}</div>
                  <p className="text-xs text-muted-foreground">nos últimos {period} dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pendentes
                  </CardTitle>
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.pendingReports}</div>
                  <p className="text-xs text-muted-foreground">aguardando revisão</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ações Tomadas
                  </CardTitle>
                  <Shield className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalActions}</div>
                  <p className="text-xs text-muted-foreground">nos últimos {period} dias</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tempo Médio
                  </CardTitle>
                  <Clock className="w-5 h-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {analytics.avgResolutionHours ? `${Math.round(analytics.avgResolutionHours)}h` : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">para resolver</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Reports Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Denúncias ao Longo do Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.reportsPerDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Nenhuma denúncia no período</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-end gap-1 h-40">
                        {analytics.reportsPerDay.map((day: any) => {
                          const maxCount = Math.max(...analytics.reportsPerDay.map((d: any) => d.count));
                          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                          return (
                            <div
                              key={day.date}
                              className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-pointer group relative"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${day.date}: ${day.count}`}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {day.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{analytics.reportsPerDay[0]?.date}</span>
                        <span>{analytics.reportsPerDay[analytics.reportsPerDay.length - 1]?.date}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Ações de Moderação ao Longo do Tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.actionsPerDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Nenhuma ação no período</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-end gap-1 h-40">
                        {analytics.actionsPerDay.map((day: any) => {
                          const maxCount = Math.max(...analytics.actionsPerDay.map((d: any) => d.count));
                          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                          return (
                            <div
                              key={day.date}
                              className="flex-1 bg-green-500/80 rounded-t hover:bg-green-500 transition-colors cursor-pointer group relative"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${day.date}: ${day.count}`}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {day.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{analytics.actionsPerDay[0]?.date}</span>
                        <span>{analytics.actionsPerDay[analytics.actionsPerDay.length - 1]?.date}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Breakdown Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Reports by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Tipo de Conteúdo</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.reportsByType.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma denúncia</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.reportsByType.map((item: any) => {
                        const percentage = analytics.totalReports > 0 ? (item.count / analytics.totalReports) * 100 : 0;
                        return (
                          <div key={item.type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{typeLabels[item.type] || item.type}</span>
                              <span className="font-medium">{item.count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
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

              {/* Reports by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.reportsByStatus.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma denúncia</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.reportsByStatus.map((item: any) => {
                        const percentage = analytics.totalReports > 0 ? (item.count / analytics.totalReports) * 100 : 0;
                        const colors: Record<string, string> = {
                          pending: "bg-yellow-500",
                          reviewed: "bg-blue-500",
                          resolved: "bg-green-500",
                          dismissed: "bg-gray-500",
                        };
                        return (
                          <div key={item.status} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{statusLabels[item.status] || item.status}</span>
                              <span className="font-medium">{item.count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colors[item.status] || "bg-primary"} rounded-full transition-all`}
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

              {/* Actions by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.actionsByType.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma ação</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.actionsByType.map((item: any) => {
                        const percentage = analytics.totalActions > 0 ? (item.count / analytics.totalActions) * 100 : 0;
                        return (
                          <div key={item.action} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{actionLabels[item.action] || item.action}</span>
                              <span className="font-medium">{item.count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
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
            </div>

            {/* Top Moderators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Moderadores
                </CardTitle>
                <CardDescription>Ranking de ações de moderação no período</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topModerators.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Nenhuma ação de moderação no período</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analytics.topModerators.map((mod: any, index: number) => (
                      <div
                        key={mod.moderatorId}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? "bg-yellow-500" :
                          index === 1 ? "bg-gray-400" :
                          index === 2 ? "bg-amber-600" :
                          "bg-primary/50"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{mod.moderatorName || `Mod #${mod.moderatorId}`}</p>
                          <p className="text-sm text-muted-foreground">{mod.count} ações</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}
