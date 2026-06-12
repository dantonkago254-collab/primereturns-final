import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { TrendingUp, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { consumeReferrer, readPendingReferrer } from '../hooks/useReferralTracking';
import { apiFetch } from '../lib/api';

export const LoginPage = () => {
  const [location, setLocation] = useLocation();
  const [isRegistering, setIsRegistering] = useState(location === '/register');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const setSession = useAuthStore(state => state.setSession);

  useEffect(() => {
    const exchangeOAuthCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('oauth_code');
      if (!code) return;

      try {
        setIsSubmitting(true);
        const auth = await apiFetch<{ token: string; user: any }>('/api/auth/oauth-exchange', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ code }),
        });
        setSession(auth.user, auth.token);
        window.history.replaceState({}, '', '/login');
        setLocation('/dashboard');
      } catch (error: any) {
        setErrorMessage(error.message || 'OAuth login failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    exchangeOAuthCode();
  }, [setLocation, setSession]);

  useEffect(() => {
    apiFetch<{ enabled: boolean }>('/api/auth/github-config', { auth: false })
      .then((config) => setGithubEnabled(config.enabled))
      .catch(() => setGithubEnabled(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGoogle = async () => {
      try {
        const config = await apiFetch<{ enabled: boolean; clientId: string }>('/api/auth/google-config', { auth: false });
        if (!config.enabled || !config.clientId || cancelled) return;
        setGoogleEnabled(true);

        await new Promise<void>((resolve, reject) => {
          if ((window as any).google?.accounts?.id) return resolve();
          const existing = document.getElementById('google-identity-script');
          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Google script failed to load.')), { once: true });
            return;
          }
          const script = document.createElement('script');
          script.id = 'google-identity-script';
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Google script failed to load.'));
          document.head.appendChild(script);
        });

        if (cancelled || !googleButtonRef.current) return;
        const googleNonce =
          (window.crypto && 'randomUUID' in window.crypto)
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

        (window as any).google.accounts.id.initialize({
          client_id: config.clientId,
          nonce: googleNonce,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setErrorMessage('Google did not return a sign-in credential. Try again.');
              return;
            }

            try {
              setGoogleLoading(true);
              const referrerCode = readPendingReferrer();
              const auth = await apiFetch<{ token: string; user: any }>('/api/auth/google', {
                method: 'POST',
                auth: false,
                body: JSON.stringify({ credential: response.credential, referrerCode: referrerCode || undefined, nonce: googleNonce }),
              });
              consumeReferrer();
              setSession(auth.user, auth.token);
              setLocation('/dashboard');
            } catch (error: any) {
              setErrorMessage(error.message || 'Google sign-in failed.');
            } finally {
              setGoogleLoading(false);
            }
          },
        });

        (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: isRegistering ? 'signup_with' : 'signin_with',
          width: 320,
        });
      } catch (error) {
        console.warn('Google sign-in is unavailable:', error);
      }
    };

    loadGoogle();

    return () => {
      cancelled = true;
    };
  }, [isRegistering, setLocation, setSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isSubmitting) return;

    if (isRecovering) {
      try {
        setIsSubmitting(true);
        const response = await apiFetch<{ message: string; resetLink?: string }>('/api/auth/forgot-password', {
          method: 'POST',
          auth: false,
          body: JSON.stringify({ email }),
        });
        setSuccessMessage(response.resetLink ? `${response.message} Reset link: ${response.resetLink}` : response.message);
      } catch (error: any) {
        setErrorMessage(error.message || 'Password recovery failed.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (email) {
      if (isRegistering && name.trim().length < 2) {
        setErrorMessage('Enter your full name to create an account.');
        return;
      }

      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters.');
        return;
      }

      if (isRegistering && confirmPassword && password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      try {
        setIsSubmitting(true);
        const referrerCode = readPendingReferrer();
        const response = await apiFetch<{ token: string; user: any }>(
          isRegistering ? '/api/auth/register' : '/api/auth/login',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify(
              isRegistering
                ? { name, email, password, referrerCode: referrerCode || undefined }
                : { email, password }
            ),
          }
        );

        if (isRegistering) consumeReferrer();
        setSession(response.user, response.token);
        setLocation('/dashboard');
      } catch (error: any) {
        if (!isRegistering && error?.status === 401) {
          setErrorMessage('Invalid login. If this is your first time, click Create One first, then register.');
          return;
        }

        if (error?.status === 503) {
          setErrorMessage('Backend database is not connected. Check DATABASE_URL in your hosting environment, then redeploy.');
          return;
        }

        if (error?.status === 500) {
          setErrorMessage('Backend error. Check hosting logs and confirm JWT_SECRET, DATABASE_URL, and APP_URL are set correctly.');
          return;
        }

        setErrorMessage(error.message || 'Authentication failed. Please try again or contact support.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = () => {
    const next = !isRegistering;
    setIsRecovering(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsRegistering(next);
    setLocation(next ? '/register' : '/login');
  };

  const startGithubLogin = () => {
    const referrerCode = readPendingReferrer();
    const query = referrerCode ? `?referrerCode=${encodeURIComponent(referrerCode)}` : '';
    window.location.href = `/api/auth/github/start${query}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tighter">PrimeReturns</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRecovering ? 'Recover your password' : isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isRecovering ? 'Enter your email and we will send a reset link.' : isRegistering ? 'Start your high-yield journey today' : 'Access your wealth nodes dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 space-y-6">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 break-words">
              {successMessage}
            </div>
          )}

          {isRegistering && !isRecovering && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {!isRecovering && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {isRegistering && !isRecovering && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Please wait...' : isRecovering ? 'Send Reset Link' : isRegistering ? 'Create Account' : 'Sign In'} <ArrowRight className="w-5 h-5" />
          </button>

          {!isRegistering && !isRecovering && (
            <button
              type="button"
              onClick={() => {
                setIsRecovering(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </button>
          )}

          {isRecovering && (
            <button
              type="button"
              onClick={() => {
                setIsRecovering(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Back to login
            </button>
          )}

          {!isRecovering && (googleEnabled || githubEnabled) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 text-xs uppercase tracking-widest font-bold">
                <div className="h-px bg-white/10 flex-1" />
                or
                <div className="h-px bg-white/10 flex-1" />
              </div>
              {googleEnabled && (
                <div className="flex justify-center min-h-[44px]">
                  {googleLoading ? (
                    <div className="text-slate-400 text-sm font-semibold py-3">Signing in with Google...</div>
                  ) : (
                    <div ref={googleButtonRef} />
                  )}
                </div>
              )}
              {githubEnabled && (
                <button
                  type="button"
                  onClick={startGithubLogin}
                  className="w-full py-3 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-100 transition-colors"
                >
                  Continue with GitHub
                </button>
              )}
            </div>
          )}
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-blue-500 font-bold hover:underline"
          >
            {isRegistering ? 'Sign In' : 'Create One'}
          </button>
        </p>
      </div>
    </div>
  );
};
