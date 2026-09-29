'use client';

import React from 'react';
import { X, Shield, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { useToast } from '@/components/common/ToastProvider';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'deletion' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const { user, deleteUserAccount } = useAuth();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  if (!type) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUserAccount();
      toast.success('All your stored data was permanently erased.');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Could not delete data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-6 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
          {type === 'privacy' && <Shield className="w-5 h-5 text-emerald-600" />}
          {type === 'terms' && <FileText className="w-5 h-5 text-emerald-600" />}
          {type === 'deletion' && <Trash2 className="w-5 h-5 text-red-600" />}
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {type === 'privacy' && 'Privacy Policy'}
            {type === 'terms' && 'Terms of Service'}
            {type === 'deletion' && 'Delete Your Stored Data'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 space-y-3">
          {type === 'privacy' && (
            <>
              <p>
                <strong>Mpa Help</strong> respects your privacy. We are committed to transparency in accordance with Uganda&apos;s Data Protection and Privacy Act.
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">1. What data we collect</h4>
              <p>
                - Information you provide: Saved documents, CV details, expense entries, and business names.<br />
                - Account information: Email address and display name if you choose to sign in via Google.<br />
                - Technical diagnostics: Anonymized AI request counts to enforce monthly fair-usage tiers.
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">2. How we use your data</h4>
              <p>
                Your data is used solely to generate your requested content and provide personal persistence across sessions. We do NOT sell your data, phone numbers, or business details to advertisers.
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">3. Your Rights</h4>
              <p>
                You can review, export, and delete all stored personal documents, CVs, and expenses at any time with one click.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                Welcome to <strong>Mpa Help</strong> (&quot;Simple help for everyday life&quot;).
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">1. Scope of Service</h4>
              <p>
                Mpa Help provides AI-assisted content drafting for letters, CVs, budgeting suggestions, marketing, and language translation in Uganda.
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">2. Responsibility & Verification</h4>
              <p>
                Generated documents and translations should always be reviewed before official submission. Mpa Help does not guarantee employment, offer certified legal advice, or provide accredited financial advisory.
              </p>
              <h4 className="font-bold text-stone-900 dark:text-white">3. Subscriptions & Limits</h4>
              <p>
                Free users receive 10 requests per calendar month. Plus and Business plans provide expanded limits. Mobile Money payments are subject to standard telecom operator terms.
              </p>
            </>
          )}

          {type === 'deletion' && (
            <div className="space-y-4">
              <p>
                You have full control over your data. Deleting your data will permanently erase all saved documents, CVs, expenses, business profiles, and conversation history from both Firestore and local device storage.
              </p>
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs">
                ⚠️ <strong>Warning:</strong> This action is permanent and cannot be undone.
              </div>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition"
                >
                  I want to delete all my data
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-red-600 dark:text-red-400">
                    Are you sure you want to proceed?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm transition"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
