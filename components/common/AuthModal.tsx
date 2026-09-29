'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '@/services/authContext';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signInWithEmail, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState<string>('travourstak22@gmail.com');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSignIn = async (emailToUse: string, name?: string) => {
    if (!emailToUse.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmail(emailToUse.trim(), name);
      setShowAuthModal(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not sign in with this email. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn(emailInput);
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
            Sync your documents, CVs, budgets, and marketing plans securely across all devices.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {/* Quick 1-Tap Admin Sign-In for Travour */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Quick 1-Tap Access
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSignIn('travourstak22@gmail.com', 'Travour')}
              className="w-full flex items-center justify-between p-3 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  T
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">Travour</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">travourstak22@gmail.com</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Enter <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <span className="relative bg-white dark:bg-stone-900 px-2.5 text-[11px] font-medium text-stone-400">
              OR USE ANOTHER GMAIL
            </span>
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleFormSubmit} className="space-y-2.5">
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@gmail.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-emerald-600 focus:border-emerald-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In with this Gmail</span>
                </>
              )}
            </button>
          </form>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => setShowAuthModal(false)}
            className="w-full py-2 px-4 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-medium transition cursor-pointer text-center block"
          >
            Continue as Guest (Save locally)
          </button>
        </div>

        {/* Security footer */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>No passwords needed. Your data is private & encrypted.</span>
        </div>
      </div>
    </div>
  );
};
