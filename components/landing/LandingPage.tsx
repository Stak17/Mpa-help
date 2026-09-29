'use client';

import React, { useState } from 'react';
import {
  FileText,
  Wallet,
  Briefcase,
  Store,
  Languages,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { PLANS, formatUGX } from '@/config/plans';

interface LandingPageProps {
  onStartUsing: () => void;
  onOpenFeature: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartUsing, onOpenFeature }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is Mpa Help?',
      a: 'Mpa Help is a practical, everyday AI-powered assistant designed specifically for mobile users and small businesses in Uganda. Instead of a confusing chatbot, it gives you clean, simple tools to draft letters, build CVs, plan budgets in UGX, write WhatsApp marketing posts, and translate into Luganda.',
    },
    {
      q: 'Is Mpa Help free to use?',
      a: 'Yes! Mpa Help provides a free tier with 10 AI requests per calendar month, with full access to all 5 core modules, CV builder, budgeting, and translations. You can upgrade to Mpa Plus or Business via MTN MoMo or Airtel Money if you need higher limits.',
    },
    {
      q: 'Can I save and print my letters and CVs?',
      a: 'Yes. Every generated document, CV, budget, and advert can be previewed, edited, saved to your private library, copied to WhatsApp, and printed or exported.',
    },
    {
      q: 'What happens when I reach my monthly limit?',
      a: 'When you reach your monthly limit, you will see a polite notification with the option to upgrade to Mpa Plus (200 requests/month) or Mpa Business (1,000 requests/month). Saved documents and budgets always remain accessible.',
    },
    {
      q: 'Can I install this on my Android or iPhone?',
      a: 'Yes! Mpa Help is an installable Progressive Web App (PWA). Simply tap "Install App" on Android or "Share > Add to Home Screen" on iPhone to get an app icon on your phone that opens like a native app.',
    },
    {
      q: 'What languages are supported?',
      a: 'Currently, full natural translation and conversation are supported in English and Luganda (Oluganda). We are actively preparing architecture to roll out Lusoga, Runyankole, Acholi, and Ateso.',
    },
    {
      q: 'How do I delete my data?',
      a: 'We strictly respect your privacy. In your Account Settings, you can permanently delete all your stored documents, expenses, and account details with a single click at any time.',
    },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="text-center pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 border border-emerald-300 dark:border-emerald-800">
          <span>🇺🇬</span>
          <span>Simple help for everyday life</span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">
          Write better. Manage money. <br className="hidden sm:inline" />
          Find work. Grow business.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          One simple place where everyday Ugandans and small businesses get practical AI assistance in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStartUsing}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try Mpa Help Now</span>
          </button>
          <button
            onClick={() => onOpenFeature('write')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm transition"
          >
            Explore Features
          </button>
        </div>
      </section>

      {/* How it Works: The Core Principle */}
      <section className="bg-stone-50 dark:bg-stone-900/60 p-6 sm:p-10 rounded-3xl border border-stone-200 dark:border-stone-800 text-center">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
          How It Works
        </h2>
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
          Simpler than a typical AI chatbot
        </h3>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-3xl mx-auto text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200">
          <div className="bg-white dark:bg-stone-800 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <span className="block text-emerald-600 font-black mb-1">1</span>
            Open App
          </div>
          <div className="hidden sm:flex items-center justify-center text-stone-300">→</div>
          <div className="bg-white dark:bg-stone-800 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <span className="block text-emerald-600 font-black mb-1">2</span>
            Choose What You Need
          </div>
          <div className="hidden sm:flex items-center justify-center text-stone-300">→</div>
          <div className="bg-white dark:bg-stone-800 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <span className="block text-emerald-600 font-black mb-1">3</span>
            Copy / Share / Save
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Tailored For Uganda
          </h2>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
            Built for your everyday needs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 w-fit">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-stone-900 dark:text-white">For Job Seekers</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Create professional, honest Ugandan CVs, cover letters, and practice common interview questions with constructive AI coaching.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 w-fit">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-stone-900 dark:text-white">For Small Businesses</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Generate attractive WhatsApp adverts with emojis, Facebook posts, TikTok video scripts, and polite customer negotiation templates.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 w-fit">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-stone-900 dark:text-white">For Households & Money</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Track rent, food, transport, Yaka, and airtime in UGX with practical budgeting advice and periodic savings calculators.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-emerald-50/70 dark:bg-emerald-950/30 p-6 sm:p-10 rounded-3xl border border-emerald-200 dark:border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Accessible Pricing
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
            Free forever or upgrade with Mobile Money
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-2 max-w-lg">
            Free plan includes 10 AI requests/month. Need more? Plus is UGX 15,000/mo (200 requests) and Business is UGX 45,000/mo (1,000 requests).
          </p>
        </div>

        <button
          onClick={() => onOpenFeature('pricing')}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm shrink-0"
        >
          View Plan Comparison
        </button>
      </section>

      {/* FAQ Accordion */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Got Questions?
          </h2>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2.5 pt-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-2 font-bold text-xs sm:text-sm text-stone-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
          Get practical help in seconds.
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          No credit card required. Try Mpa Help on your mobile phone or computer today.
        </p>
        <button
          onClick={onStartUsing}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition active:scale-98"
        >
          Start using Mpa Help
        </button>
      </section>
    </div>
  );
};
