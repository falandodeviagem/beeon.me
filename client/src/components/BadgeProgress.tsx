import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";

export interface BadgeProgressItem {
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  current: number;
  required: number;
  percentage: number;
  isUnlocked: boolean;
}

interface BadgeProgressProps {
  progress: BadgeProgressItem[];
}

export function BadgeProgress({ progress }: BadgeProgressProps) {
  // Filtrar apenas badges não desbloqueados e ordenar por proximidade
  const upcomingBadges = progress
    .filter((item) => !item.isUnlocked)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3); // Mostrar apenas os 3 mais próximos

  if (upcomingBadges.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Progresso de Badges</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Parabéns! 🎉</p>
          <p className="text-sm mt-1">Você desbloqueou todos os badges disponíveis!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Próximos Badges</h3>
        <Badge variant="secondary" className="ml-auto">
          {upcomingBadges.length} disponíveis
        </Badge>
      </div>

      <div className="space-y-4">
        {upcomingBadges.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{item.badgeIcon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{item.badgeName}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.percentage}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.badgeDescription}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={item.percentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {item.current} / {item.required}
                </span>
                <span className="font-medium">
                  {item.required - item.current} restantes
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {progress.filter((item) => !item.isUnlocked).length > 3 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          +{progress.filter((item) => !item.isUnlocked).length - 3} outros badges
          disponíveis
        </div>
      )}
    </Card>
  );
}
