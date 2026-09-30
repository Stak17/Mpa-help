'use client';

import React from 'react';
import { useAuth } from '@/services/authContext';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
import { PLANS } from '@/config/plans';
import {
  Globe,
  Zap,
  LogIn,
  LogOut,
  ShieldAlert,
  Moon,
  Sun,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageName } from '@/config/languages';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useTranslation } from '@/services/i18nContext';
import { LanguageModal } from '@/components/common/LanguageModal';
import { useToast } from '@/components/common/ToastProvider';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
}) => {
  const {
    user,
    userProfile,
    signOutUser,
    setShowAuthModal,
    setShowUpgradeModal,
    checkCanUseAI,
    isAdmin,
  } = useAuth();

  const { language, setLanguage, t, languageOption } = useTranslation();
  const [showLangModal, setShowLangModal] = React.useState(false);
  const toast = useToast();

  const handleLanguageChange = async (newLang: string) => {
    await setLanguage(newLang);
    const langName = getLanguageName(newLang);
    toast.success(`${langName}: ${t('langSwitched', 'Language switched successfully')}`);
  };

  const usageInfo = checkCanUseAI();
  const currentPlan = PLANS[userProfile?.plan || 'free'];
  const mounted = useIsMounted();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isSignedIn = Boolean(
    user ||
    (userProfile && !userProfile.userId.startsWith('guest_') && userProfile.email && !userProfile.email.includes('guest@'))
  );

  return (
    <header className="sticky top-0 z-40 w-full max-w-[100vw] overflow-x-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-3">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-xs font-bold text-sm sm:text-base shrink-0">
            M
          </div>
          <div className="flex items-center gap-1 leading-none">
            <span className="font-extrabold text-stone-900 dark:text-white text-sm sm:text-base tracking-tight whitespace-nowrap">
              Mpa Help
            </span>
            <span className="text-xs sm:text-sm">🇺🇬</span>
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Plan & Usage badge (large screens only) */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-2xs shrink-0 cursor-pointer"
            title="Click to view plans & usage"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{currentPlan.name}</span>
            <span className="text-stone-400 dark:text-stone-500">|</span>
            <span className="text-[11px] font-normal">
              {usageInfo.remaining} {t('left', 'left')}
            </span>
          </button>

          {/* Language Selector: Dual Native Select + Modal Button */}
          <div className="relative shrink-0 flex items-center">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold pl-6 pr-2 py-1.5 rounded-xl border border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:outline-none transition cursor-pointer max-w-[95px] sm:max-w-none shadow-2xs"
              aria-label="Select language"
              title="Change Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} {lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowLangModal(true)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition cursor-pointer"
              title="View all language dialects"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition shrink-0 cursor-pointer"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {mounted && darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          )}

          {/* Authentication & Profile Section */}
          {isSignedIn ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 border-l border-stone-200 dark:border-stone-800 shrink-0">
              {/* Account profile link */}
              <button
                onClick={() => setActiveTab('account')}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition text-xs font-medium cursor-pointer"
                title="Account Settings"
                aria-label="Account Settings"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:inline max-w-[70px] truncate font-medium">
                  {userProfile?.name?.split(' ')[0] || t('navAccount', 'Account')}
                </span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:border-red-800 text-stone-600 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 text-xs font-semibold transition shrink-0 cursor-pointer"
                title={t('signOut', 'Sign Out')}
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('signOut', 'Sign Out')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
              title="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('signIn', 'Sign In')}</span>
            </button>
          )}
        </div>
      </div>
      <LanguageModal isOpen={showLangModal} onClose={() => setShowLangModal(false)} />
    </header>
  );
};
