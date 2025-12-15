import express, { Express, Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../stripe";
import { ENV } from "./env";
import * as db from "../db";

/**
 * Register Stripe webhook routes
 */
export function registerStripeWebhookRoutes(app: Express) {
  // Stripe webhook endpoint - needs raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    // Use raw body parser for webhook signature verification
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        console.error("[Stripe Webhook] Missing stripe-signature header");
        return res.status(400).send("Missing stripe-signature header");
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret
        );
      } catch (err: any) {
        console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log(`[Stripe Webhook] Received event: ${event.type}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeleted(subscription);
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaid(invoice);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaymentFailed(invoice);
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error(`[Stripe Webhook] Error processing event: ${error.message}`);
        res.status(500).send(`Webhook processing error: ${error.message}`);
      }
    }
  );
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.userId || "0");
  const communityId = parseInt(session.metadata?.communityId || "0");

  if (!userId || !communityId) {
    console.error("[Stripe Webhook] Missing userId or communityId in session metadata");
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for user ${userId}, community ${communityId}`);

  // Add user as member of the community
  await db.addCommunityMember({ communityId, userId });
  await db.incrementCommunityMembers(communityId);

  // Create payment record
  await db.createPayment({
    userId,
    communityId,
    amount: session.amount_total || 0,
    currency: session.currency?.toUpperCase() || "BRL",
    status: "completed",
    stripeSessionId: session.id,
    stripeSubscriptionId: session.subscription as string || null,
  });

  // Create notification for user
  await db.createNotification({
    userId,
    type: "system",
    title: "Assinatura confirmada!",
    message: "Seu pagamento foi processado com sucesso. Você agora tem acesso à comunidade.",
    relatedType: "community",
    relatedId: communityId,
  });

  console.log(`[Stripe Webhook] User ${userId} added to community ${communityId}`);
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = parseInt(subscription.metadata?.userId || "0");
  const communityId = parseInt(subscription.metadata?.communityId || "0");

  if (!userId || !communityId) {
    console.error("[Stripe Webhook] Missing userId or communityId in subscription metadata");
    return;
  }

  console.log(`[Stripe Webhook] Subscription deleted for user ${userId}, community ${communityId}`);

  // Remove user from community
  await db.removeCommunityMember(communityId, userId);
  await db.decrementCommunityMembers(communityId);

  // Create notification for user
  await db.createNotification({
    userId,
    type: "system",
    title: "Assinatura cancelada",
    message: "Sua assinatura foi cancelada. Você não tem mais acesso à comunidade paga.",
    relatedType: "community",
    relatedId: communityId,
  });

  console.log(`[Stripe Webhook] User ${userId} removed from community ${communityId}`);
}

/**
 * Handle successful invoice payment (recurring)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  // Get subscription to find metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = parseInt(subscription.metadata?.userId || "0");
  const communityId = parseInt(subscription.metadata?.communityId || "0");

  if (!userId || !communityId) return;

  // Create payment record for recurring payment
  await db.createPayment({
    userId,
    communityId,
    amount: invoice.amount_paid || 0,
    currency: invoice.currency?.toUpperCase() || "BRL",
    status: "completed",
    stripeSubscriptionId: subscriptionId,
    stripeInvoiceId: invoice.id,
    stripeInvoiceUrl: invoice.hosted_invoice_url || null,
    periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
    periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
  });

  console.log(`[Stripe Webhook] Invoice paid for user ${userId}, community ${communityId}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) return;

  // Get subscription to find metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = parseInt(subscription.metadata?.userId || "0");
  const communityId = parseInt(subscription.metadata?.communityId || "0");

  if (!userId || !communityId) return;

  // Create failed payment record
  await db.createPayment({
    userId,
    communityId,
    amount: invoice.amount_due || 0,
    currency: invoice.currency?.toUpperCase() || "BRL",
    status: "failed",
    stripeSubscriptionId: subscriptionId,
    stripeInvoiceId: invoice.id,
  });

  // Notify user
  await db.createNotification({
    userId,
    type: "system",
    title: "Falha no pagamento",
    message: "Não foi possível processar seu pagamento. Por favor, atualize seus dados de pagamento.",
    relatedType: "community",
    relatedId: communityId,
  });

  console.log(`[Stripe Webhook] Invoice payment failed for user ${userId}, community ${communityId}`);
}
