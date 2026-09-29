'use client';

import React, { useState } from 'react';
import {
  User,
  Zap,
  Globe,
  Trash2,
  LogOut,
  LogIn,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { PLANS, formatUGX } from '@/config/plans';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

interface AccountViewProps {
  onOpenLegal: (type: 'privacy' | 'terms' | 'deletion') => void;
  setActiveTab: (tab: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenLegal, setActiveTab }) => {
  const {
    user,
    userProfile,
    signOutUser,
    setShowAuthModal,
    setShowUpgradeModal,
    updateLanguage,
    checkCanUseAI,
    isAdmin,
  } = useAuth();

  const isSignedIn = Boolean(
    user ||
    (userProfile && !userProfile.userId.startsWith('guest_') && userProfile.email && !userProfile.email.includes('guest@'))
  );

  const usageInfo = checkCanUseAI();
  const currentPlan = PLANS[userProfile?.plan || 'free'];
  const percentUsed = Math.min(100, Math.round((usageInfo.currentUsage / usageInfo.limit) * 100));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
            User Account & Settings
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage your subscription, language preferences, usage limits, and account security
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-bold text-lg uppercase shadow-xs">
              {userProfile?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-base">
                {userProfile?.name || 'Guest User'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{userProfile?.email || 'guest@mpahelp.ug'}</span>
              </p>
            </div>
          </div>

          {!isSignedIn ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={signOutUser}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-xs transition flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Subscription & Monthly Usage Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Current Plan
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-white">
                {currentPlan.name}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {currentPlan.priceUGX === 0 ? 'Free Tier' : `${formatUGX(currentPlan.priceUGX)}/mo`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            {userProfile?.plan === 'business' ? 'Manage Plan' : 'Upgrade Plan'}
          </button>
        </div>

        {/* Usage Progress */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
            <span>Monthly AI Usage:</span>
            <span>
              {usageInfo.currentUsage} / {usageInfo.limit} requests
            </span>
          </div>

          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 85 ? 'bg-red-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
            {usageInfo.remaining > 0
              ? `You have ${usageInfo.remaining} AI requests remaining this month.`
              : `You have reached your limit for this month. Upgrade to continue without interruption.`}
          </p>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">
          Preferences
        </h3>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-400" />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              Preferred Language:
            </span>
          </div>
          <select
            value={userProfile?.language || 'en'}
            onChange={(e) => updateLanguage(e.target.value)}
            className="p-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} disabled={!l.isAvailable}>
                {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admin Quick Jump if Authorized */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <span className="font-bold text-xs text-purple-900 dark:text-purple-200">
                Administrator Access
              </span>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">
                You have admin privileges for Mpa Help metrics and controls.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition"
          >
            Open Admin
          </button>
        </div>
      )}

      {/* Data Protection & Account Deletion */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">
          Privacy & Data Protection
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          In compliance with Uganda&apos;s Data Protection and Privacy Act, you have full ownership over all your stored data.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => onOpenLegal('privacy')}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Privacy Policy
          </button>
          <span className="text-stone-300">•</span>
          <button
            onClick={() => onOpenLegal('terms')}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Terms of Service
          </button>
          <span className="text-stone-300">•</span>
          <button
            onClick={() => onOpenLegal('deletion')}
            className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Stored Data / Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
