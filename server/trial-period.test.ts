import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { appRouter } from './routers';

describe('Trial Period Feature', () => {
  let testUserId: number;
  let testCommunityId: number;

  beforeAll(async () => {
    // Create test user
    testUserId = await db.upsertUser({
      openId: 'trial-test-user',
      name: 'Trial Test User',
      email: 'trial@test.com',
    });

    // Create test community
    testCommunityId = await db.createCommunity({
      name: 'Trial Test Community',
      description: 'Test community for trial period',
      ownerId: testUserId,
      isPaid: true,
      price: 2990, // R$ 29.90
      category: 'tecnologia',
    });
  });

  it('should create subscription plan with trial days', async () => {
    const planId = await db.createSubscriptionPlan({
      communityId: testCommunityId,
      name: 'Plano com Trial',
      description: '7 dias grátis',
      interval: 'monthly',
      price: 2990,
      trialDays: 7,
    });

    expect(planId).toBeGreaterThan(0);

    const plan = await db.getSubscriptionPlanById(planId);
    expect(plan).toBeDefined();
    expect(plan?.trialDays).toBe(7);
  });

  it('should create default plans with trial on monthly plan', async () => {
    const success = await db.createDefaultPlans(testCommunityId, 2990);
    expect(success).toBe(true);

    const plans = await db.getCommunityPlans(testCommunityId);
    const monthlyPlan = plans.find(p => p.interval === 'monthly');
    
    expect(monthlyPlan).toBeDefined();
    expect(monthlyPlan?.trialDays).toBe(7);
  });

  it('should update plan with trial days', async () => {
    const planId = await db.createSubscriptionPlan({
      communityId: testCommunityId,
      name: 'Plano Sem Trial',
      interval: 'yearly',
      price: 29900,
      trialDays: 0,
    });

    const success = await db.updateSubscriptionPlan(planId, {
      trialDays: 14,
    });

    expect(success).toBe(true);

    const plan = await db.getSubscriptionPlanById(planId);
    expect(plan?.trialDays).toBe(14);
  });

  it('should pass trial days to Stripe checkout session', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: 'Test User', email: 'test@test.com', role: 'user' },
    });

    const planId = await db.createSubscriptionPlan({
      communityId: testCommunityId,
      name: 'Plano Trial 14 dias',
      interval: 'monthly',
      price: 4990,
      trialDays: 14,
    });

    // This will create checkout session with trial_period_days
    const result = await caller.community.createCheckout({
      communityId: testCommunityId,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      planId,
    });

    expect(result.checkoutUrl).toBeDefined();
    expect(result.checkoutUrl).toContain('checkout.stripe.com');
  });

  it('should validate trial days range (0-90)', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: 'Test User', email: 'test@test.com', role: 'user' },
    });

    // Should fail with trial days > 90
    await expect(
      caller.community.createPlan({
        communityId: testCommunityId,
        name: 'Invalid Trial',
        interval: 'monthly',
        price: 2990,
        trialDays: 100,
      })
    ).rejects.toThrow();

    // Should fail with negative trial days
    await expect(
      caller.community.createPlan({
        communityId: testCommunityId,
        name: 'Invalid Trial',
        interval: 'monthly',
        price: 2990,
        trialDays: -1,
      })
    ).rejects.toThrow();
  });
});
