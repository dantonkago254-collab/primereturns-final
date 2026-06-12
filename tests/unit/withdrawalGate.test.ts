import { describe, expect, it } from 'vitest';
import { createDb, MockTRPCError, requestWithdrawal } from '../utils/financialHarness';

const now = new Date('2026-02-20T12:00:00.000Z');

describe('requestWithdrawal router - withdrawal gate logic', () => {
  it('blocks a user with balance but zero active referrals', async () => {
    const db = createDb({
      users: [
        { id: 1, accountBalance: '10000.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
      ],
    });

    await expect(requestWithdrawal(db, { userId: 1, amount: '10000.00', now })).rejects.toMatchObject({
      name: 'TRPCError',
      code: 'BAD_REQUEST',
      message: 'Withdrawal locked. You must have at least 1 active active referral to unlock withdrawals.',
    } satisfies Partial<MockTRPCError>);

    expect(db.users[0].accountBalance).toBe('10000.00');
    expect(db.transactions).toHaveLength(0);
  });

  it('blocks a user with one active referral but only 10 days since last successful withdrawal', async () => {
    const db = createDb({
      users: [
        {
          id: 1,
          accountBalance: '10000.00',
          totalReferralEarnings: '0.00',
          lastWithdrawalAt: new Date('2026-02-10T12:00:00.000Z'),
        },
        { id: 2, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
      ],
      referrals: [{ id: 1, referrerId: 1, referredId: 2, level: 1, createdAt: now }],
      investments: [
        { id: 1, userId: 2, amount: '5000.00', dailyReturnRate: '0.10', daysRemaining: 10, status: 'active' },
      ],
    });

    await expect(requestWithdrawal(db, { userId: 1, amount: '10000.00', now })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Withdrawal locked. Please wait 14 days between withdrawals.',
    });

    expect(db.users[0].accountBalance).toBe('10000.00');
    expect(db.transactions).toHaveLength(0);
  });

  it.each([
    ['300.00', 'Minimum withdrawal amount is KSh 500.'],
    ['600000.00', 'Maximum withdrawal amount is KSh 500,000.'],
  ])('blocks invalid withdrawal amount %s', async (amount, expectedMessage) => {
    const db = createDb({
      users: [
        { id: 1, accountBalance: '700000.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
        { id: 2, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
      ],
      referrals: [{ id: 1, referrerId: 1, referredId: 2, level: 1, createdAt: now }],
      investments: [
        { id: 1, userId: 2, amount: '5000.00', dailyReturnRate: '0.10', daysRemaining: 10, status: 'active' },
      ],
    });

    await expect(requestWithdrawal(db, { userId: 1, amount, now })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: expectedMessage,
    });
  });

  it('passes when user has active referral, 15-day cooldown has elapsed, and amount is valid', async () => {
    const db = createDb({
      users: [
        {
          id: 1,
          accountBalance: '10000.00',
          totalReferralEarnings: '0.00',
          lastWithdrawalAt: new Date('2026-02-05T12:00:00.000Z'),
        },
        { id: 2, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
      ],
      referrals: [{ id: 1, referrerId: 1, referredId: 2, level: 1, createdAt: now }],
      investments: [
        { id: 1, userId: 2, amount: '5000.00', dailyReturnRate: '0.10', daysRemaining: 10, status: 'active' },
      ],
    });

    const result = await requestWithdrawal(db, { userId: 1, amount: '10000.00', now });

    expect(result.status).toBe(200);
    expect(db.users[0].accountBalance).toBe('0.00');
    expect(db.transactions).toHaveLength(1);
    expect(db.transactions[0]).toMatchObject({
      userId: 1,
      type: 'withdrawal',
      amount: '10000.00',
      status: 'pending',
    });
  });
});