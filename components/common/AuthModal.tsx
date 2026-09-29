'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/services/authContext';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<'popup' | 'redirect' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleGoogleSignIn = async (forceRedirect: boolean = false) => {
    setLoading(true);
    setLoadingMethod(forceRedirect ? 'redirect' : 'popup');
    setErrorMsg(null);
    try {
      await signInWithGoogle(forceRedirect);
    } catch (err: any) {
      console.error('Sign-in modal caught error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        setErrorMsg('Your mobile browser blocked the pop-up window. Tap the Full-Screen Sign-In button below.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Account selection was closed before completing. Tap below to select your Gmail account.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain notice: You can continue using all Mpa Help features as Guest with local offline saving.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Network connection was interrupted. Please check your data connection and try again.');
      } else {
        setErrorMsg('Could not open the account selector in pop-up mode. Please try the Full-Screen option below.');
      }
    } finally {
      // If redirecting, page will unload, so only reset if error or completed
      setLoading(false);
      setLoadingMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-2xl mb-3 shadow-xs">
            🇺🇬
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Sign in to Mpa Help</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
            Sign in with your Gmail account to sync your documents, CVs, budgets, and marketing plans.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {/* Primary Google Sign-In */}
          <button
            onClick={() => handleGoogleSignIn(false)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 font-semibold text-xs sm:text-sm text-stone-800 dark:text-stone-100 shadow-xs transition cursor-pointer"
          >
            {loading && loadingMethod === 'popup' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              {loading && loadingMethod === 'popup'
                ? 'Loading Gmail accounts...'
                : 'Continue with Google'}
            </span>
          </button>

          {/* Full-Screen Direct Redirect Option (Guaranteed to work on all mobile phones & pop-up blocked browsers) */}
          <button
            onClick={() => handleGoogleSignIn(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-medium text-xs transition"
            title="Open Google Account Selection in Full Screen"
          >
            {loading && loadingMethod === 'redirect' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            )}
            <span>
              {loading && loadingMethod === 'redirect'
                ? 'Opening Google Page...'
                : 'Full-Screen Google Sign-In'}
            </span>
          </button>

          {/* Guest fallback button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="w-full py-2 px-4 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium transition"
          >
            Continue as Guest (Save locally)
          </button>
        </div>

        <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Your Gmail details are encrypted and never shared.</span>
        </div>
      </div>
    </div>
  );
};
