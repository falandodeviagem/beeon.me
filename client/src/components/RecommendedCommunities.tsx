import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Users, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendedCommunities() {
  const { data: recommendations, isLoading } = trpc.community.getRecommended.useQuery({
    limit: 6,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recomendadas para Você
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recomendadas para Você
          </CardTitle>
          <Link href="/communities">
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Baseado nas suas interações e interesses
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((community) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <div className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
                <div className="flex items-start gap-3">
                  {community.imageUrl ? (
                    <img
                      src={community.imageUrl}
                      alt={community.name}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/40">
                      <TrendingUp className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {community.name}
                      </h4>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                      </Badge>
                    </div>
                    
                    {community.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{community.memberCount} membros</span>
                      </div>
                      
                      {community.isPaid && (
                        <Badge variant="secondary" className="text-xs">
                          R$ {(community.price / 100).toFixed(2)}/mês
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
