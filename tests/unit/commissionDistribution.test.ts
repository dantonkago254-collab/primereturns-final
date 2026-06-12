import { describe, expect, it } from 'vitest';
import { createDb, verifyDeposit } from '../utils/financialHarness';

describe('verifyDeposit router - multi-tier commission distribution', () => {
  it('credits exact 10%, 5%, and 2% commissions for a KSh 10,000 verified deposit', async () => {
    const now = new Date('2026-02-20T12:00:00.000Z');
    const db = createDb({
      users: [
        { id: 1, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null }, // L3
        { id: 2, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null }, // L2
        { id: 3, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null }, // L1
        { id: 4, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null }, // depositor
      ],
      referrals: [
        { id: 1, referrerId: 3, referredId: 4, level: 1, createdAt: now },
        { id: 2, referrerId: 2, referredId: 4, level: 2, createdAt: now },
        { id: 3, referrerId: 1, referredId: 4, level: 3, createdAt: now },
      ],
    });

    const result = await verifyDeposit(db, {
      investingUserId: 4,
      amount: '10000.00',
      reference: 'PAYSTACK-REF-10000',
      now,
    });

    expect(result).toEqual({ status: 200, commissionRows: 3 });

    const l1 = db.users.find((user) => user.id === 3);
    const l2 = db.users.find((user) => user.id === 2);
    const l3 = db.users.find((user) => user.id === 1);

    expect(l1?.accountBalance).toBe('1000.00');
    expect(l1?.totalReferralEarnings).toBe('1000.00');
    expect(l2?.accountBalance).toBe('500.00');
    expect(l2?.totalReferralEarnings).toBe('500.00');
    expect(l3?.accountBalance).toBe('200.00');
    expect(l3?.totalReferralEarnings).toBe('200.00');

    const commissionRows = db.transactions.filter((transaction) => transaction.type === 'referral_commission');
    expect(commissionRows).toHaveLength(3);
    expect(commissionRows.map((row) => row.amount)).toEqual(['1000.00', '500.00', '200.00']);
    expect(commissionRows.map((row) => row.status)).toEqual(['completed', 'completed', 'completed']);
    expect(commissionRows.map((row) => row.description)).toEqual([
      'Level 1 commission from deposit of User #4',
      'Level 2 commission from deposit of User #4',
      'Level 3 commission from deposit of User #4',
    ]);
  });
});