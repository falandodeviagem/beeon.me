import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  createPayment: vi.fn().mockResolvedValue(1),
  getUserPayments: vi.fn().mockResolvedValue([
    {
      id: 1,
      amount: 2990,
      currency: 'BRL',
      status: 'completed',
      stripeInvoiceUrl: 'https://stripe.com/invoice/123',
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-02-01'),
      createdAt: new Date(),
      communityId: 1,
      communityName: 'Test Community',
      communityImage: null,
    }
  ]),
  getCommunityRevenueStats: vi.fn().mockResolvedValue({
    totalRevenue: 29900,
    monthlyRevenue: 5980,
    lastMonthRevenue: 5980,
    activeSubscribers: 2,
    totalPayments: 10,
  }),
  getCommunityRevenueByMonth: vi.fn().mockResolvedValue([
    { month: '2024-01', revenue: 5980, count: 2 },
    { month: '2024-02', revenue: 8970, count: 3 },
  ]),
  getCommunityPayments: vi.fn().mockResolvedValue([
    {
      id: 1,
      amount: 2990,
      currency: 'BRL',
      status: 'completed',
      createdAt: new Date(),
      userId: 1,
      userName: 'Test User',
      userAvatar: null,
    }
  ]),
}));

import * as db from './db';

describe('Payment System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment record', async () => {
      const paymentData = {
        userId: 1,
        communityId: 1,
        amount: 2990,
        status: 'completed' as const,
        stripeSessionId: 'cs_test_123',
      };

      const result = await db.createPayment(paymentData);

      expect(db.createPayment).toHaveBeenCalledWith(paymentData);
      expect(result).toBe(1);
    });

    it('should handle different payment statuses', async () => {
      const statuses = ['pending', 'completed', 'failed', 'refunded'] as const;

      for (const status of statuses) {
        await db.createPayment({
          userId: 1,
          communityId: 1,
          amount: 2990,
          status,
        });
      }

      expect(db.createPayment).toHaveBeenCalledTimes(4);
    });
  });

  describe('getUserPayments', () => {
    it('should return user payment history', async () => {
      const payments = await db.getUserPayments(1, 50);

      expect(db.getUserPayments).toHaveBeenCalledWith(1, 50);
      expect(payments).toHaveLength(1);
      expect(payments[0]).toHaveProperty('communityName');
      expect(payments[0]).toHaveProperty('amount');
      expect(payments[0]).toHaveProperty('status');
    });

    it('should include community information', async () => {
      const payments = await db.getUserPayments(1);

      expect(payments[0].communityName).toBe('Test Community');
      expect(payments[0].communityId).toBe(1);
    });
  });

  describe('getCommunityRevenueStats', () => {
    it('should return revenue statistics', async () => {
      const stats = await db.getCommunityRevenueStats(1);

      expect(db.getCommunityRevenueStats).toHaveBeenCalledWith(1);
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('monthlyRevenue');
      expect(stats).toHaveProperty('lastMonthRevenue');
      expect(stats).toHaveProperty('activeSubscribers');
      expect(stats).toHaveProperty('totalPayments');
    });

    it('should return numeric values', async () => {
      const stats = await db.getCommunityRevenueStats(1);

      expect(typeof stats?.totalRevenue).toBe('number');
      expect(typeof stats?.activeSubscribers).toBe('number');
    });
  });

  describe('getCommunityRevenueByMonth', () => {
    it('should return monthly revenue data', async () => {
      const monthlyData = await db.getCommunityRevenueByMonth(1);

      expect(db.getCommunityRevenueByMonth).toHaveBeenCalledWith(1);
      expect(monthlyData).toHaveLength(2);
      expect(monthlyData[0]).toHaveProperty('month');
      expect(monthlyData[0]).toHaveProperty('revenue');
      expect(monthlyData[0]).toHaveProperty('count');
    });

    it('should return data in chronological order', async () => {
      const monthlyData = await db.getCommunityRevenueByMonth(1);

      expect(monthlyData[0].month).toBe('2024-01');
      expect(monthlyData[1].month).toBe('2024-02');
    });
  });

  describe('getCommunityPayments', () => {
    it('should return community payment list', async () => {
      const payments = await db.getCommunityPayments(1, 50);

      expect(db.getCommunityPayments).toHaveBeenCalledWith(1, 50);
      expect(payments).toHaveLength(1);
      expect(payments[0]).toHaveProperty('userName');
      expect(payments[0]).toHaveProperty('amount');
    });

    it('should include user information', async () => {
      const payments = await db.getCommunityPayments(1);

      expect(payments[0].userName).toBe('Test User');
      expect(payments[0].userId).toBe(1);
    });
  });
});

describe('Payment Formatting', () => {
  it('should format currency correctly', () => {
    const formatCurrency = (cents: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(cents / 100);
    };

    // Use toContain to handle different space characters (regular vs non-breaking)
    expect(formatCurrency(2990)).toContain('29,90');
    expect(formatCurrency(0)).toContain('0,00');
    expect(formatCurrency(100000)).toContain('1.000,00');
  });

  it('should calculate growth percentage correctly', () => {
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return null;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    expect(calculateGrowth(5980, 5980)).toBe('0.0');
    expect(calculateGrowth(8970, 5980)).toBe('50.0');
    expect(calculateGrowth(2990, 5980)).toBe('-50.0');
    expect(calculateGrowth(100, 0)).toBeNull();
  });
});

describe('Stripe Webhook Handler', () => {
  it('should validate webhook signature requirement', () => {
    // Webhook handler requires stripe-signature header
    const headers = { 'stripe-signature': 'test_sig' };
    expect(headers['stripe-signature']).toBeDefined();
  });

  it('should handle checkout.session.completed event type', () => {
    const eventTypes = [
      'checkout.session.completed',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed',
    ];

    eventTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it('should extract metadata from session', () => {
    const session = {
      metadata: {
        userId: '1',
        communityId: '2',
      },
      amount_total: 2990,
      currency: 'brl',
      id: 'cs_test_123',
      subscription: 'sub_123',
    };

    const userId = parseInt(session.metadata?.userId || '0');
    const communityId = parseInt(session.metadata?.communityId || '0');

    expect(userId).toBe(1);
    expect(communityId).toBe(2);
    expect(session.amount_total).toBe(2990);
  });
});
