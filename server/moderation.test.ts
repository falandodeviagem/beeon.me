import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { 
  createReport, 
  getPendingReports, 
  resolveReport,
  createModerationLog,
  getModerationLogs 
} from './db-moderation';
import { upsertUser, createCommunity, addCommunityMember, createPost } from './db';

describe('Moderation System', () => {
  let reporterId: number;
  let authorId: number;
  let communityId: number;
  let postId: number;
  let reportId: number;

  beforeAll(async () => {
    // Create test users
    reporterId = await upsertUser({
      openId: `mod-test-reporter-${Date.now()}`,
      name: 'Reporter User',
      avatar: null,
    });

    authorId = await upsertUser({
      openId: `mod-test-author-${Date.now()}`,
      name: 'Author User',
      avatar: null,
    });

    // Create test community
    communityId = await createCommunity({
      name: `Mod Test Community ${Date.now()}`,
      description: 'Test community for moderation',
      ownerId: authorId,
      isPaid: false,
      price: 0,
      imageUrl: null,
      category: 'tecnologia',
    });

    // Add members
    await addCommunityMember({ communityId, userId: reporterId });
    await addCommunityMember({ communityId, userId: authorId });

    // Create test post
    postId = await createPost({
      content: 'This is a test post for moderation',
      authorId,
      communityId,
      imageUrl: null,
    });
  });

  it('should create a report for a post', async () => {
    reportId = await createReport({
      reportType: 'post',
      targetId: postId,
      reason: 'Spam content',
      reporterId,
    });

    expect(reportId).toBeGreaterThan(0);
  });

  it('should get pending reports', async () => {
    const pendingReports = await getPendingReports();
    
    expect(Array.isArray(pendingReports)).toBe(true);
    const ourReport = pendingReports.find(r => r.id === reportId);
    expect(ourReport).toBeDefined();
    expect(ourReport?.status).toBe('pending');
  });

  it('should resolve a report', async () => {
    await resolveReport(
      reportId,
      authorId,
      'resolved',
      'Content removed'
    );

    const pendingReports = await getPendingReports();
    const ourReport = pendingReports.find(r => r.id === reportId);
    expect(ourReport).toBeUndefined(); // Should not be in pending anymore
  });

  it('should create moderation log', async () => {
    const logId = await createModerationLog({
      moderatorId: authorId,
      action: 'remove_post',
      targetUserId: authorId,
      postId: postId,
      reason: 'Violated community guidelines',
    });

    expect(logId).toBeGreaterThan(0);
  });

  it('should get moderation logs', async () => {
    const logs = await getModerationLogs(20);
    
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    
    const ourLog = logs.find(l => l.postId === postId);
    expect(ourLog).toBeDefined();
    expect(ourLog?.action).toBe('remove_post');
  });

  it('should create report for comment', async () => {
    const commentReportId = await createReport({
      reportType: 'comment',
      targetId: 1, // Fake comment ID
      reason: 'Harassment',
      reporterId,
    });

    expect(commentReportId).toBeGreaterThan(0);
  });

  it('should create report for user', async () => {
    const userReportId = await createReport({
      reportType: 'user',
      targetId: authorId,
      reason: 'Fake account',
      reporterId,
    });

    expect(userReportId).toBeGreaterThan(0);
  });
});
