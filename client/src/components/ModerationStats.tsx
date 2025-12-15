import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle, Clock, Flag, Users, XCircle } from "lucide-react";

export function ModerationStats() {
  const { data: stats, isLoading } = trpc.moderation.getStats.useQuery();

  if (isLoading) {
    return (
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
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total de Denúncias",
      value: stats.total,
      icon: Flag,
      color: "text-blue-500",
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
    {
      title: "Resolvidas",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Rejeitadas",
      value: stats.dismissed,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reports by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Denúncias por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byType.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma denúncia registrada</p>
            ) : (
              <div className="space-y-3">
                {stats.byType.map((item) => {
                  const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  const typeLabels: Record<string, string> = {
                    post: "Posts",
                    comment: "Comentários",
                    user: "Usuários",
                  };
                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{typeLabels[item.type] || item.type}</span>
                        <span className="font-medium">{item.count}</span>
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

        {/* Average Resolution Time & Top Moderators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas de Desempenho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avg Resolution Time */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio de Resolução</p>
                <p className="text-2xl font-bold">
                  {stats.avgResolutionHours ? `${Math.round(stats.avgResolutionHours)}h` : "N/A"}
                </p>
              </div>
            </div>

            {/* Top Moderators */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Top Moderadores</span>
              </div>
              {stats.topModerators.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum moderador ativo</p>
              ) : (
                <div className="space-y-2">
                  {stats.topModerators.slice(0, 5).map((mod, index) => (
                    <div
                      key={mod.moderatorId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span>{mod.moderatorName || `Mod #${mod.moderatorId}`}</span>
                      </div>
                      <span className="font-medium">{mod.count} ações</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports per Day Chart (Simple) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Denúncias nos Últimos 30 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.perDay.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma denúncia no período</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.perDay.map((day) => {
                const maxCount = Math.max(...stats.perDay.map((d) => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-pointer group relative"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.count} denúncias`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
