'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  deleteUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { DatabaseService } from './databaseService';
import { UserProfile, PlanType } from '@/types';
import { getLimitForPlan, FREE_AI_LIMIT } from '@/config/plans';
import { isUserAdmin } from '@/config/admin';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  signInWithGoogle: (forceRedirect?: boolean) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  updateUserPlan: (newPlan: PlanType) => Promise<void>;
  checkCanUseAI: () => { allowed: boolean; remaining: number; limit: number; currentUsage: number };
  recordUsage: (feature: string) => Promise<boolean>;
  deleteUserAccount: () => Promise<void>;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_PROFILE_KEY = 'mpa_guest_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize or fetch Guest profile
  const getOrCreateGuestProfile = (): UserProfile => {
    if (typeof window === 'undefined') {
      return {
        userId: 'guest_default',
        name: 'Guest User',
        email: 'guest@mpahelp.ug',
        language: 'en',
        plan: 'free',
        monthlyAiUsage: 0,
        usageResetDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAdmin: false,
      };
    }
    const stored = localStorage.getItem(GUEST_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    const guest: UserProfile = {
      userId: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Guest User',
      email: 'guest@mpahelp.ug',
      language: 'en',
      plan: 'free',
      monthlyAiUsage: 0,
      usageResetDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAdmin: false,
    };
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(guest));
    return guest;
  };

  useEffect(() => {
    // Check if returning from a mobile or full-page Google sign-in redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setShowAuthModal(false);
        }
      })
      .catch((err) => {
        if (err && err.code !== 'auth/null-user') {
          console.warn('Redirect sign-in notice:', err.code, err.message);
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          let profile = await DatabaseService.getUserProfile(currentUser.uid);
          const adminCheck = isUserAdmin(currentUser.email);
          if (!profile) {
            profile = {
              userId: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Ugandan User',
              email: currentUser.email || '',
              language: 'en',
              plan: 'free',
              monthlyAiUsage: 0,
              usageResetDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isAdmin: adminCheck,
            };
            try {
              await DatabaseService.saveUserProfile(profile);
            } catch (saveErr) {
              console.warn('Initial profile creation notice:', saveErr);
            }
          } else {
            // Keep admin flag up to date if changed
            if (profile.isAdmin !== adminCheck) {
              profile.isAdmin = adminCheck;
              try {
                await DatabaseService.saveUserProfile(profile);
              } catch (adminSaveErr) {
                console.warn('Admin profile sync note:', adminSaveErr);
              }
            }
          }
          setUserProfile(profile);
        } catch (e) {
          console.warn('Error loading user profile:', e);
          setUserProfile({
            userId: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            language: 'en',
            plan: 'free',
            monthlyAiUsage: 0,
            usageResetDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isAdmin: isUserAdmin(currentUser.email),
          });
        }
      } else {
        setUser(null);
        setUserProfile(getOrCreateGuestProfile());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (forceRedirect: boolean = false) => {
    const provider = new GoogleAuthProvider();
    // Ensures Google shows the Gmail account chooser if multiple accounts exist
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    provider.addScope('email');
    provider.addScope('profile');

    const isMobile =
      typeof window !== 'undefined' &&
      /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

    // If explicitly requested or on mobile where popups are blocked by Chrome, use redirect
    if (forceRedirect) {
      await signInWithRedirect(auth, provider);
      return;
    }

    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (popupError: any) {
      const code = popupError?.code || '';
      console.warn('Google Popup sign-in error:', code, popupError);

      // If browser blocked the popup or it is unsupported, automatically fallback to redirect
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        isMobile
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }

      throw popupError;
    }
  };


  const signOutUser = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(getOrCreateGuestProfile());
    } catch (e) {
      console.error('Sign out error', e);
    }
  };

  const updateLanguage = async (lang: string) => {
    if (!userProfile) return;
    const updated = { ...userProfile, language: lang, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    if (user) {
      await DatabaseService.saveUserProfile(updated);
    } else {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  const updateUserPlan = async (newPlan: PlanType) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      plan: newPlan,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    if (user) {
      await DatabaseService.saveUserProfile(updated);
    } else {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  const checkCanUseAI = () => {
    const currentPlan = userProfile?.plan || 'free';
    const limit = getLimitForPlan(currentPlan);
    const usage = userProfile?.monthlyAiUsage || 0;
    const remaining = Math.max(0, limit - usage);
    return {
      allowed: usage < limit,
      remaining,
      limit,
      currentUsage: usage,
    };
  };

  const recordUsage = async (feature: string): Promise<boolean> => {
    const canUse = checkCanUseAI();
    if (!canUse.allowed) {
      setShowUpgradeModal(true);
      return false;
    }

    const newUsage = (userProfile?.monthlyAiUsage || 0) + 1;
    if (userProfile) {
      const updated = { ...userProfile, monthlyAiUsage: newUsage };
      setUserProfile(updated);
      if (user) {
        await DatabaseService.incrementUserUsage(user.uid, userProfile.monthlyAiUsage);
      } else {
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));
      }
    }
    return true;
  };

  const deleteUserAccount = async () => {
    if (!user) {
      localStorage.removeItem(GUEST_PROFILE_KEY);
      setUserProfile(getOrCreateGuestProfile());
      return;
    }
    try {
      await DatabaseService.deleteAllUserData(user.uid);
      await deleteUser(user);
      setUser(null);
      setUserProfile(getOrCreateGuestProfile());
    } catch (e) {
      console.error('Delete account error', e);
      throw e;
    }
  };

  const isAdmin = Boolean(userProfile?.isAdmin || (user?.email && isUserAdmin(user.email)));

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isGuest: !user,
        isAdmin,
        signInWithGoogle,
        signOutUser,
        updateLanguage,
        updateUserPlan,
        checkCanUseAI,
        recordUsage,
        deleteUserAccount,
        showUpgradeModal,
        setShowUpgradeModal,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
