import * as db from '../db';
import { sendPushNotification, PushNotificationPayload as PushPayload } from './push';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to a user if they have enabled it
 */
export async function sendPushToUser(
  userId: number,
  payload: PushNotificationPayload,
  notificationType: 'comments' | 'likes' | 'follows' | 'messages' | 'badges' | 'community'
) {
  try {
    // Get user's notification preferences
    const preferences = await db.getNotificationPreferences(userId);
    
    if (!preferences || !preferences.pushEnabled) {
      return { sent: false, reason: 'Push notifications disabled' };
    }

    // Check if user has enabled this specific notification type
    const typeEnabled = {
      comments: preferences.pushComments,
      likes: preferences.pushLikes,
      follows: preferences.pushFollows,
      messages: preferences.pushMessages,
      badges: preferences.pushBadges,
      community: preferences.pushCommunity,
    }[notificationType];

    if (!typeEnabled) {
      return { sent: false, reason: `Push notifications for ${notificationType} disabled` };
    }

    // Get user's push subscriptions
    const subscriptions = await db.getUserPushSubscriptions(userId);
    
    if (subscriptions.length === 0) {
      return { sent: false, reason: 'No push subscriptions found' };
    }

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await sendPushNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            {
              title: payload.title,
              body: payload.body,
              icon: payload.icon || '/icon-192.png',
              badge: payload.badge || '/icon-192.png',
              ...payload.data,
            }
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error(`[Push] Failed to send to ${subscription.endpoint}:`, error.message);
          
          // If subscription is invalid, delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.deletePushSubscription(subscription.endpoint);
          }
          
          throw error;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      sent: true,
      successful,
      failed,
      total: subscriptions.length,
    };
  } catch (error) {
    console.error('[Push] Error sending push notification:', error);
    return { sent: false, reason: 'Internal error' };
  }
}

/**
 * Send push notification when someone comments on a post
 */
export async function notifyPostComment(
  postAuthorId: number,
  commenterName: string,
  postContent: string,
  postId: number
) {
  return sendPushToUser(
    postAuthorId,
    {
      title: `${commenterName} comentou no seu post`,
      body: postContent.slice(0, 100) + (postContent.length > 100 ? '...' : ''),
      data: {
        type: 'comment',
        postId,
        url: `/feed?postId=${postId}`,
      },
    },
    'comments'
  );
}

/**
 * Send push notification when someone likes a post
 */
export async function notifyPostLike(
  postAuthorId: number,
  likerName: string,
  postContent: string,
  postId: number
) {
  return sendPushToUser(
    postAuthorId,
    {
      title: `${likerName} curtiu seu post`,
      body: postContent.slice(0, 100) + (postContent.length > 100 ? '...' : ''),
      data: {
        type: 'like',
        postId,
        url: `/feed?postId=${postId}`,
      },
    },
    'likes'
  );
}

/**
 * Send push notification when someone follows a user
 */
export async function notifyNewFollower(
  followedUserId: number,
  followerName: string,
  followerId: number
) {
  return sendPushToUser(
    followedUserId,
    {
      title: 'Novo seguidor!',
      body: `${followerName} começou a seguir você`,
      data: {
        type: 'follow',
        userId: followerId,
        url: `/user/${followerId}`,
      },
    },
    'follows'
  );
}

/**
 * Send push notification when user earns a badge
 */
export async function notifyBadgeEarned(
  userId: number,
  badgeName: string,
  badgeDescription: string
) {
  return sendPushToUser(
    userId,
    {
      title: `🏆 Novo badge conquistado!`,
      body: `Você ganhou o badge "${badgeName}": ${badgeDescription}`,
      data: {
        type: 'badge',
        badgeName,
        url: '/profile',
      },
    },
    'badges'
  );
}

/**
 * Send push notification for community updates
 */
export async function notifyCommunityUpdate(
  userId: number,
  communityName: string,
  updateMessage: string,
  communityId: number
) {
  return sendPushToUser(
    userId,
    {
      title: `Atualização: ${communityName}`,
      body: updateMessage,
      data: {
        type: 'community',
        communityId,
        url: `/community/${communityId}`,
      },
    },
    'community'
  );
}
