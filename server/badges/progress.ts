import * as db from "../db";
import { BADGE_DEFINITIONS } from "./definitions";

export interface BadgeProgressItem {
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  current: number;
  required: number;
  percentage: number;
  isUnlocked: boolean;
}

/**
 * Calcula o progresso do usuário para todos os badges
 */
export async function calculateBadgeProgress(
  userId: number
): Promise<BadgeProgressItem[]> {
  const [userBadges, userStats, userPosts, userCommunities, allCommunities, followers, following] = await Promise.all([
    db.getUserBadges(userId),
    db.getUserStats(userId),
    db.getUserPosts(userId),
    db.getUserCommunities(userId),
    db.getAllCommunities(),
    db.getFollowers(userId),
    db.getFollowing(userId),
  ]);

  const unlockedBadgeNames = new Set(userBadges.map((ub) => ub.badge.name));

  const progress: BadgeProgressItem[] = [];

  // Badge: Primeira Postagem
  const firstPostBadge = BADGE_DEFINITIONS.FIRST_POST;
  progress.push({
    badgeName: firstPostBadge.name,
    badgeIcon: firstPostBadge.icon,
    badgeDescription: firstPostBadge.description,
    current: Math.min(userPosts.length, 1),
    required: 1,
    percentage: Math.min((userPosts.length / 1) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(firstPostBadge.name),
  });

  // Badge: Primeira Curtida
  const firstLikeBadge = BADGE_DEFINITIONS.FIRST_LIKE;
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likeCount, 0);
  progress.push({
    badgeName: firstLikeBadge.name,
    badgeIcon: firstLikeBadge.icon,
    badgeDescription: firstLikeBadge.description,
    current: Math.min(totalLikes, 1),
    required: 1,
    percentage: Math.min((totalLikes / 1) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(firstLikeBadge.name),
  });

  // Badge: 100 Curtidas
  const hundredLikesBadge = BADGE_DEFINITIONS.HUNDRED_LIKES;
  progress.push({
    badgeName: hundredLikesBadge.name,
    badgeIcon: hundredLikesBadge.icon,
    badgeDescription: hundredLikesBadge.description,
    current: Math.min(totalLikes, 100),
    required: 100,
    percentage: Math.min((totalLikes / 100) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(hundredLikesBadge.name),
  });

  // Badge: Influencer
  const influencerBadge = BADGE_DEFINITIONS.INFLUENCER;
  progress.push({
    badgeName: influencerBadge.name,
    badgeIcon: influencerBadge.icon,
    badgeDescription: influencerBadge.description,
    current: Math.min(totalLikes, 1000),
    required: 1000,
    percentage: Math.min((totalLikes / 1000) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(influencerBadge.name),
  });

  // Badge: Comentarista
  const commentatorBadge = BADGE_DEFINITIONS.COMMENTATOR;
  progress.push({
    badgeName: commentatorBadge.name,
    badgeIcon: commentatorBadge.icon,
    badgeDescription: commentatorBadge.description,
    current: Math.min(userStats.commentCount, 50),
    required: 50,
    percentage: Math.min((userStats.commentCount / 50) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(commentatorBadge.name),
  });

  // Badge: Criador de Comunidade
  const communityCreatorBadge = BADGE_DEFINITIONS.COMMUNITY_CREATOR;
  const ownedCommunities = allCommunities.filter((c) => c.ownerId === userId);
  progress.push({
    badgeName: communityCreatorBadge.name,
    badgeIcon: communityCreatorBadge.icon,
    badgeDescription: communityCreatorBadge.description,
    current: Math.min(ownedCommunities.length, 1),
    required: 1,
    percentage: Math.min((ownedCommunities.length / 1) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(communityCreatorBadge.name),
  });

  // Badge: Líder de Comunidade
  const communityLeaderBadge = BADGE_DEFINITIONS.COMMUNITY_LEADER;
  const largeCommunities = ownedCommunities.filter((c) => c.memberCount >= 50);
  progress.push({
    badgeName: communityLeaderBadge.name,
    badgeIcon: communityLeaderBadge.icon,
    badgeDescription: communityLeaderBadge.description,
    current: Math.min(largeCommunities.length, 1),
    required: 1,
    percentage: largeCommunities.length > 0 ? 100 : ownedCommunities.length > 0 ? Math.min((Math.max(...ownedCommunities.map(c => c.memberCount)) / 50) * 100, 99) : 0,
    isUnlocked: unlockedBadgeNames.has(communityLeaderBadge.name),
  });

  // Badge: Madrugador
  const earlyBirdBadge = BADGE_DEFINITIONS.EARLY_BIRD;
  const hasEarlyPost = userPosts.some((post) => {
    const hour = new Date(post.createdAt).getHours();
    return hour >= 5 && hour < 7;
  });
  progress.push({
    badgeName: earlyBirdBadge.name,
    badgeIcon: earlyBirdBadge.icon,
    badgeDescription: earlyBirdBadge.description,
    current: hasEarlyPost ? 1 : 0,
    required: 1,
    percentage: hasEarlyPost ? 100 : 0,
    isUnlocked: unlockedBadgeNames.has(earlyBirdBadge.name),
  });

  // Badge: Social
  const socialBadge = BADGE_DEFINITIONS.SOCIAL;
  progress.push({
    badgeName: socialBadge.name,
    badgeIcon: socialBadge.icon,
    badgeDescription: socialBadge.description,
    current: Math.min(following.length, 10),
    required: 10,
    percentage: Math.min((following.length / 10) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(socialBadge.name),
  });

  // Badge: Popular
  const popularBadge = BADGE_DEFINITIONS.POPULAR;
  progress.push({
    badgeName: popularBadge.name,
    badgeIcon: popularBadge.icon,
    badgeDescription: popularBadge.description,
    current: Math.min(followers.length, 100),
    required: 100,
    percentage: Math.min((followers.length / 100) * 100, 100),
    isUnlocked: unlockedBadgeNames.has(popularBadge.name),
  });

  return progress;
}
