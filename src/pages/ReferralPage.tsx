// src/pages/ReferralPage.tsx
// The dynamic /ref/:code route handler — uses the useReferralTracking hook.
import { useReferralTracking } from '../hooks/useReferralTracking';
import { TrendingUp, Share2 } from 'lucide-react';

export const ReferralPage = () => {
  useReferralTracking();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-600/30 mb-8">
          <Share2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Capturing your referral link...</h1>
        <p className="text-slate-400 mb-8">
          We're associating this device with the referrer. You will be redirected to registration shortly.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp className="w-4 h-4" />
          <span>PrimeReturns Growth Engine</span>
        </div>
      </div>
    </div>
  );
};
