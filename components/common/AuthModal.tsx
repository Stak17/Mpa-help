'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, Mail, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/services/authContext';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signInWithGoogle, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<'google' | 'google-redirect' | 'email' | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'info' | 'error' | 'warning'; text: string } | null>(null);

  if (!showAuthModal) return null;

  const handleGoogleSignIn = async (forceRedirect: boolean = false) => {
    setLoading(true);
    setLoadingMethod(forceRedirect ? 'google-redirect' : 'google');
    setNotice(null);
    try {
      await signInWithGoogle(forceRedirect);
      setShowAuthModal(false);
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setNotice({
          type: 'info',
          text: 'Google account selection was closed. Please click below to choose your Google account.',
        });
      } else if (code === 'auth/popup-blocked') {
        setNotice({
          type: 'warning',
          text: 'Pop-up was blocked by your browser. You can use the Full-Screen Google Sign-In below.',
        });
      } else if (code === 'auth/unauthorized-domain') {
        setNotice({
          type: 'info',
          text: 'Notice: On external hosting (such as Netlify), you can sign in directly by typing your Gmail address below.',
        });
      } else if (code === 'auth/network-request-failed') {
        setNotice({
          type: 'error',
          text: 'Network connection was interrupted. Please check your data connection and try again.',
        });
      } else {
        setNotice({
          type: 'error',
          text: 'Google sign-in was interrupted. You can also sign in directly with your Gmail address below.',
        });
      }
    } finally {
      if (!forceRedirect) {
        setLoading(false);
        setLoadingMethod(null);
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    setLoadingMethod('email');
    setNotice(null);
    try {
      await signInWithEmail(emailInput.trim());
      setShowAuthModal(false);
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Could not sign in with this email. Please check and try again.',
      });
    } finally {
      setLoading(false);
      setLoadingMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-2xl mb-3 shadow-xs">
            🇺🇬
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Sign in to Mpa Help</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            Connect your Google account to sync your documents, CVs, budgets, and marketing plans across devices.
          </p>
        </div>

        {/* Informative notice/message */}
        {notice && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-start gap-2.5 transition ${
              notice.type === 'info'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                : notice.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{notice.text}</p>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {/* PRIMARY: Official Google Account Sign-In Button */}
          <button
            onClick={() => handleGoogleSignIn(false)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/80 font-bold text-xs sm:text-sm text-stone-900 dark:text-white shadow-xs hover:shadow-md transition cursor-pointer disabled:opacity-60 group"
          >
            {loading && loadingMethod === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            ) : (
              <svg className="w-4 h-4 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>
              {loading && loadingMethod === 'google'
                ? 'Opening Google Account Picker...'
                : 'Continue with Google'}
            </span>
          </button>

          {/* Full-Screen Redirect Option (Great for mobile browsers) */}
          <button
            onClick={() => handleGoogleSignIn(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs transition cursor-pointer"
            title="Open Google Account Selection in Full Screen"
          >
            {loading && loadingMethod === 'google-redirect' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            )}
            <span>
              {loading && loadingMethod === 'google-redirect'
                ? 'Redirecting to Google...'
                : 'Full-Screen Google Sign-In'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative bg-white dark:bg-stone-900 px-2.5 text-[11px] font-medium text-stone-400">
              OR SIGN IN WITH GMAIL
            </span>
          </div>

          {/* Direct Gmail Input Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-2">
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-emerald-600 focus:border-emerald-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {loading && loadingMethod === 'email' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                {loading && loadingMethod === 'email' ? 'Signing in...' : 'Sign In with this Gmail'}
              </span>
            </button>
          </form>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => setShowAuthModal(false)}
            className="w-full py-1.5 px-4 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium transition cursor-pointer text-center block"
          >
            Continue as Guest (Save locally)
          </button>
        </div>

        {/* Security footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Google-authenticated. Your data is encrypted and private.</span>
        </div>
      </div>
    </div>
  );
};
