import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Copy, 
  LayoutDashboard,
  PieChart,
  History,
  Share2,
  Info
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { formatKSH, cn } from '../lib/utils';
import { ReferralDashboard } from '../components/ReferralDashboard';
import { apiFetch } from '../lib/api';

export const Dashboard = () => {
  const { user, token, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [hasDeposited, setHasDeposited] = useState(false);
  const [serverInvestments, setServerInvestments] = useState<any[]>([]);
  const [serverTransactions, setServerTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user && (user.totalInvested > 0 || localStorage.getItem('has_deposited') === 'true')) {
      setHasDeposited(true);
    }
  }, [user?.totalInvested]);

  const refreshDashboard = async () => {
    const data = await apiFetch<{ user: any; investments: any[]; transactions: any[] }>('/api/dashboard');
    updateUser(data.user);
    setServerInvestments(data.investments || []);
    setServerTransactions(data.transactions || []);
  };

  const handlePaystackDeposit = async () => {
    if (!user || !user.email) {
      alert('⚠️ Please login first to make a deposit.');
      return;
    }

    try {
      setIsDepositing(true);
      if (!token) {
        alert('Payments require the live backend session. Please log out, register or login again on the Railway live URL, then try again.');
        setIsDepositing(false);
        return;
      }

      const data = await apiFetch<{ reference: string; authorizationUrl: string }>('/api/paystack/initialize', {
        method: 'POST',
        body: JSON.stringify({ amount: selectedAmount }),
      });
      localStorage.setItem('primereturns_pending_deposit', JSON.stringify({ reference: data.reference, amount: selectedAmount }));
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error('Paystack checkout failed:', error);
      setIsDepositing(false);
      alert((error as Error).message || 'Failed to initialize Paystack hosted checkout. Check Railway PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, APP_URL, and DATABASE_URL.');
    }
  };

  const handleWithdrawalRequest = async () => {
    const phoneNumber = window.prompt('Enter your M-Pesa phone number for withdrawal:', user?.phone || '2547');
    if (!phoneNumber) return;

    try {
      const data = await apiFetch<{ user: any; investments: any[]; transactions: any[] }>('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
      updateUser(data.user);
      setServerInvestments(data.investments || []);
      setServerTransactions(data.transactions || []);
      alert('Withdrawal request submitted for admin review.');
    } catch (error) {
      alert((error as Error).message || 'Withdrawal request failed.');
    }
  };

  useEffect(() => {
    const bootDashboard = async () => {
      if (!user) return;
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference') || params.get('trxref');
      if (reference) {
        const data = await apiFetch<{ user: any; investments: any[]; transactions: any[] }>('/api/paystack/verify', {
          method: 'POST',
          body: JSON.stringify({ reference }),
        });
        updateUser(data.user);
        setServerInvestments(data.investments || []);
        setServerTransactions(data.transactions || []);
        localStorage.removeItem('primereturns_pending_deposit');
        setHasDeposited(true);
        window.history.replaceState({}, '', window.location.pathname);
        alert(`Deposit verified successfully. Reference: ${reference}`);
        return;
      }
      await refreshDashboard();
    };

    bootDashboard().catch((error) => console.error('Dashboard boot failed:', error));
  }, [user?.id]);
  
  // Tie live balance display directly to the user store (so it reflects real Paystack credits & growth engine ticks)
  const liveBalance = user?.accountBalance || 0;

  if (!user) return null;

  const referralLink = `https://primereturns.co.ke/ref/${user.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="font-black tracking-tight text-slate-900">PrimeReturns</span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'investments', icon: PieChart, label: 'Investments' },
            { id: 'transactions', icon: History, label: 'Transactions' },
            { id: 'referrals', icon: Share2, label: 'Referrals' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Account Role</p>
            <p className="text-sm font-bold capitalize">{user.role}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Karibu, {user.name}</h1>
            <p className="text-slate-500 text-sm">Managing your wealth nodes.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handlePaystackDeposit}
              disabled={isDepositing}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isDepositing ? 'Initializing Gateway...' : `Deposit ${formatKSH(selectedAmount)}`}
            </button>
            <button onClick={handleWithdrawalRequest} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors">
              Withdraw
            </button>
            <button 
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Amount Selector */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1">Select Deposit Amount</p>
            <p className="text-slate-600 text-sm">Choose an amount to activate your node immediately.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000, 25000, 50000, 100000].map(amount => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                  selectedAmount === amount
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
              >
                KSh {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+2.4% Today</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Withdrawable Balance</p>
            <h3 data-testid="live-balance" className="text-2xl font-black text-slate-900 mt-1">{formatKSH(liveBalance)}</h3>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Invested</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatKSH(user.totalInvested)}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Profit</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatKSH(user.totalEarned)}</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ref Earnings</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatKSH(user.totalReferralEarnings)}</h3>
          </div>
        </div>

        {/* Dynamic Section */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Node Performance</h2>
                <select className="bg-slate-50 border-none rounded-lg text-sm px-4 py-2 outline-none ring-1 ring-slate-200">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              <div className="h-64 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Performance chart rendering...</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-blue-600 rounded-3xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Build Your Network</h4>
                    <p className="text-blue-100 text-sm mb-6">Earn up to 10% on direct referrals. Start sharing your link.</p>
                    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20">
                      <span className="text-xs font-mono truncate flex-1 px-2">{user.referralCode}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="bg-white text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copySuccess && <p className="absolute bottom-2 right-4 text-[10px] font-bold">Link Copied!</p>}
                  </div>
                  <Share2 className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                </div>

                {hasDeposited && (
                  <div className="p-6 border border-amber-200 rounded-3xl bg-amber-50/80 relative">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-amber-600" />
                      Platform Withdrawal Terms
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 font-medium leading-relaxed">
                      <li>• Withdrawals have a 14-day cooldown period between successful payouts.</li>
                      <li>• At least 1 active referral is required to initiate a cashout.</li>
                      <li>• Full account balance must be withdrawn per single payout request.</li>
                      <li>• M-Pesa disbursements are processed Mon–Fri by admin.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div>
               <h2 className="text-xl font-bold mb-6">Your Active Nodes</h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                       <th className="pb-4 font-bold">Plan</th>
                       <th className="pb-4 font-bold">Amount</th>
                       <th className="pb-4 font-bold">Daily Return</th>
                       <th className="pb-4 font-bold">Remaining</th>
                       <th className="pb-4 font-bold">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {(serverInvestments.length ? serverInvestments : []).map((inv, idx) => (
                       <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 font-bold text-slate-900">{inv.planName}</td>
                         <td className="py-6 font-medium">{formatKSH(inv.amount)}</td>
                          <td className="py-6 text-emerald-600 font-bold">+{formatKSH(inv.dailyReturn)}</td>
                          <td className="py-6 font-medium text-slate-500">{inv.daysRemaining} Days</td>
                         <td className="py-6">
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                             {inv.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                      {serverInvestments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                            No active investments yet. Make your first verified Paystack deposit to create one.
                          </td>
                        </tr>
                      )}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div>
               <h2 className="text-xl font-bold mb-6">Recent Ledger Statements</h2>
               <div className="space-y-4">
                  {serverTransactions.map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          tx.type === 'deposit' ? "bg-blue-50 text-blue-600" :
                          tx.type === 'referral_commission' ? "bg-violet-50 text-violet-600" :
                          "bg-emerald-50 text-emerald-600"
                        )}>
                          {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-black",
                          tx.type === 'deposit' ? "text-slate-900" : "text-emerald-600"
                        )}>
                          {tx.type === 'deposit' ? '' : '+'}{formatKSH(tx.amount)}
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                 ))}
                  {serverTransactions.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">
                      No ledger entries yet.
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'referrals' && <ReferralDashboard />}
        </div>
      </main>
    </div>
  );
};
