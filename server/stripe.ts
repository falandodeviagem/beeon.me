import Stripe from "stripe";
import { ENV } from "./_core/env";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Create a Stripe checkout session for a paid community subscription
 */
export async function createCommunityCheckoutSession(params: {
  communityId: number;
  communityName: string;
  price: number; // in cents
  userId: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `Assinatura: ${params.communityName}`,
            description: `Acesso mensal à comunidade ${params.communityName}`,
          },
          recurring: {
            interval: "month",
          },
          unit_amount: params.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      communityId: params.communityId.toString(),
      userId: params.userId.toString(),
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify if a user has an active subscription for a community
 */
export async function hasActiveSubscription(
  userId: number,
  communityId: number
): Promise<boolean> {
  // Query subscriptions with metadata matching userId and communityId
  const subscriptions = await stripe.subscriptions.list({
    limit: 100,
  });

  const activeSubscription = subscriptions.data.find(
    (sub: Stripe.Subscription) =>
      sub.status === "active" &&
      sub.metadata.userId === userId.toString() &&
      sub.metadata.communityId === communityId.toString()
  );

  return !!activeSubscription;
}

/**
 * Cancel a community subscription
 */
export async function cancelCommunitySubscription(
  userId: number,
  communityId: number
): Promise<void> {
  const subscriptions = await stripe.subscriptions.list({
    limit: 100,
  });

  const subscription = subscriptions.data.find(
    (sub: Stripe.Subscription) =>
      sub.metadata.userId === userId.toString() &&
      sub.metadata.communityId === communityId.toString()
  );

  if (subscription) {
    await stripe.subscriptions.cancel(subscription.id);
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  event: Stripe.Event,
  onSubscriptionCreated: (userId: number, communityId: number) => Promise<void>,
  onSubscriptionCanceled: (userId: number, communityId: number) => Promise<void>
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId || "0");
      const communityId = parseInt(session.metadata?.communityId || "0");

      if (userId && communityId) {
        await onSubscriptionCreated(userId, communityId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata?.userId || "0");
      const communityId = parseInt(subscription.metadata?.communityId || "0");

      if (userId && communityId) {
        await onSubscriptionCanceled(userId, communityId);
      }
      break;
    }
  }
}
