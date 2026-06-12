// src/hooks/useReferralTracking.ts
// Frontend utility responsible for listening on /ref/:code, validating it via tRPC,
// and persisting the referrer code until the user registers.
import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';

const STORAGE_KEY = 'primereturns_referrer_code';

/**
 * If the current URL matches /ref/XXXXXXXX, attempt to capture the referrer.
 * - Validates the code via the backend (validateReferrerCode tRPC query).
 * - Stores it in localStorage under the agreed-upon key.
 * - Redirects to /register afterwards.
 */
export const useReferralTracking = () => {
  const [, params] = useRoute<{ code: string }>('/ref/:code');
  const [, setLocation] = useLocation();
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    if (!params?.code) return;

    const capture = async () => {
      const code = params.code.toUpperCase().trim();
      try {
        const response = await fetch(`/api/referrals/validate/${encodeURIComponent(code)}`);
        const result = await response.json().catch(() => ({ valid: false }));
        if (response.ok && result.valid) {
          localStorage.setItem(STORAGE_KEY, code);
        }
      } catch (err) {
        console.error('[ReferralTracking] validation failed:', err);
      } finally {
        setCaptured(true);
        setLocation('/register', { replace: true });
      }
    };

    capture();
  }, [params, setLocation]);

  return { captured };
};

/**
 * Reads out any captured referrer code currently sitting in localStorage.
 * Clear it only AFTER a successful registration response.
 */
export const readPendingReferrer = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const consumeReferrer = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

export { STORAGE_KEY };
