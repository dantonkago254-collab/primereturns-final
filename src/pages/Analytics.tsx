import { Calculator, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useState } from 'react';

export const Analytics = () => {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(8);

  // Future Value = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
  const calculateFV = () => {
    const r = rate / 100 / 12;
    const n = 12;
    const t = years;
    const p = initial;
    const pmt = monthly;

    const compoundInterest = p * Math.pow(1 + r, n * t);
    const futureValueOfAnnuity = pmt * (Math.pow(1 + r, n * t) - 1) / r;
    return (compoundInterest + futureValueOfAnnuity).toFixed(2);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Calculators</h1>
        <p className="text-slate-500 mt-1">Project your future wealth and analyze performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Compound Interest Calculator</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Initial Investment
              </label>
              <input 
                type="number" 
                value={initial}
                onChange={(e) => setInitial(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Monthly Contribution
              </label>
              <input 
                type="number" 
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Years
                </label>
                <input 
                  type="number" 
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  % Expected Return
                </label>
                <input 
                  type="number" 
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-white">
            <p className="text-blue-100 text-sm font-medium mb-1">Estimated Future Value</p>
            <h3 className="text-3xl font-bold">${Number(calculateFV()).toLocaleString()}</h3>
            <p className="text-blue-200 text-xs mt-4">
              * This is an estimate. Actual returns may vary based on market conditions.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Portfolio Allocation</h3>
            <div className="space-y-4">
              {[
                { label: 'Stocks', value: 65, color: 'bg-blue-600' },
                { label: 'Crypto', value: 15, color: 'bg-violet-600' },
                { label: 'Real Estate', value: 10, color: 'bg-emerald-500' },
                { label: 'Bonds', value: 10, color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Smart Insights</h3>
              <p className="text-indigo-100 mb-6">Based on your current performance, you're on track to hit your $1M goal in 12.4 years.</p>
              <button className="px-6 py-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                View Full Analysis
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <TrendingUp className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
