'use client';

import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useTranslation } from '@/services/i18nContext';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                {t('changeLanguage', 'Select Language')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Choose your preferred language for the whole app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Options List */}
        <div className="overflow-y-auto py-2 space-y-1.5 my-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500 text-emerald-950 dark:text-emerald-100'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 border border-transparent text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold flex items-center gap-2">
                    {lang.name}
                    {lang.code === 'en' ? (
                      <span className="text-[10px] font-normal text-stone-400">Default</span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        {lang.nativeName}
                      </span>
                    )}
                  </span>
                  {lang.region && (
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {lang.region}
                    </span>
                  )}
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-400">
            Translates the full display, AI responses, and navigation in real time.
          </p>
        </div>
      </div>
    </div>
  );
};
