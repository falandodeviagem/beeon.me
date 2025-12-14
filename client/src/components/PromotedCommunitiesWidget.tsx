import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PromotedCommunitiesWidgetProps {
  communityId: number;
}

export function PromotedCommunitiesWidget({ communityId }: PromotedCommunitiesWidgetProps) {
  const { data: promotedCommunities, isLoading } = trpc.community.getPromotedCommunities.useQuery({
    communityId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comunidades Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!promotedCommunities || promotedCommunities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comunidades Recomendadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {promotedCommunities.map((community) => (
            <Link key={community.id} href={`/community/${community.id}`}>
              <div className="group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-md">
                <div className="flex items-start gap-3">
                  {community.imageUrl ? (
                    <img
                      src={community.imageUrl}
                      alt={community.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {community.name}
                      </h4>
                      {community.isPaid && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Paga
                        </Badge>
                      )}
                    </div>
                    
                    {community.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {community.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{community.memberCount} membros</span>
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
