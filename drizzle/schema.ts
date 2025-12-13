import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Profile fields
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  
  // Gamification
  points: int("points").default(0).notNull(),
  level: int("level").default(1).notNull(),
  
  // Invite system
  inviteCode: varchar("inviteCode", { length: 16 }).unique(),
  invitedBy: int("invitedBy"),
  
  // Moderation
  isBanned: boolean("isBanned").default(false).notNull(),
  bannedUntil: timestamp("bannedUntil"),
  banReason: text("banReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  inviteCodeIdx: index("invite_code_idx").on(table.inviteCode),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Communities table - public and paid communities
 */
export const communities = mysqlTable("communities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  
  // Community type
  isPaid: boolean("isPaid").default(false).notNull(),
  price: int("price").default(0).notNull(), // Price in cents
  
  // Stripe integration
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  
  // Owner
  ownerId: int("ownerId").notNull(),
  
  // Stats
  memberCount: int("memberCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;

/**
 * Community members - tracks who belongs to which community
 */
export const communityMembers = mysqlTable("community_members", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(),
  userId: int("userId").notNull(),
  
  // Subscription info for paid communities
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "unpaid"]),
  
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  communityUserIdx: unique("community_user_idx").on(table.communityId, table.userId),
  userIdx: index("user_idx").on(table.userId),
}));

export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = typeof communityMembers.$inferInsert;

/**
 * Posts table
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  
  authorId: int("authorId").notNull(),
  communityId: int("communityId").notNull(),
  
  // Stats
  likeCount: int("likeCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("author_idx").on(table.authorId),
  communityIdx: index("community_idx").on(table.communityId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Post likes
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postUserIdx: unique("post_user_idx").on(table.postId, table.userId),
  userIdx: index("user_idx").on(table.userId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Comments table - supports nested comments
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  
  postId: int("postId").notNull(),
  authorId: int("authorId").notNull(),
  
  // For nested comments
  parentId: int("parentId"),
  
  // Stats
  likeCount: int("likeCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  postIdx: index("post_idx").on(table.postId),
  authorIdx: index("author_idx").on(table.authorId),
  parentIdx: index("parent_idx").on(table.parentId),
}));

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Comment likes
 */
export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  commentUserIdx: unique("comment_user_idx").on(table.commentId, table.userId),
  userIdx: index("user_idx").on(table.userId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

/**
 * Badges - achievements users can unlock
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  
  // Requirements
  requiredPoints: int("requiredPoints"),
  requiredLevel: int("requiredLevel"),
  requiredAction: varchar("requiredAction", { length: 100 }), // e.g., "create_10_posts"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badges - tracks which badges users have earned
 */
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
}, (table) => ({
  userBadgeIdx: unique("user_badge_idx").on(table.userId, table.badgeId),
  userIdx: index("user_idx").on(table.userId),
}));

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Reports - moderation system for reporting content
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  
  // What is being reported
  reportType: mysqlEnum("reportType", ["post", "comment", "user"]).notNull(),
  targetId: int("targetId").notNull(), // ID of post, comment, or user
  
  // Who reported and why
  reporterId: int("reporterId").notNull(),
  reason: text("reason").notNull(),
  
  // Moderation status
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewNotes: text("reviewNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  reporterIdx: index("reporter_idx").on(table.reporterId),
  targetIdx: index("target_idx").on(table.reportType, table.targetId),
}));

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Gamification actions - tracks point-earning actions
 */
export const gamificationActions = mysqlTable("gamification_actions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  actionType: varchar("actionType", { length: 100 }).notNull(), // e.g., "create_post", "like_post", "invite_user"
  points: int("points").notNull(),
  relatedId: int("relatedId"), // ID of related entity (post, comment, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type GamificationAction = typeof gamificationActions.$inferSelect;
export type InsertGamificationAction = typeof gamificationActions.$inferInsert;
