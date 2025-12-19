import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  interval: "monthly" | "yearly" | "lifetime";
  price: number;
  originalPrice: number | null;
  features: string[];
  isDefault: boolean;
  trialDays: number;
}

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: number | null;
  onSelect: (planId: number) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PlanSelector({ plans, selectedPlanId, onSelect, onConfirm, isLoading }: PlanSelectorProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "/mês";
      case "yearly":
        return "/ano";
      case "lifetime":
        return " único";
      default:
        return "";
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

  const getDiscount = (plan: Plan) => {
    if (!plan.originalPrice || plan.originalPrice <= plan.price) return null;
    const discount = Math.round((1 - plan.price / plan.originalPrice) * 100);
    return discount;
  };

  const getBestValue = (): number | undefined => {
    // Find the plan with the best value (highest discount)
    let bestPlanId: number | undefined = undefined;
    let bestDiscount = 0;

    plans.forEach((plan) => {
      const discount = getDiscount(plan);
      if (discount && discount > bestDiscount) {
        bestDiscount = discount;
        bestPlanId = plan.id;
      }
    });

    return bestPlanId;
  };

  const bestValuePlanId = getBestValue();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Escolha seu plano</h3>
        <p className="text-muted-foreground mt-1">
          Selecione o plano que melhor se adapta às suas necessidades
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const discount = getDiscount(plan);
          const isBestValue = plan.id === bestValuePlanId;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-lg",
                isBestValue && "border-primary"
              )}
              onClick={() => onSelect(plan.id)}
            >
              {isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Melhor valor
                  </Badge>
                </div>
              )}

              {discount && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant="destructive" className="text-xs">
                    -{discount}%
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  {getIntervalIcon(plan.interval)}
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.trialDays > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {plan.trialDays} dias grátis
                  </Badge>
                )}
                {plan.description && (
                  <CardDescription className="text-xs mt-2">
                    {plan.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(plan.originalPrice)}
                    </p>
                  )}
                  <p className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {getIntervalLabel(plan.interval)}
                    </span>
                  </p>
                  {plan.interval === "yearly" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      equivale a {formatPrice(Math.round(plan.price / 12))}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(plan.id);
                  }}
                >
                  {isSelected ? "Selecionado" : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlanId && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? "Processando..." : "Continuar para pagamento"}
          </Button>
        </div>
      )}
    </div>
  );
}
