import { Link } from 'wouter';
import { TrendingUp, ShieldCheck, Users, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import { formatKSH } from '../lib/utils';

const plans = [
  { id: 1, name: 'Starter Node', rate: 5, min: 1000, max: 10000, duration: 30 },
  { id: 2, name: 'Growth Engine', rate: 7.5, min: 10001, max: 100000, duration: 45 },
  { id: 3, name: 'Titan Core', rate: 10, min: 100001, max: 1000000, duration: 60 },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tighter">PrimeReturns</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            NOW LIVE IN KENYA
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            High-Yield Investing <br />Made Simple & Secure.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            Earn up to 10% daily returns on your capital. Automated daily payouts, secure M-Pesa withdrawals, and a 3-tier referral program.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Start Investing <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800" />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">12,400+ Kenyans</p>
                <p className="text-xs text-slate-500">Already investing today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-4xl font-black mb-2">KSh 142M+</h3>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Total Invested</p>
          </div>
          <div>
            <h3 className="text-4xl font-black mb-2">KSh 58M+</h3>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Paid to Users</p>
          </div>
          <div>
            <h3 className="text-4xl font-black mb-2">100%</h3>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Uptime Guarantee</p>
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Choose Your Growth Node</h2>
            <p className="text-slate-400">Fixed duration plans with automated daily credit cycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="group relative p-8 bg-slate-900 border border-white/5 rounded-3xl hover:border-blue-500/50 transition-all">
                <div className="absolute inset-0 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-colors rounded-3xl" />
                <div className="relative">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-blue-400 font-mono text-sm">{plan.rate}% DAILY</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <DollarSign className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-bold">{plan.duration} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Min Amount</span>
                      <span className="font-bold">{formatKSH(plan.min)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Max Amount</span>
                      <span className="font-bold">{formatKSH(plan.max)}</span>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-white/5 group-hover:bg-blue-600 text-white font-bold rounded-2xl transition-all border border-white/10 group-hover:border-transparent">
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kenyan Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block text-xs font-black tracking-widest text-blue-500 uppercase mb-4">Kenyans Are Winning</span>
            <h2 className="text-4xl font-bold mb-4 text-white">Real Stories from Real Investors.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Hear from everyday Kenyans using PrimeReturns to grow their capital.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Mercy Wanjiru', city: 'Nairobi • Westlands', initial: 'MW', role: 'Small Business Owner', earned: 'KSh 42,500', quote: 'I started with KSh 15,000 from my kiosk savings. Within 60 days I had earned enough to open a second stall. My M-Pesa withdrawal hit in 2 hours.' },
              { name: 'David Omondi', city: 'Kisumu • Manyatta', initial: 'DO', role: 'University Student', earned: 'KSh 18,800', quote: 'I was skeptical at first, but after my first small deposit and seeing the daily returns tick up, I brought in my classmates. Referral commissions paid my semester fees.' },
              { name: 'Beatrice Chebet', city: 'Eldoret • Kipkaren', initial: 'BC', role: 'Chama Treasurer', earned: 'KSh 84,200', quote: 'Our chama pooled KSh 200,000 into the Growth Engine plan. Returns beat what we were getting from fixed deposit accounts at our local bank. Highly recommended.' },
              { name: 'Peter Karanja', city: 'Nakuru • Lanet', initial: 'PK', role: 'Matatu Owner', earned: 'KSh 65,400', quote: 'When one of my vehicles broke down I needed passive income. PrimeReturns gave me consistent daily returns without the hassle of managing matatus. Cashout was simple.' },
              { name: 'Sarah Wekesa', city: 'Mombasa • Bamburi', initial: 'SW', role: 'Primary School Teacher', earned: 'KSh 27,000', quote: 'Kazi safi. The platform is in KSh, uses M-Pesa, and the customer service replies in Swahili. That alone makes it feel like ours. My first withdrawal was smooth.' },
              { name: 'James Kiprop', city: 'Kitale • Kiminini', initial: 'JK', role: 'Agribusiness Farmer', earned: 'KSh 126,500', quote: 'I used Titan Core with proceeds from my maize harvest. The platform paid out on schedule. I have already re-invested and brought my brother on board as a referral.' },
            ].map((person, i) => (
              <div key={i} className="group relative bg-slate-900 border border-white/5 p-8 rounded-3xl hover:border-blue-500/50 transition-all">
                <div className="absolute -top-4 left-6 text-6xl text-blue-500/20 font-serif leading-none select-none">"</div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-blue-600/20">
                        {person.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{person.name}</h4>
                        <p className="text-xs text-slate-500">{person.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Earned</p>
                      <p className="text-sm font-black text-emerald-500">{person.earned}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">{person.quote}</p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs">
                    <p className="text-slate-500 font-medium">{person.role}</p>
                    <div className="text-amber-500">★★★★★</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-blue-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8">Financial Freedom <br />in 3 Simple Steps.</h2>
            <div className="space-y-8">
              {[
                { title: 'Deposit via M-Pesa', desc: 'Securely load your wallet using our Paystack integrated gateway.' },
                { title: 'Activate Node', desc: 'Select an investment plan matching your budget and start earning.' },
                { title: 'Instant Cashout', desc: 'Withdraw your full earnings directly to your mobile money wallet.' }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xl">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                    <p className="text-blue-100/70">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-950 p-12 rounded-[3rem] shadow-2xl border border-white/10">
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle2 className="text-emerald-500" />
                  <span className="font-bold">Automated Daily Returns</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">Our proprietary engine credits your balance every 24 hours at UTC midnight automatically.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <ShieldCheck className="text-blue-500" />
                  <span className="font-bold">M-Pesa Verified Payments</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">Transactions are processed via licensed gateways ensures your capital is always trackable.</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="text-violet-500" />
                  <span className="font-bold">3-Tier Affiliate System</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">Earn 10%, 5%, and 2% from your network's deposits instantly into your balance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tighter">PrimeReturns</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 PrimeReturns Global. Built for the Kenyan market.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
