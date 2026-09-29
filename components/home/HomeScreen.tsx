'use client';

import React, { useState } from 'react';
import {
  FileText,
  Wallet,
  Briefcase,
  Store,
  Languages,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface HomeScreenProps {
  setActiveTab: (tab: string) => void;
  onAskDirectly: (query: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveTab, onAskDirectly }) => {
  const [inputQuery, setInputQuery] = useState('');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    onAskDirectly(inputQuery.trim());
    setInputQuery('');
  };

  const featureCards = [
    {
      id: 'write',
      title: 'WRITE SOMETHING',
      subtitle: 'Letters, CVs, applications and messages',
      icon: FileText,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'money',
      title: 'MY MONEY',
      subtitle: 'Budget, expenses and savings in UGX',
      icon: Wallet,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      id: 'work',
      title: 'FIND WORK',
      subtitle: 'CVs, applications and interview help',
      icon: Briefcase,
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    {
      id: 'business',
      title: 'GROW MY BUSINESS',
      subtitle: 'WhatsApp adverts, social posts & plans',
      icon: Store,
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      id: 'translate',
      title: 'TRANSLATE',
      subtitle: 'English and Ugandan languages (Luganda)',
      icon: Languages,
      color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    },
  ];

  const popularRequests = [
    'Write me a job application for shop attendant',
    'Help me plan my monthly budget with UGX 800,000',
    'Create an advert for my shoe business in Kampala',
    'Create a professional CV for a cashier',
    'Translate "Good morning, how can I help you today?" into Luganda',
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="text-center pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <span>🇺🇬</span>
          <span>Made for Uganda</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Simple help for everyday life.
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
          Write letters & CVs, plan your monthly UGX budget, prep for interviews, grow your business, and translate easily.
        </p>

        {/* Global AI Input Form */}
        <form onSubmit={handleAskSubmit} className="mt-5 max-w-xl mx-auto">
          <div className="relative flex flex-col sm:flex-row gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-stone-900 border-2 border-emerald-500/40 focus-within:border-emerald-600 dark:border-stone-700 shadow-md">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="What do you need help with today?"
              className="flex-1 px-3.5 py-3 text-sm bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Mpa Help</span>
            </button>
          </div>
        </form>
      </section>

      {/* Popular Requests Chips */}
      <section className="max-w-3xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 mb-2.5 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Popular requests in Uganda:</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full max-w-full">
          {popularRequests.map((req, idx) => (
            <button
              key={idx}
              onClick={() => onAskDirectly(req)}
              className="text-left text-xs bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition shadow-2xs group max-w-full break-words"
            >
              <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 break-words">{req}</span>
            </button>
          ))}
        </div>

      </section>

      {/* 5 Core Feature Cards Grid */}
      <section className="max-w-4xl mx-auto pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Choose what you need:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setActiveTab(card.id)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all active:scale-[0.99] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {card.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Open {card.title.toLowerCase()}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
