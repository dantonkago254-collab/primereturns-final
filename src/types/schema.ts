export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  accountBalance: number;
  totalInvested: number;
  totalEarned: number;
  totalReferralEarnings: number;
  referralCode: string;
  lastWithdrawalAt: string | null;
  role: 'user' | 'admin' | 'super_admin';
}

export interface InvestmentPlan {
  id: number;
  name: string;
  dailyReturnRate: number;
  durationDays: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

export interface Investment {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  amount: number;
  dailyReturn: number;
  daysRemaining: number;
  status: 'active' | 'completed';
  startDate: string;
  endDate: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'deposit' | 'withdrawal' | 'daily_return' | 'referral_commission' | 'balance_adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Referral {
  id: number;
  referrerId: number;
  referredId: number;
  level: 1 | 2 | 3;
  commissionRate: number;
  totalEarned: number;
}
