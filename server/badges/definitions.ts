import * as db from "../db";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  checkCondition: (userId: number) => Promise<boolean>;
  event?: string; // Evento que pode desbloquear este badge
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  FIRST_POST: {
    id: "first_post",
    name: "Primeira Postagem",
    description: "Criou seu primeiro post",
    icon: "📝",
    event: "post_created",
    checkCondition: async (userId: number) => {
      const posts = await db.getUserPosts(userId);
      return posts.length >= 1;
    },
  },
  
  FIRST_LIKE: {
    id: "first_like",
    name: "Primeira Curtida",
    description: "Recebeu sua primeira curtida",
    icon: "❤️",
    event: "like_received",
    checkCondition: async (userId: number) => {
      const totalLikes = await db.getUserTotalLikes(userId);
      return totalLikes >= 1;
    },
  },
  
  HUNDRED_LIKES: {
    id: "hundred_likes",
    name: "100 Curtidas",
    description: "Recebeu 100 curtidas em seus posts",
    icon: "💯",
    event: "like_received",
    checkCondition: async (userId: number) => {
      const totalLikes = await db.getUserTotalLikes(userId);
      return totalLikes >= 100;
    },
  },
  
  INFLUENCER: {
    id: "influencer",
    name: "Influencer",
    description: "Recebeu 1000 curtidas totais",
    icon: "⭐",
    event: "like_received",
    checkCondition: async (userId: number) => {
      const totalLikes = await db.getUserTotalLikes(userId);
      return totalLikes >= 1000;
    },
  },
  
  COMMENTATOR: {
    id: "commentator",
    name: "Comentarista",
    description: "Fez 50 comentários",
    icon: "💬",
    event: "comment_created",
    checkCondition: async (userId: number) => {
      const comments = await db.getUserComments(userId);
      return comments.length >= 50;
    },
  },
  
  COMMUNITY_CREATOR: {
    id: "community_creator",
    name: "Criador de Comunidade",
    description: "Criou sua primeira comunidade",
    icon: "🏘️",
    event: "community_created",
    checkCondition: async (userId: number) => {
      const communities = await db.getUserCommunities(userId);
      // Verificar se é criador de alguma comunidade
      return communities.some(c => c.creatorId === userId);
    },
  },
  
  COMMUNITY_LEADER: {
    id: "community_leader",
    name: "Líder Comunitário",
    description: "Sua comunidade atingiu 100 membros",
    icon: "👑",
    event: "community_member_joined",
    checkCondition: async (userId: number) => {
      const communities = await db.getUserCommunities(userId);
      // Verificar comunidades criadas pelo usuário
      const ownedCommunities = communities.filter(c => c.creatorId === userId);
      for (const community of ownedCommunities) {
        if (community.memberCount >= 100) {
          return true;
        }
      }
      return false;
    },
  },
  
  SOCIAL: {
    id: "social",
    name: "Social",
    description: "Seguiu 50 usuários",
    icon: "🤝",
    event: "user_followed",
    checkCondition: async (userId: number) => {
      const following = await db.getFollowing(userId);
      return following.length >= 50;
    },
  },
  
  POPULAR: {
    id: "popular",
    name: "Popular",
    description: "Tem 100 seguidores",
    icon: "🌟",
    event: "user_followed",
    checkCondition: async (userId: number) => {
      const followers = await db.getFollowers(userId);
      return followers.length >= 100;
    },
  },
  
  EARLY_BIRD: {
    id: "early_bird",
    name: "Madrugador",
    description: "Fez um post entre 5h e 7h da manhã",
    icon: "🌅",
    event: "post_created",
    checkCondition: async (userId: number) => {
      const posts = await db.getUserPosts(userId);
      return posts.some((post) => {
        const hour = new Date(post.createdAt).getHours();
        return hour >= 5 && hour < 7;
      });
    },
  },
};

// Mapear eventos para badges relevantes
export function getBadgesForEvent(event: string): BadgeDefinition[] {
  return Object.values(BADGE_DEFINITIONS).filter((badge) => badge.event === event);
}
