import { describe, expect, it } from 'vitest';
import { createDb, runDailyReturnsCron } from '../utils/financialHarness';

describe('daily returns cron engine', () => {
  it('credits a 10% daily return, completes the final-day investment, and skips duplicate same-day runs', async () => {
    const db = createDb({
      users: [
        { id: 1, accountBalance: '0.00', totalReferralEarnings: '0.00', lastWithdrawalAt: null },
      ],
      investments: [
        {
          id: 1,
          userId: 1,
          amount: '5000.00',
          dailyReturnRate: '0.10',
          daysRemaining: 1,
          status: 'active',
        },
      ],
    });

    const firstRun = await runDailyReturnsCron(db, { runDate: '2026-02-20' });

    expect(firstRun).toEqual({ status: 200, skipped: false, credited: '500.00' });
    expect(db.users[0].accountBalance).toBe('500.00');
    expect(db.investments[0].daysRemaining).toBe(0);
    expect(db.investments[0].status).toBe('completed');
    expect(db.transactions).toHaveLength(1);
    expect(db.transactions[0]).toMatchObject({
      type: 'daily_return',
      amount: '500.00',
      status: 'completed',
    });
    expect(db.cronLogs).toHaveLength(1);
    expect(db.cronLogs[0]).toMatchObject({
      runDate: '2026-02-20',
      investmentCount: 1,
      totalCredited: '500.00',
    });

    const secondRun = await runDailyReturnsCron(db, { runDate: '2026-02-20' });

    expect(secondRun).toEqual({ status: 200, skipped: true, credited: '0.00' });
    expect(db.users[0].accountBalance).toBe('500.00');
    expect(db.transactions).toHaveLength(1);
    expect(db.cronLogs).toHaveLength(1);
  });
});