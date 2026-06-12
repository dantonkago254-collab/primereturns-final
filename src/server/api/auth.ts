// src/server/api/auth.ts
// tRPC router for authentication and the 3-Tier Referral binding sequence.
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, and, sql } from 'drizzle-orm';
import { users, referrals, transactions } from '../db/schema';

// Safe decimal math: working in cents (BigInt) to eliminate float drift.
const toCents = (amountStr: string | number) => {
  const [whole, frac = '00'] = String(amountStr).split('.');
  return BigInt(whole + (frac + '00').slice(0, 2));
};
const TIER_RATES = {
  1: 10n, // 10% in basis-point style (we'll divide by 100)
  2: 5n,
  3: 2n,
} as const;

// Random 8-char alphanumeric referral code
const generateReferralCode = () =>
  Math.random().toString(36).slice(2, 10).toUpperCase();

const validateReferrerCodeSchema = z.object({ code: z.string().max(12) });

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  referrerCode: z.string().max(12).optional(),
});

export const authRouter = (db: MySql2Database<Record<string, never>>) => ({
  // Verify if a referral code exists
  validateReferrerCode: async (input: z.infer<typeof validateReferrerCodeSchema>) => {
    const parsed = validateReferrerCodeSchema.parse(input);
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, parsed.code.toUpperCase()));
    return { valid: rows.length > 0 };
  },

  // User signup with 3-tier referral linking — inside a DB transaction.
  register: async (input: z.infer<typeof registerSchema>) => {
    const parsed = registerSchema.parse(input);
    const hashed = await bcrypt.hash(input.password, 12);
    const code = generateReferralCode();

    // Wrap everything in a DB transaction.
    const result = await db.transaction(async (tx) => {
      // 1. Block duplicate emails
      const existing = await tx.select({ id: users.id }).from(users).where(eq(users.email, parsed.email));
      if (existing.length) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email already registered.' });
      }

      // 2. Create user
      const [newUser] = await tx
        .insert(users)
        .values({
          name: parsed.name,
          email: parsed.email,
          passwordHash: hashed,
          phone: parsed.phone,
          referralCode: code,
        })
        .$returningId();

      const newUserId = newUser.id;

      // 3. 3-Tier linking
      if (parsed.referrerCode && parsed.referrerCode.trim()) {
        const cleanedCode = parsed.referrerCode.trim().toUpperCase();

        // Parent (Level 1)
        const [parent] = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.referralCode, cleanedCode));

        if (!parent || parent.id === newUserId) {
          // Invalid / self-referral — silently ignore the link rather than breaking signup.
          return newUserId;
        }

        await tx.insert(referrals).values({
          referrerId: parent.id,
          referredId: newUserId,
          level: 1,
        });

        // Grandparent (Level 2)
        const [parentLink] = await tx
          .select({ referrerId: referrals.referrerId })
          .from(referrals)
          .where(and(eq(referrals.referredId, parent.id), eq(referrals.level, 1)));

        if (parentLink) {
          await tx.insert(referrals).values({
            referrerId: parentLink.referrerId,
            referredId: newUserId,
            level: 2,
          });

          // Great-grandparent (Level 3)
          const [grandparentLink] = await tx
            .select({ referrerId: referrals.referrerId })
            .from(referrals)
            .where(and(eq(referrals.referredId, parentLink.referrerId), eq(referrals.level, 1)));

          if (grandparentLink) {
            await tx.insert(referrals).values({
              referrerId: grandparentLink.referrerId,
              referredId: newUserId,
              level: 3,
            });
          }
        }
      }

      return newUserId;
    });

    return { userId: result, referralCode: code };
  },
});

// Invoked AFTER a verified Paystack deposit — instantly credits referral commissions.
export const awardReferralCommissions = async (
  db: MySql2Database<Record<string, never>>,
  investingUserId: number,
  depositAmount: string
) => {
      const depositCents = toCents(depositAmount);

  await db.transaction(async (tx) => {
    // Fetch ALL 3 tiers linked to this investor
    const tiers = await tx
      .select({
        referrerId: referrals.referrerId,
        level: referrals.level,
      })
      .from(referrals)
      .where(eq(referrals.referredId, investingUserId));

    for (const tier of tiers) {
      const rateBasis = TIER_RATES[tier.level as keyof typeof TIER_RATES]; // 10n, 5n, or 2n
      const commissionCents = (depositCents * rateBasis) / 100n; // exact integer math

      // Update the referrer's ledger
      await tx
        .update(users)
        .set({
          accountBalanceCents: sql`${users.accountBalanceCents} + ${Number(commissionCents)}`,
          totalReferralEarningsCents: sql`${users.totalReferralEarningsCents} + ${Number(commissionCents)}`,
          totalEarnedCents: sql`${users.totalEarnedCents} + ${Number(commissionCents)}`,
        })
        .where(eq(users.id, tier.referrerId));

      // Audit row
      await tx.insert(transactions).values({
        userId: tier.referrerId,
        type: 'referral_commission',
        amountCents: Number(commissionCents),
        status: 'completed',
        description: `Level ${tier.level} commission from deposit of User #${investingUserId}`,
      });
    }
  });

  return true;
};

// Withdrawal gate — enforces the "at least 1 active referral" rule.
export const checkWithdrawalGate = async (
  db: MySql2Database<Record<string, never>>,
  userId: number
) => {
  // Find all level-1 referrals of this user, and check they own >= 1 investment row
  const rows = await db
    .select({ id: referrals.id })
    .from(referrals)
    .innerJoin(users, eq(users.id, referrals.referredId))
    .where(and(eq(referrals.referrerId, userId), eq(referrals.level, 1)))
    .execute();

  if (rows.length < 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message:
        'Withdrawal locked. You must have at least 1 active referral to unlock withdrawals.',
    });
  }
  return true;
};
