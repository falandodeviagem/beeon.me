import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { createCommunityCheckoutSession, hasActiveSubscription } from "./stripe";
import { storagePut } from "./storage";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    getProfile: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        const user = await db.getUserById(userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        return user;
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    completeOnboarding: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.updateUserProfile(ctx.user.id, { hasCompletedOnboarding: true } as any);
        return { success: true };
      }),

    generateInviteCode: protectedProcedure
      .mutation(async ({ ctx }) => {
        const inviteCode = nanoid(10);
        await db.updateUserProfile(ctx.user.id, { inviteCode } as any);
        return { inviteCode };
      }),

    getByInviteCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const user = await db.getUserByInviteCode(input.code);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid invite code' });
        return { name: user.name, id: user.id };
      }),

    acceptInvite: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const inviter = await db.getUserByInviteCode(input.code);
        if (!inviter) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid invite code' });
        
        await db.recordGamificationAction({
          userId: inviter.id,
          actionType: 'invite_user',
          points: 50,
          relatedId: ctx.user.id,
        });

        return { success: true, inviterName: inviter.name };
      }),

    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getTopUsers(input.limit);
      }),

    getBadges: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user.id;
        return await db.getUserBadges(userId);
      }),

    getActions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserActions(ctx.user.id);
      }),
  }),

  community: router({
    list: publicProcedure
      .query(async () => {
        return await db.getAllCommunities();
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const community = await db.getCommunityById(input.id);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND', message: 'Community not found' });
        return community;
      }),

    getMyCommunities: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserCommunities(ctx.user.id);
      }),

    getRecommended: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(6),
      }).optional())
      .query(async ({ ctx, input }) => {
        const limit = input?.limit || 6;
        return await db.getRecommendedCommunities(ctx.user.id, limit);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        isPaid: z.boolean().default(false),
        price: z.number().default(0),
        category: z.enum([
          "tecnologia",
          "esportes",
          "arte",
          "musica",
          "educacao",
          "negocios",
          "saude",
          "entretenimento",
          "jogos",
          "outros"
        ]).default("outros"),
      }))
      .mutation(async ({ ctx, input }) => {
        const communityId = await db.createCommunity({
          ...input,
          ownerId: ctx.user.id,
        });

        await db.addCommunityMember({
          communityId,
          userId: ctx.user.id,
        });

        await db.recordGamificationAction({
          userId: ctx.user.id,
          actionType: 'create_community',
          points: 100,
          relatedId: communityId,
        });

        return { id: communityId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.id);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const { id, ...data } = input;
        await db.updateCommunity(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.id);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.deleteCommunity(input.id);
        return { success: true };
      }),

    join: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });

        const isMember = await db.isCommunityMember(input.communityId, ctx.user.id);
        if (isMember) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already a member' });

        if (community.isPaid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Use createCheckout for paid communities' });
        }

        await db.addCommunityMember({
          communityId: input.communityId,
          userId: ctx.user.id,
        });

        return { success: true };
      }),

    createCheckout: protectedProcedure
      .input(z.object({ 
        communityId: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!community.isPaid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community is not paid' });

        const isMember = await db.isCommunityMember(input.communityId, ctx.user.id);
        if (isMember) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already a member' });

        const session = await createCommunityCheckoutSession({
          communityId: input.communityId,
          communityName: community.name,
          price: community.price,
          userId: ctx.user.id,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });

        return { checkoutUrl: session.url };
      }),

    checkSubscription: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ ctx, input }) => {
        const hasSubscription = await hasActiveSubscription(ctx.user.id, input.communityId);
        return { hasSubscription };
      }),

    leave: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeCommunityMember(input.communityId, ctx.user.id);
        return { success: true };
      }),

    isMember: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isCommunityMember(input.communityId, ctx.user.id);
      }),

    // Community Promotions
    getPromotedCommunities: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPromotedCommunities(input.communityId);
      }),

    getPromotedIds: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPromotedCommunityIds(input.communityId);
      }),

    addPromotion: protectedProcedure
      .input(z.object({ 
        communityId: z.number(),
        promotedCommunityId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can manage promotions' });
        }

        // Prevent self-promotion
        if (input.communityId === input.promotedCommunityId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot promote own community' });
        }

        await db.addCommunityPromotion(input.communityId, input.promotedCommunityId);
        return { success: true };
      }),

    removePromotion: protectedProcedure
      .input(z.object({ 
        communityId: z.number(),
        promotedCommunityId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can manage promotions' });
        }

        await db.removeCommunityPromotion(input.communityId, input.promotedCommunityId);
        return { success: true };
      }),
  }),

  post: router({
    uploadImage: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.file, 'base64');
        const ext = input.filename.split('.').pop() || 'jpg';
        const key = `posts/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        
        const { url } = await storagePut(key, buffer, `image/${ext}`);
        return { url };
      }),

    list: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommunityPosts(input.communityId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND' });
        return post;
      }),

    create: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        content: z.string().min(1),
        imageUrl: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const isMember = await db.isCommunityMember(input.communityId, ctx.user.id);
        if (!isMember) throw new TRPCError({ code: 'FORBIDDEN', message: 'Must be a member to post' });

        const postId = await db.createPost({
          ...input,
          authorId: ctx.user.id,
        });

        // Extract and link hashtags automatically
        await db.linkHashtagsToPost(postId, input.content);

        await db.recordGamificationAction({
          userId: ctx.user.id,
          actionType: 'create_post',
          points: 10,
          relatedId: postId,
        });

        return { id: postId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND' });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const { id, ...data } = input;
        await db.updatePost(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND' });
        if (post.authorId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.deletePost(input.id);
        return { success: true };
      }),

    like: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const hasLiked = await db.hasUserLikedPost(input.postId, ctx.user.id);
        if (hasLiked) {
          await db.unlikePost(input.postId, ctx.user.id);
          return { liked: false };
        } else {
          await db.likePost(input.postId, ctx.user.id);
          
          const post = await db.getPostById(input.postId);
          if (post && post.authorId !== ctx.user.id) {
            await db.recordGamificationAction({
              userId: post.authorId,
              actionType: 'receive_like',
              points: 2,
              relatedId: input.postId,
            });
          }

          return { liked: true };
        }
      }),

    hasLiked: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.hasUserLikedPost(input.postId, ctx.user.id);
      }),

    // Reactions
    react: protectedProcedure
      .input(z.object({
        postId: z.number(),
        reactionType: z.enum(["love", "like", "laugh", "wow", "sad", "angry"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const currentReaction = await db.getUserReaction(input.postId, ctx.user.id);
        
        if (currentReaction?.reactionType === input.reactionType) {
          // Remove reaction if clicking the same one
          await db.removePostReaction(input.postId, ctx.user.id);
          return { removed: true };
        } else {
          // Add or change reaction
          await db.addPostReaction(input.postId, ctx.user.id, input.reactionType);
          
          // Award points to post author
          const post = await db.getPostById(input.postId);
          if (post && post.authorId !== ctx.user.id) {
            await db.recordGamificationAction({
              userId: post.authorId,
              actionType: 'receive_reaction',
              points: 2,
              relatedId: input.postId,
            });
            
            // Create notification
            await db.createNotification({
              userId: post.authorId,
              type: 'like',
              title: 'Nova reação!',
              message: `${ctx.user.name || 'Alguém'} reagiu ao seu post`,
              relatedId: input.postId,
              relatedType: 'post',
            });
          }
          
          return { added: true, reactionType: input.reactionType };
        }
      }),

     getReactions: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostReactions(input.postId);
      }),

    share: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        await db.sharePost(input.postId);
        return { success: true };
      }),

    edit: protectedProcedure
      .input(z.object({ 
        postId: z.number(), 
        content: z.string().min(1).max(5000) 
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.editPost(input.postId, ctx.user.id, input.content);
      }),

    getUserReaction: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        const reaction = await db.getUserReaction(input.postId, ctx.user.id);
        return reaction?.reactionType || null;
      }),
  }),

  comment: router({
    list: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostComments(input.postId);
      }),

    getReplies: publicProcedure
      .input(z.object({ parentId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommentReplies(input.parentId);
      }),

    create: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const commentId = await db.createComment({
          ...input,
          authorId: ctx.user.id,
        });

        await db.recordGamificationAction({
          userId: ctx.user.id,
          actionType: 'create_comment',
          points: 5,
          relatedId: commentId,
        });

        return { id: commentId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateComment(input.id, input.content);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number(), postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteComment(input.id, input.postId);
        return { success: true };
      }),

    like: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const hasLiked = await db.hasUserLikedComment(input.commentId, ctx.user.id);
        if (hasLiked) {
          await db.unlikeComment(input.commentId, ctx.user.id);
          return { liked: false };
        } else {
          await db.likeComment(input.commentId, ctx.user.id);
          return { liked: true };
        }
      }),
  }),

  feed: router({
    get: protectedProcedure
      .input(z.object({ 
        limit: z.number().default(10),
        cursor: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const communities = await db.getUserCommunities(ctx.user.id);
        const communityIds = communities.map(c => c.id);
        const posts = await db.getFeedPosts(communityIds, input.limit + 1, input.cursor);
        
        let nextCursor: number | undefined = undefined;
        if (posts.length > input.limit) {
          const nextItem = posts.pop();
          nextCursor = nextItem!.id;
        }

        return {
          posts,
          nextCursor,
        };
      }),
  }),

  search: router({
    communities: publicProcedure
      .input(z.object({ 
        query: z.string().min(1), 
        limit: z.number().default(20),
        isPaid: z.boolean().nullable().optional(),
        orderBy: z.enum(['relevance', 'recent']).default('relevance'),
      }))
      .query(async ({ input }) => {
        return await db.searchCommunities(input.query, {
          limit: input.limit,
          isPaid: input.isPaid ?? null,
          orderBy: input.orderBy,
        });
      }),

    users: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.searchUsers(input.query, input.limit);
      }),
  }),

  moderation: router({
    report: protectedProcedure
      .input(z.object({
        reportType: z.enum(['post', 'comment', 'user']),
        targetId: z.number(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const reportId = await db.createReport({
          ...input,
          reporterId: ctx.user.id,
        });
        return { id: reportId };
      }),

    getPendingReports: adminProcedure
      .query(async () => {
        return await db.getPendingReports();
      }),

    reviewReport: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['reviewed', 'resolved', 'dismissed']),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateReport(input.id, {
          status: input.status,
          reviewedBy: ctx.user.id,
          reviewNotes: input.reviewNotes,
        });
        return { success: true };
      }),

    banUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
        until: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.banUser(input.userId, input.reason, input.until);
        return { success: true };
      }),

    unbanUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await db.unbanUser(input.userId);
        return { success: true };
      }),
  }),

  notification: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.limit);
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadNotificationCount(ctx.user.id);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.markAllNotificationsAsRead(ctx.user.id);
        return { success: true };
      }),
  }),

  follow: router({
    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot follow yourself' });
        }
        await db.followUser(ctx.user.id, input.userId);
        
        // Create notification
        await db.createNotification({
          userId: input.userId,
          type: 'follow',
          title: 'Novo seguidor!',
          message: `${ctx.user.name || 'Alguém'} começou a seguir você`,
          relatedId: ctx.user.id,
          relatedType: 'user',
        });
        
        return { success: true };
      }),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unfollowUser(ctx.user.id, input.userId);
        return { success: true };
      }),

    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isFollowing(ctx.user.id, input.userId);
      }),

    followers: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowers(input.userId);
      }),

    following: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowing(input.userId);
      }),

    followerCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowerCount(input.userId);
      }),

    followingCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFollowingCount(input.userId);
      }),
  }),

  profile: router({
    getUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.userId);
      }),

    posts: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().default(20) }))
      .query(async ({ input }) => {
        return await db.getUserPosts(input.userId, input.limit);
      }),

    badges: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserBadges(input.userId);
      }),

    communities: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserCommunities(input.userId);
      }),

    stats: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserStats(input.userId);
      }),
  }),

  trending: router({
    communities: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return await db.getTrendingCommunities(input.limit);
      }),

    posts: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return await db.getTrendingPosts(input.limit);
      }),
  }),

  messages: router({
    conversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserConversations(ctx.user.id);
      }),

    getOrCreate: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.getOrCreateConversation(ctx.user.id, input.otherUserId);
      }),

    list: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getConversationMessages(input.conversationId);
      }),

    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.sendMessage(input.conversationId, ctx.user.id, input.content);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markMessagesAsRead(input.conversationId, ctx.user.id);
        return { success: true };
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUnreadMessageCount(ctx.user.id);
      }),
  }),

  hashtags: router({
    byTag: publicProcedure
      .input(z.object({ 
        tag: z.string(),
        limit: z.number().default(20) 
      }))
      .query(async ({ input }) => {
        return await db.getPostsByHashtag(input.tag, input.limit);
      }),

    trending: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getTrendingHashtags(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
