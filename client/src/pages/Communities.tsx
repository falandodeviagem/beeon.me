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
import { toast } from "sonner";
import { Plus, Users, Lock, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Communities() {
  const { user, isAuthenticated } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  const { data: communities, isLoading } = trpc.community.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.community.create.useMutation({
    onSuccess: () => {
      toast.success("Comunidade criada com sucesso!");
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setIsPaid(false);
      setPrice("");
      utils.community.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar comunidade");
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Nome da comunidade é obrigatório");
      return;
    }

    await createMutation.mutateAsync({
      name,
      description: description || undefined,
      isPaid,
      price: isPaid ? Math.round(parseFloat(price || "0") * 100) : 0,
    });
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
                        {community.isPaid ? (
                          <Badge variant="secondary" className="gap-1 flex-shrink-0">
                            <Lock className="w-3 h-3" />
                            Paga
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex-shrink-0">Pública</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
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
