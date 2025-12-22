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

    getBadgeProgress: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const { calculateBadgeProgress } = await import('./badges/progress');
        return await calculateBadgeProgress(input.userId);
      }),

    getActions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserActions(ctx.user.id);
      }),

    getUserIdsByNames: publicProcedure
      .input(z.object({ names: z.array(z.string()) }))
      .query(async ({ input }) => {
        const result: Record<string, number> = {};
        for (const name of input.names) {
          const user = await db.getUserByName(name);
          if (user) {
            result[name] = user.id;
          }
        }
        return result;
      }),

    getPaymentHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserPayments(ctx.user.id, input.limit);
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

    getStats: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        days: z.number().min(7).max(90).default(30),
      }))
      .query(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community || community.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can view stats' });
        }
        return await db.getCommunityStats(input.communityId, input.days);
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

        // Verificar badges
        const { checkAndAwardBadges } = await import('./badges/checker');
        await checkAndAwardBadges(ctx.user.id, 'community_created');

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

        // Verificar badges para o dono da comunidade
        const { checkAndAwardBadges } = await import('./badges/checker');
        await checkAndAwardBadges(community.ownerId, 'community_member_joined');

        return { success: true };
      }),

    createCheckout: protectedProcedure
      .input(z.object({ 
        communityId: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
        planId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!community.isPaid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community is not paid' });

        const isMember = await db.isCommunityMember(input.communityId, ctx.user.id);
        if (isMember) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already a member' });

        // Get plan details if planId provided
        let price = community.price;
        let interval: 'monthly' | 'yearly' | 'lifetime' = 'monthly';
        let planName = 'Assinatura Mensal';
        let trialDays = 0;

        if (input.planId) {
          const plan = await db.getSubscriptionPlanById(input.planId);
          if (plan && plan.communityId === input.communityId) {
            price = plan.price;
            interval = plan.interval;
            planName = plan.name;
            trialDays = plan.trialDays || 0;
          }
        }

        const session = await createCommunityCheckoutSession({
          communityId: input.communityId,
          communityName: community.name,
          price,
          userId: ctx.user.id,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          planId: input.planId,
          interval,
          planName,
          trialDays: trialDays > 0 ? trialDays : undefined,
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

    // Revenue Dashboard
    getRevenueStats: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can view revenue' });
        }

        return await db.getCommunityRevenueStats(input.communityId);
      }),

    getRevenueByMonth: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can view revenue' });
        }

        return await db.getCommunityRevenueByMonth(input.communityId);
      }),

    getPayments: protectedProcedure
      .input(z.object({ communityId: z.number(), limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        // Check if user is community owner
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can view payments' });
        }

        return await db.getCommunityPayments(input.communityId, input.limit);
      }),

    // Subscription Plans
    getPlans: publicProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCommunityPlans(input.communityId, true);
      }),

    getAllPlans: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .query(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.getCommunityPlans(input.communityId, false);
      }),

    createPlan: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        interval: z.enum(['monthly', 'yearly', 'lifetime']),
        price: z.number().min(100), // minimum R$ 1.00
        originalPrice: z.number().optional(),
        features: z.array(z.string()).optional(),
        isDefault: z.boolean().optional(),
        sortOrder: z.number().optional(),
        trialDays: z.number().min(0).max(90).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only community owner can create plans' });
        }

        const planId = await db.createSubscriptionPlan(input);
        return { planId };
      }),

    updatePlan: protectedProcedure
      .input(z.object({
        planId: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        price: z.number().min(100).optional(),
        originalPrice: z.number().optional(),
        features: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
        sortOrder: z.number().optional(),
        trialDays: z.number().min(0).max(90).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getSubscriptionPlanById(input.planId);
        if (!plan) throw new TRPCError({ code: 'NOT_FOUND' });

        const community = await db.getCommunityById(plan.communityId);
        if (!community || community.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const { planId, ...updateData } = input;
        await db.updateSubscriptionPlan(planId, updateData);
        return { success: true };
      }),

    deletePlan: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const plan = await db.getSubscriptionPlanById(input.planId);
        if (!plan) throw new TRPCError({ code: 'NOT_FOUND' });

        const community = await db.getCommunityById(plan.communityId);
        if (!community || community.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.deleteSubscriptionPlan(input.planId);
        return { success: true };
      }),

    createDefaultPlans: protectedProcedure
      .input(z.object({ communityId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const community = await db.getCommunityById(input.communityId);
        if (!community) throw new TRPCError({ code: 'NOT_FOUND' });
        if (community.ownerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        if (!community.isPaid || !community.price) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Community must be paid' });
        }

        await db.createDefaultPlans(input.communityId, community.price);
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

    getShareUrls: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getPostById(input.postId);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND' });

        const { 
          generateWhatsAppShareUrl, 
          generateTwitterShareUrl, 
          generateLinkedInShareUrl,
          generateFacebookShareUrl,
          generateTelegramShareUrl,
          extractHashtagsFromContent 
        } = await import('./social-share');

        const baseUrl = process.env.VITE_APP_URL || 'https://beeonme.manus.space';
        const postUrl = `${baseUrl}/post/${input.postId}`;
        
        const shareData = {
          url: postUrl,
          title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          description: `Post de ${post.authorName} na comunidade ${post.communityName}`,
          hashtags: extractHashtagsFromContent(post.content),
        };

        return {
          whatsapp: generateWhatsAppShareUrl(shareData),
          twitter: generateTwitterShareUrl(shareData),
          linkedin: generateLinkedInShareUrl(shareData),
          facebook: generateFacebookShareUrl(shareData),
          telegram: generateTelegramShareUrl(shareData),
          directUrl: postUrl,
        };
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

        // Extract and save mentions
        const mentionRegex = /@(\w+)/g;
        const matches = input.content.matchAll(mentionRegex);
        const usernames = Array.from(matches, m => m[1]);
        
        if (usernames.length > 0) {
          // Find users by name and save mentions
          for (const username of usernames) {
            const mentionedUser = await db.getUserByName(username);
            if (mentionedUser) {
              await db.createMention({
                postId,
                mentionedUserId: mentionedUser.id,
                mentionedBy: ctx.user.id,
              });
              
              // Create notification for mentioned user
              await db.createNotification({
                userId: mentionedUser.id,
                type: 'mention',
                title: 'Nova menção',
                message: `${ctx.user.name} mencionou você em um post`,
                relatedId: postId,
                relatedType: 'post',
              });
            }
          }
        }

        await db.recordGamificationAction({
          userId: ctx.user.id,
          actionType: 'create_post',
          points: 10,
          relatedId: postId,
        });

        // Verificar badges
        const { checkAndAwardBadges } = await import('./badges/checker');
        await checkAndAwardBadges(ctx.user.id, 'post_created');

        return { id: postId, content: input.content };
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
            
            // Create notification for post author
            await db.createNotification({
              userId: post.authorId,
              type: 'like',
              title: 'Novo like no seu post',
              message: `${ctx.user.name} curtiu seu post`,
              relatedId: input.postId,
              relatedType: 'post',
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
            // Send push notification
            const { notifyPostLike } = await import('./_core/pushNotificationHelper');
            notifyPostLike(
              post.authorId,
              ctx.user.name || 'Usuário',
              post.content,
              input.postId
            ).catch(err => console.error('[Push] Failed to send like notification:', err));
            
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
            
            // Verificar badges para o autor do post
            const { checkAndAwardBadges } = await import('./badges/checker');
            await checkAndAwardBadges(post.authorId, 'like_received');
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
        }, ctx.user.id);

        // Send push notification to post author
        const post = await db.getPostById(input.postId);
        if (post && post.authorId !== ctx.user.id) {
          const { notifyPostComment } = await import('./_core/pushNotificationHelper');
          notifyPostComment(
            post.authorId,
            ctx.user.name || 'Usuário',
            input.content,
            input.postId
          ).catch(err => console.error('[Push] Failed to send comment notification:', err));
        }

        // Extract and save mentions from comment
        const mentionRegex = /@(\w+)/g;
        const matches = input.content.matchAll(mentionRegex);
        const usernames = Array.from(matches, m => m[1]);
        
        if (usernames.length > 0) {
          for (const username of usernames) {
            const mentionedUser = await db.getUserByName(username);
            if (mentionedUser && mentionedUser.id !== ctx.user.id) {
              await db.createMention({
                commentId,
                mentionedUserId: mentionedUser.id,
                mentionedBy: ctx.user.id,
              });
              
              // Create notification for mentioned user
              await db.createNotification({
                userId: mentionedUser.id,
                type: 'mention',
                title: 'Nova menção',
                message: `${ctx.user.name} mencionou você em um comentário`,
                relatedId: input.postId,
                relatedType: 'post',
              });
            }
          }
        }

        await db.recordGamificationAction({
          userId: ctx.user.id,
          actionType: 'create_comment',
          points: 5,
          relatedId: commentId,
        });

        // Verificar badges
        const { checkAndAwardBadges } = await import('./badges/checker');
        await checkAndAwardBadges(ctx.user.id, 'comment_created');

        return { id: commentId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify comment ownership
        const comment = await db.getCommentById(input.id);
        if (!comment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
        }
        if (comment.authorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own comments' });
        }
        
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
        contentType: z.enum(['all', 'text', 'image', 'link']).default('all'),
        sortBy: z.enum(['recent', 'popular', 'trending']).default('recent'),
        period: z.enum(['all', 'today', 'week', 'month']).default('all'),
      }))
      .query(async ({ ctx, input }) => {
        const communities = await db.getUserCommunities(ctx.user.id);
        const communityIds = communities.map(c => c.id);
        const posts = await db.getFeedPosts(communityIds, input.limit + 1, input.cursor, {
          contentType: input.contentType,
          sortBy: input.sortBy,
          period: input.period,
        });
        
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

    global: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().default(5) }))
      .query(async ({ input }) => {
        const [communities, users, posts, hashtags] = await Promise.all([
          db.searchCommunities(input.query, { limit: input.limit }),
          db.searchUsers(input.query, input.limit),
          db.getFeedPosts([], 50).then(posts => 
            posts.filter(p => 
              p.content?.toLowerCase().includes(input.query.toLowerCase())
            ).slice(0, input.limit)
          ),
          db.getTrendingHashtags(20).then(tags => 
            tags.filter(t => 
              t.tag.toLowerCase().includes(input.query.toLowerCase())
            ).slice(0, input.limit)
          ),
        ]);
        
        return {
          communities,
          users,
          posts,
          hashtags,
        };
      }),

    posts: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        communityId: z.number().optional(),
        authorId: z.number().optional(),
        hashtags: z.array(z.string()).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        sortBy: z.enum(['relevance', 'date', 'likes']).optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { searchPosts } = await import('./db-search');
        return await searchPosts(input);
      }),

    suggestions: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        const { getSearchSuggestions } = await import('./db-search');
        return await getSearchSuggestions(input.query);
      }),

    hashtags: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.searchHashtags(input.query, input.limit);
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

    getMentions: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await db.getUserMentions(ctx.user.id, input.limit);
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
        
        // Send push notification
        const { notifyNewFollower } = await import('./_core/pushNotificationHelper');
        notifyNewFollower(
          input.userId,
          ctx.user.name || 'Usuário',
          ctx.user.id
        ).catch(err => console.error('[Push] Failed to send follow notification:', err));
        
        // Verificar badges para quem seguiu
        const { checkAndAwardBadges } = await import('./badges/checker');
        await checkAndAwardBadges(ctx.user.id, 'user_followed');
        
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
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.sendMessage(input.conversationId, ctx.user.id, input.content, input.imageUrl);
      }),

    uploadImage: protectedProcedure
      .input(z.object({
        base64Image: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const base64Data = input.base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Upload to S3
        const fileKey = `chat-images/${ctx.user.id}/${nanoid()}.${input.mimeType.split("/")[1]}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url };
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

    onlineUsers: protectedProcedure
      .input(z.object({ userIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        const { getOnlineUserIds } = await import("./_core/websocket");
        const onlineIds = getOnlineUserIds();
        return input.userIds.filter(id => onlineIds.includes(id));
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

    getByTag: publicProcedure
      .input(z.object({ tag: z.string() }))
      .query(async ({ input }) => {
        return await db.getHashtagByTag(input.tag);
      }),

    follow: protectedProcedure
      .input(z.object({ hashtagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.followHashtag(ctx.user.id, input.hashtagId);
        return { success };
      }),

    unfollow: protectedProcedure
      .input(z.object({ hashtagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.unfollowHashtag(ctx.user.id, input.hashtagId);
        return { success };
      }),

    isFollowing: protectedProcedure
      .input(z.object({ hashtagId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isFollowingHashtag(ctx.user.id, input.hashtagId);
      }),

    myFollowed: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserFollowedHashtags(ctx.user.id);
      }),

    followersCount: publicProcedure
      .input(z.object({ hashtagId: z.number() }))
      .query(async ({ input }) => {
        return await db.getHashtagFollowersCount(input.hashtagId);
      }),
  }),

  reactions: router({
    add: protectedProcedure
      .input(z.object({
        postId: z.number(),
        reactionType: z.enum(["love", "like", "laugh", "wow", "sad", "angry"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addPostReaction(input.postId, ctx.user.id, input.reactionType);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removePostReaction(input.postId, ctx.user.id);
        return { success: true };
      }),

    getCounts: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPostReactionCounts(input.postId);
      }),

    getUserReaction: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserReaction(input.postId, ctx.user.id);
      }),

    getUsers: publicProcedure
      .input(z.object({ 
        postId: z.number(),
        reactionType: z.string().optional()
      }))
      .query(async ({ input }) => {
        const { getPostReactionUsers } = await import('./db-reactions-users');
        return await getPostReactionUsers(input.postId, input.reactionType || '');
      }),
  }),

  linkPreview: router({
    fetch: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .query(async ({ input }) => {
        const { fetchLinkPreview } = await import('./link-preview');
        return await fetchLinkPreview(input.url);
      }),
  }),

  moderation: router({
    // Create report
    report: protectedProcedure
      .input(z.object({
        reportType: z.enum(["post", "comment", "user"]),
        targetId: z.number(),
        reason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createReport } = await import('./db-moderation');
        const reportId = await createReport({
          reporterId: ctx.user.id,
          reportType: input.reportType,
          targetId: input.targetId,
          reason: input.reason,
          status: "pending",
        });
        return { reportId };
      }),

    // Get pending reports (admin only)
    getPendingReports: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async () => {
        const { getPendingReports } = await import('./db-moderation');
        return await getPendingReports();
      }),

    // Get all reports with filter (admin only)
    getAllReports: protectedProcedure
      .input(z.object({
        status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async ({ input }) => {
        const { getAllReports } = await import('./db-moderation');
        return await getAllReports(input.status);
      }),

    // Resolve report (admin only)
    resolveReport: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(["reviewed", "resolved", "dismissed"]),
        reviewNotes: z.string().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { resolveReport, createModerationLog } = await import('./db-moderation');
        await resolveReport(input.reportId, ctx.user.id, input.status, input.reviewNotes);
        await createModerationLog({
          moderatorId: ctx.user.id,
          action: "resolve_report",
          reportId: input.reportId,
          reason: input.reviewNotes || `Report ${input.status}`,
        });
        return { success: true };
      }),

    // Remove post (admin only)
    removePost: protectedProcedure
      .input(z.object({
        postId: z.number(),
        reason: z.string().min(1),
        reportId: z.number().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { removePostAsModerator } = await import('./db-moderation');
        await removePostAsModerator(input.postId, ctx.user.id, input.reason, input.reportId);
        return { success: true };
      }),

    // Remove comment (admin only)
    removeComment: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        reason: z.string().min(1),
        reportId: z.number().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { removeCommentAsModerator } = await import('./db-moderation');
        await removeCommentAsModerator(input.commentId, ctx.user.id, input.reason, input.reportId);
        return { success: true };
      }),

    // Ban user (admin only)
    banUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().min(1),
        until: z.date().optional(),
        reportId: z.number().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { banUserAsModerator } = await import('./db-moderation');
        await banUserAsModerator(input.userId, ctx.user.id, input.reason, input.until, input.reportId);
        return { success: true };
      }),

    // Unban user (admin only)
    unbanUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().min(1),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { unbanUserAsModerator } = await import('./db-moderation');
        await unbanUserAsModerator(input.userId, ctx.user.id, input.reason);
        return { success: true };
      }),

    // Get moderation logs (admin only)
    getLogs: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async ({ input }) => {
        const { getModerationLogs } = await import('./db-moderation');
        return await getModerationLogs(input.limit);
      }),

    // Get moderation statistics (admin only)
    getStats: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async () => {
        const { getModerationStats } = await import('./db-moderation');
        return await getModerationStats();
      }),

    // Issue warning with automatic escalation (admin only)
    issueWarning: protectedProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string().min(1),
        reportId: z.number().optional(),
      }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { issueWarningWithEscalation } = await import('./db-moderation');
        return await issueWarningWithEscalation(
          input.userId,
          ctx.user.id,
          input.reason,
          input.reportId
        );
      }),

    // Get user warnings (admin only)
    getUserWarnings: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async ({ input }) => {
        const { getUserWarnings, getActiveWarningsCount, getNextWarningLevel } = await import('./db-moderation');
        const warnings = await getUserWarnings(input.userId);
        const activeCount = await getActiveWarningsCount(input.userId);
        const nextLevel = await getNextWarningLevel(input.userId);
        return { warnings, activeCount, nextLevel };
      }),

    // Deactivate warning (admin only)
    deactivateWarning: protectedProcedure
      .input(z.object({ warningId: z.number() }))
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .mutation(async ({ ctx, input }) => {
        const { deactivateWarning } = await import('./db-moderation');
        await deactivateWarning(input.warningId, ctx.user.id);
        return { success: true };
      }),

    // ============ BAN APPEALS ============

    // Create ban appeal (for banned users)
    createAppeal: protectedProcedure
      .input(z.object({
        reason: z.string().min(10, "A apelação deve ter pelo menos 10 caracteres"),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is banned
        const user = await db.getUserById(ctx.user.id);
        if (!user?.isBanned) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não está banido' });
        }

        const { createBanAppeal } = await import('./db-moderation');
        const appealId = await createBanAppeal(ctx.user.id, input.reason);
        return { appealId };
      }),

    // Get user's own appeal status
    getMyAppeal: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserAppeal } = await import('./db-moderation');
        return await getUserAppeal(ctx.user.id);
      }),

    // Get pending appeals (admin only)
    getPendingAppeals: adminProcedure
      .query(async () => {
        const { getPendingAppeals } = await import('./db-moderation');
        return await getPendingAppeals();
      }),

    // Get all appeals (admin only)
    getAllAppeals: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      }))
      .query(async ({ input }) => {
        const { getAllAppeals } = await import('./db-moderation');
        return await getAllAppeals(input.status);
      }),

    // Resolve appeal (admin only)
    resolveAppeal: adminProcedure
      .input(z.object({
        appealId: z.number(),
        status: z.enum(["approved", "rejected"]),
        adminResponse: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { resolveAppeal } = await import('./db-moderation');
        return await resolveAppeal(
          input.appealId,
          ctx.user.id,
          input.status,
          input.adminResponse
        );
      }),

    // ============ AUDIT LOGS ============

    // Get audit logs (admin only)
    getAuditLogs: adminProcedure
      .input(z.object({
        action: z.string().optional(),
        entityType: z.string().optional(),
        userId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        const { getAuditLogs } = await import('./db-moderation');
        return await getAuditLogs(input);
      }),

    // Get audit log action types (admin only)
    getAuditLogActions: adminProcedure
      .query(async () => {
        const { getAuditLogActions } = await import('./db-moderation');
        return await getAuditLogActions();
      }),

    // Get audit log entity types (admin only)
    getAuditLogEntityTypes: adminProcedure
      .query(async () => {
        const { getAuditLogEntityTypes } = await import('./db-moderation');
        return await getAuditLogEntityTypes();
      }),

    // Export audit logs as CSV (admin only)
    exportAuditLogsCSV: adminProcedure
      .input(z.object({
        action: z.string().optional(),
        entityType: z.string().optional(),
        userId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { exportAuditLogsCSV } = await import('./db-moderation');
        const csv = await exportAuditLogsCSV(input);
        return { csv };
      }),

    // ============ ANALYTICS ============

    // Get analytics by period (admin only)
    getAnalytics: adminProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ input }) => {
        const { getAnalyticsByPeriod } = await import('./db-moderation');
        return await getAnalyticsByPeriod(input.days);
      }),

    // ============ RESPONSE TEMPLATES ============

    // Create response template (admin only)
    createTemplate: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(["appeal_approve", "appeal_reject", "report_resolve", "report_dismiss", "warning", "ban"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createResponseTemplate } = await import('./db-moderation');
        const id = await createResponseTemplate({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    // Get response templates (admin only)
    getTemplates: adminProcedure
      .input(z.object({
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { getResponseTemplates } = await import('./db-moderation');
        return await getResponseTemplates(input.category);
      }),

    // Update response template (admin only)
    updateTemplate: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["appeal_approve", "appeal_reject", "report_resolve", "report_dismiss", "warning", "ban"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateResponseTemplate } = await import('./db-moderation');
        const { id, ...data } = input;
        await updateResponseTemplate(id, data);
        return { success: true };
      }),

    // Delete response template (admin only)
    deleteTemplate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteResponseTemplate } = await import('./db-moderation');
        await deleteResponseTemplate(input.id);
        return { success: true };
      }),

    // Increment template use count (admin only)
    useTemplate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { incrementTemplateUseCount } = await import('./db-moderation');
        await incrementTemplateUseCount(input.id);
        return { success: true };
      }),

    // ============ USER INSIGHTS ============

    // Get user insights (admin only)
    getUserInsights: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const { getUserInsights } = await import('./db-moderation');
        return await getUserInsights(input.userId);
      }),

    // Search users for insights (admin only)
    searchUsersForInsights: adminProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { searchUsersForInsights } = await import('./db-moderation');
        return await searchUsersForInsights(input.query, input.limit);
      }),
  }),

  // Push Notifications
  push: router({
    // Get VAPID public key
    getPublicKey: publicProcedure
      .query(async () => {
        const { getVapidPublicKey } = await import('./_core/push');
        return { publicKey: getVapidPublicKey() };
      }),

    // Subscribe to push notifications
    subscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPushSubscription({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
          userAgent: input.userAgent,
        });
        return { success: true };
      }),

    // Unsubscribe from push notifications
    unsubscribe: protectedProcedure
      .input(z.object({
        endpoint: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.deletePushSubscription(input.endpoint);
        return { success: true };
      }),

    // Get user's push subscriptions
    getSubscriptions: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getUserPushSubscriptions(ctx.user.id);
      }),

    // Get notification preferences
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getNotificationPreferences(ctx.user.id);
      }),

    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        pushEnabled: z.boolean().optional(),
        pushComments: z.boolean().optional(),
        pushLikes: z.boolean().optional(),
        pushFollows: z.boolean().optional(),
        pushMessages: z.boolean().optional(),
        pushBadges: z.boolean().optional(),
        pushCommunity: z.boolean().optional(),
        inAppEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertNotificationPreferences(ctx.user.id, input);
        return { success: true };
      }),

    // Send test notification (for testing)
    sendTest: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { sendPushNotification } = await import('./_core/push');
        const subscriptions = await db.getUserPushSubscriptions(ctx.user.id);
        
        if (subscriptions.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'No push subscriptions found' });
        }

        const results = await Promise.all(
          subscriptions.map(sub =>
            sendPushNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              {
                title: 'Notificação de Teste',
                body: 'Esta é uma notificação de teste do BeeOn.me!',
                url: '/notifications',
              }
            )
          )
        );

        return { success: true, sent: results.filter(Boolean).length };
      }),
  }),

  // Analytics
  analytics: router({
    // Get community analytics
    getCommunityAnalytics: protectedProcedure
      .input(z.object({
        communityId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getCommunityAnalytics(
          input.communityId,
          input.startDate,
          input.endDate
        );
      }),

    // Get post analytics
    getPostAnalytics: protectedProcedure
      .input(z.object({
        postId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getPostAnalytics(input.postId);
      }),

    // Record post view
    recordPostView: protectedProcedure
      .input(z.object({
        postId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.incrementPostViews(input.postId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
