export interface Investment {
  id: string;
  userId: string;
  name: string;
  category: 'Stock' | 'Crypto' | 'Real Estate' | 'Bond' | 'Other';
  amount: number;
  currentValue: number;
  expectedReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  date: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

export interface Transaction {
  id: string;
  investmentId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND';
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
