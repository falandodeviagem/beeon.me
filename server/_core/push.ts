import webpush from 'web-push';

// VAPID keys for Web Push
// These should be stored in environment variables in production
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BAlEeFzAgfVmALm-Ry4vKLrEPK6UgrCuFXysGG6M-4RPTv3ITW8K3Csi9HGO2srMxhIGLGyJdPY3aabAMirfKZ4';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fwJgw3kiKJzUBaLpjIaTfhwvvUXv1N09qTyiNACUXYs';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@beeon.me';

// Configure web-push
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      url: payload.url || '/',
      tag: payload.tag || 'default',
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
    });

    await webpush.sendNotification(subscription, pushPayload);
    return true;
  } catch (error: any) {
    console.error('[Push] Error sending notification:', error);
    
    // Handle expired subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[Push] Subscription expired or invalid');
      return false;
    }
    
    throw error;
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushToMultiple(
  subscriptions: PushSubscriptionData[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; expired: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    expired: [] as string[],
  };

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        const success = await sendPushNotification(subscription, payload);
        if (success) {
          results.sent++;
        } else {
          results.expired.push(subscription.endpoint);
        }
      } catch (error) {
        results.failed++;
        console.error('[Push] Failed to send to:', subscription.endpoint, error);
      }
    })
  );

  return results;
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
