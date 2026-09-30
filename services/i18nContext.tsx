'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './authContext';
import { SUPPORTED_LANGUAGES, LanguageOption, getLanguageByCode } from '@/config/languages';
import { TRANSLATIONS } from '@/config/translations';

interface I18nContextType {
  language: string;
  languageOption: LanguageOption;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  availableLanguages: LanguageOption[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateLanguage } = useAuth();
  const [localLang, setLocalLang] = useState<string>('en');

  // Sync with stored language or user profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mpa_lang');
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLocalLang(stored);
        return;
      }
    }
    if (userProfile?.language && userProfile.language !== 'en') {
      setLocalLang(userProfile.language);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mpa_lang', userProfile.language);
      }
    }
  }, [userProfile?.language]);

  // Synchronize document attribute for accessibility
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = localLang;
    }
  }, [localLang]);

  const setLanguage = useCallback(async (lang: string) => {
    const valid = SUPPORTED_LANGUAGES.some((l) => l.code === lang) ? lang : 'en';
    setLocalLang(valid);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mpa_lang', valid);
      document.documentElement.lang = valid;
    }
    await updateLanguage(valid);
  }, [updateLanguage]);

  const languageOption = useMemo(() => getLanguageByCode(localLang), [localLang]);

  const t = useCallback((key: string, fallback?: string): string => {
    const activeDict = TRANSLATIONS[localLang] || TRANSLATIONS['en'];
    if (activeDict && activeDict[key]) {
      return activeDict[key];
    }
    const englishDict = TRANSLATIONS['en'];
    if (englishDict && englishDict[key]) {
      return englishDict[key];
    }
    return fallback || key;
  }, [localLang]);

  const value = useMemo(() => ({
    language: localLang,
    languageOption,
    setLanguage,
    t,
    availableLanguages: SUPPORTED_LANGUAGES,
  }), [localLang, languageOption, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'en',
      languageOption: SUPPORTED_LANGUAGES[0],
      setLanguage: async () => {},
      t: (key: string, fallback?: string) => TRANSLATIONS['en'][key] || fallback || key,
      availableLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
};
