import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface BadgeItem {
  badge: {
    id: number;
    name: string;
    description: string | null;
    iconUrl: string | null;
  };
  earnedAt: Date;
}

interface BadgeGridProps {
  badges: BadgeItem[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum badge conquistado ainda</p>
            <p className="text-sm">Continue interagindo para desbloquear badges!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((item) => (
            <div
              key={item.badge.id}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {item.badge.iconUrl || "🏆"}
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{item.badge.name}</p>
                {item.badge.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.badge.description}
                  </p>
                )}
                <Badge variant="secondary" className="mt-2 text-xs">
                  {new Date(item.earnedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
