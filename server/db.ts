import { eq, and, desc, sql, inArray, isNull, like, or, lt } from "drizzle-orm";
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
  gamificationActions, InsertGamificationAction
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
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

  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
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

export async function getFeedPosts(communityIds: number[], limit: number = 50, cursor?: number) {
  const db = await getDb();
  if (!db) return [];

  if (communityIds.length === 0) return [];

  const conditions = [inArray(posts.communityId, communityIds)];
  
  if (cursor) {
    conditions.push(lt(posts.id, cursor));
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
    .orderBy(desc(posts.id))
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

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(comments).values(data);
  await incrementPostComments(data.postId);
  return result[0].insertId;
}

export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(comments)
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

export async function updateComment(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(comments).set({ content }).where(eq(comments.id, id));
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
