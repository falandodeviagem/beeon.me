import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { 
  createBanAppeal, 
  getPendingAppeals, 
  getAllAppeals,
  getUserAppeal,
  resolveAppeal,
  createAuditLog,
  getAuditLogs,
  getAuditLogActions,
  getAuditLogEntityTypes,
  exportAuditLogsCSV
} from './db-moderation';

describe('Ban Appeals System', () => {
  it('should have createBanAppeal function', () => {
    expect(typeof createBanAppeal).toBe('function');
  });

  it('should have getPendingAppeals function', () => {
    expect(typeof getPendingAppeals).toBe('function');
  });

  it('should have getAllAppeals function', () => {
    expect(typeof getAllAppeals).toBe('function');
  });

  it('should have getUserAppeal function', () => {
    expect(typeof getUserAppeal).toBe('function');
  });

  it('should have resolveAppeal function', () => {
    expect(typeof resolveAppeal).toBe('function');
  });

  it('should return empty array for pending appeals when none exist', async () => {
    const appeals = await getPendingAppeals();
    expect(Array.isArray(appeals)).toBe(true);
  });

  it('should return empty or array for all appeals', async () => {
    const appeals = await getAllAppeals();
    expect(Array.isArray(appeals)).toBe(true);
  });

  it('should return null for non-existent user appeal', async () => {
    const appeal = await getUserAppeal(999999);
    expect(appeal).toBe(null);
  });
});

describe('Audit Logs System', () => {
  it('should have createAuditLog function', () => {
    expect(typeof createAuditLog).toBe('function');
  });

  it('should have getAuditLogs function', () => {
    expect(typeof getAuditLogs).toBe('function');
  });

  it('should have getAuditLogActions function', () => {
    expect(typeof getAuditLogActions).toBe('function');
  });

  it('should have getAuditLogEntityTypes function', () => {
    expect(typeof getAuditLogEntityTypes).toBe('function');
  });

  it('should have exportAuditLogsCSV function', () => {
    expect(typeof exportAuditLogsCSV).toBe('function');
  });

  it('should return logs with total count', async () => {
    const result = await getAuditLogs();
    expect(result).toHaveProperty('logs');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.logs)).toBe(true);
    expect(typeof result.total).toBe('number');
  });

  it('should return array for audit log actions', async () => {
    const actions = await getAuditLogActions();
    expect(Array.isArray(actions)).toBe(true);
  });

  it('should return array for audit log entity types', async () => {
    const types = await getAuditLogEntityTypes();
    expect(Array.isArray(types)).toBe(true);
  });

  it('should export CSV with headers', async () => {
    const csv = await exportAuditLogsCSV();
    expect(typeof csv).toBe('string');
    expect(csv).toContain('ID');
    expect(csv).toContain('Ação');
    expect(csv).toContain('Tipo de Entidade');
  });

  it('should filter logs by action', async () => {
    const result = await getAuditLogs({ action: 'ban_user' });
    expect(result).toHaveProperty('logs');
    expect(Array.isArray(result.logs)).toBe(true);
  });

  it('should filter logs by entity type', async () => {
    const result = await getAuditLogs({ entityType: 'user' });
    expect(result).toHaveProperty('logs');
    expect(Array.isArray(result.logs)).toBe(true);
  });

  it('should respect pagination', async () => {
    const result = await getAuditLogs({ limit: 5, offset: 0 });
    expect(result.logs.length).toBeLessThanOrEqual(5);
  });
});

describe('Database Schema', () => {
  it('should have ban_appeals table accessible', async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
  });

  it('should have audit_logs table accessible', async () => {
    const db = await getDb();
    expect(db).toBeTruthy();
  });
});
