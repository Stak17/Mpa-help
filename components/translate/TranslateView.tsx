'use client';

import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Share2,
  Bookmark,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { DatabaseService } from '@/services/databaseService';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';
import { useToast } from '@/components/common/ToastProvider';

export const TranslateView: React.FC = () => {
  const { user, userProfile, recordUsage } = useAuth();
  const toast = useToast();

  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('lg');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const samplePhrases = [
    'Good morning, how are you today?',
    'How much is this pair of shoes?',
    'Thank you very much for your great service.',
    'I would like to apply for the position of cashier.',
    'Please forgive me, I will be late by 15 minutes.',
  ];

  const handleSwap = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    const allowed = await recordUsage('Translate');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          from: fromLang,
          to: toLang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTranslatedText(data.translation);
      toast.success('Translation ready!');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success('Translation copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Mpa Help Translation',
          text: translatedText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSave = async () => {
    try {
      const docItem = {
        documentId: 'tr_' + Date.now(),
        userId: user?.uid || userProfile?.userId || 'guest',
        type: 'translation',
        title: `Translation: ${sourceText.slice(0, 30)}...`,
        content: `Original (${fromLang}):\n${sourceText}\n\nTranslation (${toLang}):\n${translatedText}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DatabaseService.saveDocument(docItem);
      setSaved(true);
      toast.success('Translation saved to your library!');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      toast.error('Could not save translation.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
          <Languages className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
            Ugandan Language Translation
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Natural translations between English and Luganda (Oluganda)
          </p>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-2 max-w-lg mx-auto">
        <select
          value={fromLang}
          onChange={(e) => setFromLang(e.target.value)}
          className="text-xs sm:text-sm font-semibold bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 flex-1"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} disabled={!l.isAvailable}>
              {l.name} ({l.nativeName}) {!l.isAvailable ? '- Soon' : ''}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwap}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition"
          title="Swap languages"
          aria-label="Swap languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <select
          value={toLang}
          onChange={(e) => setToLang(e.target.value)}
          className="text-xs sm:text-sm font-semibold bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 flex-1"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} disabled={!l.isAvailable}>
              {l.name} ({l.nativeName}) {!l.isAvailable ? '- Soon' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Translation Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Enter Text</span>
            {sourceText && (
              <button
                onClick={() => setSourceText('')}
                className="text-stone-400 hover:text-stone-600 text-xs font-normal"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste text to translate..."
            className="w-full flex-1 mt-2 p-1 text-xs sm:text-sm bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none resize-none leading-relaxed"
          />
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={loading || !sourceText.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translated Result */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Translation</span>
            {translatedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center gap-1 text-xs font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="text-stone-600 dark:text-stone-300 hover:text-emerald-600 flex items-center gap-1 text-xs font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleSave}
                  className="text-emerald-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 mt-2 p-1 text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
            {translatedText || (
              <span className="text-stone-400 italic">
                Translation will appear here...
              </span>
            )}
          </div>

          {translatedText && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <HelpfulFeedback featureName="Translate" />
            </div>
          )}
        </div>
      </div>

      {/* Everyday phrases chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
          Try everyday phrases:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceText(phrase);
                setFromLang('en');
                setToLang('lg');
              }}
              className="text-left text-xs bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 transition"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Cultural nuance note */}
      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Ugandan language tip: Luganda has polite prefixes depending on whether you are speaking to an individual, elder, or group. Mpa Help provides natural context and formal/casual variations.
        </span>
      </div>
    </div>
  );
};
