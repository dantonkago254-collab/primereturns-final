import { Shield, Wallet, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const notifications = [
  { id: '1', title: 'Security Alert', message: 'New login detected from a Chrome browser on Windows.', type: 'security', time: '2 hours ago', read: false },
  { id: '2', title: 'Milestone Reached', message: 'Congratulations! Your portfolio has grown by 15% this month.', type: 'milestone', time: '5 hours ago', read: false },
  { id: '3', title: 'Investment Reminder', message: 'Don\'t forget to rebalance your stock portfolio today.', type: 'reminder', time: '1 day ago', read: true },
  { id: '4', title: 'System Update', message: 'New features have been added to the analytics dashboard.', type: 'system', time: '2 days ago', read: true },
];

export const Notifications = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with your investment activity.</p>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.map((n) => (
            <div key={n.id} className={cn(
              "p-6 flex gap-4 transition-colors",
              n.read ? "bg-white" : "bg-blue-50/30"
            )}>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'security' ? "bg-rose-100 text-rose-600" :
                n.type === 'milestone' ? "bg-emerald-100 text-emerald-600" :
                n.type === 'reminder' ? "bg-amber-100 text-amber-600" :
                "bg-blue-100 text-blue-600"
              )}>
                {n.type === 'security' && <Shield className="w-6 h-6" />}
                {n.type === 'milestone' && <TrendingUp className="w-6 h-6" />}
                {n.type === 'reminder' && <Wallet className="w-6 h-6" />}
                {n.type === 'system' && <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-xs text-slate-400 font-medium">{n.time}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quick helper to avoid errors if TrendingUp is used
function TrendingUp(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
