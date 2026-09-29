'use client';

import React, { useState } from 'react';
import { X, Check, Zap, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { PLANS, formatUGX } from '@/config/plans';
import { PlanType } from '@/types';
import { PaymentService, PaymentMethod } from '@/services/paymentService';

export const UpgradeModal: React.FC = () => {
  const { showUpgradeModal, setShowUpgradeModal, userProfile, updateUserPlan, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('plus');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo_mtn');
  const [phoneNumber, setPhoneNumber] = useState<string>(userProfile?.phone || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);

  if (!showUpgradeModal) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setPromptMessage(null);
    try {
      const planConfig = PLANS[selectedPlan];
      const result = await PaymentService.initiatePayment({
        userId: userProfile?.userId || 'guest',
        userEmail: userProfile?.email || 'guest@mpahelp.ug',
        phoneNumber,
        plan: selectedPlan,
        method: paymentMethod,
        amountUGX: planConfig.priceUGX,
      });

      setPromptMessage(result.ussdPromptInfo || result.instructions);

      // Verify and activate
      setTimeout(async () => {
        const verification = await PaymentService.verifyPayment(result.transactionId);
        if (verification.success) {
          await updateUserPlan(selectedPlan);
          setIsProcessing(false);
          setPromptMessage('Payment verified! Your plan has been upgraded.');
          setTimeout(() => {
            setShowUpgradeModal(false);
            setPromptMessage(null);
          }, 1500);
        }
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setPromptMessage('Payment could not be initialized. Please check phone number.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-800 to-stone-900 p-6 text-white">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close upgrade modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇺🇬</span>
            <span className="text-xs uppercase tracking-wider font-bold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md">
              Upgrade Mpa Help
            </span>
          </div>
          <h2 className="text-xl font-bold mt-2">Get More Everyday Practical Help</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Increase your monthly AI limit for documents, CVs, money planning and business growth.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan selection tabs */}
          <div className="grid grid-cols-2 gap-3">
            {(['plus', 'business'] as PlanType[]).map((planKey) => {
              const plan = PLANS[planKey];
              const isSelected = selectedPlan === planKey;
              return (
                <div
                  key={planKey}
                  onClick={() => setSelectedPlan(planKey)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{plan.name}</span>
                    {plan.isPopular && (
                      <span className="text-[10px] bg-emerald-600 text-white font-semibold px-1.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <span className="text-lg font-extrabold text-stone-900 dark:text-white">
                      {formatUGX(plan.priceUGX)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400"> /mo</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{plan.aiLimit} requests / mo</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features list */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              What&apos;s included in {PLANS[selectedPlan].name}:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
              {PLANS[selectedPlan].features.map((feat, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              Select Ugandan Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('momo_mtn')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  paymentMethod === 'momo_mtn'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-200 ring-2 ring-yellow-400/20'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-yellow-600" />
                <span>MTN MoMo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('airtel_money')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  paymentMethod === 'airtel_money'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 ring-2 ring-red-400/20'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Smartphone className="w-4 h-4 mb-1 text-red-600" />
                <span>Airtel Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Bank Card</span>
              </button>
            </div>

            {(paymentMethod === 'momo_mtn' || paymentMethod === 'airtel_money') && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {paymentMethod === 'momo_mtn' ? 'MTN' : 'Airtel'} Phone Number (e.g. 077... or 075...):
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0771 234 567"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {promptMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">{promptMessage}</p>
            </div>
          )}

          {/* Action button */}
          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Mobile Money...</span>
                </>
              ) : (
                <>
                  <span>Pay {formatUGX(PLANS[selectedPlan].priceUGX)} with Mobile Money</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe sandbox verification. Cancel anytime.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
