import { getDb } from './db';
import { reports, moderationLogs, posts, comments, users } from '../drizzle/schema';
import type { InsertReport, InsertModerationLog } from '../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(reports).values(data);
  return result.insertId;
}

export async function getPendingReports() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: reports.id,
      reportType: reports.reportType,
      targetId: reports.targetId,
      reporterId: reports.reporterId,
      reporterName: users.name,
      reason: reports.reason,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .where(eq(reports.status, "pending"))
    .orderBy(desc(reports.createdAt));
}

export async function getAllReports(status?: "pending" | "reviewed" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) return [];

  const query = db
    .select({
      id: reports.id,
      reportType: reports.reportType,
      targetId: reports.targetId,
      reporterId: reports.reporterId,
      reporterName: users.name,
      reason: reports.reason,
      status: reports.status,
      reviewedBy: reports.reviewedBy,
      reviewerName: users.name,
      reviewNotes: reports.reviewNotes,
      createdAt: reports.createdAt,
      reviewedAt: reports.reviewedAt,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id));

  if (status) {
    return query.where(eq(reports.status, status)).orderBy(desc(reports.createdAt));
  }

  return query.orderBy(desc(reports.createdAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function resolveReport(
  reportId: number,
  reviewedBy: number,
  status: "reviewed" | "resolved" | "dismissed",
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(reports)
    .set({
      status,
      reviewedBy,
      reviewNotes,
      reviewedAt: new Date(),
    })
    .where(eq(reports.id, reportId));
}

export async function createModerationLog(data: InsertModerationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(moderationLogs).values(data);
}

export async function getModerationLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: moderationLogs.id,
      moderatorId: moderationLogs.moderatorId,
      moderatorName: users.name,
      action: moderationLogs.action,
      targetUserId: moderationLogs.targetUserId,
      postId: moderationLogs.postId,
      commentId: moderationLogs.commentId,
      reportId: moderationLogs.reportId,
      reason: moderationLogs.reason,
      createdAt: moderationLogs.createdAt,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.moderatorId, users.id))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(limit);
}

export async function removePostAsModerator(postId: number, moderatorId: number, reason: string, reportId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get post author before deletion
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (post.length === 0) {
    throw new Error("Post not found");
  }

  // Delete post
  await db.delete(posts).where(eq(posts.id, postId));

  // Create moderation log
  await createModerationLog({
    moderatorId,
    action: "remove_post",
    targetUserId: post[0].authorId,
    postId,
    reportId,
    reason,
  });
}

export async function removeCommentAsModerator(commentId: number, moderatorId: number, reason: string, reportId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get comment author before deletion
  const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (comment.length === 0) {
    throw new Error("Comment not found");
  }

  // Delete comment
  await db.delete(comments).where(eq(comments.id, commentId));

  // Create moderation log
  await createModerationLog({
    moderatorId,
    action: "remove_comment",
    targetUserId: comment[0].authorId,
    commentId,
    reportId,
    reason,
  });
}

export async function banUserAsModerator(
  userId: number,
  moderatorId: number,
  reason: string,
  until?: Date,
  reportId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Ban user
  await db
    .update(users)
    .set({
      isBanned: true,
      bannedUntil: until || null,
      banReason: reason,
    })
    .where(eq(users.id, userId));

  // Create moderation log
  await createModerationLog({
    moderatorId,
    action: "ban_user",
    targetUserId: userId,
    reportId,
    reason: until ? `${reason} (until ${until.toISOString()})` : reason,
  });
}

export async function unbanUserAsModerator(userId: number, moderatorId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Unban user
  await db
    .update(users)
    .set({
      isBanned: false,
      bannedUntil: null,
      banReason: null,
    })
    .where(eq(users.id, userId));

  // Create moderation log
  await createModerationLog({
    moderatorId,
    action: "unban_user",
    targetUserId: userId,
    reason,
  });
}
