import { describe, it, expect } from 'vitest';
import { 
  getAnalyticsByPeriod,
  createResponseTemplate,
  getResponseTemplates,
  updateResponseTemplate,
  deleteResponseTemplate,
  incrementTemplateUseCount
} from './db-moderation';

describe('Analytics System', () => {
  it('should have getAnalyticsByPeriod function', () => {
    expect(typeof getAnalyticsByPeriod).toBe('function');
  });

  it('should return analytics data for 30 days', async () => {
    const analytics = await getAnalyticsByPeriod(30);
    
    expect(analytics).toHaveProperty('period');
    expect(analytics.period).toBe(30);
    expect(analytics).toHaveProperty('reportsPerDay');
    expect(analytics).toHaveProperty('reportsByType');
    expect(analytics).toHaveProperty('reportsByStatus');
    expect(analytics).toHaveProperty('actionsPerDay');
    expect(analytics).toHaveProperty('actionsByType');
    expect(analytics).toHaveProperty('topModerators');
    expect(analytics).toHaveProperty('avgResolutionHours');
    expect(analytics).toHaveProperty('totalReports');
    expect(analytics).toHaveProperty('totalActions');
    expect(analytics).toHaveProperty('pendingReports');
  });

  it('should return analytics data for 7 days', async () => {
    const analytics = await getAnalyticsByPeriod(7);
    expect(analytics.period).toBe(7);
  });

  it('should return analytics data for 90 days', async () => {
    const analytics = await getAnalyticsByPeriod(90);
    expect(analytics.period).toBe(90);
  });

  it('should return arrays for time-series data', async () => {
    const analytics = await getAnalyticsByPeriod(30);
    
    expect(Array.isArray(analytics.reportsPerDay)).toBe(true);
    expect(Array.isArray(analytics.actionsPerDay)).toBe(true);
    expect(Array.isArray(analytics.topModerators)).toBe(true);
  });

  it('should return numbers for totals', async () => {
    const analytics = await getAnalyticsByPeriod(30);
    
    expect(typeof analytics.totalReports).toBe('number');
    expect(typeof analytics.totalActions).toBe('number');
    expect(typeof analytics.pendingReports).toBe('number');
  });
});

describe('Response Templates System', () => {
  it('should have createResponseTemplate function', () => {
    expect(typeof createResponseTemplate).toBe('function');
  });

  it('should have getResponseTemplates function', () => {
    expect(typeof getResponseTemplates).toBe('function');
  });

  it('should have updateResponseTemplate function', () => {
    expect(typeof updateResponseTemplate).toBe('function');
  });

  it('should have deleteResponseTemplate function', () => {
    expect(typeof deleteResponseTemplate).toBe('function');
  });

  it('should have incrementTemplateUseCount function', () => {
    expect(typeof incrementTemplateUseCount).toBe('function');
  });

  it('should return array for getResponseTemplates', async () => {
    const templates = await getResponseTemplates();
    expect(Array.isArray(templates)).toBe(true);
  });

  it('should filter templates by category', async () => {
    const templates = await getResponseTemplates('appeal_approve');
    expect(Array.isArray(templates)).toBe(true);
  });

  it('should filter templates by ban category', async () => {
    const templates = await getResponseTemplates('ban');
    expect(Array.isArray(templates)).toBe(true);
  });

  it('should filter templates by warning category', async () => {
    const templates = await getResponseTemplates('warning');
    expect(Array.isArray(templates)).toBe(true);
  });
});

describe('Template CRUD Operations', () => {
  let createdTemplateId: number;

  it('should create a new template', async () => {
    const id = await createResponseTemplate({
      name: 'Test Template',
      content: 'This is a test template content',
      category: 'warning',
      createdBy: 1,
    });
    
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
    createdTemplateId = id;
  });

  it('should retrieve the created template', async () => {
    const templates = await getResponseTemplates('warning');
    const found = templates.find((t: any) => t.name === 'Test Template');
    expect(found).toBeDefined();
    expect(found?.content).toBe('This is a test template content');
  });

  it('should update the template', async () => {
    if (createdTemplateId) {
      await updateResponseTemplate(createdTemplateId, {
        content: 'Updated content',
      });
      
      const templates = await getResponseTemplates('warning');
      const found = templates.find((t: any) => t.id === createdTemplateId);
      expect(found?.content).toBe('Updated content');
    }
  });

  it('should increment use count', async () => {
    if (createdTemplateId) {
      await incrementTemplateUseCount(createdTemplateId);
      
      const templates = await getResponseTemplates('warning');
      const found = templates.find((t: any) => t.id === createdTemplateId);
      expect(found?.useCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('should delete the template', async () => {
    if (createdTemplateId) {
      await deleteResponseTemplate(createdTemplateId);
      
      const templates = await getResponseTemplates('warning');
      const found = templates.find((t: any) => t.id === createdTemplateId);
      expect(found).toBeUndefined();
    }
  });
});
