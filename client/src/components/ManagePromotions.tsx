import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Plus, Search, Users, DollarSign } from "lucide-react";


interface ManagePromotionsProps {
  communityId: number;
}

export function ManagePromotions({ communityId }: ManagePromotionsProps) {

  const [searchQuery, setSearchQuery] = useState("");
  const utils = trpc.useUtils();

  const { data: promotedIds = [] } = trpc.community.getPromotedIds.useQuery({ communityId });
  const { data: promotedCommunities = [] } = trpc.community.getPromotedCommunities.useQuery({ communityId });
  const { data: allCommunities = [] } = trpc.community.list.useQuery();

  const addPromotion = trpc.community.addPromotion.useMutation({
    onSuccess: () => {
      utils.community.getPromotedIds.invalidate({ communityId });
      utils.community.getPromotedCommunities.invalidate({ communityId });
      // Success handled by invalidation
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const removePromotion = trpc.community.removePromotion.useMutation({
    onSuccess: () => {
      utils.community.getPromotedIds.invalidate({ communityId });
      utils.community.getPromotedCommunities.invalidate({ communityId });
      // Success handled by invalidation
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const availableCommunities = allCommunities.filter(
    (c) => c.id !== communityId && !promotedIds.includes(c.id)
  );

  const filteredCommunities = searchQuery
    ? availableCommunities.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableCommunities;

  const handleAdd = (promotedCommunityId: number) => {
    if (promotedIds.length >= 6) {
      alert("Limite atingido: você só pode promover até 6 comunidades.");
      return;
    }
    addPromotion.mutate({ communityId, promotedCommunityId });
  };

  const handleRemove = (promotedCommunityId: number) => {
    removePromotion.mutate({ communityId, promotedCommunityId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comunidades Promovidas ({promotedIds.length}/6)</CardTitle>
          <CardDescription>
            Selecione até 6 comunidades para exibir como recomendações na sidebar da sua comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promotedCommunities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma comunidade promovida ainda. Adicione comunidades abaixo.
            </p>
          ) : (
            <div className="space-y-2">
              {promotedCommunities.map((community) => (
                <div
                  key={community.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    {community.imageUrl ? (
                      <img
                        src={community.imageUrl}
                        alt={community.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{community.name}</h4>
                        {community.isPaid && (
                          <Badge variant="secondary" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Paga
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {community.memberCount} membros
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(community.id)}
                    disabled={removePromotion.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {promotedIds.length < 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Comunidades</CardTitle>
            <CardDescription>
              Busque e adicione comunidades para promover
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-96 space-y-2 overflow-y-auto">
                {filteredCommunities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma comunidade encontrada
                  </p>
                ) : (
                  filteredCommunities.slice(0, 20).map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        {community.imageUrl ? (
                          <img
                            src={community.imageUrl}
                            alt={community.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{community.name}</h4>
                            {community.isPaid && (
                              <Badge variant="secondary" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Paga
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {community.memberCount} membros
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdd(community.id)}
                        disabled={addPromotion.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
