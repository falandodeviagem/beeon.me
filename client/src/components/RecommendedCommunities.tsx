import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Users, TrendingUp, Sparkles, ChevronDown, ChevronUp, Flame, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function RecommendedCommunities() {
  const [expanded, setExpanded] = useState(false);
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: recommendations, isLoading } = trpc.community.getRecommended.useQuery({
    limit: expanded ? 12 : 6,
  });

  const joinMutation = trpc.community.join.useMutation({
    onSuccess: (_, variables) => {
      setJoiningId(null);
      toast({
        title: "Sucesso!",
        description: "Você entrou na comunidade",
        variant: "success",
      });
      // Invalidate queries to update UI
      utils.community.getRecommended.invalidate();
      utils.community.getMyCommunities.invalidate();
    },
    onError: (error) => {
      setJoiningId(null);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar na comunidade",
        variant: "destructive",
      });
    },
  });

  const handleQuickJoin = (e: React.MouseEvent, communityId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setJoiningId(communityId);
    joinMutation.mutate({ communityId });
  };

  const handleCardClick = (communityId: number) => {
    setLocation(`/community/${communityId}`);
  };

  const isNew = (createdAt: Date | string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/communities")}
          >
            Ver todas
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Baseado nas suas interações e interesses
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.slice(0, expanded ? 12 : 6).map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div 
                className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md relative"
                onClick={() => handleCardClick(community.id)}
              >
                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {isNew(community.createdAt) && (
                    <Badge variant="default" className="text-xs gap-1 bg-green-500 hover:bg-green-600">
                      <Zap className="w-3 h-3" />
                      Novo
                    </Badge>
                  )}
                  {community.memberCount > 50 && (
                    <Badge variant="default" className="text-xs gap-1 bg-orange-500 hover:bg-orange-600">
                      <Flame className="w-3 h-3" />
                      Em Alta
                    </Badge>
                  )}
                </div>

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
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {community.name}
                      </h4>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                      </Badge>
                    </div>
                    
                    {community.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 mb-2">
                        {community.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
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

                      {/* Quick Join Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => handleQuickJoin(e, community.id)}
                        disabled={joiningId === community.id}
                      >
                        {joiningId === community.id ? "..." : "Entrar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {recommendations.length > 6 && (
          <Button
            variant="ghost"
            className="w-full mt-4 gap-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver mais ({recommendations.length - 6} comunidades)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
