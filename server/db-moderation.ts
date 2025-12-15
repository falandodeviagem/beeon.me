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


// ANALYTICS HELPERS

export async function getAnalyticsByPeriod(days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Reports per day - using raw SQL to avoid ONLY_FULL_GROUP_BY issues
  const reportsPerDay = await db.execute(
    sql`SELECT DATE(createdAt) as date, COUNT(*) as count FROM reports WHERE createdAt >= ${startDate} GROUP BY DATE(createdAt) ORDER BY DATE(createdAt)`
  ) as any;
  const reportsPerDayData = reportsPerDay[0] || [];

  // Reports by type
  const reportsByType = await db
    .select({
      type: reports.reportType,
      count: sql<number>`count(*)`,
    })
    .from(reports)
    .where(gte(reports.createdAt, startDate))
    .groupBy(reports.reportType);

  // Reports by status
  const reportsByStatus = await db
    .select({
      status: reports.status,
      count: sql<number>`count(*)`,
    })
    .from(reports)
    .where(gte(reports.createdAt, startDate))
    .groupBy(reports.status);

  // Moderation actions per day - using raw SQL to avoid ONLY_FULL_GROUP_BY issues
  const actionsPerDay = await db.execute(
    sql`SELECT DATE(createdAt) as date, COUNT(*) as count FROM moderation_logs WHERE createdAt >= ${startDate} GROUP BY DATE(createdAt) ORDER BY DATE(createdAt)`
  ) as any;
  const actionsPerDayData = actionsPerDay[0] || [];

  // Actions by type
  const actionsByType = await db
    .select({
      action: moderationLogs.action,
      count: sql<number>`count(*)`,
    })
    .from(moderationLogs)
    .where(gte(moderationLogs.createdAt, startDate))
    .groupBy(moderationLogs.action);

  // Top moderators
  const topModerators = await db
    .select({
      moderatorId: moderationLogs.moderatorId,
      moderatorName: users.name,
      count: sql<number>`count(*)`,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.moderatorId, users.id))
    .where(gte(moderationLogs.createdAt, startDate))
    .groupBy(moderationLogs.moderatorId, users.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Average resolution time
  const avgResolutionTime = await db
    .select({
      avgHours: sql<number>`AVG(TIMESTAMPDIFF(HOUR, ${reports.createdAt}, ${reports.reviewedAt}))`,
    })
    .from(reports)
    .where(and(
      gte(reports.createdAt, startDate),
      isNotNull(reports.reviewedAt)
    ));

  // Total counts
  const totalReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(gte(reports.createdAt, startDate));

  const totalActions = await db
    .select({ count: sql<number>`count(*)` })
    .from(moderationLogs)
    .where(gte(moderationLogs.createdAt, startDate));

  // Pending reports
  const pendingReports = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(and(
      gte(reports.createdAt, startDate),
      eq(reports.status, 'pending')
    ));

  return {
    period: days,
    reportsPerDay: reportsPerDayData,
    reportsByType,
    reportsByStatus,
    actionsPerDay: actionsPerDayData,
    actionsByType,
    topModerators,
    avgResolutionHours: avgResolutionTime[0]?.avgHours || 0,
    totalReports: totalReports[0]?.count || 0,
    totalActions: totalActions[0]?.count || 0,
    pendingReports: pendingReports[0]?.count || 0,
  };
}

// RESPONSE TEMPLATES HELPERS

export async function createResponseTemplate(data: {
  name: string;
  content: string;
  category: "appeal_approve" | "appeal_reject" | "report_resolve" | "report_dismiss" | "warning" | "ban";
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { responseTemplates } = await import('../drizzle/schema');

  const [result] = await db.insert(responseTemplates).values({
    name: data.name,
    content: data.content,
    category: data.category,
    createdBy: data.createdBy,
  });

  return result.insertId;
}

export async function getResponseTemplates(category?: string) {
  const db = await getDb();
  if (!db) return [];

  const { responseTemplates } = await import('../drizzle/schema');

  const query = db
    .select({
      id: responseTemplates.id,
      name: responseTemplates.name,
      content: responseTemplates.content,
      category: responseTemplates.category,
      createdBy: responseTemplates.createdBy,
      creatorName: users.name,
      useCount: responseTemplates.useCount,
      createdAt: responseTemplates.createdAt,
    })
    .from(responseTemplates)
    .leftJoin(users, eq(responseTemplates.createdBy, users.id));

  if (category) {
    return query
      .where(eq(responseTemplates.category, category as any))
      .orderBy(desc(responseTemplates.useCount));
  }

  return query.orderBy(desc(responseTemplates.useCount));
}

export async function updateResponseTemplate(
  id: number,
  data: { name?: string; content?: string; category?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { responseTemplates } = await import('../drizzle/schema');

  await db
    .update(responseTemplates)
    .set(data as any)
    .where(eq(responseTemplates.id, id));
}

export async function deleteResponseTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { responseTemplates } = await import('../drizzle/schema');

  await db.delete(responseTemplates).where(eq(responseTemplates.id, id));
}

export async function incrementTemplateUseCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { responseTemplates } = await import('../drizzle/schema');

  await db
    .update(responseTemplates)
    .set({ useCount: sql`${responseTemplates.useCount} + 1` })
    .where(eq(responseTemplates.id, id));
}


// USER INSIGHTS HELPERS (LGPD Compliant - behavioral data only)

export async function getUserInsights(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { 
    users, posts, comments, postReactions, communityMembers, communities,
    userBadges, badges, gamificationActions, userWarnings, userFollows
  } = await import('../drizzle/schema');

  // Basic user info (public data)
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatarUrl,
      bio: users.bio,
      points: users.points,
      level: users.level,
      role: users.role,
      isBanned: users.isBanned,
      banReason: users.banReason,
      createdAt: users.createdAt,
      lastActiveAt: users.lastSignedIn,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  // Engagement metrics
  const [postCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.authorId, userId));

  const [commentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(eq(comments.authorId, userId));

  const [reactionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postReactions)
    .where(eq(postReactions.userId, userId));

  // Reactions received on user's posts
  const reactionsReceived = await db.execute(
    sql`SELECT COUNT(*) as count FROM post_reactions pr 
        JOIN posts p ON pr.postId = p.id 
        WHERE p.authorId = ${userId}`
  ) as any;
  const reactionsReceivedCount = reactionsReceived[0]?.[0]?.count || 0;

  // Followers/Following count
  const [followersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  const [followingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  // Communities and categories of interest
  const userCommunities = await db
    .select({
      communityId: communityMembers.communityId,
      communityName: communities.name,
      category: communities.category,
      joinedAt: communityMembers.joinedAt,
    })
    .from(communityMembers)
    .innerJoin(communities, eq(communityMembers.communityId, communities.id))
    .where(eq(communityMembers.userId, userId))
    .orderBy(desc(communityMembers.joinedAt));

  // Category interests (aggregated from communities)
  const categoryInterests = userCommunities.reduce((acc: Record<string, number>, c) => {
    if (c.category) {
      acc[c.category] = (acc[c.category] || 0) + 1;
    }
    return acc;
  }, {});

  // Badges earned
  const userBadgesList = await db
    .select({
      badgeId: userBadges.badgeId,
      badgeName: badges.name,
      badgeDescription: badges.description,
      badgeIcon: badges.iconUrl,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt));

  // Activity by hour (last 30 days)
  const activityByHour = await db.execute(
    sql`SELECT HOUR(createdAt) as hour, COUNT(*) as count 
        FROM gamification_actions 
        WHERE userId = ${userId} 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY HOUR(createdAt)
        ORDER BY hour`
  ) as any;
  const activityByHourData = activityByHour[0] || [];

  // Activity by day of week (last 30 days)
  const activityByDay = await db.execute(
    sql`SELECT DAYOFWEEK(createdAt) as dayOfWeek, COUNT(*) as count 
        FROM gamification_actions 
        WHERE userId = ${userId} 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DAYOFWEEK(createdAt)
        ORDER BY dayOfWeek`
  ) as any;
  const activityByDayData = activityByDay[0] || [];

  // Recent activity (last 10 actions)
  const recentActivity = await db
    .select({
      id: gamificationActions.id,
      action: gamificationActions.actionType,
      points: gamificationActions.points,
      createdAt: gamificationActions.createdAt,
    })
    .from(gamificationActions)
    .where(eq(gamificationActions.userId, userId))
    .orderBy(desc(gamificationActions.createdAt))
    .limit(10);

  // Moderation history (warnings)
  const warnings = await db
    .select({
      id: userWarnings.id,
      reason: userWarnings.reason,
      severity: userWarnings.level,
      issuedBy: userWarnings.moderatorId,
      issuerName: users.name,
      expiresAt: userWarnings.expiresAt,
      isActive: userWarnings.isActive,
      createdAt: userWarnings.createdAt,
    })
    .from(userWarnings)
    .leftJoin(users, eq(userWarnings.moderatorId, users.id))
    .where(eq(userWarnings.userId, userId))
    .orderBy(desc(userWarnings.createdAt));

  // Reports made by this user
  const [reportsMade] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(eq(reports.reporterId, userId));

  // Reports against this user
  const reportsAgainst = await db.execute(
    sql`SELECT COUNT(*) as count FROM reports r
        JOIN posts p ON r.targetId = p.id AND r.reportType = 'post'
        WHERE p.authorId = ${userId}
        UNION ALL
        SELECT COUNT(*) as count FROM reports r
        JOIN comments c ON r.targetId = c.id AND r.reportType = 'comment'
        WHERE c.authorId = ${userId}
        UNION ALL
        SELECT COUNT(*) as count FROM reports r
        WHERE r.targetId = ${userId} AND r.reportType = 'user'`
  ) as any;
  const totalReportsAgainst = (reportsAgainst[0] || []).reduce((sum: number, r: any) => sum + (r.count || 0), 0);

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, Math.round(
    (postCount?.count || 0) * 5 +
    (commentCount?.count || 0) * 2 +
    (reactionCount?.count || 0) * 1 +
    (reactionsReceivedCount) * 3 +
    (followersCount?.count || 0) * 4
  ) / 10);

  // Days since registration
  const daysSinceRegistration = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    user: {
      ...user,
      daysSinceRegistration,
    },
    engagement: {
      score: engagementScore,
      posts: postCount?.count || 0,
      comments: commentCount?.count || 0,
      reactions: reactionCount?.count || 0,
      reactionsReceived: reactionsReceivedCount,
      followers: followersCount?.count || 0,
      following: followingCount?.count || 0,
    },
    communities: userCommunities,
    categoryInterests: Object.entries(categoryInterests)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => (b.count as number) - (a.count as number)),
    badges: userBadgesList,
    activity: {
      byHour: activityByHourData,
      byDay: activityByDayData,
      recent: recentActivity,
    },
    moderation: {
      warnings,
      activeWarnings: warnings.filter(w => w.isActive).length,
      reportsMade: reportsMade?.count || 0,
      reportsAgainst: totalReportsAgainst,
    },
  };
}

export async function searchUsersForInsights(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const { users } = await import('../drizzle/schema');
  const { like, or } = await import('drizzle-orm');

  return db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatarUrl,
      points: users.points,
      level: users.level,
      isBanned: users.isBanned,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(or(
      like(users.name, `%${query}%`),
      eq(users.id, parseInt(query) || 0)
    ))
    .orderBy(desc(users.points))
    .limit(limit);
}
