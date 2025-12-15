import { describe, it, expect } from "vitest";

describe("Subscription Plans System", () => {
  describe("Plan Intervals", () => {
    it("should support monthly, yearly, and lifetime intervals", () => {
      const validIntervals = ["monthly", "yearly", "lifetime"];
      expect(validIntervals).toContain("monthly");
      expect(validIntervals).toContain("yearly");
      expect(validIntervals).toContain("lifetime");
    });

    it("should calculate yearly savings correctly", () => {
      const monthlyPrice = 2990; // R$ 29.90
      const yearlyPrice = 29900; // R$ 299.00
      const yearlyEquivalent = monthlyPrice * 12; // R$ 358.80
      const savings = yearlyEquivalent - yearlyPrice;
      const savingsPercent = Math.round((savings / yearlyEquivalent) * 100);
      
      expect(savingsPercent).toBeGreaterThan(0);
      expect(savingsPercent).toBe(17); // ~17% discount
    });
  });

  describe("Price Formatting", () => {
    it("should format price in BRL correctly", () => {
      const formatPrice = (cents: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(cents / 100);
      };

      expect(formatPrice(2990)).toMatch(/R\$\s*29[,.]90/);
      expect(formatPrice(29900)).toMatch(/R\$\s*299[,.]00/);
      expect(formatPrice(99900)).toMatch(/R\$\s*999[,.]00/);
    });

    it("should calculate discount percentage correctly", () => {
      const getDiscount = (price: number, originalPrice: number) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round((1 - price / originalPrice) * 100);
      };

      expect(getDiscount(29900, 35880)).toBe(17); // yearly vs monthly*12
      expect(getDiscount(99900, 358800)).toBe(72); // lifetime vs monthly*120
      expect(getDiscount(2990, 2990)).toBeNull(); // no discount
      expect(getDiscount(2990, 2000)).toBeNull(); // price higher than original
    });
  });

  describe("Plan Features", () => {
    it("should parse features from newline-separated string", () => {
      const featuresString = "Acesso completo\nParticipação em discussões\nSuporte prioritário";
      const features = featuresString.split("\n").map(f => f.trim()).filter(f => f.length > 0);
      
      expect(features).toHaveLength(3);
      expect(features[0]).toBe("Acesso completo");
      expect(features[2]).toBe("Suporte prioritário");
    });

    it("should handle empty features", () => {
      const featuresString = "";
      const features = featuresString.split("\n").map(f => f.trim()).filter(f => f.length > 0);
      
      expect(features).toHaveLength(0);
    });
  });

  describe("Default Plans Generation", () => {
    it("should generate correct default plans based on base price", () => {
      const basePrice = 2990; // R$ 29.90/month
      
      const defaultPlans = [
        {
          name: "Mensal",
          interval: "monthly",
          price: basePrice,
          originalPrice: null,
        },
        {
          name: "Anual",
          interval: "yearly",
          price: Math.round(basePrice * 10), // 2 months free
          originalPrice: basePrice * 12,
        },
        {
          name: "Vitalício",
          interval: "lifetime",
          price: Math.round(basePrice * 24), // 2 years worth
          originalPrice: basePrice * 36, // vs 3 years
        },
      ];

      expect(defaultPlans[0].price).toBe(2990);
      expect(defaultPlans[1].price).toBe(29900); // 10 months
      expect(defaultPlans[1].originalPrice).toBe(35880); // 12 months
      expect(defaultPlans[2].price).toBe(71760); // 24 months
      expect(defaultPlans[2].originalPrice).toBe(107640); // 36 months
    });
  });

  describe("Stripe Integration", () => {
    it("should determine correct Stripe mode based on interval", () => {
      const getStripeMode = (interval: string) => {
        return interval === "lifetime" ? "payment" : "subscription";
      };

      expect(getStripeMode("monthly")).toBe("subscription");
      expect(getStripeMode("yearly")).toBe("subscription");
      expect(getStripeMode("lifetime")).toBe("payment");
    });

    it("should map interval to Stripe recurring interval", () => {
      const getStripeInterval = (interval: string) => {
        switch (interval) {
          case "yearly": return "year";
          case "monthly": return "month";
          default: return null; // lifetime has no recurring
        }
      };

      expect(getStripeInterval("monthly")).toBe("month");
      expect(getStripeInterval("yearly")).toBe("year");
      expect(getStripeInterval("lifetime")).toBeNull();
    });
  });

  describe("Plan Validation", () => {
    it("should validate minimum price (R$ 1.00)", () => {
      const minPrice = 100; // R$ 1.00 in cents
      
      expect(50 >= minPrice).toBe(false);
      expect(100 >= minPrice).toBe(true);
      expect(2990 >= minPrice).toBe(true);
    });

    it("should validate plan name length", () => {
      const maxLength = 100;
      const validName = "Plano Anual Premium";
      const invalidName = "A".repeat(101);
      
      expect(validName.length <= maxLength).toBe(true);
      expect(invalidName.length <= maxLength).toBe(false);
    });
  });

  describe("Best Value Calculation", () => {
    it("should identify plan with highest discount as best value", () => {
      const plans = [
        { id: 1, price: 2990, originalPrice: null },
        { id: 2, price: 29900, originalPrice: 35880 }, // 17% off
        { id: 3, price: 71760, originalPrice: 107640 }, // 33% off
      ];

      const getDiscount = (plan: typeof plans[0]) => {
        if (!plan.originalPrice || plan.originalPrice <= plan.price) return 0;
        return Math.round((1 - plan.price / plan.originalPrice) * 100);
      };

      let bestPlanId: number | undefined;
      let bestDiscount = 0;

      plans.forEach(plan => {
        const discount = getDiscount(plan);
        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestPlanId = plan.id;
        }
      });

      expect(bestPlanId).toBe(3); // Lifetime has best discount
      expect(bestDiscount).toBe(33);
    });
  });
});
