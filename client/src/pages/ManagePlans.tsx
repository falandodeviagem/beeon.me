import { useAuth } from "@/_core/hooks/useAuth";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Zap,
  Sparkles,
  Crown,
  Check,
  X,
} from "lucide-react";

export default function ManagePlans() {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/community/:id/plans");
  const communityId = params?.id ? parseInt(params.id) : 0;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    interval: "monthly" as "monthly" | "yearly" | "lifetime",
    price: "",
    originalPrice: "",
    features: "",
    isDefault: false,
  });

  const { data: community, isLoading: communityLoading } = trpc.community.getById.useQuery(
    { id: communityId },
    { enabled: communityId > 0 }
  );

  const { data: plans, isLoading: plansLoading, refetch } = trpc.community.getAllPlans.useQuery(
    { communityId },
    { enabled: communityId > 0 && isAuthenticated }
  );

  const utils = trpc.useUtils();

  const createPlanMutation = trpc.community.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar plano");
    },
  });

  const updatePlanMutation = trpc.community.updatePlan.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      setEditingPlan(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar plano");
    },
  });

  const deletePlanMutation = trpc.community.deletePlan.useMutation({
    onSuccess: () => {
      toast.success("Plano excluído com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir plano");
    },
  });

  const createDefaultPlansMutation = trpc.community.createDefaultPlans.useMutation({
    onSuccess: () => {
      toast.success("Planos padrão criados com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar planos padrão");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      interval: "monthly",
      price: "",
      originalPrice: "",
      features: "",
      isDefault: false,
    });
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      interval: plan.interval,
      price: (plan.price / 100).toFixed(2),
      originalPrice: plan.originalPrice ? (plan.originalPrice / 100).toFixed(2) : "",
      features: plan.features?.join("\n") || "",
      isDefault: plan.isDefault,
    });
  };

  const handleSubmit = () => {
    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    const originalPriceInCents = formData.originalPrice
      ? Math.round(parseFloat(formData.originalPrice) * 100)
      : undefined;
    const featuresArray = formData.features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingPlan) {
      updatePlanMutation.mutate({
        planId: editingPlan.id,
        name: formData.name,
        description: formData.description || undefined,
        price: priceInCents,
        originalPrice: originalPriceInCents,
        features: featuresArray,
        isDefault: formData.isDefault,
      });
    } else {
      createPlanMutation.mutate({
        communityId,
        name: formData.name,
        description: formData.description || undefined,
        interval: formData.interval,
        price: priceInCents,
        originalPrice: originalPriceInCents,
        features: featuresArray,
        isDefault: formData.isDefault,
      });
    }
  };

  const handleToggleActive = (plan: any) => {
    updatePlanMutation.mutate({
      planId: plan.id,
      isActive: !plan.isActive,
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "Mensal";
      case "yearly":
        return "Anual";
      case "lifetime":
        return "Vitalício";
      default:
        return interval;
    }
  };

  const getIntervalIcon = (interval: string) => {
    switch (interval) {
      case "monthly":
        return <Zap className="w-5 h-5" />;
      case "yearly":
        return <Sparkles className="w-5 h-5" />;
      case "lifetime":
        return <Crown className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Faça login para gerenciar planos</p>
        </div>
      </MainLayout>
    );
  }

  if (communityLoading || plansLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!community || community.ownerId !== user?.id) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Você não tem permissão para gerenciar esta comunidade</p>
        </div>
      </MainLayout>
    );
  }

  if (!community.isPaid) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Esta comunidade não é paga</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/community/${communityId}`}>
              <a>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </a>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Planos</h1>
              <p className="text-muted-foreground">{community.name}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {(!plans || plans.length === 0) && (
              <Button
                variant="outline"
                onClick={() => createDefaultPlansMutation.mutate({ communityId })}
                disabled={createDefaultPlansMutation.isPending}
              >
                {createDefaultPlansMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Criar Planos Padrão
              </Button>
            )}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingPlan(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Plano</DialogTitle>
                  <DialogDescription>
                    Configure os detalhes do novo plano de assinatura
                  </DialogDescription>
                </DialogHeader>
                <PlanForm
                  formData={formData}
                  setFormData={setFormData}
                  isEditing={false}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createPlanMutation.isPending || !formData.name || !formData.price}
                  >
                    {createPlanMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Criar Plano
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Plans List */}
        {plans && plans.length > 0 ? (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {getIntervalIcon(plan.interval)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <Badge variant="secondary">{getIntervalLabel(plan.interval)}</Badge>
                          {plan.isDefault && <Badge>Padrão</Badge>}
                          {!plan.isActive && <Badge variant="destructive">Inativo</Badge>}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        )}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                          {plan.originalPrice && plan.originalPrice > plan.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(plan.originalPrice)}
                            </span>
                          )}
                        </div>
                        {plan.features && plan.features.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {plan.features.slice(0, 3).map((feature: string, index: number) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-sm text-muted-foreground">
                                +{plan.features.length - 3} mais...
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor={`active-${plan.id}`} className="text-sm">
                          Ativo
                        </Label>
                        <Switch
                          id={`active-${plan.id}`}
                          checked={plan.isActive}
                          onCheckedChange={() => handleToggleActive(plan)}
                        />
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleEditPlan(plan)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Plano</DialogTitle>
                            <DialogDescription>
                              Atualize os detalhes do plano de assinatura
                            </DialogDescription>
                          </DialogHeader>
                          <PlanForm
                            formData={formData}
                            setFormData={setFormData}
                            isEditing={true}
                          />
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingPlan(null)}>
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleSubmit}
                              disabled={updatePlanMutation.isPending}
                            >
                              {updatePlanMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              )}
                              Salvar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este plano?")) {
                            deletePlanMutation.mutate({ planId: plan.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum plano criado</h3>
              <p className="text-muted-foreground mb-4">
                Crie planos de assinatura para oferecer diferentes opções aos seus membros
              </p>
              <Button
                onClick={() => createDefaultPlansMutation.mutate({ communityId })}
                disabled={createDefaultPlansMutation.isPending}
              >
                {createDefaultPlansMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Criar Planos Padrão
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

function PlanForm({
  formData,
  setFormData,
  isEditing,
}: {
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Plano</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Mensal, Anual, Vitalício"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interval">Intervalo</Label>
          <Select
            value={formData.interval}
            onValueChange={(value) => setFormData({ ...formData, interval: value })}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
              <SelectItem value="lifetime">Vitalício</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Breve descrição do plano"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="1"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="29.90"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Preço Original (R$)</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            placeholder="Para mostrar desconto"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Recursos (um por linha)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Acesso completo ao conteúdo&#10;Participação em discussões&#10;Suporte da comunidade"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
        />
        <Label htmlFor="isDefault">Plano padrão (pré-selecionado)</Label>
      </div>
    </div>
  );
}
