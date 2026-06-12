import { 
  ShieldAlert, 
  Activity, 
  Users, 
  ArrowUpCircle, 
  Database,
  CheckCircle,
  XCircle,
  Terminal
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatKSH, cn } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export const AdminPanel = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [activeAdminTab, setActiveAdminTab] = useState('payouts');
  const [metrics, setMetrics] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [cronLogs, setCronLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const metricsResponse = await apiFetch<{ metrics: any }>('/api/admin/metrics');
        const activityResponse = await apiFetch<{ logs: any[]; payments: any[] }>('/api/admin/activity');
        const withdrawalResponse = await apiFetch<{ withdrawals: any[] }>('/api/admin/withdrawals');
        const usersResponse = await apiFetch<{ users: any[] }>('/api/admin/users');
        const cronResponse = await apiFetch<{ logs: any[] }>('/api/admin/cron-logs');
        setMetrics(metricsResponse.metrics);
        setActivity(activityResponse.logs || []);
        setPayments(activityResponse.payments || []);
        setWithdrawals(withdrawalResponse.withdrawals || []);
        setUsersData(usersResponse.users || []);
        setCronLogs(cronResponse.logs || []);
      } catch (error) {
        console.error('Admin metrics failed to load:', error);
      }
    };

    loadAdmin();
  }, []);

  const reloadAdmin = async () => {
    const metricsResponse = await apiFetch<{ metrics: any }>('/api/admin/metrics');
    const activityResponse = await apiFetch<{ logs: any[]; payments: any[] }>('/api/admin/activity');
    const withdrawalResponse = await apiFetch<{ withdrawals: any[] }>('/api/admin/withdrawals');
    const usersResponse = await apiFetch<{ users: any[] }>('/api/admin/users');
    const cronResponse = await apiFetch<{ logs: any[] }>('/api/admin/cron-logs');
    setMetrics(metricsResponse.metrics);
    setActivity(activityResponse.logs || []);
    setPayments(activityResponse.payments || []);
    setWithdrawals(withdrawalResponse.withdrawals || []);
    setUsersData(usersResponse.users || []);
    setCronLogs(cronResponse.logs || []);
  };

  const approveWithdrawal = async (id: number) => {
    await apiFetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST', body: JSON.stringify({}) });
    await reloadAdmin();
  };

  const failWithdrawal = async (id: number) => {
    const reason = window.prompt('Reason for rejecting this withdrawal:', 'Rejected by admin');
    if (!reason) return;
    await apiFetch(`/api/admin/withdrawals/${id}/fail`, { method: 'POST', body: JSON.stringify({ reason }) });
    await reloadAdmin();
  };

  const adjustUserBalance = async (targetUser: any) => {
    const mode = window.prompt('Type balance action: set, add, or subtract', 'add')?.trim().toLowerCase();
    if (!mode) return;
    if (!['set', 'add', 'subtract'].includes(mode)) {
      alert('Invalid action. Use set, add, or subtract.');
      return;
    }

    const amount = window.prompt(`Amount in KSh to ${mode} for ${targetUser.email}:`, '1000');
    if (!amount) return;

    const reason = window.prompt('Reason for this manual balance adjustment:', 'Support-approved manual adjustment');
    if (!reason) return;

    try {
      await apiFetch(`/api/super-admin/users/${targetUser.id}/balance`, {
        method: 'POST',
        body: JSON.stringify({ mode, amount, reason }),
      });
      await reloadAdmin();
      alert('Balance adjustment saved and audited.');
    } catch (error) {
      alert((error as Error).message || 'Balance adjustment failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/20 p-2 rounded-lg">
              <ShieldAlert className="text-rose-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">PrimeReturns Admin</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">System Architect Mode</span>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
            {[
              { id: 'health', icon: Activity, label: 'Health' },
              { id: 'payouts', icon: ArrowUpCircle, label: 'Payouts' },
              { id: 'cron', icon: Terminal, label: 'Cron Logs' },
              { id: 'activity', icon: Activity, label: 'Activity' },
              { id: 'users', icon: Users, label: 'Users' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  activeAdminTab === tab.id ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        {activeAdminTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <Database className="text-blue-500" />
                <span className="text-emerald-500 text-xs font-black uppercase">Online</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Database Cluster</p>
              <h3 className="text-2xl font-bold">MySQL 8.0 Enterprise</h3>
              <p className="text-slate-500 text-xs mt-4">Users: {metrics?.totalUsers ?? 0} | Active investments: {metrics?.activeInvestments ?? 0}</p>
            </div>
            
            <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <Activity className="text-emerald-500" />
                <span className="text-emerald-500 text-xs font-black uppercase">Active</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Paystack Gateway</p>
              <h3 className="text-2xl font-bold">{metrics?.successfulPayments24h ?? 0} paid today</h3>
              <p className="text-slate-500 text-xs mt-4">Attempts 24h: {metrics?.paymentAttempts24h ?? 0} | Paid in: {formatKSH(metrics?.paidIn ?? 0)}</p>
            </div>

            <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <Users className="text-violet-500" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Active Sessions</p>
              <h3 className="text-2xl font-bold">{metrics?.activeUsers24h ?? 0} Users</h3>
              <p className="text-slate-500 text-xs mt-4">Logins 24h: {metrics?.logins24h ?? 0} | New users: {metrics?.newUsers24h ?? 0}</p>
            </div>

            <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl md:col-span-3">
              <p className="text-slate-500 text-xs font-bold uppercase mb-4">Financial Overview</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div><p className="text-slate-500 text-xs">Total invested</p><h3 className="text-xl font-black">{formatKSH(metrics?.totalInvested ?? 0)}</h3></div>
                <div><p className="text-slate-500 text-xs">Balances owed</p><h3 className="text-xl font-black">{formatKSH(metrics?.totalBalances ?? 0)}</h3></div>
                <div><p className="text-slate-500 text-xs">Referral earnings</p><h3 className="text-xl font-black">{formatKSH(metrics?.totalReferralEarnings ?? 0)}</h3></div>
                <div><p className="text-slate-500 text-xs">Pending withdrawals</p><h3 className="text-xl font-black">{metrics?.pendingWithdrawals ?? 0}</h3></div>
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'payouts' && (
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-bold">Pending M-Pesa Disbursements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50">
                  <tr className="text-slate-500 text-[10px] uppercase tracking-widest">
                    <th className="px-8 py-4">User Details</th>
                    <th className="px-8 py-4">Phone Number</th>
                    <th className="px-8 py-4">Requested Amount</th>
                    <th className="px-8 py-4">Ref Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((payout, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold">{payout.name}</p>
                        <p className="text-xs text-slate-500">{payout.email}</p>
                      </td>
                      <td className="px-8 py-6 font-mono text-sm">{payout.phone_number || 'Not provided'}</td>
                      <td className="px-8 py-6 font-black text-emerald-500">{formatKSH(payout.amount)}</td>
                      <td className="px-8 py-6">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded uppercase">
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => approveWithdrawal(payout.id)} className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => failWithdrawal(payout.id)} className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/20">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-500">No pending payout records yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeAdminTab === 'cron' && (
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Terminal className="text-blue-500" />
                Automated Return Engine Logs
              </h3>
              <button className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-colors">
                Force Trigger UTC Midnight
              </button>
            </div>
            <div className="space-y-4 font-mono text-xs">
              {cronLogs.map((log) => (
                <div key={log.id} className="flex gap-4 p-3 bg-slate-950/50 rounded-lg border border-white/5">
                  <span className="text-slate-500">[{new Date(log.createdAt).toLocaleString()}]</span>
                  <span className="text-emerald-500">RUN {log.runDate}: {log.investmentCount} investments credited {formatKSH(log.totalCredited)}</span>
                </div>
              ))}
              {cronLogs.length === 0 && <div className="p-8 text-center text-slate-500">No cron runs recorded yet.</div>}
            </div>
          </div>
        )}

        {activeAdminTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-bold">Login and System Activity</h3>
                <p className="text-xs text-slate-500">Recent auth, gateway, withdrawal, and admin events.</p>
              </div>
              <div className="divide-y divide-white/5 max-h-[560px] overflow-auto">
                {activity.map((log) => (
                  <div key={log.id} className="p-4 flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.email || 'System'} | {log.ip_address || 'No IP'}</p>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {activity.length === 0 && <div className="p-8 text-center text-slate-500">No activity logs yet.</div>}
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-bold">Payment Ledger</h3>
                <p className="text-xs text-slate-500">Deposits, withdrawals, and referral commission records.</p>
              </div>
              <div className="divide-y divide-white/5 max-h-[560px] overflow-auto">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold">{payment.type} | {payment.status}</p>
                      <p className="text-xs text-slate-500">{payment.email} | {payment.reference || payment.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">{formatKSH(payment.amount)}</p>
                      <p className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && <div className="p-8 text-center text-slate-500">No payment records yet.</div>}
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'users' && (
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-bold">Registered Users</h3>
              <p className="text-xs text-slate-500">Users, balances, deposits, investments, and last login records.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Invested</th>
                    <th className="px-6 py-4">Deposits</th>
                    <th className="px-6 py-4">Last Login</th>
                    {currentUser?.role === 'super_admin' && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersData.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <p className="font-bold">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="text-[10px] text-slate-600 font-mono">REF: {user.referralCode}</p>
                      </td>
                      <td className="px-6 py-4 capitalize text-sm">{user.role}</td>
                      <td className="px-6 py-4 font-black text-emerald-500">{formatKSH(user.accountBalance)}</td>
                      <td className="px-6 py-4 font-bold">{formatKSH(user.totalInvested)}</td>
                      <td className="px-6 py-4 text-sm">{user.completedDepositCount} paid / {user.investmentCount} nodes</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      {currentUser?.role === 'super_admin' && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => adjustUserBalance(user)} className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-black hover:bg-amber-500/20">
                            Adjust Balance
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {usersData.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No registered users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
