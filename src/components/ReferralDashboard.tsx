import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Share2, Users, XCircle, Coins } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatKSH, cn } from '../lib/utils';
import { useAuthStore } from '../store/useAuthStore';

interface ReferralNode {
  id: number;
  name: string;
  email: string;
  level: 1 | 2 | 3;
  joinedAt: string;
  hasInvested: boolean;
}

interface ReferralTransaction {
  type: string;
  amount: number;
}

const obfuscate = (email: string) => {
  if (!email.includes('@')) return email;
  const [user, domain] = email.split('@');
  return `${user.slice(0, Math.min(3, user.length))}***@${domain}`;
};

export const ReferralDashboard = () => {
  const { user, updateUser } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<ReferralNode[]>([]);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://primereturns.co.ke';
  const referralCode = user?.referralCode || '';
  const referralLink = `${origin}/ref/${referralCode}`;

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        const data = await apiFetch<{ user: any; referrals: ReferralNode[]; transactions: ReferralTransaction[] }>('/api/dashboard');
        updateUser(data.user);
        setNetwork(data.referrals || []);
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Failed to load referral dashboard:', error);
      }
    };

    loadReferrals();
  }, []);

  const totals = useMemo(() => {
    const commissionTotal = transactions
      .filter((tx) => tx.type === 'referral_commission')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalEarned: user?.totalReferralEarnings || commissionTotal,
      totalUsers: network.length,
      l1Count: network.filter((node) => node.level === 1).length,
      l2Count: network.filter((node) => node.level === 2).length,
      l3Count: network.filter((node) => node.level === 3).length,
    };
  }, [network, transactions, user?.totalReferralEarnings]);

  const copyLink = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareNative = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({ title: 'Join me on PrimeReturns', text: 'Use my referral link to join PrimeReturns.', url: referralLink });
      } catch {
        return;
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Referral Network</h1>
        <p className="text-slate-500 text-sm mt-1">Track your direct and extended referral network in real time.</p>
      </div>

      <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-blue-600/20">
        <Share2 className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-widest text-blue-100 mb-2">Your Personal Invitation Link</p>
          <h3 className="text-xl font-bold mb-6">Share it anywhere to grow your network.</h3>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 font-mono text-sm break-all">
              {referralLink}
            </div>
            <button onClick={copyLink} className="bg-white text-blue-600 hover:bg-blue-50 transition-all font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2">
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={shareNative} className="bg-white/10 hover:bg-white/20 transition-all text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/20">
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
          <p className="text-blue-100 text-sm">Referral code: <span className="font-black">{referralCode}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 mb-4 w-fit"><Coins className="w-6 h-6" /></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Referral Earnings</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatKSH(totals.totalEarned)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 mb-4 w-fit"><Users className="w-6 h-6" /></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Invited Users</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{totals.totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Tier Breakdown</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Level 1</span><b>{totals.l1Count}</b></div>
            <div className="flex justify-between"><span>Level 2</span><b>{totals.l2Count}</b></div>
            <div className="flex justify-between"><span>Level 3</span><b>{totals.l3Count}</b></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Network Activity</h3>
            <p className="text-xs text-slate-500">Real users connected to your referral tree.</p>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">{network.length} members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-3 font-black">User</th>
                <th className="px-6 py-3 font-black">Tier</th>
                <th className="px-6 py-3 font-black">Date Joined</th>
                <th className="px-6 py-3 font-black text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {network.map((node) => (
                <tr key={`${node.level}-${node.id}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{node.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{obfuscate(node.email)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest', node.level === 1 ? 'bg-blue-50 text-blue-600' : node.level === 2 ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600')}>
                      Level {node.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(node.joinedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn('inline-flex items-center gap-1 text-xs font-bold', node.hasInvested ? 'text-emerald-600' : 'text-slate-400')}>
                      {node.hasInvested ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {node.hasInvested ? 'Active' : 'Invited'}
                    </span>
                  </td>
                </tr>
              ))}
              {network.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">No referrals yet. Share your link to start building your network.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};