import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestoreErrors';
import {
  UserProfile,
  DocumentItem,
  ExpenseItem,
  BusinessProfileItem,
  ConversationItem,
  FeedbackItem,
} from '@/types';

const LOCAL_STORAGE_PREFIX = 'mpa_help_';

function getUserKey(key: string, userId?: string): string {
  const safeUser = userId && userId.trim() ? userId.trim() : 'guest';
  return `${LOCAL_STORAGE_PREFIX}${safeUser}_${key}`;
}

function getLocal<T>(key: string, userId?: string, defaultValue: T = [] as unknown as T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const storageKey = getUserKey(key, userId);
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = getUserKey(key, userId);
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write failed', e);
  }
}

export const DatabaseService = {
  // --- USERS ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.userId}`;
    try {
      await setDoc(doc(db, 'users', profile.userId), profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async incrementUserUsage(userId: string, currentUsage: number): Promise<number> {
    const newUsage = currentUsage + 1;
    try {
      await updateDoc(doc(db, 'users', userId), {
        monthlyAiUsage: newUsage,
        updatedAt: new Date().toISOString(),
      });
      return newUsage;
    } catch (err) {
      console.warn('Could not update remote user usage directly', err);
      return newUsage;
    }
  },

  // --- DOCUMENTS ---
  async saveDocument(item: DocumentItem): Promise<void> {
    try {
      await setDoc(doc(db, 'documents', item.documentId), item);
      const list = getLocal<DocumentItem[]>('docs', item.userId, []);
      const updated = [item, ...list.filter((d) => d.documentId !== item.documentId)];
      setLocal('docs', updated, item.userId);
    } catch (err) {
      const list = getLocal<DocumentItem[]>('docs', item.userId, []);
      const updated = [item, ...list.filter((d) => d.documentId !== item.documentId)];
      setLocal('docs', updated, item.userId);
    }
  },

  async getDocuments(userId?: string): Promise<DocumentItem[]> {
    if (!userId || userId === 'guest') {
      return getLocal<DocumentItem[]>('docs', 'guest', []);
    }
    try {
      const q = query(collection(db, 'documents'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as DocumentItem);
      // Sort newest first
      const sorted = remote.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLocal('docs', sorted, userId);
      return sorted;
    } catch (err) {
      console.warn('Failed to fetch remote documents, fallback to isolated local cache', err);
      return getLocal<DocumentItem[]>('docs', userId, []);
    }
  },

  async deleteDocument(documentId: string, userId?: string): Promise<void> {
    try {
      if (userId && userId !== 'guest') {
        await deleteDoc(doc(db, 'documents', documentId));
      }
    } catch (err) {
      console.warn('Remote doc delete failed', err);
    } finally {
      const local = getLocal<DocumentItem[]>('docs', userId, []);
      setLocal(
        'docs',
        local.filter((d) => d.documentId !== documentId),
        userId
      );
    }
  },

  // --- EXPENSES & BUDGET ---
  async saveExpense(expense: ExpenseItem): Promise<void> {
    try {
      await setDoc(doc(db, 'expenses', expense.expenseId), expense);
    } catch (err) {
      console.warn('Remote save expense failed, saving locally', err);
    } finally {
      const local = getLocal<ExpenseItem[]>('expenses', expense.userId, []);
      const updated = [expense, ...local.filter((e) => e.expenseId !== expense.expenseId)];
      setLocal('expenses', updated, expense.userId);
    }
  },

  async getExpenses(userId?: string): Promise<ExpenseItem[]> {
    if (!userId || userId === 'guest') {
      return getLocal<ExpenseItem[]>('expenses', 'guest', []);
    }
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as ExpenseItem);
      setLocal('expenses', remote, userId);
      return remote;
    } catch (err) {
      return getLocal<ExpenseItem[]>('expenses', userId, []);
    }
  },

  async deleteExpense(expenseId: string, userId?: string): Promise<void> {
    try {
      if (userId && userId !== 'guest') {
        await deleteDoc(doc(db, 'expenses', expenseId));
      }
    } catch (err) {
      console.warn('Delete expense error', err);
    } finally {
      const local = getLocal<ExpenseItem[]>('expenses', userId, []);
      setLocal(
        'expenses',
        local.filter((e) => e.expenseId !== expenseId),
        userId
      );
    }
  },

  // --- BUSINESS PROFILES ---
  async saveBusinessProfile(profile: BusinessProfileItem): Promise<void> {
    try {
      await setDoc(doc(db, 'businessProfiles', profile.businessId), profile);
    } catch (err) {
      console.warn('Saving business locally', err);
    } finally {
      const local = getLocal<BusinessProfileItem[]>('businesses', profile.userId, []);
      const updated = [profile, ...local.filter((b) => b.businessId !== profile.businessId)];
      setLocal('businesses', updated, profile.userId);
    }
  },

  async getBusinessProfiles(userId?: string): Promise<BusinessProfileItem[]> {
    if (!userId || userId === 'guest') {
      return getLocal<BusinessProfileItem[]>('businesses', 'guest', []);
    }
    try {
      const q = query(collection(db, 'businessProfiles'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as BusinessProfileItem);
      setLocal('businesses', remote, userId);
      return remote;
    } catch (err) {
      return getLocal<BusinessProfileItem[]>('businesses', userId, []);
    }
  },

  async deleteBusinessProfile(businessId: string, userId?: string): Promise<void> {
    try {
      if (userId && userId !== 'guest') {
        await deleteDoc(doc(db, 'businessProfiles', businessId));
      }
    } catch (err) {
      console.warn('Delete business error', err);
    } finally {
      const local = getLocal<BusinessProfileItem[]>('businesses', userId, []);
      setLocal(
        'businesses',
        local.filter((b) => b.businessId !== businessId),
        userId
      );
    }
  },

  // --- CONVERSATIONS ---
  async saveConversation(conv: ConversationItem): Promise<void> {
    try {
      await setDoc(doc(db, 'conversations', conv.conversationId), conv);
    } catch (err) {
      console.warn('Saving conversation locally', err);
    } finally {
      const local = getLocal<ConversationItem[]>('conversations', conv.userId, []);
      const updated = [conv, ...local.filter((c) => c.conversationId !== conv.conversationId)];
      setLocal('conversations', updated, conv.userId);
    }
  },

  async getConversations(userId?: string): Promise<ConversationItem[]> {
    if (!userId || userId === 'guest') {
      return getLocal<ConversationItem[]>('conversations', 'guest', []);
    }
    try {
      const q = query(collection(db, 'conversations'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as ConversationItem);
      setLocal('conversations', remote, userId);
      return remote;
    } catch (err) {
      return getLocal<ConversationItem[]>('conversations', userId, []);
    }
  },

  async deleteConversation(conversationId: string, userId?: string): Promise<void> {
    try {
      if (userId && userId !== 'guest') {
        await deleteDoc(doc(db, 'conversations', conversationId));
      }
    } catch (err) {
      console.warn('Delete conversation error', err);
    } finally {
      const local = getLocal<ConversationItem[]>('conversations', userId, []);
      setLocal(
        'conversations',
        local.filter((c) => c.conversationId !== conversationId),
        userId
      );
    }
  },

  // --- FEEDBACK ---
  async submitFeedback(feedback: FeedbackItem): Promise<void> {
    try {
      await setDoc(doc(db, 'feedback', feedback.feedbackId), feedback);
    } catch (err) {
      console.warn('Failed remote feedback, saving local', err);
      const local = getLocal<FeedbackItem[]>('feedback', 'all', []);
      setLocal('feedback', [feedback, ...local], 'all');
    }
  },

  async getAllFeedback(): Promise<FeedbackItem[]> {
    try {
      const snap = await getDocs(collection(db, 'feedback'));
      return snap.docs.map((d) => d.data() as FeedbackItem);
    } catch (err) {
      return getLocal<FeedbackItem[]>('feedback', 'all', []);
    }
  },

  // --- CLEAR / DELETE ALL USER DATA ---
  async deleteAllUserData(userId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      const safeUser = userId || 'guest';
      localStorage.removeItem(getUserKey('docs', safeUser));
      localStorage.removeItem(getUserKey('expenses', safeUser));
      localStorage.removeItem(getUserKey('businesses', safeUser));
      localStorage.removeItem(getUserKey('conversations', safeUser));
    }
    try {
      const docs = await this.getDocuments(userId);
      for (const d of docs) {
        await deleteDoc(doc(db, 'documents', d.documentId));
      }
      const exps = await this.getExpenses(userId);
      for (const e of exps) {
        await deleteDoc(doc(db, 'expenses', e.expenseId));
      }
      const bzs = await this.getBusinessProfiles(userId);
      for (const b of bzs) {
        await deleteDoc(doc(db, 'businessProfiles', b.businessId));
      }
      const convs = await this.getConversations(userId);
      for (const c of convs) {
        await deleteDoc(doc(db, 'conversations', c.conversationId));
      }
    } catch (e) {
      console.warn('Partial remote deletion error', e);
    }
  },
};
