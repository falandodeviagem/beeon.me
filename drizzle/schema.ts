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
  
  // Onboarding
  hasCompletedOnboarding: boolean("hasCompletedOnboarding").default(false).notNull(),
  
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
  
  // Category
  category: mysqlEnum("category", [
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
  ]).default("outros").notNull(),
  
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
  shareCount: int("shareCount").default(0).notNull(),
  
  // Edit tracking
  isEdited: boolean("isEdited").default(false).notNull(),
  editedAt: timestamp("editedAt"),
  
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
  
  // Edit tracking
  isEdited: boolean("isEdited").default(false).notNull(),
  editedAt: timestamp("editedAt"),
  
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

/**
 * Notifications - user notifications for various events
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Notification content
  type: mysqlEnum("type", ["like", "comment", "badge", "follow", "mention", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Related entities
  relatedId: int("relatedId"), // ID of post, comment, user, etc.
  relatedType: varchar("relatedType", { length: 50 }), // "post", "comment", "user", etc.
  
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  isReadIdx: index("is_read_idx").on(table.isRead),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Post Reactions - diverse reactions beyond simple likes
 */
export const postReactions = mysqlTable("post_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  reactionType: mysqlEnum("reactionType", ["love", "like", "laugh", "wow", "sad", "angry"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postUserIdx: unique("post_user_idx").on(table.postId, table.userId),
  postIdx: index("post_idx").on(table.postId),
  userIdx: index("user_idx").on(table.userId),
}));

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * User Follows - system for following other users
 */
export const userFollows = mysqlTable("user_follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(), // User who follows
  followingId: int("followingId").notNull(), // User being followed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerFollowingIdx: unique("follower_following_idx").on(table.followerId, table.followingId),
  followerIdx: index("follower_idx").on(table.followerId),
  followingIdx: index("following_idx").on(table.followingId),
}));

export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = typeof userFollows.$inferInsert;

/**
 * Conversations - private chat conversations between users
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  user1Idx: index("user1_idx").on(table.user1Id),
  user2Idx: index("user2_idx").on(table.user2Id),
  user1User2Idx: unique("user1_user2_idx").on(table.user1Id, table.user2Id),
}));

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  senderIdx: index("sender_idx").on(table.senderId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Hashtags - unique hashtags used in posts
 */
export const hashtags = mysqlTable("hashtags", {
  id: int("id").autoincrement().primaryKey(),
  tag: varchar("tag", { length: 100 }).notNull().unique(),
  useCount: int("useCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  tagIdx: index("tag_idx").on(table.tag),
  useCountIdx: index("use_count_idx").on(table.useCount),
}));

export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = typeof hashtags.$inferInsert;

/**
 * Post Hashtags - relationship between posts and hashtags
 */
export const postHashtags = mysqlTable("post_hashtags", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  hashtagId: int("hashtagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postHashtagIdx: unique("post_hashtag_idx").on(table.postId, table.hashtagId),
  postIdx: index("post_idx").on(table.postId),
  hashtagIdx: index("hashtag_idx").on(table.hashtagId),
}));

export type PostHashtag = typeof postHashtags.$inferSelect;
export type InsertPostHashtag = typeof postHashtags.$inferInsert;

/**
 * Community Promotions - communities promoted in other communities (max 6)
 */
export const communityPromotions = mysqlTable("community_promotions", {
  id: int("id").autoincrement().primaryKey(),
  communityId: int("communityId").notNull(), // Community where promotion appears
  promotedCommunityId: int("promotedCommunityId").notNull(), // Community being promoted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  communityPromotedIdx: unique("community_promoted_idx").on(table.communityId, table.promotedCommunityId),
  communityIdx: index("community_idx").on(table.communityId),
}));

export type CommunityPromotion = typeof communityPromotions.$inferSelect;
export type InsertCommunityPromotion = typeof communityPromotions.$inferInsert;

/**
 * Mentions - tracks user mentions in posts and comments
 */
export const mentions = mysqlTable("mentions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId"),
  commentId: int("commentId"),
  mentionedUserId: int("mentionedUserId").notNull(),
  mentionedBy: int("mentionedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  mentionedUserIdx: index("mentioned_user_idx").on(table.mentionedUserId),
  postIdx: index("post_idx").on(table.postId),
  commentIdx: index("comment_idx").on(table.commentId),
}));

export type Mention = typeof mentions.$inferSelect;
export type InsertMention = typeof mentions.$inferInsert;

/**
 * Moderation Logs - history of moderation actions
 */
export const moderationLogs = mysqlTable("moderation_logs", {
  id: int("id").autoincrement().primaryKey(),
  moderatorId: int("moderatorId").notNull(),
  action: mysqlEnum("action", ["remove_post", "remove_comment", "ban_user", "unban_user", "resolve_report"]).notNull(),
  targetUserId: int("targetUserId"),
  postId: int("postId"),
  commentId: int("commentId"),
  reportId: int("reportId"),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  moderatorIdx: index("moderator_idx").on(table.moderatorId),
  targetUserIdx: index("target_user_idx").on(table.targetUserId),
  actionIdx: index("action_idx").on(table.action),
}));

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;

/**
 * User Warnings - strike system for moderation
 */
export const userWarnings = mysqlTable("user_warnings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  moderatorId: int("moderatorId").notNull(),
  level: mysqlEnum("level", ["warning_1", "warning_2", "temp_ban", "perm_ban"]).notNull(),
  reason: text("reason").notNull(),
  reportId: int("reportId"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("warning_user_idx").on(table.userId),
  moderatorIdx: index("warning_moderator_idx").on(table.moderatorId),
  levelIdx: index("warning_level_idx").on(table.level),
  activeIdx: index("warning_active_idx").on(table.isActive),
}));

export type UserWarning = typeof userWarnings.$inferSelect;
export type InsertUserWarning = typeof userWarnings.$inferInsert;


/**
 * Ban Appeals - allows banned users to request review
 */
export const banAppeals = mysqlTable("ban_appeals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Appeal content
  reason: text("reason").notNull(),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Admin response
  adminId: int("adminId"),
  adminResponse: text("adminResponse"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
}, (table) => ({
  userIdx: index("appeal_user_idx").on(table.userId),
  statusIdx: index("appeal_status_idx").on(table.status),
}));

export type BanAppeal = typeof banAppeals.$inferSelect;
export type InsertBanAppeal = typeof banAppeals.$inferInsert;

/**
 * Audit Logs - detailed logging of all administrative actions
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Action details
  action: varchar("action", { length: 100 }).notNull(), // e.g., "ban_user", "edit_community", "delete_post"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "user", "community", "post", "comment"
  entityId: int("entityId").notNull(),
  
  // Who performed the action
  userId: int("userId").notNull(),
  
  // Additional details (JSON string)
  details: text("details"),
  
  // IP address for security
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  actionIdx: index("audit_action_idx").on(table.action),
  entityTypeIdx: index("audit_entity_type_idx").on(table.entityType),
  userIdx: index("audit_user_idx").on(table.userId),
  createdAtIdx: index("audit_created_at_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;


/**
 * Response Templates - pre-defined responses for moderation
 */
export const responseTemplates = mysqlTable("response_templates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Template content
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  // Category for organization
  category: mysqlEnum("category", ["appeal_approve", "appeal_reject", "report_resolve", "report_dismiss", "warning", "ban"]).notNull(),
  
  // Who created it
  createdBy: int("createdBy").notNull(),
  
  // Usage count for popularity sorting
  useCount: int("useCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("template_category_idx").on(table.category),
  createdByIdx: index("template_created_by_idx").on(table.createdBy),
}));

export type ResponseTemplate = typeof responseTemplates.$inferSelect;
export type InsertResponseTemplate = typeof responseTemplates.$inferInsert;


/**
 * User Hashtag Follows - users following hashtags
 */
export const userHashtagFollows = mysqlTable("user_hashtag_follows", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  hashtagId: int("hashtagId").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("hashtag_follow_user_idx").on(table.userId),
  hashtagIdx: index("hashtag_follow_hashtag_idx").on(table.hashtagId),
  uniqueFollow: unique("unique_hashtag_follow").on(table.userId, table.hashtagId),
}));

export type UserHashtagFollow = typeof userHashtagFollows.$inferSelect;
export type InsertUserHashtagFollow = typeof userHashtagFollows.$inferInsert;


/**
 * Payments - subscription payments for paid communities
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  
  // Who paid
  userId: int("userId").notNull(),
  
  // Which community
  communityId: int("communityId").notNull(),
  
  // Payment details
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  // Stripe references
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  stripeInvoiceUrl: text("stripeInvoiceUrl"),
  
  // Subscription period
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("payment_user_idx").on(table.userId),
  communityIdx: index("payment_community_idx").on(table.communityId),
  statusIdx: index("payment_status_idx").on(table.status),
  createdAtIdx: index("payment_created_at_idx").on(table.createdAt),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
