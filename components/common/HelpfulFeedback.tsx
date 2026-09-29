'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, Send, X } from 'lucide-react';
import { DatabaseService } from '@/services/databaseService';
import { useAuth } from '@/services/authContext';

interface HelpfulFeedbackProps {
  featureName: string;
  contextTitle?: string;
}

export const HelpfulFeedback: React.FC<HelpfulFeedbackProps> = ({ featureName, contextTitle }) => {
  const { user, userProfile } = useAuth();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showDetailInput, setShowDetailInput] = useState<boolean>(false);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleVote = async (isHelpful: boolean) => {
    const type = isHelpful ? 'helpful' : 'not_helpful';
    setRating(type);
    if (!isHelpful) {
      setShowDetailInput(true);
      return;
    }

    try {
      setSubmitting(true);
      await DatabaseService.submitFeedback({
        feedbackId: 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: user?.uid || userProfile?.userId || 'guest',
        type: 'helpful',
        message: contextTitle ? `Helpful response on: ${contextTitle}` : 'Positive rating',
        feature: featureName,
        rating: 5,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await DatabaseService.submitFeedback({
        feedbackId: 'fb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: user?.uid || userProfile?.userId || 'guest',
        type: rating || 'not_helpful',
        message: feedbackNote || 'User indicated output could be improved.',
        feature: featureName,
        rating: rating === 'helpful' ? 4 : 2,
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setShowDetailInput(false);
    } catch (e) {
      console.error(e);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>Thank you for your feedback! Webale nnyo.</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <span className="font-medium">Was this helpful?</span>
        <button
          onClick={() => handleVote(true)}
          disabled={submitting}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200 dark:border-stone-700 transition"
          aria-label="Helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Yes</span>
        </button>
        <button
          onClick={() => handleVote(false)}
          disabled={submitting}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-400 border border-stone-200 dark:border-stone-700 transition"
          aria-label="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>No</span>
        </button>
      </div>

      {showDetailInput && (
        <form onSubmit={handleDetailedSubmit} className="mt-1 p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Tell us what went wrong:
            </span>
            <button
              type="button"
              onClick={() => setShowDetailInput(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="e.g. Too long, missing details, incorrect translation..."
            className="w-full text-xs p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Send className="w-3 h-3" />
              <span>Submit</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
