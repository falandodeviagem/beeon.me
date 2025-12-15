import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Lock, DollarSign, ArrowRight, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Communities() {
  const { user, isAuthenticated } = useAuth();
  const { loading, update, toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"tecnologia" | "esportes" | "arte" | "musica" | "educacao" | "negocios" | "saude" | "entretenimento" | "jogos" | "outros">("outros");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("members");

  const { data: allCommunities, isLoading } = trpc.community.list.useQuery();
  
  // Apply filters and sorting
  const communities = allCommunities
    ? allCommunities
        .filter(c => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = c.name.toLowerCase().includes(query);
            const matchesDesc = c.description?.toLowerCase().includes(query);
            if (!matchesName && !matchesDesc) return false;
          }
          
          // Category filter
          if (filterCategory !== "all" && c.category !== filterCategory) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "members":
              return b.memberCount - a.memberCount;
            case "recent":
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "name":
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        })
    : [];
  const utils = trpc.useUtils();

  const createMutation = trpc.community.create.useMutation();

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da comunidade é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    const toastId = loading("Criando comunidade...");
    
    try {
      await createMutation.mutateAsync({
        name,
        description: description || undefined,
        isPaid,
        price: isPaid ? Math.round(parseFloat(price || "0") * 100) : 0,
        category,
      });
      
      update(toastId.id, {
        title: "Sucesso!",
        description: "Comunidade criada com sucesso",
        variant: "success",
      });
      
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setIsPaid(false);
      setPrice("");
      utils.community.list.invalidate();
    } catch (error: any) {
      update(toastId.id, {
        title: "Erro",
        description: error.message || "Erro ao criar comunidade",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comunidades</h1>
            <p className="text-muted-foreground">
              Explore e participe de comunidades incríveis
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Criar Comunidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Comunidade</DialogTitle>
                <DialogDescription>
                  Crie sua própria comunidade e comece a construir sua audiência
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Comunidade</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Desenvolvedores React"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva sobre o que é sua comunidade..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPaid">Comunidade Paga</Label>
                    <p className="text-sm text-muted-foreground">
                      Membros precisarão pagar para entrar
                    </p>
                  </div>
                  <Switch
                    id="isPaid"
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>

                {isPaid && (
                  <div>
                    <Label htmlFor="price">Preço Mensal (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9.90"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="esportes">Esportes</SelectItem>
                      <SelectItem value="arte">Arte</SelectItem>
                      <SelectItem value="musica">Música</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="negocios">Negócios</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="entretenimento">Entretenimento</SelectItem>
                      <SelectItem value="jogos">Jogos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? "Criando..." : "Criar Comunidade"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="esportes">Esportes</SelectItem>
                  <SelectItem value="arte">Arte</SelectItem>
                  <SelectItem value="musica">Música</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="negocios">Negócios</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="entretenimento">Entretenimento</SelectItem>
                  <SelectItem value="jogos">Jogos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Mais membros</SelectItem>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Results count */}
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-4">
                {communities.length} {communities.length === 1 ? 'comunidade encontrada' : 'comunidades encontradas'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Link key={community.id} href={`/community/${community.id}`}>
                <a>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1">{community.name}</CardTitle>
                        <div className="flex gap-1 flex-shrink-0">
                          {community.isPaid ? (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="w-3 h-3" />
                              Paga
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pública</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {community.category.charAt(0).toUpperCase() + community.category.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {community.description || "Sem descrição"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{community.memberCount} membros</span>
                        </div>
                        {community.isPaid && (
                          <div className="flex items-center gap-1 font-semibold text-primary">
                            <DollarSign className="w-4 h-4" />
                            <span>R$ {(community.price / 100).toFixed(2)}/mês</span>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        Ver Comunidade
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma comunidade encontrada</h3>
              <p className="text-muted-foreground text-center mb-6">
                Seja o primeiro a criar uma comunidade!
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                Criar Primeira Comunidade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
