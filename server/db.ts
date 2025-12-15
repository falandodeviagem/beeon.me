import { eq, and, desc, sql, inArray, notInArray, isNull, isNotNull, like, or, lt, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  communities, InsertCommunity,
  communityMembers, InsertCommunityMember,
  posts, InsertPost,
  postLikes, InsertPostLike,
  comments, InsertComment,
  commentLikes, InsertCommentLike,
  badges, InsertBadge,
  userBadges, InsertUserBadge,
  reports, InsertReport,
  gamificationActions, InsertGamificationAction,
  notifications, InsertNotification,
  postReactions, InsertPostReaction,
  userFollows, InsertUserFollow,
  conversations, InsertConversation,
  messages, InsertMessage,
  hashtags, InsertHashtag,
  postHashtags, InsertPostHashtag,
  communityPromotions, InsertCommunityPromotion,
  mentions, InsertMention,
  userHashtagFollows, InsertUserHashtagFollow,
  payments, InsertPayment,
  subscriptionPlans, InsertSubscriptionPlan
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<number> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    throw new Error("Database not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "bio", "avatarUrl"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Fetch and return the user ID
    const existingUser = await getUserByOpenId(user.openId);
    if (!existingUser) {
      throw new Error("Failed to retrieve user after upsert");
    }
    return existingUser.id;
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByInviteCode(inviteCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.inviteCode, inviteCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function updateUserPoints(userId: number, points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ 
    points: sql`${users.points} + ${points}` 
  }).where(eq(users.id, userId));
}

export async function checkAndUpdateUserLevel(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserById(userId);
  if (!user) return;

  const newLevel = Math.floor(user.points / 100) + 1;
  
  if (newLevel > user.level) {
    await db.update(users).set({ level: newLevel }).where(eq(users.id, userId));
  }
}

export async function banUser(userId: number, reason: string, until?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    isBanned: true,
    bannedUntil: until || null,
    banReason: reason,
  }).where(eq(users.id, userId));
}

export async function unbanUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    isBanned: false,
    bannedUntil: null,
    banReason: null,
  }).where(eq(users.id, userId));
}

export async function getTopUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.points)).limit(limit);
}

// COMMUNITY OPERATIONS

export async function createCommunity(data: InsertCommunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(communities).values(data);
  return result[0].insertId;
}

export async function getCommunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCommunities() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(communities).orderBy(desc(communities.createdAt));
}

export async function getUserCommunities(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      community: communities,
      membership: communityMembers,
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communityMembers.communityId, communities.id))
    .where(eq(communityMembers.userId, userId))
    .orderBy(desc(communityMembers.joinedAt));

  return result.map(r => ({ ...r.community, membership: r.membership }));
}

export async function updateCommunity(id: number, data: Partial<InsertCommunity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communities).set(data).where(eq(communities.id, id));
}

export async function deleteCommunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(communities).where(eq(communities.id, id));
}

export async function incrementCommunityMembers(communityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communities).set({
    memberCount: sql`${communities.memberCount} + 1`
  }).where(eq(communities.id, communityId));
}

export async function decrementCommunityMembers(communityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communities).set({
    memberCount: sql`${communities.memberCount} - 1`
  }).where(eq(communities.id, communityId));
}

// COMMUNITY MEMBER OPERATIONS

export async function addCommunityMember(data: InsertCommunityMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(communityMembers).values(data);
  await incrementCommunityMembers(data.communityId);
}

export async function removeCommunityMember(communityId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(communityMembers).where(
    and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, userId)
    )
  );
  await decrementCommunityMembers(communityId);
}

export async function isCommunityMember(communityId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(communityMembers).where(
    and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, userId)
    )
  ).limit(1);

  return result.length > 0;
}

export async function getCommunityMembership(communityId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(communityMembers).where(
    and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, userId)
    )
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateCommunityMembership(communityId: number, userId: number, data: Partial<InsertCommunityMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(communityMembers).set(data).where(
    and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, userId)
    )
  );
}

// POST OPERATIONS

export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(posts).values(data);
  return result[0].insertId;
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      communityId: posts.communityId,
      communityName: communities.name,
      likeCount: posts.likeCount,
      commentCount: posts.commentCount,
      shareCount: posts.shareCount,
      isEdited: posts.isEdited,
      editedAt: posts.editedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(posts.id, id))
    .limit(1);
    
  return result.length > 0 ? result[0] : undefined;
}

export async function getCommunityPosts(communityId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(posts)
    .where(eq(posts.communityId, communityId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getFeedPosts(
  communityIds: number[], 
  limit: number = 50, 
  cursor?: number,
  filters?: {
    contentType?: 'all' | 'text' | 'image' | 'link';
    sortBy?: 'recent' | 'popular' | 'trending';
    period?: 'all' | 'today' | 'week' | 'month';
  }
) {
  const db = await getDb();
  if (!db) return [];

  if (communityIds.length === 0) return [];

  const conditions = [inArray(posts.communityId, communityIds)];
  
  if (cursor) {
    conditions.push(lt(posts.id, cursor));
  }

  // Content type filter
  if (filters?.contentType && filters.contentType !== 'all') {
    if (filters.contentType === 'text') {
      conditions.push(isNull(posts.imageUrl));
    } else if (filters.contentType === 'image') {
      conditions.push(isNotNull(posts.imageUrl));
    }
    // 'link' would require checking content for URLs
  }

  // Period filter
  if (filters?.period && filters.period !== 'all') {
    const now = Date.now();
    let periodStart: number;
    
    if (filters.period === 'today') {
      periodStart = now - 24 * 60 * 60 * 1000;
    } else if (filters.period === 'week') {
      periodStart = now - 7 * 24 * 60 * 60 * 1000;
    } else if (filters.period === 'month') {
      periodStart = now - 30 * 24 * 60 * 60 * 1000;
    } else {
      periodStart = 0;
    }
    
    conditions.push(sql`${posts.createdAt} >= ${periodStart}`);
  }

  const result = await db.select({
    id: posts.id,
    content: posts.content,
    imageUrl: posts.imageUrl,
    createdAt: posts.createdAt,
    authorId: posts.authorId,
    communityId: posts.communityId,
    likeCount: posts.likeCount,
    commentCount: posts.commentCount,
    authorName: users.name,
    authorAvatar: users.avatarUrl,
    communityName: communities.name,
  })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(and(...conditions))
    .orderBy(
      filters?.sortBy === 'popular' 
        ? desc(posts.likeCount)
        : filters?.sortBy === 'trending'
        ? desc(sql`${posts.likeCount} + ${posts.commentCount}`)
        : desc(posts.id)
    )
    .limit(limit);

  return result;
}

export async function updatePost(id: number, data: { content?: string; imageUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(posts).where(eq(posts.id, id));
}

export async function incrementPostLikes(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set({
    likeCount: sql`${posts.likeCount} + 1`
  }).where(eq(posts.id, postId));
}

export async function decrementPostLikes(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set({
    likeCount: sql`${posts.likeCount} - 1`
  }).where(eq(posts.id, postId));
}

export async function incrementPostComments(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set({
    commentCount: sql`${posts.commentCount} + 1`
  }).where(eq(posts.id, postId));
}

export async function decrementPostComments(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(posts).set({
    commentCount: sql`${posts.commentCount} - 1`
  }).where(eq(posts.id, postId));
}

// POST LIKE OPERATIONS

export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(postLikes).values({ postId, userId });
  await incrementPostLikes(postId);
}

export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(postLikes).where(
    and(
      eq(postLikes.postId, postId),
      eq(postLikes.userId, userId)
    )
  );
  await decrementPostLikes(postId);
}

export async function hasUserLikedPost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(postLikes).where(
    and(
      eq(postLikes.postId, postId),
      eq(postLikes.userId, userId)
    )
  ).limit(1);

  return result.length > 0;
}

// COMMENT OPERATIONS

export async function createComment(data: InsertComment, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(comments).values(data);
  const commentId = result[0].insertId;
  await incrementPostComments(data.postId);
  
  // Process mentions in comment content
  if (data.content) {
    const mentionRegex = /@(\w+)/g;
    const matches = Array.from(data.content.matchAll(mentionRegex));
    
    for (const match of matches) {
      const username = match[1];
      const mentionedUser = await getUserByName(username);
      
      if (mentionedUser && mentionedUser.id !== authorId) {
        // Save mention
        await db.insert(mentions).values({
          commentId,
          mentionedUserId: mentionedUser.id,
          mentionedBy: authorId,
        });
        
        // Create notification
        await createNotification({
          userId: mentionedUser.id,
          type: "mention",
          title: "Você foi mencionado em um comentário",
          message: `@${username} mencionou você em um comentário`,
          relatedId: data.postId,
        });
      }
    }
  }
  
  return commentId;
}

export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      parentId: comments.parentId,
      likeCount: comments.likeCount,
      isEdited: comments.isEdited,
      editedAt: comments.editedAt,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
    .orderBy(desc(comments.createdAt));
}

export async function getCommentReplies(parentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(comments)
    .where(eq(comments.parentId, parentId))
    .orderBy(desc(comments.createdAt));
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(comments)
    .where(eq(comments.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function updateComment(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({ 
    content,
    isEdited: true,
    editedAt: new Date()
  }).where(eq(comments.id, id));
}

export async function deleteComment(id: number, postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(comments).where(eq(comments.id, id));
  await decrementPostComments(postId);
}

export async function incrementCommentLikes(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({
    likeCount: sql`${comments.likeCount} + 1`
  }).where(eq(comments.id, commentId));
}

export async function decrementCommentLikes(commentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({
    likeCount: sql`${comments.likeCount} - 1`
  }).where(eq(comments.id, commentId));
}

// COMMENT LIKE OPERATIONS

export async function likeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(commentLikes).values({ commentId, userId });
  await incrementCommentLikes(commentId);
}

export async function unlikeComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(commentLikes).where(
    and(
      eq(commentLikes.commentId, commentId),
      eq(commentLikes.userId, userId)
    )
  );
  await decrementCommentLikes(commentId);
}

export async function hasUserLikedComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(commentLikes).where(
    and(
      eq(commentLikes.commentId, commentId),
      eq(commentLikes.userId, userId)
    )
  ).limit(1);

  return result.length > 0;
}

// BADGE OPERATIONS

export async function createBadge(data: InsertBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(badges).values(data);
  return result[0].insertId;
}

export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(badges);
}

export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      badge: badges,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));

  return result;
}

export async function awardBadge(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userBadges).values({ userId, badgeId });
}

export async function hasUserBadge(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select().from(userBadges).where(
    and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badgeId)
    )
  ).limit(1);

  return result.length > 0;
}

// REPORT OPERATIONS

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reports).values(data);
  return result[0].insertId;
}

export async function getPendingReports() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(reports)
    .where(eq(reports.status, "pending"))
    .orderBy(desc(reports.createdAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateReport(id: number, data: { status?: typeof reports.$inferSelect.status; reviewedBy?: number; reviewNotes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(reports).set({
    ...data,
    reviewedAt: new Date(),
  }).where(eq(reports.id, id));
}

// GAMIFICATION OPERATIONS

export async function recordGamificationAction(data: InsertGamificationAction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(gamificationActions).values(data);
  await updateUserPoints(data.userId, data.points);
  await checkAndUpdateUserLevel(data.userId);
}

export async function getUserActions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(gamificationActions)
    .where(eq(gamificationActions.userId, userId))
    .orderBy(desc(gamificationActions.createdAt))
    .limit(limit);
}

// SEARCH OPERATIONS

export async function searchCommunities(
  query: string, 
  options: { 
    limit?: number; 
    isPaid?: boolean | null; 
    orderBy?: 'relevance' | 'recent';
  } = {}
) {
  const db = await getDb();
  if (!db) return [];

  const { limit = 20, isPaid = null, orderBy = 'relevance' } = options;
  const searchTerm = `%${query}%`;
  
  const conditions = [
    or(
      like(communities.name, searchTerm),
      like(communities.description, searchTerm)
    )
  ];

  // Add isPaid filter if specified
  if (isPaid !== null) {
    conditions.push(eq(communities.isPaid, isPaid));
  }

  const baseQuery = db.select({
    id: communities.id,
    name: communities.name,
    description: communities.description,
    imageUrl: communities.imageUrl,
    isPaid: communities.isPaid,
    price: communities.price,
    memberCount: communities.memberCount,
    ownerId: communities.ownerId,
    createdAt: communities.createdAt,
  })
    .from(communities)
    .where(and(...conditions))
    .limit(limit);

  // Apply ordering
  if (orderBy === 'recent') {
    return await baseQuery.orderBy(desc(communities.createdAt));
  } else {
    return await baseQuery.orderBy(desc(communities.memberCount));
  }
}

export async function searchUsers(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query}%`;
  
  return await db.select({
    id: users.id,
    name: users.name,
    bio: users.bio,
    avatarUrl: users.avatarUrl,
    points: users.points,
    level: users.level,
  })
    .from(users)
    .where(
      or(
        like(users.name, searchTerm),
        like(users.bio, searchTerm)
      )
    )
    .orderBy(desc(users.points))
    .limit(limit);
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.insert(notifications).values(notification);
  return Number((result as any).insertId || 0);
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));

  return result[0]?.count || 0;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications)
    .set({ isRead: true })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
}

// ============================================
// POST REACTIONS
// ============================================

export async function addPostReaction(postId: number, userId: number, reactionType: string) {
  const db = await getDb();
  if (!db) return;

  // Remove existing reaction if any
  await db.delete(postReactions)
    .where(and(
      eq(postReactions.postId, postId),
      eq(postReactions.userId, userId)
    ));

  // Add new reaction
  await db.insert(postReactions).values({
    postId,
    userId,
    reactionType: reactionType as any,
  });
}

export async function removePostReaction(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(postReactions)
    .where(and(
      eq(postReactions.postId, postId),
      eq(postReactions.userId, userId)
    ));
}

export async function getPostReactions(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(postReactions)
    .where(eq(postReactions.postId, postId));
}

export async function getPostReactionCounts(postId: number) {
  const db = await getDb();
  if (!db) return {};

  const reactions = await db.select({
    reactionType: postReactions.reactionType,
    count: sql<number>`count(*)`,
  })
    .from(postReactions)
    .where(eq(postReactions.postId, postId))
    .groupBy(postReactions.reactionType);

  const counts: Record<string, number> = {};
  reactions.forEach(r => {
    counts[r.reactionType] = r.count;
  });

  return counts;
}

export async function getUserReaction(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(postReactions)
    .where(and(
      eq(postReactions.postId, postId),
      eq(postReactions.userId, userId)
    ))
    .limit(1);

  return result[0] || null;
}

// ============================================
// USER FOLLOWS
// ============================================

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;

  await db.insert(userFollows).values({
    followerId,
    followingId,
  });
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(userFollows)
    .where(and(
      eq(userFollows.followerId, followerId),
      eq(userFollows.followingId, followingId)
    ));
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.select()
    .from(userFollows)
    .where(and(
      eq(userFollows.followerId, followerId),
      eq(userFollows.followingId, followingId)
    ))
    .limit(1);

  return result.length > 0;
}

export async function getFollowers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: users.id,
    name: users.name,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
    points: users.points,
    level: users.level,
    followedAt: userFollows.createdAt,
  })
    .from(userFollows)
    .innerJoin(users, eq(userFollows.followerId, users.id))
    .where(eq(userFollows.followingId, userId))
    .orderBy(desc(userFollows.createdAt));
}

export async function getFollowing(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: users.id,
    name: users.name,
    avatarUrl: users.avatarUrl,
    bio: users.bio,
    points: users.points,
    level: users.level,
    followedAt: userFollows.createdAt,
  })
    .from(userFollows)
    .innerJoin(users, eq(userFollows.followingId, users.id))
    .where(eq(userFollows.followerId, userId))
    .orderBy(desc(userFollows.createdAt));
}

export async function getFollowerCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  return result[0]?.count || 0;
}

export async function getFollowingCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return result[0]?.count || 0;
}

// ============================================
// USER PROFILE
// ============================================

export async function getUserPosts(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: posts.id,
    content: posts.content,
    imageUrl: posts.imageUrl,
    createdAt: posts.createdAt,
    communityId: posts.communityId,
    communityName: communities.name,
    likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`,
    commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE postId = ${posts.id})`,
  })
    .from(posts)
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return { postCount: 0, commentCount: 0 };

  const postCount = await db.select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.authorId, userId));

  const commentCount = await db.select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(eq(comments.authorId, userId));

  return {
    postCount: postCount[0]?.count || 0,
    commentCount: commentCount[0]?.count || 0,
  };
}

// ============================================
// TRENDING
// ============================================

export async function getTrendingCommunities(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return await db.select({
    id: communities.id,
    name: communities.name,
    description: communities.description,
    imageUrl: communities.imageUrl,
    isPaid: communities.isPaid,
    memberCount: sql<number>`(SELECT COUNT(*) FROM community_members WHERE communityId = ${communities.id})`,
    recentPostCount: sql<number>`(SELECT COUNT(*) FROM posts WHERE communityId = ${communities.id} AND createdAt >= ${sevenDaysAgo})`,
  })
    .from(communities)
    .orderBy(desc(sql<number>`(SELECT COUNT(*) FROM posts WHERE communityId = ${communities.id} AND createdAt >= ${sevenDaysAgo})`))
    .limit(limit);
}

export async function getTrendingPosts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return await db.select({
    id: posts.id,
    content: posts.content,
    imageUrl: posts.imageUrl,
    createdAt: posts.createdAt,
    authorId: posts.authorId,
    authorName: users.name,
    authorAvatar: users.avatarUrl,
    communityId: posts.communityId,
    communityName: communities.name,
    reactionCount: sql<number>`(SELECT COUNT(*) FROM post_reactions WHERE postId = ${posts.id} AND createdAt >= ${oneDayAgo})`,
    commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE postId = ${posts.id})`,
  })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(sql`${posts.createdAt} >= ${oneDayAgo}`)
    .orderBy(desc(sql<number>`(SELECT COUNT(*) FROM post_reactions WHERE postId = ${posts.id} AND createdAt >= ${oneDayAgo})`))
    .limit(limit);
}

// ============================================
// MESSAGES
// ============================================

export async function getOrCreateConversation(user1Id: number, user2Id: number) {
  const db = await getDb();
  if (!db) return null;

  // Ensure consistent ordering (smaller ID first)
  const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  // Try to find existing conversation
  const existing = await db.select()
    .from(conversations)
    .where(and(
      eq(conversations.user1Id, smallerId),
      eq(conversations.user2Id, largerId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const result = await db.insert(conversations).values({
    user1Id: smallerId,
    user2Id: largerId,
  });

  const newConversation = await db.select()
    .from(conversations)
    .where(eq(conversations.id, Number(result[0].insertId)))
    .limit(1);

  return newConversation[0] || null;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all conversations for the user
  const convos = await db.select()
    .from(conversations)
    .where(or(
      eq(conversations.user1Id, userId),
      eq(conversations.user2Id, userId)
    ))
    .orderBy(desc(conversations.lastMessageAt));

  // For each conversation, get the other user's info
  const result = [];
  for (const convo of convos) {
    const otherUserId = convo.user1Id === userId ? convo.user2Id : convo.user1Id;
    const otherUser = await db.select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
      .from(users)
      .where(eq(users.id, otherUserId))
      .limit(1);

    const unreadCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(
        eq(messages.conversationId, convo.id),
        sql`${messages.senderId} != ${userId}`,
        eq(messages.isRead, false)
      ));

    result.push({
      id: convo.id,
      user1Id: convo.user1Id,
      user2Id: convo.user2Id,
      lastMessageAt: convo.lastMessageAt,
      otherUserId,
      otherUserName: otherUser[0]?.name || null,
      otherUserAvatar: otherUser[0]?.avatarUrl || null,
      unreadCount: unreadCountResult[0]?.count || 0,
    });
  }

  return result;
}

export async function getConversationMessages(conversationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: messages.id,
    conversationId: messages.conversationId,
    senderId: messages.senderId,
    content: messages.content,
    isRead: messages.isRead,
    createdAt: messages.createdAt,
    senderName: users.name,
    senderAvatar: users.avatarUrl,
  })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(messages).values({
    conversationId,
    senderId,
    content,
  });

  // Update conversation lastMessageAt
  await db.update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return Number(result[0].insertId);
}

export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.conversationId, conversationId),
      sql`${messages.senderId} != ${userId}`,
      eq(messages.isRead, false)
    ));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const userConvos = await db.select({ id: conversations.id })
    .from(conversations)
    .where(or(
      eq(conversations.user1Id, userId),
      eq(conversations.user2Id, userId)
    ));

  if (userConvos.length === 0) return 0;

  const convoIds = userConvos.map(c => c.id);

  const result = await db.select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(
      inArray(messages.conversationId, convoIds),
      sql`${messages.senderId} != ${userId}`,
      eq(messages.isRead, false)
    ));

  return result[0]?.count || 0;
}

// ============================================
// SHARE
// ============================================

export async function sharePost(postId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(posts)
    .set({ shareCount: sql`${posts.shareCount} + 1` })
    .where(eq(posts.id, postId));
}


// ============================================
// POST EDITING
// ============================================

export async function editPost(postId: number, authorId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verify author
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) throw new Error("Post not found");
  if (post.authorId !== authorId) throw new Error("Not authorized to edit this post");

  await db.update(posts)
    .set({ 
      content, 
      isEdited: true, 
      editedAt: new Date() 
    })
    .where(eq(posts.id, postId));

  return { success: true };
}


// ============================================
// HASHTAG HELPERS
// ============================================

/**
 * Extract hashtags from text using regex
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  if (!matches) return [];
  
  // Remove # and convert to lowercase, remove duplicates
  return Array.from(new Set(matches.map(tag => tag.slice(1).toLowerCase())));
}

/**
 * Get or create hashtags and link them to a post
 */
export async function linkHashtagsToPost(postId: number, content: string) {
  const db = await getDb();
  if (!db) return;

  const tags = extractHashtags(content);
  if (tags.length === 0) return;

  for (const tag of tags) {
    // Get or create hashtag
    const existing = await db.select().from(hashtags).where(eq(hashtags.tag, tag)).limit(1);
    
    let hashtagId: number;
    if (existing.length > 0) {
      hashtagId = existing[0]!.id;
      // Increment use count
      await db.update(hashtags)
        .set({ useCount: existing[0]!.useCount + 1 })
        .where(eq(hashtags.id, hashtagId));
    } else {
      // Create new hashtag
      const result = await db.insert(hashtags).values({ tag, useCount: 1 });
      hashtagId = Number(result[0].insertId);
    }

    // Link hashtag to post (ignore if already exists)
    try {
      await db.insert(postHashtags).values({ postId, hashtagId });
    } catch (error) {
      // Ignore duplicate key errors
    }
  }
}

/**
 * Get posts by hashtag
 */
export async function getPostsByHashtag(tag: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const normalizedTag = tag.toLowerCase();
  
  const result = await db
    .select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      communityId: posts.communityId,
      communityName: communities.name,
      likeCount: posts.likeCount,
      commentCount: posts.commentCount,
      shareCount: posts.shareCount,
      isEdited: posts.isEdited,
      editedAt: posts.editedAt,
    })
    .from(postHashtags)
    .innerJoin(hashtags, eq(postHashtags.hashtagId, hashtags.id))
    .innerJoin(posts, eq(postHashtags.postId, posts.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .innerJoin(communities, eq(posts.communityId, communities.id))
    .where(eq(hashtags.tag, normalizedTag))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result;
}

/**
 * Get trending hashtags (most used in last 7 days)
 */
export async function getTrendingHashtags(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select({
      id: hashtags.id,
      tag: hashtags.tag,
      useCount: hashtags.useCount,
      postCount: sql<number>`COUNT(DISTINCT ${postHashtags.postId})`.as('postCount'),
    })
    .from(hashtags)
    .leftJoin(postHashtags, eq(hashtags.id, postHashtags.hashtagId))
    .leftJoin(posts, and(
      eq(postHashtags.postId, posts.id),
      gte(posts.createdAt, sevenDaysAgo)
    ))
    .groupBy(hashtags.id, hashtags.tag, hashtags.useCount)
    .orderBy(desc(sql`postCount`))
    .limit(limit);

  return result;
}

/**
 * Community Promotions - manage promoted communities widget
 */

export async function addCommunityPromotion(communityId: number, promotedCommunityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already promoting
  const existing = await db
    .select()
    .from(communityPromotions)
    .where(and(
      eq(communityPromotions.communityId, communityId),
      eq(communityPromotions.promotedCommunityId, promotedCommunityId)
    ))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Community is already being promoted");
  }

  // Check limit of 6
  const count = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(communityPromotions)
    .where(eq(communityPromotions.communityId, communityId));

  if (count[0]?.count >= 6) {
    throw new Error("Maximum of 6 promoted communities reached");
  }

  await db.insert(communityPromotions).values({
    communityId,
    promotedCommunityId,
  });
}

export async function removeCommunityPromotion(communityId: number, promotedCommunityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(communityPromotions)
    .where(and(
      eq(communityPromotions.communityId, communityId),
      eq(communityPromotions.promotedCommunityId, promotedCommunityId)
    ));
}

export async function getPromotedCommunities(communityId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      imageUrl: communities.imageUrl,
      isPaid: communities.isPaid,
      price: communities.price,
      memberCount: communities.memberCount,
    })
    .from(communityPromotions)
    .innerJoin(communities, eq(communityPromotions.promotedCommunityId, communities.id))
    .where(eq(communityPromotions.communityId, communityId))
    .limit(6);

  return result;
}

export async function getPromotedCommunityIds(communityId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ promotedCommunityId: communityPromotions.promotedCommunityId })
    .from(communityPromotions)
    .where(eq(communityPromotions.communityId, communityId));

  return result.map(r => r.promotedCommunityId);
}

/**
 * Get recommended communities for a user based on their interactions
 */
export async function getRecommendedCommunities(userId: number, limit: number = 6) {
  const db = await getDb();
  if (!db) return [];

  // Get communities user is already a member of
  const userCommunityIds = (await db
    .select({ communityId: communityMembers.communityId })
    .from(communityMembers)
    .where(eq(communityMembers.userId, userId)))
    .map(r => r.communityId);

  // Get categories from user's communities
  const userCategories = userCommunityIds.length > 0
    ? (await db
        .select({ category: communities.category })
        .from(communities)
        .where(inArray(communities.id, userCommunityIds)))
        .map(r => r.category)
    : [];

  // Get communities from posts user liked
  const likedPostCommunities = (await db
    .select({ communityId: posts.communityId })
    .from(postLikes)
    .innerJoin(posts, eq(postLikes.postId, posts.id))
    .where(eq(postLikes.userId, userId))
    .limit(50))
    .map(r => r.communityId);

  // Get communities from posts user commented on
  const commentedPostCommunities = (await db
    .select({ communityId: posts.communityId })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .where(eq(comments.authorId, userId))
    .limit(50))
    .map(r => r.communityId);

  // Get communities from users that current user follows
  const followedUsersCommunities = (await db
    .select({ communityId: communityMembers.communityId })
    .from(userFollows)
    .innerJoin(communityMembers, eq(userFollows.followingId, communityMembers.userId))
    .where(eq(userFollows.followerId, userId))
    .limit(100))
    .map(r => r.communityId);

  // Combine all community IDs and calculate scores
  const communityScores = new Map<number, number>();

  // Score based on liked posts (weight: 2)
  likedPostCommunities.forEach(id => {
    if (!userCommunityIds.includes(id)) {
      communityScores.set(id, (communityScores.get(id) || 0) + 2);
    }
  });

  // Score based on commented posts (weight: 3)
  commentedPostCommunities.forEach(id => {
    if (!userCommunityIds.includes(id)) {
      communityScores.set(id, (communityScores.get(id) || 0) + 3);
    }
  });

  // Score based on followed users (weight: 1)
  followedUsersCommunities.forEach(id => {
    if (!userCommunityIds.includes(id)) {
      communityScores.set(id, (communityScores.get(id) || 0) + 1);
    }
  });

  // Get top scored communities
  const topCommunityIds = Array.from(communityScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit * 2) // Get more to filter by category
    .map(([id]) => id);

  if (topCommunityIds.length === 0) {
    // Fallback: return popular communities if no interactions yet
    return await db
      .select()
      .from(communities)
      .where(notInArray(communities.id, userCommunityIds.length > 0 ? userCommunityIds : [0]))
      .orderBy(desc(communities.memberCount))
      .limit(limit);
  }

  // Get full community data
  const recommendedCommunities = await db
    .select()
    .from(communities)
    .where(inArray(communities.id, topCommunityIds));

  // Boost communities with matching categories
  const scoredCommunities = recommendedCommunities.map(community => {
    let score = communityScores.get(community.id) || 0;
    
    // Boost if category matches user's communities
    if (userCategories.includes(community.category)) {
      score += 5;
    }
    
    // Boost by member count (popularity)
    score += Math.log10(community.memberCount + 1) * 0.5;
    
    return { ...community, score };
  });

  // Sort by final score and return top N
  return scoredCommunities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Create a mention
 */
export async function createMention(data: InsertMention) {
  const db = await getDb();
  await db!.insert(mentions).values(data);
}

/**
 * Get mentions for a post
 */
export async function getPostMentions(postId: number) {
  const db = await getDb();
  return await db!
    .select()
    .from(mentions)
    .where(eq(mentions.postId, postId));
}

/**
 * Get mentions for a comment
 */
export async function getCommentMentions(commentId: number) {
  const db = await getDb();
  return await db!
    .select()
    .from(mentions)
    .where(eq(mentions.commentId, commentId));
}

/**
 * Get user mentions (notifications)
 */
export async function getUserMentions(userId: number, limit: number = 20) {
  const db = await getDb();
  return await db!
    .select({
      id: mentions.id,
      postId: mentions.postId,
      commentId: mentions.commentId,
      mentionedBy: mentions.mentionedBy,
      createdAt: mentions.createdAt,
      mentionerName: users.name,
      mentionerAvatar: users.avatarUrl,
    })
    .from(mentions)
    .leftJoin(users, eq(mentions.mentionedBy, users.id))
    .where(eq(mentions.mentionedUserId, userId))
    .orderBy(desc(mentions.createdAt))
    .limit(limit);
}

/**
 * Get community statistics for dashboard
 */
export async function getCommunityStats(communityId: number, days: number = 30) {
  const db = await getDb();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // New members per day
  const newMembersData = await db!
    .select({
      date: sql<string>`DATE(${communityMembers.joinedAt})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.communityId, communityId),
        gte(communityMembers.joinedAt, startDate)
      )
    )
    .groupBy(sql`DATE(${communityMembers.joinedAt})`)
    .orderBy(sql`DATE(${communityMembers.joinedAt})`);

  // Posts per week
  const postsData = await db!
    .select({
      week: sql<string>`YEARWEEK(${posts.createdAt})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(posts)
    .where(
      and(
        eq(posts.communityId, communityId),
        gte(posts.createdAt, startDate)
      )
    )
    .groupBy(sql`YEARWEEK(${posts.createdAt})`)
    .orderBy(sql`YEARWEEK(${posts.createdAt})`);

  // Average engagement (likes + comments per post)
  const engagementData = await db!
    .select({
      avgLikes: sql<number>`AVG(${posts.likeCount})`,
      avgComments: sql<number>`AVG(${posts.commentCount})`,
      totalPosts: sql<number>`COUNT(*)`,
    })
    .from(posts)
    .where(
      and(
        eq(posts.communityId, communityId),
        gte(posts.createdAt, startDate)
      )
    );

  return {
    newMembersPerDay: newMembersData,
    postsPerWeek: postsData,
    engagement: engagementData[0] || { avgLikes: 0, avgComments: 0, totalPosts: 0 },
  };
}

/**
 * Search hashtags by prefix for autocomplete
 */
export async function searchHashtags(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = query.replace(/^#/, '').toLowerCase();
  if (!searchTerm) return [];

  const result = await db
    .select({
      id: hashtags.id,
      tag: hashtags.tag,
      useCount: hashtags.useCount,
    })
    .from(hashtags)
    .where(like(hashtags.tag, `${searchTerm}%`))
    .orderBy(desc(hashtags.useCount))
    .limit(limit);

  return result;
}

/**
 * Follow a hashtag
 */
export async function followHashtag(userId: number, hashtagId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(userHashtagFollows).values({ userId, hashtagId });
    return true;
  } catch (error) {
    // Already following
    return false;
  }
}

/**
 * Unfollow a hashtag
 */
export async function unfollowHashtag(userId: number, hashtagId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(userHashtagFollows)
    .where(and(
      eq(userHashtagFollows.userId, userId),
      eq(userHashtagFollows.hashtagId, hashtagId)
    ));
  return true;
}

/**
 * Check if user follows a hashtag
 */
export async function isFollowingHashtag(userId: number, hashtagId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ id: userHashtagFollows.id })
    .from(userHashtagFollows)
    .where(and(
      eq(userHashtagFollows.userId, userId),
      eq(userHashtagFollows.hashtagId, hashtagId)
    ))
    .limit(1);

  return result.length > 0;
}

/**
 * Get hashtags followed by user
 */
export async function getUserFollowedHashtags(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: hashtags.id,
      tag: hashtags.tag,
      useCount: hashtags.useCount,
      followedAt: userHashtagFollows.createdAt,
    })
    .from(userHashtagFollows)
    .innerJoin(hashtags, eq(userHashtagFollows.hashtagId, hashtags.id))
    .where(eq(userHashtagFollows.userId, userId))
    .orderBy(desc(userHashtagFollows.createdAt));

  return result;
}

/**
 * Get hashtag by tag name
 */
export async function getHashtagByTag(tag: string) {
  const db = await getDb();
  if (!db) return null;

  const normalizedTag = tag.toLowerCase().replace(/^#/, '');
  const result = await db
    .select()
    .from(hashtags)
    .where(eq(hashtags.tag, normalizedTag))
    .limit(1);

  return result[0] || null;
}

/**
 * Get hashtag followers count
 */
export async function getHashtagFollowersCount(hashtagId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userHashtagFollows)
    .where(eq(userHashtagFollows.hashtagId, hashtagId));

  return result[0]?.count || 0;
}

// PAYMENT OPERATIONS

/**
 * Create a payment record
 */
export async function createPayment(payment: {
  userId: number;
  communityId: number;
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripeSessionId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeInvoiceId?: string | null;
  stripeInvoiceUrl?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(payments).values({
    userId: payment.userId,
    communityId: payment.communityId,
    amount: payment.amount,
    currency: payment.currency || 'BRL',
    status: payment.status,
    stripeSessionId: payment.stripeSessionId,
    stripeSubscriptionId: payment.stripeSubscriptionId,
    stripeInvoiceId: payment.stripeInvoiceId,
    stripeInvoiceUrl: payment.stripeInvoiceUrl,
    periodStart: payment.periodStart,
    periodEnd: payment.periodEnd,
  });

  return result[0].insertId;
}

/**
 * Get payments for a user
 */
export async function getUserPayments(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      stripeInvoiceUrl: payments.stripeInvoiceUrl,
      periodStart: payments.periodStart,
      periodEnd: payments.periodEnd,
      createdAt: payments.createdAt,
      communityId: payments.communityId,
      communityName: communities.name,
      communityImage: communities.imageUrl,
    })
    .from(payments)
    .leftJoin(communities, eq(payments.communityId, communities.id))
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);

  return result;
}

/**
 * Get revenue stats for a community
 */
export async function getCommunityRevenueStats(communityId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Total revenue
  const totalResult = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed')
    ));

  // This month revenue
  const monthResult = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed'),
      sql`${payments.createdAt} >= ${startOfMonth}`
    ));

  // Last month revenue
  const lastMonthResult = await db
    .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed'),
      sql`${payments.createdAt} >= ${startOfLastMonth}`,
      sql`${payments.createdAt} < ${startOfMonth}`
    ));

  // Active subscribers count
  const subscribersResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT userId)` })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed'),
      sql`${payments.createdAt} >= ${startOfMonth}`
    ));

  // Payment count
  const paymentCountResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed')
    ));

  return {
    totalRevenue: totalResult[0]?.total || 0,
    monthlyRevenue: monthResult[0]?.total || 0,
    lastMonthRevenue: lastMonthResult[0]?.total || 0,
    activeSubscribers: subscribersResult[0]?.count || 0,
    totalPayments: paymentCountResult[0]?.count || 0,
  };
}

/**
 * Get revenue by month for a community (last 12 months)
 */
export async function getCommunityRevenueByMonth(communityId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      month: sql<string>`DATE_FORMAT(${payments.createdAt}, '%Y-%m')`,
      revenue: sql<number>`COALESCE(SUM(amount), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payments)
    .where(and(
      eq(payments.communityId, communityId),
      eq(payments.status, 'completed'),
      sql`${payments.createdAt} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`
    ))
    .groupBy(sql`DATE_FORMAT(${payments.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${payments.createdAt}, '%Y-%m')`);

  return result;
}

/**
 * Get recent payments for a community
 */
export async function getCommunityPayments(communityId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      createdAt: payments.createdAt,
      userId: payments.userId,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(payments)
    .leftJoin(users, eq(payments.userId, users.id))
    .where(eq(payments.communityId, communityId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);

  return result;
}

// SUBSCRIPTION PLAN OPERATIONS

/**
 * Create a subscription plan
 */
export async function createSubscriptionPlan(plan: {
  communityId: number;
  name: string;
  description?: string;
  interval: 'monthly' | 'yearly' | 'lifetime';
  price: number;
  originalPrice?: number;
  features?: string[];
  stripePriceId?: string;
  isDefault?: boolean;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(subscriptionPlans).values({
    communityId: plan.communityId,
    name: plan.name,
    description: plan.description,
    interval: plan.interval,
    price: plan.price,
    originalPrice: plan.originalPrice,
    features: plan.features ? JSON.stringify(plan.features) : null,
    stripePriceId: plan.stripePriceId,
    isDefault: plan.isDefault || false,
    sortOrder: plan.sortOrder || 0,
  });

  return result[0].insertId;
}

/**
 * Get subscription plans for a community
 */
export async function getCommunityPlans(communityId: number, activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(subscriptionPlans.communityId, communityId)];
  if (activeOnly) {
    conditions.push(eq(subscriptionPlans.isActive, true));
  }

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(and(...conditions))
    .orderBy(subscriptionPlans.sortOrder, subscriptionPlans.price);

  return result.map(plan => ({
    ...plan,
    features: plan.features ? JSON.parse(plan.features) : [],
  }));
}

/**
 * Get a subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0],
    features: result[0].features ? JSON.parse(result[0].features) : [],
  };
}

/**
 * Update a subscription plan
 */
export async function updateSubscriptionPlan(planId: number, data: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  features?: string[];
  stripePriceId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) return false;

  const updateData: any = { ...data };
  if (data.features) {
    updateData.features = JSON.stringify(data.features);
  }

  await db
    .update(subscriptionPlans)
    .set(updateData)
    .where(eq(subscriptionPlans.id, planId));

  return true;
}

/**
 * Delete a subscription plan
 */
export async function deleteSubscriptionPlan(planId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .delete(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));

  return true;
}

/**
 * Create default plans for a community
 */
export async function createDefaultPlans(communityId: number, basePrice: number) {
  const db = await getDb();
  if (!db) return false;

  // Monthly plan
  await createSubscriptionPlan({
    communityId,
    name: 'Mensal',
    description: 'Acesso mensal à comunidade',
    interval: 'monthly',
    price: basePrice,
    features: ['Acesso completo ao conteúdo', 'Participação em discussões', 'Suporte da comunidade'],
    isDefault: true,
    sortOrder: 1,
  });

  // Yearly plan (2 months free)
  const yearlyPrice = basePrice * 10; // 10 months instead of 12
  await createSubscriptionPlan({
    communityId,
    name: 'Anual',
    description: 'Economize 2 meses com o plano anual',
    interval: 'yearly',
    price: yearlyPrice,
    originalPrice: basePrice * 12,
    features: ['Tudo do plano mensal', '2 meses grátis', 'Acesso prioritário a novidades'],
    sortOrder: 2,
  });

  // Lifetime plan (24 months price)
  const lifetimePrice = basePrice * 24;
  await createSubscriptionPlan({
    communityId,
    name: 'Vitalício',
    description: 'Pague uma vez, acesse para sempre',
    interval: 'lifetime',
    price: lifetimePrice,
    originalPrice: basePrice * 36,
    features: ['Tudo do plano anual', 'Acesso vitalicio', 'Badge exclusivo de fundador'],
    sortOrder: 3,
  });

  return true;
}

// MODERATION OPERATIONS
