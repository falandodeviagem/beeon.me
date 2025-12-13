/**
 * Stripe products configuration
 * This file centralizes product and price definitions for the platform
 */

export const STRIPE_PRODUCTS = {
  // Community subscription products will be created dynamically
  // when community owners create paid communities
} as const;

/**
 * Helper to create a Stripe product and price for a paid community
 */
export interface CommunityProductConfig {
  name: string;
  description: string;
  price: number; // in cents
}
