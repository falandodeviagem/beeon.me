import { getDb } from './db';
import { reports, moderationLogs, posts, comments, users } from '../drizzle/schema';
import type { InsertReport, InsertModerationLog } from '../drizzle/schema';
import { eq, desc, and, sql, gte, isNotNull } from 'drizzle-orm';

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

// MODERATION STATISTICS

export async function getModerationStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get total reports
  const totalReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports);

  // Get pending reports
  const pendingReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(eq(reports.status, 'pending'));

  // Get resolved reports
  const resolvedReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(eq(reports.status, 'resolved'));

  // Get dismissed reports
  const dismissedReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(eq(reports.status, 'dismissed'));

  // Get reports by type
  const reportsByType = await db
    .select({
      type: reports.reportType,
      count: sql<number>`count(*)`,
    })
    .from(reports)
    .groupBy(reports.reportType);

  // Get reports per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const reportsPerDay = await db
    .select({
      date: sql<string>`DATE(${reports.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(reports)
    .where(gte(reports.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${reports.createdAt})`)
    .orderBy(sql`DATE(${reports.createdAt})`);

  // Get average resolution time (in hours)
  const avgResolutionTime = await db
    .select({
      avgHours: sql<number>`AVG(TIMESTAMPDIFF(HOUR, ${reports.createdAt}, ${reports.reviewedAt}))`,
    })
    .from(reports)
    .where(isNotNull(reports.reviewedAt));

  // Get top moderators
  const topModerators = await db
    .select({
      moderatorId: reports.reviewedBy,
      moderatorName: users.name,
      count: sql<number>`count(*)`,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reviewedBy, users.id))
    .where(isNotNull(reports.reviewedBy))
    .groupBy(reports.reviewedBy, users.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return {
    total: totalReports[0]?.count || 0,
    pending: pendingReports[0]?.count || 0,
    resolved: resolvedReports[0]?.count || 0,
    dismissed: dismissedReports[0]?.count || 0,
    byType: reportsByType,
    perDay: reportsPerDay,
    avgResolutionHours: avgResolutionTime[0]?.avgHours || 0,
    topModerators,
  };
}


// USER WARNINGS SYSTEM

export async function createWarning(data: {
  userId: number;
  moderatorId: number;
  level: "warning_1" | "warning_2" | "temp_ban" | "perm_ban";
  reason: string;
  reportId?: number;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userWarnings } = await import('../drizzle/schema');
  
  const [result] = await db.insert(userWarnings).values({
    userId: data.userId,
    moderatorId: data.moderatorId,
    level: data.level,
    reason: data.reason,
    reportId: data.reportId,
    expiresAt: data.expiresAt,
    isActive: true,
  });

  // Create moderation log
  await createModerationLog({
    moderatorId: data.moderatorId,
    action: data.level === "temp_ban" || data.level === "perm_ban" ? "ban_user" : "resolve_report",
    targetUserId: data.userId,
    reportId: data.reportId,
    reason: `${data.level}: ${data.reason}`,
  });

  return result.insertId;
}

export async function getUserWarnings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const { userWarnings } = await import('../drizzle/schema');

  return db
    .select({
      id: userWarnings.id,
      userId: userWarnings.userId,
      moderatorId: userWarnings.moderatorId,
      moderatorName: users.name,
      level: userWarnings.level,
      reason: userWarnings.reason,
      reportId: userWarnings.reportId,
      expiresAt: userWarnings.expiresAt,
      isActive: userWarnings.isActive,
      createdAt: userWarnings.createdAt,
    })
    .from(userWarnings)
    .leftJoin(users, eq(userWarnings.moderatorId, users.id))
    .where(eq(userWarnings.userId, userId))
    .orderBy(desc(userWarnings.createdAt));
}

export async function getActiveWarningsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const { userWarnings } = await import('../drizzle/schema');

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(userWarnings)
    .where(and(
      eq(userWarnings.userId, userId),
      eq(userWarnings.isActive, true)
    ));

  return result[0]?.count || 0;
}

export async function getNextWarningLevel(userId: number): Promise<"warning_1" | "warning_2" | "temp_ban" | "perm_ban"> {
  const db = await getDb();
  if (!db) return "warning_1";

  const { userWarnings } = await import('../drizzle/schema');

  // Get all active warnings for this user
  const activeWarnings = await db
    .select({ level: userWarnings.level })
    .from(userWarnings)
    .where(and(
      eq(userWarnings.userId, userId),
      eq(userWarnings.isActive, true)
    ))
    .orderBy(desc(userWarnings.createdAt));

  if (activeWarnings.length === 0) return "warning_1";

  const lastLevel = activeWarnings[0].level;

  // Escalation logic
  switch (lastLevel) {
    case "warning_1":
      return "warning_2";
    case "warning_2":
      return "temp_ban";
    case "temp_ban":
      return "perm_ban";
    case "perm_ban":
      return "perm_ban"; // Already at max
    default:
      return "warning_1";
  }
}

export async function issueWarningWithEscalation(
  userId: number,
  moderatorId: number,
  reason: string,
  reportId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get next warning level based on history
  const level = await getNextWarningLevel(userId);

  // Calculate expiration for temp ban (7 days)
  let expiresAt: Date | undefined;
  if (level === "temp_ban") {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  // Create the warning
  const warningId = await createWarning({
    userId,
    moderatorId,
    level,
    reason,
    reportId,
    expiresAt,
  });

  // If temp_ban or perm_ban, also ban the user
  if (level === "temp_ban" || level === "perm_ban") {
    await banUserAsModerator(
      userId,
      moderatorId,
      reason,
      expiresAt,
      reportId
    );
  }

  return { warningId, level, expiresAt };
}

export async function deactivateWarning(warningId: number, moderatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { userWarnings } = await import('../drizzle/schema');

  await db
    .update(userWarnings)
    .set({ isActive: false })
    .where(eq(userWarnings.id, warningId));

  await createModerationLog({
    moderatorId,
    action: "resolve_report",
    reason: `Warning #${warningId} deactivated`,
  });
}


// BAN APPEALS SYSTEM

export async function createBanAppeal(userId: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { banAppeals } = await import('../drizzle/schema');

  // Check if user already has a pending appeal
  const existingAppeal = await db
    .select()
    .from(banAppeals)
    .where(and(
      eq(banAppeals.userId, userId),
      eq(banAppeals.status, 'pending')
    ))
    .limit(1);

  if (existingAppeal.length > 0) {
    throw new Error("Você já tem uma apelação pendente");
  }

  const [result] = await db.insert(banAppeals).values({
    userId,
    reason,
    status: 'pending',
  });

  return result.insertId;
}

export async function getPendingAppeals() {
  const db = await getDb();
  if (!db) return [];

  const { banAppeals } = await import('../drizzle/schema');

  return db
    .select({
      id: banAppeals.id,
      userId: banAppeals.userId,
      userName: users.name,
      userEmail: users.email,
      banReason: users.banReason,
      reason: banAppeals.reason,
      status: banAppeals.status,
      createdAt: banAppeals.createdAt,
    })
    .from(banAppeals)
    .leftJoin(users, eq(banAppeals.userId, users.id))
    .where(eq(banAppeals.status, 'pending'))
    .orderBy(desc(banAppeals.createdAt));
}

export async function getAllAppeals(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];

  const { banAppeals } = await import('../drizzle/schema');
  const adminUsers = users;

  const baseQuery = db
    .select({
      id: banAppeals.id,
      userId: banAppeals.userId,
      userName: users.name,
      userEmail: users.email,
      banReason: users.banReason,
      reason: banAppeals.reason,
      status: banAppeals.status,
      adminId: banAppeals.adminId,
      adminResponse: banAppeals.adminResponse,
      createdAt: banAppeals.createdAt,
      resolvedAt: banAppeals.resolvedAt,
    })
    .from(banAppeals)
    .leftJoin(users, eq(banAppeals.userId, users.id));

  if (status) {
    return baseQuery
      .where(eq(banAppeals.status, status))
      .orderBy(desc(banAppeals.createdAt));
  }

  return baseQuery.orderBy(desc(banAppeals.createdAt));
}

export async function getUserAppeal(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const { banAppeals } = await import('../drizzle/schema');

  const result = await db
    .select({
      id: banAppeals.id,
      reason: banAppeals.reason,
      status: banAppeals.status,
      adminResponse: banAppeals.adminResponse,
      createdAt: banAppeals.createdAt,
      resolvedAt: banAppeals.resolvedAt,
    })
    .from(banAppeals)
    .where(eq(banAppeals.userId, userId))
    .orderBy(desc(banAppeals.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function resolveAppeal(
  appealId: number,
  adminId: number,
  status: "approved" | "rejected",
  adminResponse: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { banAppeals } = await import('../drizzle/schema');

  // Get the appeal to find the user
  const appeal = await db
    .select()
    .from(banAppeals)
    .where(eq(banAppeals.id, appealId))
    .limit(1);

  if (appeal.length === 0) {
    throw new Error("Apelação não encontrada");
  }

  // Update appeal
  await db
    .update(banAppeals)
    .set({
      status,
      adminId,
      adminResponse,
      resolvedAt: new Date(),
    })
    .where(eq(banAppeals.id, appealId));

  // If approved, unban the user
  if (status === "approved") {
    await unbanUserAsModerator(appeal[0].userId, adminId, `Apelação aprovada: ${adminResponse}`);
  }

  // Create audit log
  await createAuditLog({
    action: status === "approved" ? "approve_appeal" : "reject_appeal",
    entityType: "ban_appeal",
    entityId: appealId,
    userId: adminId,
    details: JSON.stringify({
      appealUserId: appeal[0].userId,
      adminResponse,
    }),
  });

  return { userId: appeal[0].userId, status };
}

// AUDIT LOGS SYSTEM

export async function createAuditLog(data: {
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  details?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { auditLogs } = await import('../drizzle/schema');

  const [result] = await db.insert(auditLogs).values({
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    userId: data.userId,
    details: data.details,
    ipAddress: data.ipAddress,
  });

  return result.insertId;
}

export async function getAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };

  const { auditLogs } = await import('../drizzle/schema');

  const conditions = [];

  if (filters?.action) {
    conditions.push(eq(auditLogs.action, filters.action));
  }
  if (filters?.entityType) {
    conditions.push(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }
  if (filters?.startDate) {
    conditions.push(gte(auditLogs.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    const { lte } = await import('drizzle-orm');
    conditions.push(lte(auditLogs.createdAt, filters.endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  // Get logs with user info
  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      userId: auditLogs.userId,
      userName: users.name,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);

  return { logs, total };
}

export async function getAuditLogActions() {
  const db = await getDb();
  if (!db) return [];

  const { auditLogs } = await import('../drizzle/schema');

  const result = await db
    .select({ action: auditLogs.action })
    .from(auditLogs)
    .groupBy(auditLogs.action)
    .orderBy(auditLogs.action);

  return result.map(r => r.action);
}

export async function getAuditLogEntityTypes() {
  const db = await getDb();
  if (!db) return [];

  const { auditLogs } = await import('../drizzle/schema');

  const result = await db
    .select({ entityType: auditLogs.entityType })
    .from(auditLogs)
    .groupBy(auditLogs.entityType)
    .orderBy(auditLogs.entityType);

  return result.map(r => r.entityType);
}

export async function exportAuditLogsCSV(filters?: {
  action?: string;
  entityType?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const { logs } = await getAuditLogs({ ...filters, limit: 10000 });

  // Generate CSV header
  const headers = ['ID', 'Ação', 'Tipo de Entidade', 'ID da Entidade', 'Usuário ID', 'Usuário Nome', 'Detalhes', 'IP', 'Data'];
  
  // Generate CSV rows
  const rows = logs.map(log => [
    log.id,
    log.action,
    log.entityType,
    log.entityId,
    log.userId,
    log.userName || '',
    log.details ? log.details.replace(/"/g, '""') : '',
    log.ipAddress || '',
    log.createdAt.toISOString(),
  ]);

  // Combine into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}
