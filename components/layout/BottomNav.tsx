'use client';

import React from 'react';
import {
  Home,
  FileText,
  Wallet,
  Briefcase,
  Store,
  Bookmark,
  User,
} from 'lucide-react';
import { useTranslation } from '@/services/i18nContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', labelKey: 'navHome', fallback: 'Home', icon: Home },
    { id: 'write', labelKey: 'navWrite', fallback: 'Write', icon: FileText },
    { id: 'money', labelKey: 'navMoney', fallback: 'Money', icon: Wallet },
    { id: 'work', labelKey: 'navWork', fallback: 'Work', icon: Briefcase },
    { id: 'business', labelKey: 'navBusiness', fallback: 'Business', icon: Store },
    { id: 'saved', labelKey: 'navSaved', fallback: 'Saved', icon: Bookmark },
    { id: 'account', labelKey: 'navAccount', fallback: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between px-1 py-1 safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = t(item.labelKey, item.fallback);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              aria-label={label}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950/80' : ''
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
