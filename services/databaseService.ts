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
  orderBy,
  limit,
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
  SubscriptionItem,
  UsageEventItem,
} from '@/types';

// Helper for localStorage fallback (useful for guest or offline mode)
const LOCAL_STORAGE_PREFIX = 'mpa_help_';

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
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
    const path = `users/${userId}`;
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
    const path = `documents/${item.documentId}`;
    try {
      await setDoc(doc(db, 'documents', item.documentId), item);
      // Also cache locally
      const list = getLocal<DocumentItem[]>('docs', []);
      const updated = [item, ...list.filter((d) => d.documentId !== item.documentId)];
      setLocal('docs', updated);
    } catch (err) {
      // If unauthorized (e.g. guest), save locally
      const list = getLocal<DocumentItem[]>('docs', []);
      const updated = [item, ...list.filter((d) => d.documentId !== item.documentId)];
      setLocal('docs', updated);
      console.warn('Saved document locally:', item.title);
    }
  },

  async getDocuments(userId?: string): Promise<DocumentItem[]> {
    if (!userId) {
      return getLocal<DocumentItem[]>('docs', []);
    }
    const path = 'documents';
    try {
      const q = query(collection(db, 'documents'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as DocumentItem);
      // Merge with any offline items
      const local = getLocal<DocumentItem[]>('docs', []);
      const map = new Map<string, DocumentItem>();
      remote.forEach((d) => map.set(d.documentId, d));
      local.forEach((d) => map.set(d.documentId, d));
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.warn('Failed to fetch remote documents, fallback to local', err);
      return getLocal<DocumentItem[]>('docs', []);
    }
  },

  async deleteDocument(documentId: string, userId?: string): Promise<void> {
    const path = `documents/${documentId}`;
    try {
      if (userId) {
        await deleteDoc(doc(db, 'documents', documentId));
      }
    } catch (err) {
      console.warn('Remote doc delete failed', err);
    } finally {
      const local = getLocal<DocumentItem[]>('docs', []);
      setLocal(
        'docs',
        local.filter((d) => d.documentId !== documentId)
      );
    }
  },

  // --- EXPENSES & BUDGET ---
  async saveExpense(expense: ExpenseItem): Promise<void> {
    const path = `expenses/${expense.expenseId}`;
    try {
      await setDoc(doc(db, 'expenses', expense.expenseId), expense);
    } catch (err) {
      console.warn('Remote save expense failed, saving locally', err);
    } finally {
      const local = getLocal<ExpenseItem[]>('expenses', []);
      const updated = [expense, ...local.filter((e) => e.expenseId !== expense.expenseId)];
      setLocal('expenses', updated);
    }
  },

  async getExpenses(userId?: string): Promise<ExpenseItem[]> {
    if (!userId) {
      return getLocal<ExpenseItem[]>('expenses', []);
    }
    const path = 'expenses';
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as ExpenseItem);
      return remote.length > 0 ? remote : getLocal<ExpenseItem[]>('expenses', []);
    } catch (err) {
      return getLocal<ExpenseItem[]>('expenses', []);
    }
  },

  async deleteExpense(expenseId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        await deleteDoc(doc(db, 'expenses', expenseId));
      }
    } catch (err) {
      console.warn('Delete expense error', err);
    } finally {
      const local = getLocal<ExpenseItem[]>('expenses', []);
      setLocal(
        'expenses',
        local.filter((e) => e.expenseId !== expenseId)
      );
    }
  },

  // --- BUSINESS PROFILES ---
  async saveBusinessProfile(profile: BusinessProfileItem): Promise<void> {
    const path = `businessProfiles/${profile.businessId}`;
    try {
      await setDoc(doc(db, 'businessProfiles', profile.businessId), profile);
    } catch (err) {
      console.warn('Saving business locally', err);
    } finally {
      const local = getLocal<BusinessProfileItem[]>('businesses', []);
      const updated = [profile, ...local.filter((b) => b.businessId !== profile.businessId)];
      setLocal('businesses', updated);
    }
  },

  async getBusinessProfiles(userId?: string): Promise<BusinessProfileItem[]> {
    if (!userId) {
      return getLocal<BusinessProfileItem[]>('businesses', []);
    }
    try {
      const q = query(collection(db, 'businessProfiles'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as BusinessProfileItem);
      return remote.length > 0 ? remote : getLocal<BusinessProfileItem[]>('businesses', []);
    } catch (err) {
      return getLocal<BusinessProfileItem[]>('businesses', []);
    }
  },

  async deleteBusinessProfile(businessId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        await deleteDoc(doc(db, 'businessProfiles', businessId));
      }
    } catch (err) {
      console.warn('Delete business error', err);
    } finally {
      const local = getLocal<BusinessProfileItem[]>('businesses', []);
      setLocal(
        'businesses',
        local.filter((b) => b.businessId !== businessId)
      );
    }
  },

  // --- CONVERSATIONS ---
  async saveConversation(conv: ConversationItem): Promise<void> {
    const path = `conversations/${conv.conversationId}`;
    try {
      await setDoc(doc(db, 'conversations', conv.conversationId), conv);
    } catch (err) {
      console.warn('Saving conversation locally', err);
    } finally {
      const local = getLocal<ConversationItem[]>('conversations', []);
      const updated = [conv, ...local.filter((c) => c.conversationId !== conv.conversationId)];
      setLocal('conversations', updated);
    }
  },

  async getConversations(userId?: string): Promise<ConversationItem[]> {
    if (!userId) {
      return getLocal<ConversationItem[]>('conversations', []);
    }
    try {
      const q = query(collection(db, 'conversations'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const remote = snap.docs.map((d) => d.data() as ConversationItem);
      return remote.length > 0 ? remote : getLocal<ConversationItem[]>('conversations', []);
    } catch (err) {
      return getLocal<ConversationItem[]>('conversations', []);
    }
  },

  async deleteConversation(conversationId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        await deleteDoc(doc(db, 'conversations', conversationId));
      }
    } catch (err) {
      console.warn('Delete conversation error', err);
    } finally {
      const local = getLocal<ConversationItem[]>('conversations', []);
      setLocal(
        'conversations',
        local.filter((c) => c.conversationId !== conversationId)
      );
    }
  },

  // --- FEEDBACK ---
  async submitFeedback(feedback: FeedbackItem): Promise<void> {
    const path = `feedback/${feedback.feedbackId}`;
    try {
      await setDoc(doc(db, 'feedback', feedback.feedbackId), feedback);
    } catch (err) {
      console.warn('Failed remote feedback, saving local', err);
      const local = getLocal<FeedbackItem[]>('feedback', []);
      setLocal('feedback', [feedback, ...local]);
    }
  },

  async getAllFeedback(): Promise<FeedbackItem[]> {
    try {
      const snap = await getDocs(collection(db, 'feedback'));
      return snap.docs.map((d) => d.data() as FeedbackItem);
    } catch (err) {
      return getLocal<FeedbackItem[]>('feedback', []);
    }
  },

  // --- CLEAR / DELETE ALL USER DATA ---
  async deleteAllUserData(userId: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'docs');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'expenses');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'businesses');
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'conversations');
    }
    // Delete from Firestore
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
