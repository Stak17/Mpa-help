'use client';

import React from 'react';
import { useTranslation } from '@/services/i18nContext';

interface FooterProps {
  onOpenLegal: (type: 'privacy' | 'terms' | 'deletion') => void;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, setActiveTab }) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 mb-20 sm:mb-8 pt-8 pb-6 border-t border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-stone-900 dark:text-white">Mpa Help 🇺🇬</span>
          <span>•</span>
          <span>{t('tagline', 'Simple help for everyday life')}</span>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-stone-600 dark:text-stone-400 font-medium">
          <button onClick={() => setActiveTab('pricing')} className="hover:text-emerald-600 transition cursor-pointer">
            {t('pricingNav', 'Pricing')}
          </button>
          <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-600 transition cursor-pointer">
            {t('aboutFaqNav', 'About & FAQ')}
          </button>
          <button onClick={() => onOpenLegal('privacy')} className="hover:text-emerald-600 transition cursor-pointer">
            {t('privacyPolicy', 'Privacy Policy')}
          </button>
          <button onClick={() => onOpenLegal('terms')} className="hover:text-emerald-600 transition cursor-pointer">
            {t('termsOfService', 'Terms of Service')}
          </button>
          <button onClick={() => onOpenLegal('deletion')} className="hover:text-red-600 transition cursor-pointer">
            {t('deleteMyData', 'Delete My Data')}
          </button>
        </div>
      </div>
      <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 mt-4">
        {t('footerSub', 'Designed for mobile users and small businesses across Uganda.')}
      </div>
    </footer>
  );
};
