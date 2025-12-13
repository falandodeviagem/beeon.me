import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { createCommunityCheckoutSession, hasActiveSubscription } from "./stripe";

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

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        isPaid: z.boolean().default(false),
        price: z.number().default(0),
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
  }),

  post: router({
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
      }))
      .mutation(async ({ ctx, input }) => {
        const isMember = await db.isCommunityMember(input.communityId, ctx.user.id);
        if (!isMember) throw new TRPCError({ code: 'FORBIDDEN', message: 'Must be a member to post' });

        const postId = await db.createPost({
          ...input,
          authorId: ctx.user.id,
        });

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
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        const communities = await db.getUserCommunities(ctx.user.id);
        const communityIds = communities.map(c => c.id);
        return await db.getFeedPosts(communityIds, input.limit);
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
});

export type AppRouter = typeof appRouter;
