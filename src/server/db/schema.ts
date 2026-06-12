import {
  bigint,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  phone: varchar('phone', { length: 32 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  accountBalanceCents: bigint('account_balance_cents', { mode: 'number' }).notNull().default(0),
  totalInvestedCents: bigint('total_invested_cents', { mode: 'number' }).notNull().default(0),
  totalEarnedCents: bigint('total_earned_cents', { mode: 'number' }).notNull().default(0),
  totalReferralEarningsCents: bigint('total_referral_earnings_cents', { mode: 'number' }).notNull().default(0),
  referralCode: varchar('referral_code', { length: 12 }).notNull().unique(),
  lastWithdrawalAt: timestamp('last_withdrawal_at'),
  role: mysqlEnum('role', ['user', 'admin', 'super_admin']).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const investmentPlans = mysqlTable('investment_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  dailyReturnRateBp: int('daily_return_rate_bp').notNull(),
  durationDays: int('duration_days').notNull(),
  minAmountCents: bigint('min_amount_cents', { mode: 'number' }).notNull(),
  maxAmountCents: bigint('max_amount_cents', { mode: 'number' }).notNull(),
  isActive: int('is_active').notNull().default(1),
});

export const referrals = mysqlTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: int('referrer_id').notNull().references(() => users.id),
  referredId: int('referred_id').notNull().references(() => users.id),
  level: int('level').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  uniqueReferredLevel: unique('unique_referred_level').on(table.referredId, table.level),
  referrerLevelIdx: index('idx_referrer_level').on(table.referrerId, table.level),
}));

export const investments = mysqlTable('investments', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  planId: int('plan_id').notNull().references(() => investmentPlans.id),
  planName: varchar('plan_name', { length: 100 }).notNull(),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  dailyReturnCents: bigint('daily_return_cents', { mode: 'number' }).notNull(),
  daysRemaining: int('days_remaining').notNull(),
  status: mysqlEnum('status', ['active', 'completed']).notNull().default('active'),
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
}, (table) => ({
  userStatusIdx: index('idx_user_status').on(table.userId, table.status),
}));

export const transactions = mysqlTable('transactions', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  type: mysqlEnum('type', ['deposit', 'withdrawal', 'daily_return', 'referral_commission', 'balance_adjustment']).notNull(),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  status: mysqlEnum('status', ['pending', 'completed', 'failed']).notNull().default('pending'),
  description: text('description').notNull(),
  phoneNumber: varchar('phone_number', { length: 32 }),
  reference: varchar('reference', { length: 100 }).unique(),
  transferCode: varchar('transfer_code', { length: 100 }),
  transferRecipientCode: varchar('transfer_recipient_code', { length: 100 }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userCreatedIdx: index('idx_user_created').on(table.userId, table.createdAt),
  typeStatusIdx: index('idx_type_status').on(table.type, table.status),
}));

export const cronLogs = mysqlTable('cron_logs', {
  id: serial('id').primaryKey(),
  runDate: varchar('run_date', { length: 10 }).notNull().unique(),
  investmentCount: int('investment_count').notNull().default(0),
  totalCreditedCents: bigint('total_credited_cents', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = mysqlTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: int('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: text('user_agent'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  actionCreatedIdx: index('idx_action_created').on(table.action, table.createdAt),
  userCreatedIdx: index('idx_user_created').on(table.userId, table.createdAt),
}));

export type User = typeof users.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;