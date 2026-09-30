'use client';

import React from 'react';
import { Check, Zap, Sparkles, Smartphone, HelpCircle } from 'lucide-react';
import { PLANS, formatUGX } from '@/config/plans';
import { useAuth } from '@/services/authContext';
import { PlanType } from '@/types';
import { useTranslation } from '@/services/i18nContext';

export const PricingView: React.FC = () => {
  const { userProfile, setShowUpgradeModal } = useAuth();
  const { t } = useTranslation();
  const currentPlan = userProfile?.plan || 'free';

  const planKeys: PlanType[] = ['free', 'plus', 'business'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <span>🇺🇬</span>
          <span>{t('pricingBadge', 'Simple, Honest Pricing in UGX')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
          {t('pricingTitle', 'Choose the right plan for your everyday life')}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
          {t('pricingSubtitle', 'Start for free, or upgrade with Mobile Money (MTN MoMo & Airtel Money) for higher monthly AI limits.')}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planKeys.map((key) => {
          const plan = PLANS[key];
          const isCurrent = currentPlan === key;
          return (
            <div
              key={key}
              className={`rounded-2xl p-5 sm:p-6 bg-white dark:bg-stone-900 border flex flex-col justify-between relative transition shadow-xs hover:shadow-md ${
                plan.isPopular
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      Your Current Plan
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 min-h-[32px]">
                  {plan.tagline}
                </p>

                <div className="mt-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                    {formatUGX(plan.priceUGX)}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {' '}
                    /{plan.period}
                  </span>
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-bold cursor-default"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 ${
                      plan.isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Upgrade to {plan.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan comparison feature matrix */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 overflow-x-auto">
        <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider mb-2">
          Detailed Feature Comparison
        </h3>
        <table className="w-full text-xs text-left min-w-[500px]">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500">
              <th className="py-2">Features</th>
              <th className="py-2 font-bold">Mpa Free</th>
              <th className="py-2 font-bold text-emerald-600">Mpa Plus</th>
              <th className="py-2 font-bold text-purple-600">Mpa Business</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
            <tr>
              <td className="py-2.5 font-medium">Monthly AI Limit</td>
              <td className="py-2.5">10 requests</td>
              <td className="py-2.5 font-bold text-emerald-600">200 requests</td>
              <td className="py-2.5 font-bold text-purple-600">1,000 requests</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Job CV Builder (All 3 styles)</td>
              <td className="py-2.5">Basic</td>
              <td className="py-2.5">Full & Unbranded</td>
              <td className="py-2.5">Full & Unbranded</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Interview Practice & Feedback</td>
              <td className="py-2.5">Sample questions</td>
              <td className="py-2.5">Full AI evaluation</td>
              <td className="py-2.5">Full AI evaluation</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Business Profiles Supported</td>
              <td className="py-2.5">1 business</td>
              <td className="py-2.5">1 business</td>
              <td className="py-2.5">Unlimited businesses</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">WhatsApp Marketing & Social Scripts</td>
              <td className="py-2.5">Standard</td>
              <td className="py-2.5">Advanced</td>
              <td className="py-2.5">Full 30-day calendars</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Luganda Translation</td>
              <td className="py-2.5">Included</td>
              <td className="py-2.5">Included</td>
              <td className="py-2.5">Priority</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Payment Provider</td>
              <td className="py-2.5">Free forever</td>
              <td className="py-2.5">MTN / Airtel / Card</td>
              <td className="py-2.5">MTN / Airtel / Card</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
