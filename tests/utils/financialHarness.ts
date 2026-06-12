export type TRPCCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND';

export class MockTRPCError extends Error {
  code: TRPCCode;

  constructor(code: TRPCCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'TRPCError';
  }
}

export interface UserRecord {
  id: number;
  accountBalance: string;
  totalReferralEarnings: string;
  lastWithdrawalAt: Date | null;
}

export interface ReferralRecord {
  id: number;
  referrerId: number;
  referredId: number;
  level: 1 | 2 | 3;
  createdAt: Date;
}

export interface InvestmentRecord {
  id: number;
  userId: number;
  amount: string;
  dailyReturnRate: string;
  daysRemaining: number;
  status: 'active' | 'completed';
}

export interface TransactionRecord {
  id: number;
  userId: number;
  type: 'deposit' | 'withdrawal' | 'daily_return' | 'referral_commission' | 'balance_adjustment';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  reference?: string;
}

export interface CronLogRecord {
  id: number;
  runDate: string;
  investmentCount: number;
  totalCredited: string;
  createdAt: Date;
}

export interface InMemoryFinancialDb {
  users: UserRecord[];
  referrals: ReferralRecord[];
  investments: InvestmentRecord[];
  transactions: TransactionRecord[];
  cronLogs: CronLogRecord[];
}

export const createDb = (overrides: Partial<InMemoryFinancialDb> = {}): InMemoryFinancialDb => ({
  users: [],
  referrals: [],
  investments: [],
  transactions: [],
  cronLogs: [],
  ...overrides,
});

export const toCents = (amount: string | number): bigint => {
  const normalized = typeof amount === 'number' ? amount.toFixed(2) : amount;
  const trimmed = normalized.trim();
  const negative = trimmed.startsWith('-');
  const clean = negative ? trimmed.slice(1) : trimmed;
  const [wholeRaw, fracRaw = ''] = clean.split('.');
  const whole = wholeRaw || '0';
  const frac = (fracRaw + '00').slice(0, 2);
  const cents = BigInt(whole) * 100n + BigInt(frac);
  return negative ? -cents : cents;
};

export const centsToKsh = (cents: bigint): string => {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / 100n;
  const fraction = abs % 100n;
  return `${negative ? '-' : ''}${whole.toString()}.${fraction.toString().padStart(2, '0')}`;
};

const addMoney = (current: string, delta: bigint) => centsToKsh(toCents(current) + delta);

const findUser = (db: InMemoryFinancialDb, userId: number) => {
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) throw new MockTRPCError('NOT_FOUND', `User #${userId} was not found.`);
  return user;
};

const daysBetween = (from: Date, to: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
};

export async function requestWithdrawal(
  db: InMemoryFinancialDb,
  input: { userId: number; amount: string; now?: Date }
) {
  const now = input.now ?? new Date();
  const user = findUser(db, input.userId);
  const requestedCents = toCents(input.amount);

  const minimum = toCents('500.00');
  const maximum = toCents('500000.00');

  if (requestedCents < minimum) {
    throw new MockTRPCError('BAD_REQUEST', 'Minimum withdrawal amount is KSh 500.');
  }

  if (requestedCents > maximum) {
    throw new MockTRPCError('BAD_REQUEST', 'Maximum withdrawal amount is KSh 500,000.');
  }

  if (toCents(user.accountBalance) < requestedCents) {
    throw new MockTRPCError('BAD_REQUEST', 'Insufficient account balance.');
  }

  const activeReferralIds = new Set(
    db.referrals
      .filter((referral) => referral.referrerId === input.userId && referral.level === 1)
      .filter((referral) =>
        db.investments.some(
          (investment) =>
            investment.userId === referral.referredId &&
            (investment.status === 'active' || investment.status === 'completed')
        )
      )
      .map((referral) => referral.referredId)
  );

  if (activeReferralIds.size < 1) {
    throw new MockTRPCError(
      'BAD_REQUEST',
      'Withdrawal locked. You must have at least 1 active active referral to unlock withdrawals.'
    );
  }

  if (user.lastWithdrawalAt && daysBetween(user.lastWithdrawalAt, now) < 14) {
    throw new MockTRPCError('BAD_REQUEST', 'Withdrawal locked. Please wait 14 days between withdrawals.');
  }

  const transaction: TransactionRecord = {
    id: db.transactions.length + 1,
    userId: input.userId,
    type: 'withdrawal',
    amount: user.accountBalance,
    status: 'pending',
    description: `Full balance withdrawal request for User #${input.userId}`,
    createdAt: now,
  };

  db.transactions.push(transaction);
  user.accountBalance = '0.00';

  return { status: 200, transaction };
}

const tierRates: Record<1 | 2 | 3, bigint> = {
  1: 10n,
  2: 5n,
  3: 2n,
};

export async function verifyDeposit(
  db: InMemoryFinancialDb,
  input: { investingUserId: number; amount: string; reference: string; now?: Date }
) {
  const now = input.now ?? new Date();
  const depositCents = toCents(input.amount);

  if (db.transactions.some((transaction) => transaction.reference === input.reference)) {
    throw new MockTRPCError('BAD_REQUEST', 'Duplicate deposit reference rejected.');
  }

  db.transactions.push({
    id: db.transactions.length + 1,
    userId: input.investingUserId,
    type: 'deposit',
    amount: centsToKsh(depositCents),
    status: 'completed',
    reference: input.reference,
    description: `Verified Paystack deposit ${input.reference}`,
    createdAt: now,
  });

  const tierRows = db.referrals
    .filter((referral) => referral.referredId === input.investingUserId)
    .sort((a, b) => a.level - b.level);

  for (const row of tierRows) {
    const referrer = findUser(db, row.referrerId);
    const commissionCents = (depositCents * tierRates[row.level]) / 100n;
    const amount = centsToKsh(commissionCents);

    referrer.accountBalance = addMoney(referrer.accountBalance, commissionCents);
    referrer.totalReferralEarnings = addMoney(referrer.totalReferralEarnings, commissionCents);

    db.transactions.push({
      id: db.transactions.length + 1,
      userId: row.referrerId,
      type: 'referral_commission',
      amount,
      status: 'completed',
      description: `Level ${row.level} commission from deposit of User #${input.investingUserId}`,
      createdAt: now,
    });
  }

  return { status: 200, commissionRows: tierRows.length };
}

const rateToBasisPoints = (rate: string | number) => Math.round(Number(rate) * 10000);

export async function runDailyReturnsCron(
  db: InMemoryFinancialDb,
  input: { runDate: string; now?: Date }
) {
  const now = input.now ?? new Date(`${input.runDate}T00:00:00.000Z`);

  if (db.cronLogs.some((log) => log.runDate === input.runDate)) {
    return { status: 200, skipped: true, credited: '0.00' };
  }

  let investmentCount = 0;
  let totalCredited = 0n;

  for (const investment of db.investments.filter((candidate) => candidate.status === 'active')) {
    const user = findUser(db, investment.userId);
    const principal = toCents(investment.amount);
    const basisPoints = BigInt(rateToBasisPoints(investment.dailyReturnRate));
    const dailyReturnCents = (principal * basisPoints) / 10000n;

    user.accountBalance = addMoney(user.accountBalance, dailyReturnCents);
    totalCredited += dailyReturnCents;
    investmentCount += 1;
    investment.daysRemaining = Math.max(0, investment.daysRemaining - 1);

    if (investment.daysRemaining === 0) {
      investment.status = 'completed';
    }

    db.transactions.push({
      id: db.transactions.length + 1,
      userId: investment.userId,
      type: 'daily_return',
      amount: centsToKsh(dailyReturnCents),
      status: 'completed',
      description: `Daily return for Investment #${investment.id}`,
      createdAt: now,
    });
  }

  db.cronLogs.push({
    id: db.cronLogs.length + 1,
    runDate: input.runDate,
    investmentCount,
    totalCredited: centsToKsh(totalCredited),
    createdAt: now,
  });

  return { status: 200, skipped: false, credited: centsToKsh(totalCredited) };
}