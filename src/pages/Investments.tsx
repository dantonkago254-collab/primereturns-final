import { Plus, Search, Filter, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

const investments = [
  { id: 1, name: 'S&P 500 ETF', category: 'Stock', amount: 25000, current: 28450, change: 13.8, status: 'Active', risk: 'Medium' },
  { id: 2, name: 'Bitcoin', category: 'Crypto', amount: 10000, current: 12200, change: 22.0, status: 'Active', risk: 'High' },
  { id: 3, name: 'Tesla Inc.', category: 'Stock', amount: 15000, current: 14100, change: -6.0, status: 'Active', risk: 'High' },
  { id: 4, name: 'Government Bond', category: 'Bond', amount: 50000, current: 51200, change: 2.4, status: 'Completed', risk: 'Low' },
  { id: 5, name: 'Gold Bullion', category: 'Other', amount: 8000, current: 8400, change: 5.0, status: 'Active', risk: 'Low' },
];

export const Investments = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investments</h1>
          <p className="text-slate-500 mt-1">Manage and track your investment portfolio.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20">
          <Plus className="w-5 h-5" />
          Add Investment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search investments..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Investment</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Current Value</th>
                <th className="px-6 py-4 font-semibold">Performance</th>
                <th className="px-6 py-4 font-semibold">Risk</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investments.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{inv.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{inv.category}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ${inv.current.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-bold",
                      inv.change >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {inv.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {inv.change > 0 ? '+' : ''}{inv.change}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      inv.risk === 'Low' ? "bg-blue-50 text-blue-600" :
                      inv.risk === 'Medium' ? "bg-amber-50 text-amber-600" :
                      "bg-rose-50 text-rose-600"
                    )}>
                      {inv.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
