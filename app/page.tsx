'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { HomeScreen } from '@/components/home/HomeScreen';
import { AssistantView } from '@/components/assistant/AssistantView';
import { WriteView } from '@/components/write/WriteView';
import { CVBuilderView } from '@/components/cv/CVBuilderView';
import { MoneyView } from '@/components/money/MoneyView';
import { WorkView } from '@/components/work/WorkView';
import { BusinessView } from '@/components/business/BusinessView';
import { TranslateView } from '@/components/translate/TranslateView';
import { SavedView } from '@/components/saved/SavedView';
import { AccountView } from '@/components/account/AccountView';
import { PricingView } from '@/components/pricing/PricingView';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { LandingPage } from '@/components/landing/LandingPage';
import { UpgradeModal } from '@/components/common/UpgradeModal';
import { AuthModal } from '@/components/common/AuthModal';
import { LegalModal } from '@/components/common/LegalModal';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [initialAskQuery, setInitialAskQuery] = useState<string>('');
  const { isDark, toggleTheme } = useTheme();
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'deletion' | null>(null);

  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Mpa Help SW registered:', reg.scope))
        .catch((err) => console.warn('Mpa Help SW failed:', err));
    }
  }, []);

  const handleAskDirectly = (query: string) => {
    setInitialAskQuery(query);
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={isDark}
        toggleDarkMode={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
        {activeTab === 'home' && (

          <HomeScreen
            setActiveTab={setActiveTab}
            onAskDirectly={handleAskDirectly}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView
            initialQuery={initialAskQuery}
            onClearInitialQuery={() => setInitialAskQuery('')}
          />
        )}

        {activeTab === 'write' && <WriteView />}

        {activeTab === 'cv' && <CVBuilderView />}

        {activeTab === 'money' && <MoneyView />}

        {activeTab === 'work' && (
          <WorkView
            onOpenCVBuilder={() => setActiveTab('cv')}
            onOpenCoverLetter={() => setActiveTab('write')}
          />
        )}

        {activeTab === 'business' && <BusinessView />}

        {activeTab === 'translate' && <TranslateView />}

        {activeTab === 'saved' && <SavedView />}

        {activeTab === 'account' && (
          <AccountView
            onOpenLegal={(type) => setLegalModalType(type)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'pricing' && <PricingView />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'landing' && (
          <LandingPage
            onStartUsing={() => setActiveTab('home')}
            onOpenFeature={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(type) => setLegalModalType(type)}
        setActiveTab={setActiveTab}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals & Indicators */}
      <UpgradeModal />
      <AuthModal />
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
      <OfflineIndicator />
    </div>
  );
}
